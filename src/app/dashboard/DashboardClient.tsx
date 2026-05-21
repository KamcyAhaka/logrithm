'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

import { useDemoMode } from '@/hooks/useDemoMode';
import { useAuth } from '@/hooks/useAuth';
import { useGitHubActivity } from '@/hooks/useGitHubActivity';
import { useInsights } from '@/hooks/useInsights';

import Navbar from '@/components/layout/Navbar';
import DemoBanner from '@/components/layout/DemoBanner';
import StatsCard from '@/components/dashboard/StatsCard';
import CommitChart from '@/components/dashboard/CommitChart';
import LanguageBreakdown from '@/components/dashboard/LanguageBreakdown';
import ActivityHeatmap from '@/components/dashboard/ActivityHeatmap';
import RepoList from '@/components/dashboard/RepoList';
import InsightPanel from '@/components/insights/InsightPanel';

import { GitCommit, GitPullRequest, AlertCircle, FolderOpen } from 'lucide-react';

export default function DashboardClient() {
  const isDemoMode = useDemoMode();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

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

  // Auth guard — redirect to / if not authenticated in live mode
  useEffect(() => {
    if (!isDemoMode && !authLoading && !user) {
      router.replace('/');
    }
  }, [isDemoMode, authLoading, user, router]);

  // Fetch activity on mount (demo mode uses stub data immediately)
  useEffect(() => {
    if (isDemoMode) return; // Demo data already loaded in hook
    if (!user) return;

    const loadActivity = async () => {
      try {
        // Get stored GitHub token from Firestore
        const tokenSnap = await getDoc(doc(db, 'users', user.uid, 'tokens', 'github'));
        if (!tokenSnap.exists()) {
          console.warn('[DashboardClient] No GitHub token found — redirecting to login');
          router.replace('/');
          return;
        }
        const { accessToken } = tokenSnap.data() as { accessToken: string };
        await fetchActivity(accessToken);
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

  const login = isDemoMode ? 'demo-dev' : (activity?.login ?? user?.displayName ?? user?.email ?? 'developer');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <Navbar />

      {isDemoMode && <DemoBanner />}

      <main
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          maxWidth: '80rem',
          margin: '0 auto',
          width: '100%',
          padding: '2rem 1.5rem',
          boxSizing: 'border-box',
        }}
      >
        {/* Activity fetch error */}
        {activityError && (
          <div
            style={{
              padding: '0.875rem 1.25rem',
              background: 'rgba(255,100,100,0.06)',
              border: '1px solid rgba(255,100,100,0.15)',
              borderRadius: '0.75rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              color: 'rgba(255,100,100,0.85)',
            }}
          >
            {activityError}
          </div>
        )}

                {/* ─────────────────────────────────── */}
        {/*  InsightPanel + RepoList      */}
        {/* ─────────────────────────────────── */}
        {activity && (
          <div
            className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4"
            style={{ minHeight: 500 }}
          >
            <InsightPanel
              insights={insights}
              loading={insightsLoading}
              error={insightsError}
              onRun={() => {
                const uid = isDemoMode ? 'demo' : user?.uid ?? 'anon';
                runInsights(activity, uid);
              }}
              login={login}
            />
            <RepoList repositories={activity.repositories} />
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
          <div
         
            className="flex flex-col gap-4 sm:grid-cols-1 md:grid-cols-[2fr_1fr]"
          >
            <CommitChart contributionCalendar={activity.contributionCalendar} />
            <LanguageBreakdown repositories={activity.repositories} />
          </div>
        )}

        {/* ─────────────────────────────────── */}
        {/*  Activity heatmap (full width) */}
        {/* ─────────────────────────────────── */}
        {activity && (
          <ActivityHeatmap contributionCalendar={activity.contributionCalendar} />
        )}



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
    </div>
  );
}
