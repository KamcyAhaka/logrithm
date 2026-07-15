'use client';

import { useState, useCallback, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DUMMY_INSIGHTS } from '@/lib/demoData';
import { generateInsights as callGenerateInsights } from '@/lib/functions';
import type { GitHubActivity, InsightObject } from '@/types/github';
import { useDashboardStore } from '@/store/useDashboardStore';
import { isProUpgradeDisabled } from '@/lib/planGating';

interface UseInsightsReturn {
  insights: InsightObject | null;
  loading: boolean;
  error: string | null;
  run: (activity: GitHubActivity, uid: string, forceRefresh?: boolean) => Promise<void>;
  clearError: () => void;
}

export function useInsights(
  isDemoMode: boolean,
  uid?: string,
  activity?: GitHubActivity | null
): UseInsightsReturn {
  const { insights, setInsights } = useDashboardStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialFetched, setHasInitialFetched] = useState(false);

  const run = useCallback(
    async (activityData: GitHubActivity, runUid: string, forceRefresh = true) => {
      if (isDemoMode) {
        // Simulate brief loading for demo UX
        setLoading(true);
        await new Promise((r) => setTimeout(r, 1200));
        setInsights(DUMMY_INSIGHTS);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await callGenerateInsights({
          activity: activityData,
          uid: runUid,
          forceRefresh,
        });
        setInsights(result);
      } catch (err: unknown) {
        console.error('[useInsights] Error:', err);
        const errorObj = err as { code?: string; message?: string };
        const errorMsg = errorObj.message || '';
        const errorCode = errorObj.code || '';

        if (
          errorCode === 'resource-exhausted' ||
          errorCode === 'functions/resource-exhausted' ||
          errorMsg.toLowerCase().includes('limit reached')
        ) {
          if (isProUpgradeDisabled()) {
            setError('Daily analysis limit reached. Pro upgrades coming soon.');
          } else {
            setError('Daily analysis limit reached. Upgrade to Pro for unlimited refreshes.');
          }
        } else {
          setError(errorMsg || 'The log is empty. Try again.');
        }
      } finally {
        setLoading(false);
      }
    },
    [isDemoMode, setInsights]
  );

  // Fetch and check cache on mount to support automated daily updates
  useEffect(() => {
    if (isDemoMode) {
      // In demo mode, we wait for the user to click "Run" to show the dummy insights
      return;
    }
    // We need both uid and activity to proceed with cache check and potential auto-update
    if (!uid || hasInitialFetched || !activity) return;

    const fetchAndCheckCache = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'users', uid, 'insights', 'latest');
        const docSnap = await getDoc(docRef);
        let needsUpdate = true;

        if (docSnap.exists()) {
          const docData = docSnap.data();
          const cachedData = docData.data as InsightObject;

          // Check if generated today
          let generatedAt: Date;
          if (docData.generatedAt && typeof docData.generatedAt.toDate === 'function') {
            generatedAt = docData.generatedAt.toDate();
          } else {
            generatedAt = new Date(docData.generatedAt as string);
          }

          const today = new Date();
          const sameDay =
            generatedAt.getFullYear() === today.getFullYear() &&
            generatedAt.getMonth() === today.getMonth() &&
            generatedAt.getDate() === today.getDate();

          if (sameDay) {
            setInsights(cachedData);
            needsUpdate = false;
          } else {
            // Pre-populate with older insights to avoid blank layout while background fetching
            setInsights(cachedData);
          }
        }

        if (needsUpdate) {
          // Trigger automated daily analysis (non-forced so it respects backend/same-day checks if any)
          await run(activity, uid, false);
        }
      } catch (err) {
        console.error('[useInsights] Failed to load/auto-update insights:', err);
      } finally {
        setLoading(false);
        setHasInitialFetched(true);
      }
    };

    fetchAndCheckCache();
  }, [isDemoMode, uid, hasInitialFetched, activity, run, setInsights]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { insights, loading, error, run, clearError };
}
