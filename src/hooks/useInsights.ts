'use client'

import { useState, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { DUMMY_INSIGHTS } from '@/lib/demoData';

export const useInsights = () => {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInsights = useCallback(async (activity: any, isDemoMode: boolean) => {
    setLoading(true);
    setError(null);

    try {
      const insightFunc = httpsCallable(functions, 'generateInsights');
      const result = await insightFunc({ activity, isDemoMode });
      setInsights(result.data);
    } catch (err: any) {
      console.error('Generate Insights Error:', err);
      // Fallback to dummy data in production if GEMINI fails but user is valid?
      // For now, only fallback if isDemoMode or explicitly handled in Cloud Function
      setError(err.message || 'Failed to generate insights');
    } finally {
      setLoading(false);
    }
  }, []);

  return { insights, loading, error, generateInsights };
};
