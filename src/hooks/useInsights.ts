'use client';

import { useState, useCallback, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DUMMY_INSIGHTS } from '@/lib/demoData';
import { generateInsights as callGenerateInsights } from '@/lib/functions';
import type { GitHubActivity, InsightObject } from '@/types/github';
import { useDashboardStore } from '@/store/useDashboardStore';

interface UseInsightsReturn {
  insights: InsightObject | null;
  loading: boolean;
  error: string | null;
  run: (activity: GitHubActivity, uid: string) => Promise<void>;
}

export function useInsights(isDemoMode: boolean, uid?: string): UseInsightsReturn {
  const { insights, setInsights } = useDashboardStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialFetched, setHasInitialFetched] = useState(false);

  // Fetch from Firestore on mount
  useEffect(() => {
    if (isDemoMode) {
      // In demo mode, we wait for the user to click "Run" to show the dummy insights
      return;
    }
    // If we already have insights in the store, skip initial fetch
    if (!uid || hasInitialFetched || insights) return;

    const fetchInitial = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'users', uid, 'insights', 'latest');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data().data as InsightObject;
          setInsights(data);
        }
      } catch (err) {
        console.error('[useInsights] Failed to fetch initial insights:', err);
      } finally {
        setLoading(false);
        setHasInitialFetched(true);
      }
    };

    fetchInitial();
  }, [isDemoMode, uid, hasInitialFetched, insights, setInsights]);

  const run = useCallback(
    async (activity: GitHubActivity, runUid: string) => {
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
        // Force refresh to bypass Cloud Function cache
        const result = await callGenerateInsights({ activity, uid: runUid, forceRefresh: true });
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
          setError('Daily analysis limit reached. Upgrade to Pro for unlimited refreshes.');
        } else {
          setError(errorMsg || 'The log is empty. Try again.');
        }
      } finally {
        setLoading(false);
      }
    },
    [isDemoMode, setInsights]
  );

  return { insights, loading, error, run };
}
