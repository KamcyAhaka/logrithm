'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { usePlan } from './usePlan';

export interface ComparisonStats {
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  mean: number;
  totalUsers: number;
}

export function useComparisonStats(countryCode: string | null, primaryLanguage: string | null) {
  const { isPro } = usePlan();
  const [globalStats, setGlobalStats] = useState<ComparisonStats | null>(null);
  const [countryStats, setCountryStats] = useState<ComparisonStats | null>(null);
  const [languageStats, setLanguageStats] = useState<ComparisonStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        // Global stats is always loaded (available for Free & Pro)
        const globalDocRef = doc(db, 'stats', 'global');
        const globalSnap = await getDoc(globalDocRef);
        if (globalSnap.exists()) {
          setGlobalStats(globalSnap.data() as ComparisonStats);
        }

        // Segmented stats are loaded for Pro users
        if (isPro) {
          if (countryCode) {
            const countryDocRef = doc(db, 'stats', `country_${countryCode.toLowerCase()}`);
            const countrySnap = await getDoc(countryDocRef);
            if (countrySnap.exists()) {
              setCountryStats(countrySnap.data() as ComparisonStats);
            } else {
              setCountryStats(null);
            }
          } else {
            setCountryStats(null);
          }

          if (primaryLanguage) {
            const langDocRef = doc(db, 'stats', `lang_${primaryLanguage.toLowerCase()}`);
            const langSnap = await getDoc(langDocRef);
            if (langSnap.exists()) {
              setLanguageStats(langSnap.data() as ComparisonStats);
            } else {
              setLanguageStats(null);
            }
          } else {
            setLanguageStats(null);
          }
        } else {
          setCountryStats(null);
          setLanguageStats(null);
        }
      } catch (err) {
        console.error('Error fetching comparison stats:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [isPro, countryCode, primaryLanguage]);

  return {
    globalStats,
    countryStats,
    languageStats,
    loading,
  };
}
