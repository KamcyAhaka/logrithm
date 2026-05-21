'use client';

import { useState, useCallback, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DUMMY_INSIGHTS } from '@/lib/demoData';
import { generateInsights as callGenerateInsights } from '@/lib/functions';
import type { GitHubActivity, InsightObject } from '@/types/github';

interface UseInsightsReturn {
  insights: InsightObject | null;
  loading: boolean;
  error: string | null;
  run: (activity: GitHubActivity, uid: string) => Promise<void>;
}

export function useInsights(isDemoMode: boolean, uid?: string): UseInsightsReturn {
  const [insights, setInsights] = useState<InsightObject | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialFetched, setHasInitialFetched] = useState(false);

  // Fetch from Firestore on mount
  useEffect(() => {
    if (isDemoMode) {
      // In demo mode, we wait for the user to click "Run" to show the dummy insights
      return;
    }
    if (!uid || hasInitialFetched) return;

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
  }, [isDemoMode, uid, hasInitialFetched]);

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
      } catch (err) {
        console.error('[useInsights] Error:', err);
        setError('The log is empty. Try again.');
      } finally {
        setLoading(false);
      }
    },
    [isDemoMode]
  );

  return { insights, loading, error, run };
}
