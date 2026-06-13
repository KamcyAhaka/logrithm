import { HttpsError } from 'firebase-functions/v2/https';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSecret } from '../secrets/getSecret';
import type { GitHubActivity, InsightObject, PrivacySettingsDocument } from '../types/github';
import {
  initUserPrivacySettings,
  getPrivacySettings,
  getIncludedRepos,
  saveInsightHistory,
  updateAnalysisStatus,
} from '../lib/firestoreService';
import type { RepoDocument } from '../types/github';
import { onCall, db } from '../lib/firebase'; // Added to resolve db.doc TS error
import { getRepoLimit, assertCanRefresh, getUserPlan } from '../lib/planService';
import { calculateActivityScore } from '../lib/scoreCalculator';
import { upsertLeaderboardEntry } from '../lib/leaderboardService';
import { parseCountryCode } from '../lib/locationParser';

// ---------------------------------------------------------------------------
// Demo fallback — returned when key is missing or demo mode is active
// ---------------------------------------------------------------------------
const DUMMY_INSIGHTS: InsightObject = {
  summary:
    'Demo Developer is a highly active full-stack engineer with a strong focus on TypeScript and React ecosystems. 847 commits across 12 repos show consistent, sustained contribution habits.',
  strengths: [
    'Consistent daily commit cadence with strong Mon–Thu activity peaks, indicating disciplined deep work scheduling.',
    'Broad language versatility across TypeScript, Python, and Dart, enabling contribution across web, backend, and mobile stacks.',
    'High PR merge rate indicating clean, review-ready code submissions with low revision overhead.',
  ],
  improvements: [
    'Issue response time could improve — open issues trend toward 7+ days without updates.',
    'Weekend contribution gaps suggest potential for async deep-work sessions if schedule permits.',
    'Consider consolidating smaller utility repos to reduce context-switching overhead.',
  ],
  patterns:
    'Peak activity falls on Tuesday–Wednesday between 10am and 2pm. Quarterly streaks of 14+ days followed by short recovery periods reveal a sprint-and-rest pattern.',
  topLanguages: ['TypeScript', 'JavaScript', 'Dart'],
  activityScore: 82,
  tags: [
    'typescript',
    'high output',
    'multi-repo',
    'pr focused',
    'full-stack',
    'sprint cycles',
    'cross-platform',
  ],
};

// ---------------------------------------------------------------------------
// Gemini prompt builder
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
function buildPrompt(
  activity: GitHubActivity,
  filteredRepos?: RepoDocument[],
  activityScore?: number,
  privacySettings?: Omit<PrivacySettingsDocument, 'updatedAt'> | PrivacySettingsDocument
): string {
  const reposToUse = filteredRepos ?? activity.repositories;
  const topLangs = reposToUse
    .filter((r) => r.primaryLanguage)
    .reduce<Record<string, number>>((acc, r) => {
      const lang = r.primaryLanguage!.name;
      acc[lang] = (acc[lang] ?? 0) + r.commitCount;
      return acc;
    }, {});

  const sortedLangs = Object.entries(topLangs)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([lang]) => lang);

  const devName = activity.name ? `${activity.name} (@${activity.login})` : `@${activity.login}`;

  let privateRepoIndex = 1;
  let orgRepoIndex = 1;

  const repoListText = reposToUse
    .slice(0, 10)
    .map((r) => {
      let repoName = r.name;
      const isPrivate =
        r.isPrivate === true ||
        r.visibility === 'private_personal' ||
        r.visibility === 'private_org';
      const isOrg = r.ownerType === 'organization' || r.visibility === 'private_org';

      if (isPrivate) {
        if (isOrg) {
          if (privacySettings?.display?.showOrgRepoNames !== true) {
            repoName = `private-org-repo-${orgRepoIndex++}`;
          }
        } else {
          if (privacySettings?.display?.showPrivateRepoNames !== true) {
            repoName = `private-personal-repo-${privateRepoIndex++}`;
          }
        }
      }

      return `  - ${repoName}: ${r.commitCount} commits, lang: ${r.primaryLanguage?.name ?? 'unknown'}, ★${r.stargazerCount}`;
    })
    .join('\n');

  return `
You are an expert developer analytics engine. Analyse the following GitHub activity data for the developer ${devName} and return a JSON insight object.

Return ONLY a valid JSON object with no markdown, no code blocks, no explanation.

CRITICAL SECURITY INSTRUCTION: Some repository names may be masked as placeholder names (e.g. "private-personal-repo-X" or "private-org-repo-Y") to protect private source code and organization details. You MUST NOT use or output these literal placeholder names in your summary, strengths, improvements, or patterns fields. Instead, refer to them generally as "a private repository", "a personal project", or "an organization codebase" to ensure the user's private data is kept secure.

CRITICAL INSTRUCTION: You MUST use the developer's name (${activity.name || activity.login}) in the summary! Do NOT use abstract terms like "This developer" or "The user". Write directly about them.

Note: they may contribute significantly to open source projects owned by others. High PR counts relative to commits may indicate OSS maintainer or contributor activity — do not treat this as low productivity.

GitHub Activity Summary:
- Username: ${activity.login}
- Total commits (12 months): ${activity.totalCommitContributions}
- Total PRs: ${activity.totalPullRequestContributions}
- Total issues: ${activity.totalIssueContributions}
- Repos contributed to: ${activity.totalRepositoriesWithContributedCommits}
- Top languages by commit: ${sortedLangs.join(', ')}
- Total calendar contributions: ${activity.contributionCalendar.totalContributions}
- Active repos (with details):
${repoListText}

Return this exact JSON shape:
{
  "summary": "${activity.name || activity.login} is a...",
  "strengths": ["full sentence 1", "full sentence 2", "full sentence 3"],
  "improvements": ["full sentence 1", "full sentence 2", "full sentence 3"],
  "patterns": "paragraph describing timing patterns, streaks, and working rhythm",
  "topLanguages": ["Language1", "Language2", "Language3"],
  "activityScore": ${activityScore ?? '<number 1-100>'},
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

Rules:
- strengths: exactly 3 items, full sentences
- improvements: exactly 3 items, full sentences
- topLanguages: exactly 3 language names
- activityScore: MUST be exactly ${activityScore ?? 'an integer 1-100'}.
  Do not generate your own score — use this exact value.
- tags: 5-7 short keyword tags, max 2 words each, all lowercase, no punctuation.
  Derived from data patterns — not copied from strengths/improvements sentences.
  Examples: typescript, high output, multi-repo, pr focused, vue specialist
`.trim();
}

// ---------------------------------------------------------------------------
// Response parsing — strip code blocks, fallback to regex
// ---------------------------------------------------------------------------
function parseInsights(text: string): InsightObject {
  const cleaned = text
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

  let insights: InsightObject;
  try {
    insights = JSON.parse(cleaned) as InsightObject;
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Could not parse JSON from Gemini response.');
    insights = JSON.parse(match[0]) as InsightObject;
  }

  // Sanitise tags — fix known bug where tags may be missing or malformed
  if (!Array.isArray(insights.tags) || insights.tags.length === 0) {
    insights.tags = (insights.topLanguages ?? []).map((l: string) => l.toLowerCase()).slice(0, 3);
  }
  insights.tags = insights.tags
    .map((t: string) =>
      t
        .replace(/[^a-z0-9\s]/gi, '')
        .toLowerCase()
        .trim()
    )
    .filter(Boolean)
    .slice(0, 7);

  return insights;
}

// ---------------------------------------------------------------------------
// Cloud Function
// ---------------------------------------------------------------------------
export const generateInsightsInternal = async (
  uid: string,
  activity: GitHubActivity,
  isDemoMode?: boolean,
  forceRefresh?: boolean
): Promise<InsightObject> => {
  // Step 1: Demo mode → return dummy immediately
  if (isDemoMode) {
    return DUMMY_INSIGHTS;
  }

  if (!uid || !activity) {
    throw new HttpsError('invalid-argument', 'activity and uid are required.');
  }

  // Enforce plan limits server-side — never trust client
  // assertCanRefresh throws HttpsError if free tier daily limit exceeded
  try {
    await assertCanRefresh(uid);
  } catch (err) {
    // Re-throw HttpsError directly so the client receives the right error code
    throw err;
  }

  const repoLimit = await getRepoLimit(uid);

  // Step 2: Check Firestore cache — one Gemini call per user per day max (unless forceRefresh is true)
  const insightRef = db.doc(`users/${uid}/insights/latest`);

  if (!forceRefresh) {
    try {
      const cached = await insightRef.get();
      if (cached.exists) {
        const data = cached.data() as {
          data: InsightObject;
          generatedAt: FirebaseFirestore.Timestamp | string;
        };

        // Handle both Timestamp (new) and ISO string (legacy) formats
        let generatedAt: Date;
        if (
          data.generatedAt &&
          typeof (data.generatedAt as FirebaseFirestore.Timestamp).toDate === 'function'
        ) {
          generatedAt = (data.generatedAt as FirebaseFirestore.Timestamp).toDate();
        } else {
          generatedAt = new Date(data.generatedAt as string);
        }

        const today = new Date();
        const sameDay =
          generatedAt.getFullYear() === today.getFullYear() &&
          generatedAt.getMonth() === today.getMonth() &&
          generatedAt.getDate() === today.getDate();

        if (sameDay) {
          return data.data;
        }
      }
    } catch (err) {
      console.warn('[generateInsights] Cache check failed, continuing:', err);
    }
  }

  // Step 2b: Ensure privacy settings exist for this user (idempotent)
  try {
    await initUserPrivacySettings(uid);
  } catch (err) {
    console.warn('[generateInsights] Could not init privacy settings:', err);
    // Non-fatal — continue without privacy settings initialised
  }

  // Step 2c: Mark analysis as running
  try {
    await updateAnalysisStatus(uid, 'running');
  } catch (err) {
    console.warn('[generateInsights] Could not update analysis status:', err);
  }

  // Step 3: Get GEMINI_API_KEY — env first, then Secret Manager
  let apiKey = process.env.GEMINI_API_KEY ?? null;

  if (!apiKey) {
    apiKey = await getSecret('GEMINI_API_KEY');
  }

  if (!apiKey) {
    console.warn('[generateInsights] GEMINI_API_KEY not found — returning DUMMY_INSIGHTS');
    return DUMMY_INSIGHTS;
  }

  // Step 3b: Fetch privacy-filtered repos from Firestore
  // Falls back to activity.repositories if Firestore repos are not yet populated
  let filteredRepos: RepoDocument[] | undefined;
  try {
    const firestoreRepos = await getIncludedRepos(uid);
    if (firestoreRepos.length > 0) {
      filteredRepos = firestoreRepos;
    }
  } catch (err) {
    console.warn(
      '[generateInsights] Could not fetch filtered repos, using activity.repositories:',
      err
    );
  }

  // Apply plan-based repo limit
  if (filteredRepos) {
    filteredRepos = filteredRepos.slice(0, repoLimit);
  }

  // Load privacy settings for masking
  let privacySettings: PrivacySettingsDocument | undefined;
  try {
    privacySettings = await getPrivacySettings(uid);
  } catch (err) {
    console.warn('[generateInsights] Could not load privacy settings for masking:', err);
  }

  // Calculate deterministic score BEFORE Gemini call
  // This score is passed into the prompt — Gemini is told to use it exactly
  const scoreBreakdown = calculateActivityScore(activity);
  const deterministicScore = scoreBreakdown.total;

  // Step 4: Call Gemini
  let insights: InsightObject;
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.85, // Add randomness so manual updates feel fresh
      },
    });
    const prompt = buildPrompt(activity, filteredRepos, deterministicScore, privacySettings);
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    insights = parseInsights(text);
    // Override LLM score with deterministic calculation
    insights.activityScore = deterministicScore;
  } catch (err) {
    console.error('[generateInsights] Gemini call failed:', err);
    try {
      await updateAnalysisStatus(uid, 'error', String(err));
    } catch {
      // Non-fatal
    }
    return DUMMY_INSIGHTS;
  }

  // Step 5: Persist insights via firestoreService
  // saveInsightHistory writes to both insights/latest (preserving UI)
  // and a new timestamped history doc, and updates profile/data
  try {
    const repoScope = {
      totalReposAnalyzed: Math.min(
        filteredRepos?.length ?? activity.repositories.length,
        repoLimit
      ),
      publicReposCount: filteredRepos?.filter((r) => r.visibility === 'public').length ?? 0,
      privatePersonalCount:
        filteredRepos?.filter((r) => r.visibility === 'private_personal').length ?? 0,
      orgReposCount: filteredRepos?.filter((r) => r.visibility === 'private_org').length ?? 0,
      excludedCount: 0, // populated when excludedByUser logic is fully wired
    };

    await saveInsightHistory(
      uid,
      { ...insights, scoreBreakdown: scoreBreakdown.components },
      {
        geminiModel: 'gemini-2.5-flash',
        repoScope,
      }
    );

    // Update anonymous leaderboard entry for comparison system
    try {
      const plan = await getUserPlan(uid);
      const countryCode = parseCountryCode(activity.location ?? null);
      await upsertLeaderboardEntry(
        uid,
        deterministicScore,
        scoreBreakdown.components,
        insights.topLanguages,
        countryCode,
        plan
      );
    } catch (err) {
      console.warn('[generateInsights] Could not upsert leaderboard entry (non-fatal):', err);
    }
  } catch (err) {
    console.warn('[generateInsights] Could not save insights:', err);
    // Non-fatal — return insights even if persistence fails
  }

  return insights;
};

import { buildSnapshot } from '../lib/snapshotBuilder';
import { saveSnapshot } from '../lib/firestoreService';

export const generateInsights = onCall(
  { region: 'us-central1' },
  async (request): Promise<InsightObject> => {
    const { activity, uid, isDemoMode, forceRefresh } = request.data as {
      activity: GitHubActivity;
      uid: string;
      isDemoMode?: boolean;
      forceRefresh?: boolean;
    };

    if (!isDemoMode) {
      if (!request.auth) {
        throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
      }
      if (request.auth.uid !== uid) {
        throw new HttpsError(
          'permission-denied',
          'You do not have permission to generate insights for this user.'
        );
      }
    }

    if (forceRefresh && !isDemoMode) {
      try {
        const snapshot = buildSnapshot(activity);
        await saveSnapshot(uid, snapshot);
      } catch (err) {
        console.error(
          `[generateInsights] Failed to save snapshot during force refresh for ${uid}:`,
          err
        );
      }
    }

    return generateInsightsInternal(uid, activity, isDemoMode, forceRefresh);
  }
);
