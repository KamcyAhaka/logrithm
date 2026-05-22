'use client';

import { useState, useCallback } from 'react';
import { DUMMY_GITHUB_DATA } from '@/lib/demoData';
import { fetchGitHubActivity as callFetchGitHubActivity } from '@/lib/functions';
import type { GitHubActivity } from '@/types/github';
import { useDashboardStore } from '@/store/useDashboardStore';
import { getAuth } from 'firebase/auth';

interface UseGitHubActivityReturn {
  data: GitHubActivity | null;
  loading: boolean;
  error: string | null;
  fetch: (token: string) => Promise<void>;
}

export function useGitHubActivity(isDemoMode: boolean): UseGitHubActivityReturn {
  const { activity: data, setActivity: setData } = useDashboardStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(
    async (token: string) => {
      // If we already have data in the store, don't refetch
      if (data && !isDemoMode) {
        return;
      }

      if (isDemoMode) {
        setData(DUMMY_GITHUB_DATA);
        return;
      }

      const uid = getAuth().currentUser?.uid;
      if (!uid) {
        setError('Not authenticated. Please sign in again.');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const activity = await callFetchGitHubActivity(token, uid);
        setData(activity);
      } catch (err) {
        console.error('[useGitHubActivity] Error:', err);
        setError('The log is empty. Try again.');
      } finally {
        setLoading(false);
      }
    },
    [isDemoMode, data, setData]
  );

  return { data, loading, error, fetch };
}
