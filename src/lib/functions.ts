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

export interface GenerateGoalActionPlanParams {
  promptText: string;
  isDemoMode?: boolean;
}

export interface GoalActionPlanResult {
  dimensionGaps: Array<{ dimension: string; current: string; required: string; gap: string }>;
  weeklyActions: string[];
  timeframeWeeks: number;
  summary: string;
}

export async function generateGoalActionPlan(
  params: GenerateGoalActionPlanParams
): Promise<GoalActionPlanResult> {
  const fn = httpsCallable<GenerateGoalActionPlanParams, GoalActionPlanResult>(
    functions,
    'generateGoalActionPlan'
  );
  const result = await fn(params);
  return result.data;
}

export interface InviteAccountabilityPartnerParams {
  goalId: string;
  username: string;
}

export interface InvitePartnerResult {
  success: boolean;
  error?: string;
  partner?: {
    githubLogin: string;
    avatarUrl: string;
    currentScore: number;
  };
}

export async function inviteAccountabilityPartner(
  params: InviteAccountabilityPartnerParams
): Promise<InvitePartnerResult> {
  const fn = httpsCallable<InviteAccountabilityPartnerParams, InvitePartnerResult>(
    functions,
    'inviteAccountabilityPartner'
  );
  const result = await fn(params);
  return result.data;
}

export interface GetAccountabilityPartnersParams {
  invitedUsers: string[];
}

export interface GetPartnersResult {
  partners: Array<{
    githubLogin: string;
    avatarUrl: string;
    currentScore: number;
  }>;
}

export async function getAccountabilityPartners(
  params: GetAccountabilityPartnersParams
): Promise<GetPartnersResult> {
  const fn = httpsCallable<GetAccountabilityPartnersParams, GetPartnersResult>(
    functions,
    'getAccountabilityPartners'
  );
  const result = await fn(params);
  return result.data;
}

export interface PendingInvite {
  goalId: string;
  goalOwnerUid: string;
  ownerUsername: string;
  ownerAvatarUrl: string;
  targetScore: number;
  targetLabel: string;
}

export interface GetPendingInvitesResult {
  invites: PendingInvite[];
}

export async function getPendingInvites(): Promise<GetPendingInvitesResult> {
  const fn = httpsCallable<void, GetPendingInvitesResult>(functions, 'getPendingInvites');
  const result = await fn();
  return result.data;
}

export interface RespondToInviteParams {
  goalId: string;
  ownerUid: string;
  accept: boolean;
}

export async function respondToAccountabilityInvite(
  params: RespondToInviteParams
): Promise<{ success: boolean }> {
  const fn = httpsCallable<RespondToInviteParams, { success: boolean }>(
    functions,
    'respondToAccountabilityInvite'
  );
  const result = await fn(params);
  return result.data;
}

export interface InvitedGoal {
  id: string;
  userId: string;
  ownerUsername: string;
  ownerAvatarUrl: string;
  ownerCurrentScore: number;
  targetScore: number;
  targetLabel: string;
  progressPercent: number;
  status: 'active' | 'achieved' | 'abandoned';
  weeklyActions: string[];
  geminiSummary: string;
  timeframeWeeks: number;
}

export interface GetInvitedGoalsResult {
  goals: InvitedGoal[];
}

export async function getInvitedGoals(): Promise<GetInvitedGoalsResult> {
  const fn = httpsCallable<void, GetInvitedGoalsResult>(functions, 'getInvitedGoals');
  const result = await fn();
  return result.data;
}

export interface CreateGoalParams {
  targetScore: number;
  targetLabel: string;
  scoreAtCreation: number;
  dimensionGapsAtCreation: Array<{
    dimension: string;
    current: string;
    required: string;
    gap: string;
  }>;
  weeklyActions: string[];
  timeframeWeeks: number;
  geminiSummary: string;
}

export async function createGoal(
  params: CreateGoalParams
): Promise<{ success: boolean; goalId: string }> {
  const fn = httpsCallable<CreateGoalParams, { success: boolean; goalId: string }>(
    functions,
    'createGoal'
  );
  const result = await fn(params);
  return result.data;
}
