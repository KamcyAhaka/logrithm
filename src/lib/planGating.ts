import type { Plan, ShareCardType } from '@/types/github';

// ─────────────────────────────────────────────────────────────────────────────
// Plan limits — the single source of truth for tier logic on the frontend.
// Backend enforcement lives in functions/src/lib/planService.ts
// ─────────────────────────────────────────────────────────────────────────────

export const PLAN_LIMITS = {
  free: {
    maxRepos: 10,
    maxInsightHistory: 3,
    analysisWindowDays: 30,
    refreshesPerDay: 1,
    shareCardTypes: ['about'] as ShareCardType[],
    profileStyles: ['card'] as Array<'card' | 'full'>,
    canUsePrivateRepos: false,
    canUseOrgRepos: false,
    canExportPDF: false,
    canCustomSlug: false,
    canViewFullProfile: false,
    canViewInsightHistory: false,
  },
  pro: {
    maxRepos: 50,
    maxInsightHistory: Infinity,
    analysisWindowDays: 365,
    refreshesPerDay: Infinity,
    shareCardTypes: [
      'about',
      'score',
      'streak',
      'top_repo',
      'pr_stats',
      'wrapped',
    ] as ShareCardType[],
    profileStyles: ['card', 'full'] as Array<'card' | 'full'>,
    canUsePrivateRepos: true,
    canUseOrgRepos: true,
    canExportPDF: true,
    canCustomSlug: true,
    canViewFullProfile: true,
    canViewInsightHistory: true,
  },
} as const satisfies Record<Plan, object>;

export type PlanLimits = (typeof PLAN_LIMITS)[Plan];
export type PlanFeatureKey = keyof (typeof PLAN_LIMITS)['pro'];

// ─────────────────────────────────────────────────────────────────────────────
// Helper functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the limits object for a given plan.
 * Falls back to free if plan is unknown.
 */
export function getPlanLimits(plan: Plan): PlanLimits {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
}

/**
 * Returns true if the given feature is available on the given plan.
 * Use for boolean feature flags only (canExportPDF, canUsePrivateRepos etc.)
 */
export function canAccess(plan: Plan, feature: Extract<PlanFeatureKey, `can${string}`>): boolean {
  const limits = getPlanLimits(plan);
  return Boolean(limits[feature]);
}

/**
 * Returns true if a given share card type is available on the given plan.
 */
export function canUseCardType(plan: Plan, cardType: ShareCardType): boolean {
  return getPlanLimits(plan).shareCardTypes.includes(cardType);
}

/**
 * Returns true if a given profile style is available on the given plan.
 */
export function canUseProfileStyle(plan: Plan, style: 'card' | 'full'): boolean {
  return (getPlanLimits(plan).profileStyles as string[]).includes(style);
}
