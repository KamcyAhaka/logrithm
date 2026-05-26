import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { GitHubActivity, InsightObject, Plan } from '@/types/github';

interface DashboardState {
  activity: GitHubActivity | null;
  insights: InsightObject | null;
  plan: Plan;
  setPlan: (plan: Plan) => void;
  setActivity: (activity: GitHubActivity | null) => void;
  setInsights: (insights: InsightObject | null) => void;
  clearStore: () => void;
}

export const useDashboardStore = create<DashboardState>()(
  devtools(
    (set) => ({
      activity: null,
      insights: null,
      plan: 'free', // default — updated after profile loads
      setPlan: (plan) => set({ plan }, false, 'SET_PLAN'),
      setActivity: (activity) => set({ activity }, false, 'SET_ACTIVITY'),
      setInsights: (insights) => set({ insights }, false, 'SET_INSIGHTS'),
      clearStore: () => set({ activity: null, insights: null, plan: 'free' }, false, 'CLEAR_STORE'),
    }),
    { name: 'DashboardStore' }
  )
);
