'use client'

import { useState, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { DUMMY_GITHUB_DATA } from '@/lib/demoData';

export const useGitHubActivity = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivity = useCallback(async (isDemoMode: boolean) => {
    setLoading(true);
    setError(null);

    if (isDemoMode) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      setData(DUMMY_GITHUB_DATA);
      setLoading(false);
      return;
    }

    try {
      const fetchFunc = httpsCallable(functions, 'fetchGitHubActivity');
      const result = await fetchFunc({});
      setData(result.data);
    } catch (err: any) {
      console.error('Fetch Activity Error:', err);
      setError(err.message || 'Failed to fetch GitHub activity');
    } finally {
      setLoading(false);
    }
  }, []);
  const clear = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return { data, loading, error, fetchActivity, clear };
};
