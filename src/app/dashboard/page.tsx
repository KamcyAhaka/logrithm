'use client'

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  GitCommitVertical, 
  GitPullRequest, 
  CircleAlert, 
  BookOpen, 
  Loader2,
  Terminal as TerminalIcon
} from 'lucide-react';

import { Navbar } from '@/components/layout/Navbar';
import { DemoBanner } from '@/components/layout/DemoBanner';
import { TerminalWindow } from '@/components/layout/TerminalWindow';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { CommitChart } from '@/components/dashboard/CommitChart';
import { LanguageBreakdown } from '@/components/dashboard/LanguageBreakdown';
import { ActivityHeatmap } from '@/components/dashboard/ActivityHeatmap';
import { RepoList } from '@/components/dashboard/RepoList';
import { InsightPanel } from '@/components/insights/InsightPanel';

import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { useDemoMode } from '@/hooks/useDemoMode';
import { useGitHubActivity } from '@/hooks/useGitHubActivity';
import { useInsights } from '@/hooks/useInsights';

const DashboardContent = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const isDemo = useDemoMode();
  
  const { 
    data: activity, 
    loading: activityLoading,
    fetchActivity,
    clear: clearActivity
  } = useGitHubActivity();
  
  const { 
    insights, 
    loading: insightsLoading, 
    generateInsights 
  } = useInsights();

  useEffect(() => {
    if (!user && !isDemo) {
      clearActivity();
    }
  }, [user, isDemo, clearActivity]);

  useEffect(() => {
    if (activity || activityLoading) return;

    if (user && !isDemo) {
      // Force fetch real data if we have a user and aren't in demo mode
      fetchActivity(false);
    } else if (isDemo) {
      // Fetch demo data only if nothing is loaded
      fetchActivity(true);
    }
  }, [isDemo, user, fetchActivity, activity, activityLoading]);

  const handleAnalyze = () => {
    if (activity) {
      generateInsights(activity, isDemo);
    }
  };

  if (!user && !isDemo) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="glass-card max-w-md w-full p-12 rounded-3xl text-center space-y-8 animate-in fade-in zoom-in duration-700">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto ring-1 ring-primary/20">
            <TerminalIcon className="text-primary" size={32} />
          </div>
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">Access Restricted</h1>
            <p className="text-white/40 font-mono text-sm leading-relaxed">
              Logrithm requires a GitHub connection to decode your development patterns.
            </p>
          </div>
          <button 
            onClick={() => router.push('/')}
            className="w-full py-4 bg-primary text-black font-black uppercase tracking-widest text-xs rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Connect GitHub
          </button>
        </div>
      </div>
    );
  }

  if (activityLoading || authLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="text-white/40 font-mono animate-pulse">Running the algorithm...</p>
      </div>
    );
  }

  if (!activity) return null;

  const commitHistory = activity.contributionCalendar.weeks.flatMap((w: any) => 
    w.contributionDays.map((d: any) => ({ date: d.date, count: d.contributionCount }))
  );

  const languages = activity.repositories.reduce((acc: any[], repo: any) => {
    if (repo.primaryLanguage) {
      const existing = acc.find(l => l.name === repo.primaryLanguage.name);
      if (existing) {
        existing.count += (repo.commitCount || 1);
      } else {
        acc.push({ 
          name: repo.primaryLanguage.name, 
          count: repo.commitCount || 1, 
          color: repo.primaryLanguage.color 
        });
      }
    }
    return acc;
  }, []).sort((a: any, b: any) => b.count - a.count);

  return (
    <div className="flex-1 space-y-6 pb-20">
      {isDemo && <DemoBanner />}
      
      <div className="max-w-6xl mx-auto px-4 pt-12 space-y-12">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center space-y-8">
          <TerminalWindow 
            username={activity.login} 
            commits={activity.totalCommitContributions}
            repos={activity.totalRepositoriesWithContributedCommits}
            score={insights ? insights.activityScore : (insightsLoading ? '--' : 0)}
            insights={insights ? [...insights.strengths, ...insights.improvements] : []}
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl">
            <div className="glass-card p-6 rounded-2xl flex flex-col items-center">
              <span className="text-4xl font-black text-primary leading-none mb-2">{activity.totalCommitContributions}</span>
              <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">commits analyzed</span>
            </div>
            <div className="glass-card p-6 rounded-2xl flex flex-col items-center">
              <span className="text-4xl font-black text-primary leading-none mb-2">{activity.totalRepositoriesWithContributedCommits}</span>
              <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">repos tracked</span>
            </div>
            <div className="glass-card p-6 rounded-2xl flex flex-col items-center">
              <span className="text-4xl font-black text-primary leading-none mb-2">
                {insights ? insights.activityScore : (insightsLoading ? '...' : '--')}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">activity score</span>
            </div>
          </div>
        </div>

        {/* AI Analysis Row */}
        <div>
          <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/30 mb-6 font-mono">
            {insightsLoading ? 'Algorithm running...' : 'Latest Insight'}
          </h2>
          <InsightPanel 
            insights={insights} 
            isLoading={insightsLoading} 
            onGenerate={handleAnalyze} 
            username={activity.login}
          />
        </div>

        {/* Detailed Stats Header */}
        <div>
          <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/30 mb-8">What Logrithm Sees</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard label="Commits (12m)" value={activity.totalCommitContributions} icon={GitCommitVertical} />
            <StatsCard label="PRs Merged" value={activity.totalPullRequestContributions} icon={GitPullRequest} />
            <StatsCard label="Open Issues" value={activity.totalIssueContributions} icon={CircleAlert} />
            <StatsCard label="Active Repos" value={activity.totalRepositoriesWithContributedCommits} icon={BookOpen} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 min-h-[400px]">
            <CommitChart data={commitHistory} />
          </div>
          <div className="lg:col-span-1 min-h-[400px]">
            <LanguageBreakdown data={languages} />
          </div>
        </div>

        <div>
          <ActivityHeatmap weeks={activity.contributionCalendar.weeks} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-5">
            <RepoList repos={activity.repositories} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  return (
    <AuthProvider>
      <Navbar />
      <div className="pt-16 min-h-screen flex flex-col bg-[#0A0A0A]">
        <DashboardContent />
      </div>
    </AuthProvider>
  );
}
