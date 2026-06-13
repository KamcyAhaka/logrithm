import { FieldValue } from 'firebase-admin/firestore';
import { createHmac } from 'crypto';
import { getSecret } from '../secrets/getSecret';
import type { ScoreBreakdown } from './scoreCalculator';
import { db } from './firebase';

let cachedSalt: string | null = null;

async function getSalt(): Promise<string> {
  if (cachedSalt) return cachedSalt;

  let salt = process.env.LEADERBOARD_SALT ?? null;
  if (!salt) {
    salt = await getSecret('LEADERBOARD_SALT');
  }

  if (!salt) {
    console.warn(
      '[leaderboardService] LEADERBOARD_SALT environment variable/secret is not set. Using local development fallback.'
    );
    salt = 'local-dev-default-salt';
  }

  cachedSalt = salt;
  return salt;
}

/**
 * Computes a secure, non-reversible, one-way anonymous ID from a user's UID.
 * Uses HMAC-SHA256 with a server-side salt.
 */
export async function computeAnonymousId(uid: string): Promise<string> {
  const salt = await getSalt();
  return createHmac('sha256', salt).update(uid).digest('hex').slice(0, 16);
}

export interface LeaderboardEntry {
  anonymousId: string; // hash of uid — never expose raw uid
  score: number;
  scoreBreakdown: ScoreBreakdown['components'];
  languages: string[]; // top 3 languages
  countryCode: string | null;
  plan: 'free' | 'pro';
  updatedAt: FieldValue;
}

export interface StatsDocument {
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  mean: number;
  totalUsers: number;
  updatedAt: FieldValue;
}

/**
 * Writes or updates an anonymous leaderboard entry for a user.
 * Uses a hash of the uid as the document ID — never the raw uid.
 * Called after every successful analysis run.
 */
export async function upsertLeaderboardEntry(
  uid: string,
  score: number,
  scoreBreakdown: ScoreBreakdown['components'],
  languages: string[],
  countryCode: string | null,
  plan: 'free' | 'pro'
): Promise<void> {
  const anonymousId = await computeAnonymousId(uid);

  const entry: LeaderboardEntry = {
    anonymousId,
    score,
    scoreBreakdown,
    languages: languages.slice(0, 3),
    countryCode,
    plan,
    updatedAt: FieldValue.serverTimestamp(),
  };

  await db.doc(`leaderboard/${anonymousId}`).set(entry, { merge: false });
}

/**
 * Reads all leaderboard entries and computes percentile stats.
 * Called by the scheduler nightly to update /stats/*.
 * Returns stats objects for global, per-language, and per-country.
 */
export async function computeAndSaveStats(): Promise<void> {
  const snap = await db.collection('leaderboard').get();

  if (snap.empty) {
    console.log('[leaderboardService] No leaderboard entries yet — skipping stats computation');
    return;
  }

  const entries = snap.docs.map((d) => d.data() as LeaderboardEntry);
  const scores = entries.map((e) => e.score).sort((a, b) => a - b);

  // Global stats
  await db.doc('stats/global').set({
    ...computePercentiles(scores),
    totalUsers: scores.length,
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Per-language stats — only compute if >= 10 users share a language
  const langMap = new Map<string, number[]>();
  for (const entry of entries) {
    for (const lang of entry.languages) {
      const existing = langMap.get(lang) ?? [];
      existing.push(entry.score);
      langMap.set(lang, existing);
    }
  }

  const langBatch = db.batch();
  for (const [lang, langScores] of langMap.entries()) {
    if (langScores.length < 10) continue; // minimum sample size
    langBatch.set(db.doc(`stats/lang_${lang.toLowerCase()}`), {
      ...computePercentiles(langScores.sort((a, b) => a - b)),
      totalUsers: langScores.length,
      language: lang,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
  await langBatch.commit();

  // Per-country stats — only compute if >= 10 users share a country
  const countryMap = new Map<string, number[]>();
  for (const entry of entries) {
    if (!entry.countryCode) continue;
    const existing = countryMap.get(entry.countryCode) ?? [];
    existing.push(entry.score);
    countryMap.set(entry.countryCode, existing);
  }

  const countryBatch = db.batch();
  for (const [code, countryScores] of countryMap.entries()) {
    if (countryScores.length < 10) continue; // minimum sample size
    countryBatch.set(db.doc(`stats/country_${code.toLowerCase()}`), {
      ...computePercentiles(countryScores.sort((a, b) => a - b)),
      totalUsers: countryScores.length,
      countryCode: code,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
  await countryBatch.commit();

  console.log(`[leaderboardService] Stats computed for ${scores.length} users`);
}

/**
 * Calculates what percentile a given score falls at within a sorted array.
 * Returns 1-99 (never 0 or 100 — edge case protection).
 */
export function getPercentileRank(score: number, sortedScores: number[]): number {
  if (sortedScores.length === 0) return 50;
  const below = sortedScores.filter((s) => s < score).length;
  const rank = Math.round((below / sortedScores.length) * 100);
  return Math.min(Math.max(rank, 1), 99);
}

// ── Internal helpers ──────────────────────────────────────────────────────

function percentileValue(sorted: number[], p: number): number {
  const idx = Math.floor((p / 100) * (sorted.length - 1));
  return sorted[idx] ?? 0;
}

function computePercentiles(sorted: number[]) {
  const mean =
    sorted.length > 0 ? Math.round(sorted.reduce((a, b) => a + b, 0) / sorted.length) : 0;
  return {
    p25: percentileValue(sorted, 25),
    p50: percentileValue(sorted, 50),
    p75: percentileValue(sorted, 75),
    p90: percentileValue(sorted, 90),
    mean,
  };
}
