'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useDemoMode } from '@/hooks/useDemoMode';
import { useAuth } from '@/hooks/useAuth';
import { useGitHubActivity } from '@/hooks/useGitHubActivity';
import { useDashboardStore } from '@/store/useDashboardStore';
import { useInsights } from '@/hooks/useInsights';
import { useComparisonStats } from '@/hooks/useComparisonStats';

import Navbar from '@/components/layout/Navbar';
import DemoBanner from '@/components/layout/DemoBanner';
import StatsGrid from '@/components/dashboard/StatsGrid';
import CommitChart from '@/components/dashboard/CommitChart';
import LanguageBreakdown from '@/components/dashboard/LanguageBreakdown';
import ActivityHeatmap from '@/components/dashboard/ActivityHeatmap';
import RepoList from '@/components/dashboard/RepoList';
import InsightPanel from '@/components/insights/InsightPanel';
import ComparisonPanel from '@/components/insights/ComparisonPanel';
import StrengthsAndImprovementsCard from '@/components/dashboard/StrengthsAndImprovementsCard';
import OnboardingFlow from '@/components/dashboard/OnboardingFlow';
import TermsModal from '@/components/dashboard/TermsModal';
import TerminalCard from '@/components/dashboard/TerminalCard';
import RevealSection from '@/components/dashboard/RevealSection';
import { SequenceProvider } from '@/components/dashboard/SequenceContext';
import { ScanningBar } from '@/components/dashboard/Loaders';

import { useGitHubReconnect } from '@/hooks/useGitHubReconnect';

// ── Reusable dashed section divider ─────────────────────────────────────────
function SectionDivider() {
  return <div className="border-term-border border-t border-dashed" />;
}

export default function DashboardClient() {
  const isDemoMode = useDemoMode();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [mustAcceptTerms, setMustAcceptTerms] = useState(false);
  const [excludedRepoIds, setExcludedRepoIds] = useState<Set<string>>(new Set());
  const [countryCode, setCountryCode] = useState<string | null>(null);

  const {
    reconnect,
    loading: reconnectLoading,
    error: reconnectError,
    success: reconnectSuccess,
  } = useGitHubReconnect();

  const handleReconnect = async () => {
    const ok = await reconnect();
    if (ok && user?.uid) {
      try {
        await fetchActivity(user.uid, true);
      } catch (err) {
        console.error('[DashboardClient] Failed to refetch activity after reconnect:', err);
      }
    }
  };

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
    clearError: clearInsightsError,
  } = useInsights(isDemoMode, user?.uid, activity);

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
    if (isDemoMode) return;
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
        try {
          const { getDoc, doc } = await import('firebase/firestore');
          const { db } = await import('@/lib/firebase');
          const profileSnap = await getDoc(doc(db, 'users', user.uid, 'profile', 'data'));
          if (profileSnap.exists()) {
            const profileData = profileSnap.data() as {
              plan?: string;
              onboardingCompleted?: boolean;
              countryCode?: string | null;
              agreedToTerms?: boolean;
            };
            const plan = profileData.plan === 'pro' ? 'pro' : 'free';
            useDashboardStore.getState().setPlan(plan);
            setCountryCode(profileData.countryCode ?? null);
            if (profileData.agreedToTerms !== true) {
              setMustAcceptTerms(true);
            }
            if (profileData.onboardingCompleted === false) {
              setIsOnboarding(true);
            }
          }
        } catch (err) {
          console.warn('[DashboardClient] Could not load plan:', err);
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
          background: 'var(--bg-page)',
        }}
      >
        <ScanningBar text="authorizing connection..." />
      </div>
    );
  }

  const login = isDemoMode
    ? 'demo-dev'
    : (activity?.login ?? user?.displayName ?? user?.email ?? 'developer');

  return (
    <div className="bg-term-bg text-term-light flex min-h-screen flex-col font-mono selection:bg-white/20 selection:text-white">
      {/* Onboarding overlay for first-time signups */}
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
        <>
          {/* Demo Mode Banner */}
          {isDemoMode && <DemoBanner />}

          {/* Terms Modal */}
          {!isDemoMode && mustAcceptTerms && user && (
            <TermsModal uid={user.uid} onAccept={() => setMustAcceptTerms(false)} />
          )}

          {/* Primary Navigation Bar */}
          <Navbar />

          {/* Main Container */}
          <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6">
            {/* Activity fetch error */}
            {activityError && (
              <div className="mb-4 rounded border border-red-500/30 bg-red-500/10 p-3.5 font-mono text-xs text-red-400">
                {activityError}
              </div>
            )}

            <SequenceProvider>
              {/* ── Single continuous terminal frame ─────────────────────────── */}
              <TerminalCard title="dashboard.sh">
                <div className="flex flex-col gap-6 font-mono">
                  {/* §1 Live analysis / insights console */}
                  <InsightPanel
                    insights={insights}
                    loading={insightsLoading}
                    activityLoading={activityLoading}
                    activity={activity}
                    error={insightsError}
                    onRun={() => {
                      const uid = isDemoMode ? 'demo' : (user?.uid ?? 'anon');
                      runInsights(activity!, uid);
                    }}
                    onClearError={clearInsightsError}
                    login={login}
                    countryCode={countryCode}
                    globalStats={globalStats}
                    languageStats={languageStats}
                    countryStats={countryStats}
                    totalCommits={activity?.totalCommitContributions ?? 0}
                    totalRepos={activity?.totalRepositoriesWithContributedCommits ?? 0}
                  />

                  {/* §4 Peer comparison */}
                  {insights && (
                    <RevealSection stepIndex={4}>
                      <SectionDivider />
                      <ComparisonPanel
                        activityScore={insights.activityScore}
                        primaryLanguage={insights.topLanguages[0] ?? null}
                        countryCode={countryCode ?? null}
                        globalStats={globalStats}
                        languageStats={languageStats}
                        countryStats={countryStats}
                      />
                    </RevealSection>
                  )}

                  {/* §5 Stats grid */}
                  {activity && (
                    <RevealSection stepIndex={5}>
                      <SectionDivider />
                      <div>
                        <div className="text-term-dim mb-4 font-mono text-[11px]">
                          <span className="mr-1.5 text-white/40">$</span>
                          <span>logrithm stats --summary</span>
                        </div>
                        <StatsGrid
                          totalCommits={activity.totalCommitContributions}
                          prsMerged={activity.totalPullRequestContributions}
                          openIssues={activity.totalIssueContributions}
                          activeRepos={activity.totalRepositoriesWithContributedCommits}
                        />
                      </div>
                    </RevealSection>
                  )}

                  {/* §6 Commit activity chart */}
                  {activity && (
                    <RevealSection stepIndex={6}>
                      <SectionDivider />
                      <CommitChart contributionCalendar={activity.contributionCalendar} />
                    </RevealSection>
                  )}

                  {/* §7 Activity heatmap */}
                  {activity && (
                    <RevealSection stepIndex={7}>
                      <SectionDivider />
                      <ActivityHeatmap contributionCalendar={activity.contributionCalendar} />
                    </RevealSection>
                  )}

                  {/* §8 Repositories */}
                  {activity && (
                    <RevealSection stepIndex={8}>
                      <SectionDivider />
                      <RepoList
                        repositories={activity.repositories.filter(
                          (r) => !excludedRepoIds.has(String(r.repoId ?? r.name))
                        )}
                        onReconnect={!isDemoMode ? handleReconnect : undefined}
                        reconnecting={reconnectLoading}
                        reconnectError={reconnectError}
                        reconnectSuccess={reconnectSuccess}
                      />
                    </RevealSection>
                  )}

                  {/* §9 Language distribution */}
                  {activity && (
                    <RevealSection stepIndex={9}>
                      <SectionDivider />
                      <LanguageBreakdown repositories={activity.repositories} />
                    </RevealSection>
                  )}

                  {/* §10 Strengths & improvements */}
                  {insights && (
                    <RevealSection stepIndex={10}>
                      <SectionDivider />
                      <StrengthsAndImprovementsCard
                        strengths={insights.strengths}
                        improvements={insights.improvements}
                      />
                    </RevealSection>
                  )}

                  {/* Activity loading skeleton */}
                  {activityLoading && !activity && (
                    <div className="flex items-center justify-center py-16">
                      <ScanningBar text="fetching 12 months of activity..." />
                    </div>
                  )}
                </div>
              </TerminalCard>
            </SequenceProvider>
          </main>
        </>
      )}
    </div>
  );
}
