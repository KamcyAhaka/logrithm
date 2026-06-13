import { HttpsError } from 'firebase-functions/v2/https';
import { onCall } from '../lib/firebase';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSecret } from '../secrets/getSecret';

const DUMMY_ACTION_PLAN = {
  dimensionGaps: [
    { dimension: 'Commit Volume', current: '18/30', required: '24/30', gap: '+6 pts' },
    { dimension: 'Weekly Consistency', current: '15/25', required: '20/25', gap: '+5 pts' },
    { dimension: 'Collaboration', current: '12/20', required: '16/20', gap: '+4 pts' },
    { dimension: 'Diversity', current: '9/15', required: '12/15', gap: '+3 pts' },
    { dimension: 'Momentum', current: '6/10', required: '8/10', gap: '+2 pts' },
  ],
  weeklyActions: [
    'Schedule 2 focused deep-work blocks of 2 hours each mid-week to increase Commit Volume.',
    'Contribute code on at least 5 different days each week to maximize Weekly Consistency.',
    'Increase PR creation frequency relative to commits; aim for a 1:4 PR-to-commit ratio (Collaboration).',
    'Explore and make minor contributions to at least 2 other active internal repositories to boost Diversity.',
    'Maintain a steady streak of daily activity to push and keep Momentum high.',
  ],
  timeframeWeeks: 6,
  summary:
    'Your current activity score shows solid contributions, but consistency and collaboration are the main constraints holding you back from a Great score. By focusing on week-over-week consistency and raising your PR ratio, you can bridge these gaps in about 6 weeks.',
};

function cleanString(str: unknown): string {
  if (typeof str !== 'string') return String(str ?? '');
  return str.replace(/\*\*/g, '').replace(/\*/g, '').trim();
}

function parseActionPlan(text: string) {
  const cleaned = text
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Could not parse JSON from Gemini response.');
    parsed = JSON.parse(match[0]);
  }

  if (parsed && typeof parsed === 'object') {
    const p = parsed as Record<string, unknown>;
    if (p.summary) {
      p.summary = cleanString(p.summary);
    }
    if (Array.isArray(p.weeklyActions)) {
      p.weeklyActions = p.weeklyActions.map((act: unknown) => cleanString(act));
    }
    if (Array.isArray(p.dimensionGaps)) {
      p.dimensionGaps = p.dimensionGaps.map((item: Record<string, unknown>) => {
        if (!item || typeof item !== 'object') return item;

        const dimension = cleanString(item.dimension || item.name || '');
        const current = cleanString(
          item.current !== undefined ? item.current : (item.currentValue ?? '')
        );
        const required = cleanString(
          item.required !== undefined ? item.required : (item.requiredValue ?? '')
        );
        let gap = cleanString(item.gap !== undefined ? item.gap : (item.difference ?? ''));

        // Programmatically compute gap if it is missing or empty
        if (!gap && current && required) {
          const curVal = parseFloat(current.split('/')[0]);
          const reqVal = parseFloat(required.split('/')[0]);
          if (!isNaN(curVal) && !isNaN(reqVal)) {
            const diff = reqVal - curVal;
            if (diff > 0) {
              gap = `+${diff.toFixed(1).replace(/\.0$/, '')} pts`;
            } else if (diff === 0) {
              gap = '0 pts';
            } else {
              gap = `${diff.toFixed(1).replace(/\.0$/, '')} pts`;
            }
          }
        }

        return {
          dimension,
          current,
          required,
          gap,
        };
      });
    }
  }

  return parsed;
}

/** Returns true for transient errors worth retrying (503, 429, network timeouts). */
function isRetryable(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes('503') ||
    msg.includes('Service Unavailable') ||
    msg.includes('429') ||
    msg.includes('Too Many Requests') ||
    msg.includes('ECONNRESET') ||
    msg.includes('ETIMEDOUT')
  );
}

/** Sleep for `ms` milliseconds. */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calls Gemini with exponential backoff.
 * Tries gemini-2.5-flash up to `maxAttempts` times, then falls back to
 * gemini-1.5-flash for one final attempt before giving up.
 */
async function callGeminiWithRetry(
  apiKey: string,
  promptText: string,
  maxAttempts = 3
): Promise<unknown> {
  const MODELS = ['gemini-2.5-flash', 'gemini-1.5-flash'] as const;
  let lastErr: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // On the last primary-model attempt, try the fallback model instead
    const modelName = attempt === maxAttempts ? MODELS[1] : MODELS[0];

    try {
      console.log(`[generateGoalActionPlan] Attempt ${attempt}/${maxAttempts} using ${modelName}`);
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { temperature: 0.2 },
      });

      const result = await model.generateContent(promptText);
      const text = result.response.text();
      console.log('[generateGoalActionPlan] Raw Gemini response:', text.slice(0, 500));
      return parseActionPlan(text);
    } catch (err) {
      lastErr = err;
      if (isRetryable(err) && attempt < maxAttempts) {
        const backoffMs = Math.pow(2, attempt) * 1000; // 2s, 4s
        console.warn(
          `[generateGoalActionPlan] Transient error on attempt ${attempt}, retrying in ${backoffMs}ms:`,
          err instanceof Error ? err.message : err
        );
        await sleep(backoffMs);
      } else {
        // Non-retryable error or last attempt — stop immediately
        break;
      }
    }
  }

  throw lastErr;
}

export const generateGoalActionPlan = onCall(
  { region: 'us-central1', timeoutSeconds: 120 },
  async (request) => {
    const { promptText, isDemoMode } = request.data as {
      promptText: string;
      isDemoMode?: boolean;
    };

    if (isDemoMode) {
      return DUMMY_ACTION_PLAN;
    }

    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }

    if (!promptText) {
      throw new HttpsError('invalid-argument', 'promptText is required.');
    }

    // Load API Key — env var first, then Secret Manager
    let apiKey = process.env.GEMINI_API_KEY ?? null;
    if (!apiKey) {
      apiKey = await getSecret('GEMINI_API_KEY');
    }

    if (!apiKey) {
      console.warn(
        '[generateGoalActionPlan] GEMINI_API_KEY not found — returning dummy action plan'
      );
      return DUMMY_ACTION_PLAN;
    }

    try {
      const plan = await callGeminiWithRetry(apiKey, promptText);
      return plan;
    } catch (err) {
      console.error('[generateGoalActionPlan] All Gemini attempts failed:', err);
      // Surface the real error so the client can show a meaningful message
      throw new HttpsError(
        'unavailable',
        `Gemini is temporarily unavailable. Please try again in a moment. (${err instanceof Error ? err.message : String(err)})`
      );
    }
  }
);
