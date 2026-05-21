import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { GitHubActivity, InsightObject } from '@/types/github';

interface DashboardState {
  activity: GitHubActivity | null;
  insights: InsightObject | null;
  setActivity: (activity: GitHubActivity | null) => void;
  setInsights: (insights: InsightObject | null) => void;
  clearStore: () => void;
}

export const useDashboardStore = create<DashboardState>()(
  devtools(
    (set) => ({
      activity: null,
      insights: null,
      setActivity: (activity) => set({ activity }, false, 'SET_ACTIVITY'),
      setInsights: (insights) => set({ insights }, false, 'SET_INSIGHTS'),
      clearStore: () => set({ activity: null, insights: null }, false, 'CLEAR_STORE'),
    }),
    { name: 'DashboardStore' }
  )
);
