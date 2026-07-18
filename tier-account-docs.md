Tiered Access & Public Search Plan
Implement tiered access for Logrithm, dividing capabilities into three distinct tiers:

Tier 1: Anonymous Viewer: No auth required. Unlimited username searches (served from a public-safe Firestore cache). Cache refreshes once every 24 hours per profile. Searches on never-analyzed profiles are enqueued and processed offline by a background scheduled function. Access to Gemini is capped at a global daily limit to control costs. No access to peer comparisons.
Tier 2: Free Account: Scoped to the user's own profile. Automatic daily refresh via an existing scheduler. Peer comparison remains locked. Private and organization repositories are excluded from analysis.
Tier 3: Pro: Includes private and organization repository analysis, and unlocks full peer comparison features (percentile rank, score distribution).
User Review Required
IMPORTANT

Privacy and Organization Repository Filtering To enforce private/org repository exclusion for Free Tier users, the backend function getIncludedRepos will be updated to fetch the user's plan and filter out any repositories with visibility === 'private_personal', visibility === 'private_org', or ownerType === 'organization' if they are on the Free plan.

WARNING

Offline Queue Processing Speed Since anonymous queries do not trigger synchronous Gemini calls, the background queue processing function will run every 2 minutes. This means visitors searching a new username will see a "not analyzed yet, check back shortly" screen for up to 2 minutes before the profile displays.

Open Questions
None at this time. The requirements are fully detailed.

Proposed Changes
Firestore Schema Additions

1. Public Analyses Collection (public_analyses/{username})
   Stores public-safe insights and metadata for any analyzed GitHub username. It contains NO repository lists or private data.

typescript

interface PublicAnalysisDocument {
githubLogin: string;
displayName: string;
avatarUrl: string;
location: string | null;
activityScore: number;
scoreBreakdown: {
volume: number;
consistency: number;
collaboration: number;
diversity: number;
momentum: number;
};
insights: {
summary: string;
strengths: string[];
improvements: string[];
patterns: string;
topLanguages: string[];
tags: string[];
};
totalCommits: number;
totalPRs: number;
totalIssues: number;
activeReposCount: number;
calendarContributions: number;
contributionCalendar: {
totalContributions: number;
weeks: Array<{
contributionDays: Array<{
date: string;
contributionCount: number;
}>;
}>;
};
topLanguages: string[];
updatedAt: FirebaseFirestore.Timestamp;
} 2. Pending Analyses Collection (pending_analyses/{username})
A queue of usernames waiting to be analyzed.

typescript

interface PendingAnalysisDocument {
username: string; // original case
status: 'pending' | 'processing' | 'completed' | 'failed' | 'rate*limited';
requestedAt: FirebaseFirestore.Timestamp;
error?: string;
} 3. Daily Analysis Counter (stats/daily_analyses*{YYYY-MM-DD})
Maintains a daily count of background analyses performed to enforce the cost cap.

typescript

interface DailyAnalysesDocument {
count: number;
}
Cloud Functions (functions/src)
[NEW]
processPendingAnalyses.ts
A background worker running every 2 minutes that:

Reads the global daily Gemini analysis counter for today.
If the count meets or exceeds the cap (e.g. 100), updates all pending requests in the batch to status rate_limited (graceful degradation) and aborts.
Otherwise, queries pending_analyses for status pending ordered by requestedAt ascending (limit: 5).
For each request:
Marks status as processing.
Fetches public GitHub activity via a new fetchPublicActivityInternal(username) utility using the system-wide GitHub token.
Calculates the deterministic score.
Calls Gemini gemini-2.5-flash to get insights.
Stores the combined safe data in public_analyses/{username}.
Increments the daily counter transactionally.
Updates pending_analyses/{username} status to completed.
If any step fails, updates status to failed and records the error message.
[MODIFY]
index.ts
Export the new functions: enqueuePublicAnalysis and processPendingAnalyses.

[MODIFY]
fetchActivity.ts
Add fetchPublicActivityInternal(username: string) that performs a public-only query to user(login: $username). It uses a system-wide GitHub token (loaded via secret key SYSTEM_GITHUB_TOKEN or GITHUB_TOKEN, falling back to GITHUB_TOKEN_OVERRIDE in dev).

[NEW]
enqueuePublicAnalysis.ts
A callable Cloud Function accepting { username: string }.

Checks if a fresh (< 24 hrs) public analysis exists in public_analyses/{username}. If so, returns { status: 'cached' }.
Checks if the daily cap has already been hit. If yes, returns { status: 'rate_limited' }.
If not rate-limited and a queue entry does not exist, enqueues the request in pending_analyses/{username} with status pending. Returns { status: 'pending' }.
[MODIFY]
firestoreService.ts
Update getIncludedRepos to fetch the user's plan. If plan is free, filter out private and organization repositories.

Security Rules (firestore.rules)
[MODIFY]
firestore.rules
Add security rules allowing public read access to public_analyses and pending_analyses, restricting writes to server-only:

javascript

// Public analyses and pending queue
match /public_analyses/{username} {
allow read: if true;
allow write: if false; // server only
}
match /pending_analyses/{username} {
allow read: if true;
allow write: if false; // server only
}
Client Components (src)
[MODIFY]
ComparisonPanel.tsx
If isPro is false, lock/blur the entire panel with a single overlay explaining that "Peer Comparisons are Pro Features".

[MODIFY]
HeroSection.tsx
Add an input search form for searching GitHub usernames. Submitting redirects to /profile/[username].

[NEW]
page.tsx
The public search landing route. It retrieves public_analyses/{username}.

If it exists, checks freshness. If stale, calls enqueuePublicAnalysis in the background. Displays the cached analysis details immediately.
If it doesn't exist, calls enqueuePublicAnalysis and listens to pending_analyses/{username} in real-time.
If status is pending or processing, shows a sleek dark progress state ("running the algorithm... please check back shortly").
If status is rate_limited, shows "high demand right now, check back later".
If status is completed (observed via Firestore snapshot), updates view to render the newly generated profile.
Verification Plan
Automated Tests
Build verification: bun run build to ensure no TypeScript compilation errors.
Test script: Create a temporary test runner script under scratch/test-tiered-access.ts and run it via bun run to verify:
enqueuePublicAnalysis enqueues requests correctly.
Background queue processing generates the public cache, increments stats, and marks completed.
Stale cache triggers background enqueuing without blocking client read.
Manual Verification
Launch local emulator:
Terminal 1: cd functions && bun run build --watch
Terminal 2: firebase emulators:start --only functions,firestore
Terminal 3: bun run dev:emulator
Navigate to homepage on localhost.
Enter a username to search anonymously. Verify:
It shows "not analyzed yet, check back shortly".
Triggering the background scheduler/job updates the database.
UI updates dynamically to render the analysis.
Peer comparison panel is fully locked with an overlay.
