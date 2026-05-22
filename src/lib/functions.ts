// Typed wrappers for Firebase Cloud Functions.
// Import from here rather than calling httpsCallable directly in components.

import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import type { GitHubActivity, InsightObject } from '@/types/github';

export interface FetchActivityParams {
  token: string;
  uid: string;
}

export interface GenerateInsightsParams {
  activity: GitHubActivity;
  uid: string;
  isDemoMode?: boolean;
  forceRefresh?: boolean;
}

export async function fetchGitHubActivity(token: string, uid: string): Promise<GitHubActivity> {
  const fn = httpsCallable<FetchActivityParams, GitHubActivity>(functions, 'fetchGitHubActivity');
  const result = await fn({ token, uid });
  return result.data;
}

export async function generateInsights(params: GenerateInsightsParams): Promise<InsightObject> {
  const fn = httpsCallable<GenerateInsightsParams, InsightObject>(functions, 'generateInsights');
  const result = await fn(params);
  return result.data;
}
