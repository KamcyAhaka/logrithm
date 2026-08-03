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
  const [revealedSections, setRevealedSections] = useState(1);

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

  // Sequentially reveal subsequent sections once Section 1 completes
  useEffect(() => {
    if (revealedSections < 2 || revealedSections >= 8) return;

    const timer = setTimeout(() => {
      setRevealedSections((prev) => prev + 1);
    }, 200);

    return () => clearTimeout(timer);
  }, [revealedSections]);

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
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <Navbar />

      {isDemoMode && <DemoBanner />}

      {!isDemoMode && mustAcceptTerms && user && (
        <TermsModal uid={user.uid} onAccept={() => setMustAcceptTerms(false)} />
      )}

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
            maxWidth: '960px',
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
                marginBottom: '1rem',
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

          {/* ── Single continuous terminal frame ─────────────────────────── */}
          <TerminalCard title="dashboard.sh">
            <div className="flex flex-col gap-6">
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
                onComplete={() => setRevealedSections((prev) => Math.max(prev, 2))}
              />

              {/* §2 Peer comparison */}
              {insights && revealedSections >= 2 && (
                <>
                  <SectionDivider />
                  <ComparisonPanel
                    activityScore={insights.activityScore}
                    primaryLanguage={insights.topLanguages[0] ?? null}
                    countryCode={countryCode ?? null}
                    globalStats={globalStats}
                    languageStats={languageStats}
                    countryStats={countryStats}
                  />
                </>
              )}

              {/* §3 Stats grid */}
              {activity && revealedSections >= 3 && (
                <>
                  <SectionDivider />
                  <div>
                    <div className="text-term-dim mb-4 font-mono text-[11px] font-semibold tracking-wider uppercase">
                      {'// activity_stats.log'}
                    </div>
                    <StatsGrid
                      totalCommits={activity.totalCommitContributions}
                      prsMerged={activity.totalPullRequestContributions}
                      openIssues={activity.totalIssueContributions}
                      activeRepos={activity.totalRepositoriesWithContributedCommits}
                    />
                  </div>
                </>
              )}

              {/* §4 Commit activity chart */}
              {activity && revealedSections >= 4 && (
                <>
                  <SectionDivider />
                  <CommitChart contributionCalendar={activity.contributionCalendar} />
                </>
              )}

              {/* §5 Activity heatmap */}
              {activity && revealedSections >= 5 && (
                <>
                  <SectionDivider />
                  <ActivityHeatmap contributionCalendar={activity.contributionCalendar} />
                </>
              )}

              {/* §6 Repositories */}
              {activity && revealedSections >= 6 && (
                <>
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
                </>
              )}

              {/* §7 Language distribution */}
              {activity && revealedSections >= 7 && (
                <>
                  <SectionDivider />
                  <LanguageBreakdown repositories={activity.repositories} />
                </>
              )}

              {/* §8 Strengths & improvements */}
              {insights && revealedSections >= 8 && (
                <>
                  <SectionDivider />
                  <StrengthsAndImprovementsCard
                    strengths={insights.strengths}
                    improvements={insights.improvements}
                  />
                </>
              )}

              {/* Activity loading skeleton */}
              {activityLoading && !activity && (
                <div className="flex items-center justify-center py-16">
                  <ScanningBar text="fetching 12 months of activity..." />
                </div>
              )}
            </div>
          </TerminalCard>
        </main>
      )}
    </div>
  );
}
