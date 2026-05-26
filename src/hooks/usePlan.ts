'use client';

import { useDashboardStore } from '@/store/useDashboardStore';
import {
  getPlanLimits,
  canAccess,
  canUseCardType,
  canUseProfileStyle,
  type PlanFeatureKey,
} from '@/lib/planGating';
import type { Plan, ShareCardType } from '@/types/github';

export interface UsePlanReturn {
  plan: Plan;
  isPro: boolean;
  isFree: boolean;
  limits: ReturnType<typeof getPlanLimits>;
  can: (feature: Extract<PlanFeatureKey, `can${string}`>) => boolean;
  canUseCard: (cardType: ShareCardType) => boolean;
  canUseStyle: (style: 'card' | 'full') => boolean;
}

export function usePlan(): UsePlanReturn {
  const plan = useDashboardStore((s) => s.plan);
  const limits = getPlanLimits(plan);

  return {
    plan,
    isPro: plan === 'pro',
    isFree: plan === 'free',
    limits,
    can: (feature) => canAccess(plan, feature),
    canUseCard: (cardType) => canUseCardType(plan, cardType),
    canUseStyle: (style) => canUseProfileStyle(plan, style),
  };
}
