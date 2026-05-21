'use client';

import { useState, useCallback } from 'react';
import { DUMMY_GITHUB_DATA } from '@/lib/demoData';
import { fetchGitHubActivity } from '@/lib/functions';
import type { GitHubActivity } from '@/types/github';

interface UseGitHubActivityReturn {
  data: GitHubActivity | null;
  loading: boolean;
  error: string | null;
  fetch: (token: string) => Promise<void>;
}

export function useGitHubActivity(isDemoMode: boolean): UseGitHubActivityReturn {
  const [data, setData] = useState<GitHubActivity | null>(isDemoMode ? DUMMY_GITHUB_DATA : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(
    async (token: string) => {
      if (isDemoMode) {
        setData(DUMMY_GITHUB_DATA);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const activity = await fetchGitHubActivity(token);
        setData(activity);
      } catch (err) {
        console.error('[useGitHubActivity] Error:', err);
        setError('The log is empty. Try again.');
      } finally {
        setLoading(false);
      }
    },
    [isDemoMode]
  );

  return { data, loading, error, fetch };
}
