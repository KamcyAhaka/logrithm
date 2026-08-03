'use client';

import { useState, useEffect, useRef } from 'react';
import { usePlan } from '@/hooks/usePlan';
import { isProUpgradeDisabled } from '@/lib/planGating';
import { Globe, Code, MapPin, TrendingUp } from 'lucide-react';
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
  const [streamStep, setStreamStep] = useState(3);
  const playedStatsRef = useRef<string | null>(null);

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

  const { stats, name } = getStatsForTab();
  const percentile = estimatePercentile(activityScore, stats);
  const isTabLocked = !isPro;

  // Stream reveal effect for unlocked tier
  useEffect(() => {
    if (isTabLocked || !stats) {
      const t = setTimeout(() => setStreamStep(3), 0);
      return () => clearTimeout(t);
    }

    const currentKey = `${activeTab}-${stats.totalUsers}-${activityScore}`;
    if (playedStatsRef.current !== currentKey) {
      playedStatsRef.current = currentKey;
      const t = setTimeout(() => setStreamStep(1), 0);
      return () => clearTimeout(t);
    }
  }, [isTabLocked, stats, activeTab, activityScore]);

  useEffect(() => {
    if (streamStep >= 3) return;

    const timer = setTimeout(() => {
      setStreamStep((prev) => prev + 1);
    }, 300);

    return () => clearTimeout(timer);
  }, [streamStep]);

  return (
    <div className="font-mono">
      {/* Section header + tab buttons */}
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <div className="text-term-dim font-mono text-[11px]">
            <span className="mr-1.5 text-white/40">$</span>
            <span>logrithm compare --peers --scope={activeTab}</span>
          </div>
          <div className="text-term-dim mt-1 font-mono text-[11px]">
            {isTabLocked ? (
              <span>&gt; pro required · percentile rank &amp; distribution locked</span>
            ) : (
              <span>
                &gt; percentile compiled across {stats?.totalUsers ?? 0} {name} profiles
              </span>
            )}
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="bg-term-hover border-term-border flex self-start rounded border p-0.5 sm:self-auto">
          <button
            onClick={() => setActiveTab('global')}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-[11px] font-medium transition-all ${
              activeTab === 'global'
                ? 'bg-term-accent/15 text-term-accent border-term-border border'
                : 'text-term-dim hover:text-term-light border border-transparent'
            }`}
          >
            <Globe className="h-3 w-3" />
            <span>Global</span>
          </button>

          <button
            onClick={() => setActiveTab('language')}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-[11px] font-medium transition-all ${
              activeTab === 'language'
                ? 'bg-term-accent/15 text-term-accent border-term-border border'
                : 'text-term-dim hover:text-term-light border border-transparent'
            }`}
          >
            <Code className="h-3 w-3" />
            <span>Language</span>
          </button>

          <button
            onClick={() => setActiveTab('country')}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-[11px] font-medium transition-all ${
              activeTab === 'country'
                ? 'bg-term-accent/15 text-term-accent border-term-border border'
                : 'text-term-dim hover:text-term-light border border-transparent'
            }`}
          >
            <MapPin className="h-3 w-3" />
            <span>Country</span>
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="relative min-h-40">
        {/* Gated Panel Overlay */}
        {isTabLocked ? (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded bg-black/55 p-6 text-center font-mono backdrop-blur-[4px]">
            {isProUpgradeDisabled() ? (
              <div className="border-term-border bg-term-bg/90 text-term-dim flex items-center gap-2 rounded border border-dashed px-4 py-2 text-xs shadow-xl">
                <span>$ unlock --plan=pro</span>
                <span className="text-amber-500/80">→ pro coming soon</span>
              </div>
            ) : (
              <a
                href="/settings/account"
                className="border-term-accent/40 bg-term-bg/90 text-term-accent hover:border-term-accent hover:bg-term-block flex items-center gap-2 rounded border border-dashed px-4 py-2 text-xs shadow-xl transition-all"
              >
                <span>$ unlock --plan=pro</span>
                <span className="text-term-dim hover:text-term-accent">
                  → reveal peer_comparison.log
                </span>
              </a>
            )}
          </div>
        ) : null}

        {/* Tab Content (always rendered, blurred if locked) */}
        <div
          className={`transition-all duration-300 ${
            isTabLocked ? 'pointer-events-none blur-[4px] filter select-none' : ''
          }`}
        >
          {!stats ? (
            <div className="flex h-32 flex-col items-center justify-center text-center font-mono">
              <span className="text-term-dim text-xs">&gt; not enough segment data yet</span>
              <span className="text-term-dim/50 mt-1 text-[10px]">
                requires 10+ users to compile stats
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-6 pt-2 lg:flex-row lg:gap-8">
              {/* Percentile Rank Block (Unboxed) */}
              <div className="flex-1 space-y-2">
                <div className="text-term-dim flex items-center gap-2 font-mono text-xs">
                  <TrendingUp className="text-term-accent h-3.5 w-3.5" />
                  <span>PERCENTILE_RANK</span>
                </div>
                <div className="flex items-baseline gap-1.5 pt-1">
                  <span className="text-term-accent font-mono text-3xl font-extrabold">
                    {percentile}th
                  </span>
                  <span className="text-term-dim font-mono text-xs">percentile</span>
                </div>
                <p className="text-term-light font-mono text-xs leading-relaxed">
                  You score higher than {percentile}% of developers in this group ({name}).
                </p>

                {/* Stats sub-row */}
                {stats.totalUsers >= 10 && streamStep >= 2 && (
                  <div className="text-term-dim border-term-border/40 flex items-center gap-4 border-t border-dashed pt-2 font-mono text-xs">
                    <div>
                      <span className="text-white/40">profiles: </span>
                      <span className="text-term-light font-semibold">{stats.totalUsers}</span>
                    </div>
                    <div>
                      <span className="text-white/40">avg score: </span>
                      <span className="text-term-light font-semibold">{stats.mean}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Score Distribution Visualizer (Unboxed) */}
              {streamStep >= 3 && (
                <div className="border-term-border/40 flex flex-[1.5] flex-col justify-center space-y-3 border-t border-dashed pt-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
                  <div className="text-term-light font-mono text-xs font-semibold">
                    Score Distribution ({name})
                  </div>
                  <div className="relative py-4">
                    {/* Bar track */}
                    <div className="bg-term-bg border-term-border h-2 w-full rounded-[1px] border" />

                    {/* Percentile points */}
                    <div
                      className="bg-term-dim absolute top-1/2 left-[25%] h-2.5 w-2.5 -translate-y-1/2 rounded"
                      title={`25th Percentile: ${stats.p25}`}
                    />
                    <div
                      className="bg-term-dim absolute top-1/2 left-[50%] h-2.5 w-2.5 -translate-y-1/2 rounded"
                      title={`Median (50th): ${stats.p50}`}
                    />
                    <div
                      className="bg-term-dim absolute top-1/2 left-[75%] h-2.5 w-2.5 -translate-y-1/2 rounded"
                      title={`75th Percentile: ${stats.p75}`}
                    />
                    <div
                      className="bg-term-dim absolute top-1/2 left-[90%] h-2.5 w-2.5 -translate-y-1/2 rounded"
                      title={`90th Percentile: ${stats.p90}`}
                    />

                    {/* User marker */}
                    <div
                      className="absolute top-1/2 z-10 flex -translate-y-1/2 flex-col items-center"
                      style={{
                        left: `${Math.min(96, Math.max(4, percentile))}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <div className="border-term-border bg-term-accent text-term-bg shadow-term-accent/20 flex h-5 w-5 items-center justify-center rounded border text-[9px] font-bold shadow-lg">
                        {activityScore}
                      </div>
                    </div>
                  </div>

                  <div className="text-term-dim flex justify-between px-1 font-mono text-[9px]">
                    <span>P25 ({stats.p25})</span>
                    <span>Median ({stats.p50})</span>
                    <span>P75 ({stats.p75})</span>
                    <span>P90 ({stats.p90})</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
