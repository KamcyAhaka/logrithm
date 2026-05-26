import { getFirestore } from 'firebase-admin/firestore';
import { HttpsError } from 'firebase-functions/v2/https';
import { Timestamp } from 'firebase-admin/firestore';

const db = getFirestore();

export type Plan = 'free' | 'pro';

const FREE_LIMITS = {
  maxRepos: 10,
  analysisWindowDays: 30,
  refreshesPerDay: 1,
} as const;

const PRO_LIMITS = {
  maxRepos: 50,
  analysisWindowDays: 365,
  refreshesPerDay: Infinity,
} as const;

/**
 * Reads the user's plan from Firestore profile/data.
 * Returns 'free' if doc missing or plan field absent.
 * NEVER trust a plan value passed from the client.
 */
export async function getUserPlan(uid: string): Promise<Plan> {
  try {
    const snap = await db.doc(`users/${uid}/profile/data`).get();
    if (!snap.exists) return 'free';
    const data = snap.data() as { plan?: string };
    return data.plan === 'pro' ? 'pro' : 'free';
  } catch (err) {
    console.warn(`[planService] Could not read plan for ${uid}:`, err);
    return 'free'; // fail safe — never grant pro on error
  }
}

/**
 * Returns the repo limit for the user's plan.
 */
export async function getRepoLimit(uid: string): Promise<number> {
  const plan = await getUserPlan(uid);
  return plan === 'pro' ? PRO_LIMITS.maxRepos : FREE_LIMITS.maxRepos;
}

/**
 * Returns the analysis window in days for the user's plan.
 */
export async function getAnalysisWindowDays(uid: string): Promise<number> {
  const plan = await getUserPlan(uid);
  return plan === 'pro' ? PRO_LIMITS.analysisWindowDays : FREE_LIMITS.analysisWindowDays;
}

/**
 * Asserts the user can run another analysis refresh today.
 * Throws HttpsError 'resource-exhausted' if free tier daily limit hit.
 * Pro users always pass.
 */
export async function assertCanRefresh(uid: string): Promise<void> {
  const plan = await getUserPlan(uid);
  if (plan === 'pro') return; // pro: unlimited

  // Count insights generated today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const snap = await db
    .collection(`users/${uid}/insights`)
    .where('generatedAt', '>=', Timestamp.fromDate(todayStart))
    .count()
    .get();

  const count = snap.data().count;

  if (count >= FREE_LIMITS.refreshesPerDay) {
    throw new HttpsError(
      'resource-exhausted',
      'Daily analysis limit reached. Upgrade to Pro for unlimited refreshes.'
    );
  }
}

/**
 * Asserts the user can access a feature by plan.
 * Throws HttpsError 'permission-denied' if not allowed.
 */
export async function assertProFeature(uid: string, featureName: string): Promise<void> {
  const plan = await getUserPlan(uid);
  if (plan !== 'pro') {
    throw new HttpsError('permission-denied', `${featureName} requires a Pro plan.`);
  }
}
