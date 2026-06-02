'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import { useDemoMode } from '@/hooks/useDemoMode';
import { useAuth } from '@/hooks/useAuth';
import { useGitHubActivity } from '@/hooks/useGitHubActivity';
import { useDashboardStore } from '@/store/useDashboardStore';
import { useInsights } from '@/hooks/useInsights';
import { useComparisonStats } from '@/hooks/useComparisonStats';

import Navbar from '@/components/layout/Navbar';
import DemoBanner from '@/components/layout/DemoBanner';
import StatsCard from '@/components/dashboard/StatsCard';
import CommitChart from '@/components/dashboard/CommitChart';
import LanguageBreakdown from '@/components/dashboard/LanguageBreakdown';
import ActivityHeatmap from '@/components/dashboard/ActivityHeatmap';
import RepoList from '@/components/dashboard/RepoList';
import InsightPanel from '@/components/insights/InsightPanel';
import OnboardingFlow from '@/components/dashboard/OnboardingFlow';

import { GitCommit, GitPullRequest, AlertCircle, FolderOpen } from 'lucide-react';

export default function DashboardClient() {
  const isDemoMode = useDemoMode();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [excludedRepoIds, setExcludedRepoIds] = useState<Set<string>>(new Set());
  const [countryCode, setCountryCode] = useState<string | null>(null);

  const {
    data: activity,
    loading: activityLoading,
    error: activityError,
    fetch: fetchActivity,
  } = useGitHubActivity(isDemoMode);

  const {
    insights,
    loading: insightsLoading,
    error: insightsError,
    run: runInsights,
  } = useInsights(isDemoMode, user?.uid);

  const { globalStats, countryStats, languageStats } = useComparisonStats(
    countryCode,
    insights?.topLanguages[0] ?? null
  );

  // Auth guard — redirect to / if not authenticated in live mode
  useEffect(() => {
    if (!isDemoMode && !authLoading && !user) {
      router.replace('/');
    }
  }, [isDemoMode, authLoading, user, router]);

  // Fetch activity on mount (demo mode uses stub data immediately)
  useEffect(() => {
    if (isDemoMode) return; // Demo data already loaded in hook
    if (!user?.uid) return;

    const loadRepos = async () => {
      try {
        const { getDocs, collection } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        const reposSnap = await getDocs(collection(db, 'users', user.uid, 'repos'));
        const excludedIds = new Set(
          reposSnap.docs
            .map((d) => d.data() as { excludedByUser?: boolean; repoId?: string; name?: string })
            .filter((r) => r.excludedByUser)
            .map((r) => String(r.repoId ?? r.name))
        );
        setExcludedRepoIds(excludedIds as Set<string>);
      } catch (e) {
        console.warn('[DashboardClient] Could not load repos:', e);
      }
    };

    const loadActivity = async () => {
      try {
        await fetchActivity(user.uid);
        // Read plan from profile/data and sync to store
        try {
          const { getDoc, doc } = await import('firebase/firestore');
          const { db } = await import('@/lib/firebase');
          const profileSnap = await getDoc(doc(db, 'users', user.uid, 'profile', 'data'));
          if (profileSnap.exists()) {
            const profileData = profileSnap.data() as {
              plan?: string;
              onboardingCompleted?: boolean;
              countryCode?: string | null;
            };
            const plan = profileData.plan === 'pro' ? 'pro' : 'free';
            useDashboardStore.getState().setPlan(plan);
            setCountryCode(profileData.countryCode ?? null);
            if (profileData.onboardingCompleted === false) {
              setIsOnboarding(true);
            }
          }
        } catch (err) {
          console.warn('[DashboardClient] Could not load plan:', err);
          // Non-fatal — defaults to free
        }
        await loadRepos();
      } catch (err) {
        console.error('[DashboardClient] Failed to load activity:', err);
      }
    };

    loadActivity();
  }, [isDemoMode, user, fetchActivity, router]);

  // Loading state — waiting for auth or initial activity fetch
  const isInitializing = !isDemoMode && authLoading;
  if (isInitializing) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
        }}
      >
        Running the algorithm...
      </div>
    );
  }

  const login = isDemoMode
    ? 'demo-dev'
    : (activity?.login ?? user?.displayName ?? user?.email ?? 'developer');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <Navbar />

      {isDemoMode && <DemoBanner />}

      {isOnboarding && activity ? (
        <OnboardingFlow
          activity={activity}
          onComplete={async () => {
            setIsOnboarding(false);
            if (!isDemoMode && user?.uid) {
              const { getDocs, collection } = await import('firebase/firestore');
              const { db } = await import('@/lib/firebase');
              const reposSnap = await getDocs(collection(db, 'users', user.uid, 'repos'));
              const excludedIds = new Set(
                reposSnap.docs
                  .map(
                    (d) => d.data() as { excludedByUser?: boolean; repoId?: string; name?: string }
                  )
                  .filter((r) => r.excludedByUser)
                  .map((r) => String(r.repoId ?? r.name))
              );
              setExcludedRepoIds(excludedIds as Set<string>);
            }
          }}
        />
      ) : (
        <main
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            maxWidth: '80rem',
            margin: '0 auto',
            width: '100%',
            boxSizing: 'border-box',
          }}
          className="px-0 sm:px-6 sm:py-8"
        >
          {/* Activity fetch error */}
          {activityError && (
            <div
              style={{
                padding: '0.875rem 1.25rem',
                background: 'rgba(255,100,100,0.06)',
                border: '1px solid rgba(255,100,100,0.15)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                color: 'rgba(255,100,100,0.85)',
              }}
              className="rounded-none sm:rounded-xl"
            >
              {activityError}
            </div>
          )}

          {/* ─────────────────────────────────── */}
          {/*  InsightPanel + RepoList      */}
          {/* ─────────────────────────────────── */}
          {activity && (
            <div
              className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr]"
              style={{ minHeight: 500 }}
            >
              <InsightPanel
                insights={insights}
                loading={insightsLoading}
                error={insightsError}
                onRun={() => {
                  const uid = isDemoMode ? 'demo' : (user?.uid ?? 'anon');
                  runInsights(activity, uid);
                }}
                login={login}
                countryCode={countryCode}
                globalStats={globalStats}
                languageStats={languageStats}
                countryStats={countryStats}
              />
              <RepoList
                repositories={activity.repositories.filter(
                  (r) => !excludedRepoIds.has(String(r.repoId ?? r.name))
                )}
              />
            </div>
          )}

          {/* ─────────────────────────────────── */}
          {/* Stats cards                  */}
          {/* ─────────────────────────────────── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
            }}
          >
            <StatsCard
              label="Total Commits (12mo)"
              value={activity?.totalCommitContributions ?? '—'}
              icon={<GitCommit size={16} />}
            />
            <StatsCard
              label="PRs Merged"
              value={activity?.totalPullRequestContributions ?? '—'}
              icon={<GitPullRequest size={16} />}
            />
            <StatsCard
              label="Open Issues"
              value={activity?.totalIssueContributions ?? '—'}
              icon={<AlertCircle size={16} />}
            />
            <StatsCard
              label="Active Repos"
              value={activity?.totalRepositoriesWithContributedCommits ?? '—'}
              icon={<FolderOpen size={16} />}
            />
          </div>

          {/* ─────────────────────────────────── */}
          {/* Commit chart + Language pie  */}
          {/* ─────────────────────────────────── */}
          {activity && (
            <div className="flex flex-col gap-4 sm:grid-cols-1 md:grid-cols-[2fr_1fr]">
              <CommitChart contributionCalendar={activity.contributionCalendar} />
              <LanguageBreakdown repositories={activity.repositories} />
            </div>
          )}

          {/* ─────────────────────────────────── */}
          {/*  Activity heatmap (full width) */}
          {/* ─────────────────────────────────── */}
          {activity && <ActivityHeatmap contributionCalendar={activity.contributionCalendar} />}

          {/* Loading skeleton for activity */}
          {activityLoading && (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  color: 'var(--green)',
                }}
              >
                Running the algorithm...
              </p>
            </div>
          )}
        </main>
      )}
    </div>
  );
}
