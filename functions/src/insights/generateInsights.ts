import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSecret } from '../secrets/getSecret';
import type { GitHubActivity, InsightObject } from '../types/github';

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

// Init admin SDK if not already initialised
if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();

// ---------------------------------------------------------------------------
// Gemini prompt builder
// ---------------------------------------------------------------------------
function buildPrompt(activity: GitHubActivity): string {
  const topLangs = activity.repositories
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

  return `
You are an expert developer analytics engine. Analyse the following GitHub activity data for the developer ${devName} and return a JSON insight object.

Return ONLY a valid JSON object with no markdown, no code blocks, no explanation.

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
${activity.repositories
  .slice(0, 10)
  .map(
    (r) =>
      `  - ${r.name}: ${r.commitCount} commits, lang: ${r.primaryLanguage?.name ?? 'unknown'}, ★${r.stargazerCount}`
  )
  .join('\n')}

Return this exact JSON shape:
{
  "summary": "${activity.name || activity.login} is a...",
  "strengths": ["full sentence 1", "full sentence 2", "full sentence 3"],
  "improvements": ["full sentence 1", "full sentence 2", "full sentence 3"],
  "patterns": "paragraph describing timing patterns, streaks, and working rhythm",
  "topLanguages": ["Language1", "Language2", "Language3"],
  "activityScore": <number 1-100>,
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

Rules:
- strengths: exactly 3 items, full sentences
- improvements: exactly 3 items, full sentences
- topLanguages: exactly 3 language names
- activityScore: integer 1-100 based on consistency, volume, and diversity
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
export const generateInsights = onCall(
  { region: 'us-central1' },
  async (request): Promise<InsightObject> => {
    const { activity, uid, isDemoMode, forceRefresh } = request.data as {
      activity: GitHubActivity;
      uid: string;
      isDemoMode?: boolean;
      forceRefresh?: boolean;
    };

    // Step 1: Demo mode → return dummy immediately
    if (isDemoMode) {
      return DUMMY_INSIGHTS;
    }

    if (!uid || !activity) {
      throw new HttpsError('invalid-argument', 'activity and uid are required.');
    }

    // Step 2: Check Firestore cache — one Gemini call per user per day max (unless forceRefresh is true)
    const insightRef = db.doc(`users/${uid}/insights/latest`);

    if (!forceRefresh) {
      try {
        const cached = await insightRef.get();
        if (cached.exists) {
          const data = cached.data() as { data: InsightObject; generatedAt: string };
          const generatedAt = new Date(data.generatedAt);
          const today = new Date();
          const sameDay =
            generatedAt.getFullYear() === today.getFullYear() &&
            generatedAt.getMonth() === today.getMonth() &&
            generatedAt.getDate() === today.getDate();

          if (sameDay) {
            console.log(`[generateInsights] Returning cached insights for ${uid}`);
            return data.data;
          }
        }
      } catch (err) {
        console.warn('[generateInsights] Cache check failed, continuing:', err);
      }
    } else {
      console.log(`[generateInsights] forceRefresh=true for ${uid}, bypassing cache check`);
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
      const prompt = buildPrompt(activity);
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      insights = parseInsights(text);
    } catch (err) {
      console.error('[generateInsights] Gemini call failed:', err);
      // Cost protection: if Gemini fails, return dummy — never crash
      return DUMMY_INSIGHTS;
    }

    // Step 5: Cache in Firestore
    try {
      await insightRef.set({
        data: insights,
        generatedAt: new Date().toISOString(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    } catch (err) {
      console.warn('[generateInsights] Could not cache insights:', err);
      // Non-fatal — return insights even if cache write fails
    }

    return insights;
  }
);
