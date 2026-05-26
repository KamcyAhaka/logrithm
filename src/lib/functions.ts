// Typed wrappers for Firebase Cloud Functions.
// Import from here rather than calling httpsCallable directly in components.

import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import type { GitHubActivity, InsightObject } from '@/types/github';

export interface StoreTokenParams {
  token: string;
}

export async function storeGitHubToken(token: string): Promise<void> {
  const fn = httpsCallable<StoreTokenParams, { success: boolean }>(functions, 'storeGitHubToken');
  await fn({ token });
}

export interface GenerateInsightsParams {
  activity: GitHubActivity;
  uid: string;
  isDemoMode?: boolean;
  forceRefresh?: boolean;
}

export async function fetchGitHubActivity(uid: string): Promise<GitHubActivity> {
  const fn = httpsCallable<{ uid: string }, GitHubActivity>(functions, 'fetchGitHubActivity');
  const result = await fn({ uid });
  return result.data;
}

export async function generateInsights(params: GenerateInsightsParams): Promise<InsightObject> {
  const fn = httpsCallable<GenerateInsightsParams, InsightObject>(functions, 'generateInsights');
  const result = await fn(params);
  return result.data;
}
