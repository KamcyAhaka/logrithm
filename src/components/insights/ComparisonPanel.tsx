'use client';

import { useState } from 'react';
import { usePlan } from '@/hooks/usePlan';
import { Lock, Globe, Code, MapPin, TrendingUp } from 'lucide-react';
import type { ComparisonStats } from '@/hooks/useComparisonStats';

interface ComparisonPanelProps {
  activityScore: number;
  primaryLanguage: string | null;
  countryCode: string | null;
  globalStats: ComparisonStats | null;
  languageStats: ComparisonStats | null;
  countryStats: ComparisonStats | null;
}

type TabType = 'global' | 'language' | 'country';

export default function ComparisonPanel({
  activityScore,
  primaryLanguage,
  countryCode,
  globalStats,
  languageStats,
  countryStats,
}: ComparisonPanelProps) {
  const { isPro } = usePlan();
  const [activeTab, setActiveTab] = useState<TabType>('global');

  // Estimate percentile based on percentiles in stats doc
  const estimatePercentile = (score: number, stats: ComparisonStats | null): number => {
    if (!stats) return 50;
    if (score <= 1) return 1;
    if (score >= 100) return 99;

    const { p25, p50, p75, p90 } = stats;

    if (score < p25) {
      return Math.max(1, Math.round((score / Math.max(p25, 1)) * 25));
    }
    if (score < p50) {
      const denom = Math.max(p50 - p25, 1);
      return Math.round(25 + ((score - p25) / denom) * 25);
    }
    if (score < p75) {
      const denom = Math.max(p75 - p50, 1);
      return Math.round(50 + ((score - p50) / denom) * 25);
    }
    if (score < p90) {
      const denom = Math.max(p90 - p75, 1);
      return Math.round(75 + ((score - p75) / denom) * 15);
    }
    const denom = Math.max(100 - p90, 1);
    return Math.min(99, Math.round(90 + ((score - p90) / denom) * 9));
  };

  const getStatsForTab = (): { stats: ComparisonStats | null; label: string; name: string } => {
    switch (activeTab) {
      case 'language':
        return {
          stats: languageStats,
          label: 'Language',
          name: primaryLanguage || 'Primary Language',
        };
      case 'country':
        return {
          stats: countryStats,
          label: 'Country',
          name: countryCode ? countryCode.toUpperCase() : 'Country',
        };
      default:
        return { stats: globalStats, label: 'Global', name: 'Worldwide' };
    }
  };

  const { stats, label, name } = getStatsForTab();
  const percentile = estimatePercentile(activityScore, stats);
  const isTabLocked = (activeTab === 'language' || activeTab === 'country') && !isPro;

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="font-sans text-lg font-semibold text-white">Peer Comparison</h3>
          <p className="text-xs text-white/40">
            See how your activity score stacks up against other developers
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex self-start rounded-lg bg-black/30 p-1 sm:self-auto">
          <button
            onClick={() => setActiveTab('global')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'global'
                ? 'bg-[#1D9E75] text-white'
                : 'text-white/60 hover:text-white/95'
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>Global</span>
          </button>

          <button
            onClick={() => setActiveTab('language')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'language'
                ? 'bg-[#1D9E75] text-white'
                : 'text-white/60 hover:text-white/95'
            }`}
          >
            <Code className="h-3.5 w-3.5" />
            <span>Language</span>
            {!isPro && <Lock className="h-3 w-3 text-white/40" />}
          </button>

          <button
            onClick={() => setActiveTab('country')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'country'
                ? 'bg-[#1D9E75] text-white'
                : 'text-white/60 hover:text-white/95'
            }`}
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>Country</span>
            {!isPro && <Lock className="h-3 w-3 text-white/40" />}
          </button>
        </div>
      </div>

      <div className="relative min-h-[160px]">
        {isTabLocked ? (
          /* Gated Tab Overlay */
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-lg border border-white/5 bg-[#0a0a0a]/80 p-6 text-center backdrop-blur-md">
            <Lock className="mb-2 h-6 w-6 text-[#1D9E75]" />
            <h4 className="font-mono text-sm font-semibold text-white">
              {label} Comparisons are Pro Features
            </h4>
            <p className="mt-1 max-w-sm text-xs text-white/40">
              Filter comparisons by country and languages to see segment-specific leaderboards and
              averages.
            </p>
            <a
              href="/settings/account"
              className="mt-4 rounded-md bg-[#1D9E75] px-4 py-2 font-mono text-xs font-bold text-white transition-colors hover:bg-[#1D9E75]/95"
            >
              Upgrade to Pro
            </a>
          </div>
        ) : null}

        {/* Tab Content (always rendered, blurred if locked) */}
        <div
          className={`transition-all duration-300 ${isTabLocked ? 'pointer-events-none blur-[4px] filter' : ''}`}
        >
          {!stats ? (
            <div className="flex h-32 flex-col items-center justify-center text-center">
              <span className="text-sm text-white/40">Not enough segment data yet</span>
              <span className="text-[10px] text-white/20">Requires 10+ users to compile stats</span>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-5">
              {/* Left summary cards */}
              <div className="space-y-4 lg:col-span-2">
                <div className="rounded-lg border border-white/5 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <TrendingUp className="h-4 w-4 text-[#1D9E75]" />
                    <span>Percentile Rank</span>
                  </div>
                  <div className="mt-1.5 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white">{percentile}th</span>
                    <span className="text-xs text-white/60">percentile</span>
                  </div>
                  <p className="mt-1 text-xs text-white/40">
                    You score higher than {percentile}% of developers in this cohort ({name}).
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-white/5 bg-white/5 p-3">
                    <span className="text-[10px] text-white/40 uppercase">Cohort Mean</span>
                    <div className="text-xl font-bold text-white/80">{stats.mean}</div>
                  </div>
                  <div className="rounded-lg border border-white/5 bg-white/5 p-3">
                    <span className="text-[10px] text-white/40 uppercase">Cohort Size</span>
                    <div className="text-xl font-bold text-white/80">{stats.totalUsers}</div>
                  </div>
                </div>
              </div>

              {/* Right distribution visualizer */}
              <div className="flex flex-col justify-center space-y-4 lg:col-span-3">
                <span className="text-xs font-medium text-white/60">
                  Distribution Cohort Spread ({name})
                </span>
                <div className="relative py-4">
                  {/* The bar track */}
                  <div className="h-2 w-full rounded-full bg-white/5" />

                  {/* Percentile points */}
                  <div
                    className="absolute top-1/2 left-[25%] h-3 w-3 -translate-y-1/2 rounded-full border border-white/20 bg-white/10"
                    title={`25th Percentile: ${stats.p25}`}
                  />
                  <div
                    className="absolute top-1/2 left-[50%] h-3 w-3 -translate-y-1/2 rounded-full border border-white/20 bg-white/10"
                    title={`Median (50th): ${stats.p50}`}
                  />
                  <div
                    className="absolute top-1/2 left-[75%] h-3 w-3 -translate-y-1/2 rounded-full border border-white/20 bg-white/10"
                    title={`75th Percentile: ${stats.p75}`}
                  />
                  <div
                    className="absolute top-1/2 left-[90%] h-3 w-3 -translate-y-1/2 rounded-full border border-white/20 bg-white/10"
                    title={`90th Percentile: ${stats.p90}`}
                  />

                  {/* User marker position indicator */}
                  <div
                    className="absolute top-1/2 z-10 flex -translate-y-1/2 flex-col items-center"
                    style={{
                      left: `${Math.min(96, Math.max(4, percentile))}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <div className="flex h-5 w-5 animate-bounce items-center justify-center rounded-full border-2 border-white bg-[#1D9E75] shadow-lg shadow-[#1D9E75]/50">
                      <span className="text-[8px] font-bold text-white">{activityScore}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between px-1 text-[10px] text-white/30">
                  <span>P25 ({stats.p25})</span>
                  <span>Median ({stats.p50})</span>
                  <span>P75 ({stats.p75})</span>
                  <span>P90 ({stats.p90})</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
