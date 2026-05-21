---
name: logrithm-cloud-functions
description: Cloud Functions conventions for the Logrithm project. Use when writing, editing, or debugging Firebase Cloud Functions — including fetchGitHubActivity, generateInsights, Gemini prompt rules, InsightObject shape, caching logic, Secret Manager access, cost protection, and the background scheduler stub. Apply whenever touching anything in the functions/ directory.
---

# Logrithm — Cloud Functions

## Two Callable Functions

Both exported from functions/src/index.ts.

## fetchGitHubActivity

Accepts : { token: string }
Calls   : https://api.github.com/graphql
Header  : Authorization: bearer ${token}

GraphQL query must fetch:
  viewer.login, viewer.name, viewer.avatarUrl
  contributionsCollection (last 12 months):
    totalCommitContributions
    totalPullRequestContributions
    totalIssueContributions
    totalRepositoriesWithContributedCommits
    contributionCalendar {
      totalContributions
      weeks { contributionDays { date contributionCount } }
    }
  repositories (first: 15, orderBy: UPDATED_AT DESC):
    name, url, stargazerCount, forkCount
    primaryLanguage { name color }
    defaultBranchRef {
      target { ... on Commit { history(first: 1) { totalCount } } }
    }

Always filter(Boolean) on primaryLanguage — some repos return null.
Handle GitHub API errors gracefully with meaningful messages.

## generateInsights

Accepts: { activity: GitHubActivity, uid: string, isDemoMode?: boolean }

Execution order:
1. isDemoMode === true → return DUMMY_INSIGHTS immediately
2. Check Firestore: users/{uid}/insights/latest
   generatedAt is today → return cached, skip Gemini entirely
3. Get GEMINI_API_KEY:
   - Check process.env.GEMINI_API_KEY first (covers functions/.env.local)
   - Fall back to getSecret('GEMINI_API_KEY') for production
   - Key missing → log warning, return DUMMY_INSIGHTS, never throw
4. Call Gemini gemini-2.5-flash
5. Parse and sanitise response
6. Cache result in Firestore users/{uid}/insights/latest
7. Return InsightObject

## InsightObject Shape

{
  summary      : string     // 2-3 sentence developer persona
  strengths    : string[]   // exactly 3 items, full sentences
  improvements : string[]   // exactly 3 items, full sentences
  patterns     : string     // paragraph on timing and consistency
  topLanguages : string[]   // top 3 language names
  activityScore: number     // 1-100
  tags         : string[]   // 5-7 tags, max 2 words, lowercase, no punctuation
}

## Gemini Prompt Rules

Model: gemini-2.5-flash (all users — free tier only for now)

Always include:
  "Return ONLY a valid JSON object with no markdown, no code blocks,
   no explanation."

Always include OSS context:
  "Note: this developer may contribute significantly to open source
   projects owned by others. High PR counts relative to commits may
   indicate OSS maintainer or contributor activity — do not treat
   this as low productivity."

Tags instruction:
  "tags: 5-7 short keyword tags, max 2 words each, all lowercase, no
   punctuation. Derived from the data — not copied from
   strengths/improvements sentences.
   Examples: typescript, high output, multi-repo, pr focused, vue specialist"

## Gemini Response Parsing

Strip code blocks first, fall back to regex:

  const cleaned = text
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

  let insights;
  try {
    insights = JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Could not parse JSON from Gemini');
    insights = JSON.parse(match[0]);
  }

Always sanitise tags after parsing — Gemini ignores rules sometimes:

  if (!Array.isArray(insights.tags) || insights.tags.length === 0) {
    insights.tags = insights.topLanguages
      .map((l: string) => l.toLowerCase())
      .slice(0, 3);
  }
  insights.tags = insights.tags
    .map((t: string) =>
      t.replace(/[^a-z0-9\s]/gi, '').toLowerCase().trim()
    )
    .filter(Boolean)
    .slice(0, 7);

## Secret Manager

Local dev   : GEMINI_API_KEY in functions/.env.local
Production  : GCP Secret Manager via getSecret('GEMINI_API_KEY')
Service acct: logrithm@appspot.gserviceaccount.com
Role needed : roles/secretmanager.secretAccessor

## Cost Protection — Never Violate

1. One Gemini call per user per day max — enforced by cache check
2. Cloud Run max instances: 5 — hard cap, never change
3. Demo mode and missing key always return DUMMY_INSIGHTS — never crash

## Background Scheduler (Phase 2 — stub only)

File: functions/src/scheduler/runBackgroundAnalysis.ts

Create the file now with a placeholder export and detailed comment:

  // Phase 2: onSchedule('every 1 hours')
  // Loop users with uid-based slot allocation so each user is
  // processed once per day regardless of total user count:
  //   const slot = parseInt(uid.slice(-2), 16) % 24;
  //   if (slot !== new Date().getHours()) return;
  //
  // Per user:
  //   1. Skip if snapshot exists for today (no GitHub call needed)
  //   2. Fetch GitHub activity
  //   3. Compare to last snapshot — only call Gemini if meaningful
  //      change: 5+ new commits, new repo, or 20%+ language shift
  //   4. Write to insights/latest AND insights/history/{YYYY-MM}
  //   5. Write raw activity to snapshots/{YYYY-MM-DD}
  //   Pro users only when plan gating is added in Phase 2.

  export const scheduledAnalysis = null; // Phase 2
