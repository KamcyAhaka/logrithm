'use client';

import { useState } from 'react';
import { usePlan } from '@/hooks/usePlan';
import { HelpCircle, Lock } from 'lucide-react';
import type { ComparisonStats } from '@/hooks/useComparisonStats';

interface ScoreBreakdownProps {
  scoreBreakdown?: {
    volume: number;
    consistency: number;
    collaboration: number;
    diversity: number;
    momentum: number;
  };
  globalStats: ComparisonStats | null;
}

const SCORE_COMPONENTS = [
  {
    key: 'volume' as const,
    label: 'Commit Volume',
    weight: 30,
    peerEst: 42,
    description:
      'Measures overall coding output. Normalized against an elite benchmark of 1,000 commits per year.',
  },
  {
    key: 'consistency' as const,
    label: 'Weekly Consistency',
    weight: 25,
    peerEst: 48,
    description:
      'Checks how regularly you code. Measures the percentage of weeks meeting a 5-day-a-week target.',
  },
  {
    key: 'collaboration' as const,
    label: 'Collaboration',
    weight: 20,
    peerEst: 35,
    description:
      'Evaluates your integration with team workflows. Measures the ratio of Pull Requests to Commits, with an ideal target of 0.25.',
  },
  {
    key: 'diversity' as const,
    label: 'Diversity',
    weight: 15,
    peerEst: 30,
    description:
      'Checks project variety. Normalized against contributions across 15 active repositories.',
  },
  {
    key: 'momentum' as const,
    label: 'Momentum',
    weight: 10,
    peerEst: 50,
    description:
      'Measures recent calendar activity. Compares contributions in the last 30 days against your historical monthly average.',
  },
];

export default function ScoreBreakdown({ scoreBreakdown, globalStats }: ScoreBreakdownProps) {
  const { isPro } = usePlan();
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Fallback defaults if not computed yet
  const breakdown = scoreBreakdown || {
    volume: 0,
    consistency: 0,
    collaboration: 0,
    diversity: 0,
    momentum: 0,
  };

  // Scale the component peer average based on globalStats mean if available
  const getPeerVal = (peerEst: number) => {
    if (!globalStats) return peerEst;
    // Scale estimated average dynamically based on actual global database mean (default benchmark base is 41)
    const factor = globalStats.mean / 41;
    return Math.min(Math.max(Math.round(peerEst * factor), 10), 90);
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-sans text-lg font-semibold text-white">Score Breakdown</h3>
          <p className="text-xs text-white/40">
            How your deterministic activity score is calculated
          </p>
        </div>
        {!isPro && (
          <div className="flex items-center gap-1.5 rounded-full bg-[#1D9E75]/15 px-2.5 py-1 text-xs font-medium text-[#1D9E75]">
            <Lock className="h-3 w-3" />
            <span>Pro unlocks peer averages</span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {SCORE_COMPONENTS.map((comp) => {
          const score = breakdown[comp.key];
          const peerVal = getPeerVal(comp.peerEst);

          // Calculate weighted points (e.g., 54% of 30 = 16.2)
          const userPoints = Math.round((score * comp.weight) / 10) / 10;
          const peerPoints = Math.round((peerVal * comp.weight) / 10) / 10;

          return (
            <div key={comp.key} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-white/80">{comp.label}</span>
                  <span className="text-[10px] text-white/40">({comp.weight}% weight)</span>

                  {/* Tooltip trigger */}
                  <div className="relative flex items-center">
                    <button
                      onMouseEnter={() => setActiveTooltip(comp.key)}
                      onMouseLeave={() => setActiveTooltip(null)}
                      onClick={() => setActiveTooltip(activeTooltip === comp.key ? null : comp.key)}
                      className="text-white/40 hover:text-white/80 focus:outline-none"
                    >
                      <HelpCircle className="h-3.5 w-3.5" />
                    </button>
                    {activeTooltip === comp.key && (
                      <div className="absolute bottom-6 left-1/2 z-50 w-64 -translate-x-1/2 rounded-lg border border-white/15 bg-[#0a0a0a] p-3 text-xs text-white shadow-xl backdrop-blur-md">
                        {comp.description}
                      </div>
                    )}
                  </div>
                </div>
                <span className="font-mono font-semibold text-[#1D9E75]">
                  {userPoints}/{comp.weight}
                </span>
              </div>

              {/* Progress bar and peer marker */}
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/5">
                {/* User score progress fill */}
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#1D9E75]/70 to-[#1D9E75] transition-all duration-500 ease-out"
                  style={{ width: `${score}%` }}
                />

                {/* Peer average marker (Pro only) */}
                {isPro ? (
                  <div
                    className="group absolute top-0 bottom-0 z-10 flex w-2 -translate-x-1/2 justify-center"
                    style={{ left: `${peerVal}%` }}
                    title={`Peer Average: ${peerPoints}`}
                  >
                    {/* The white dot marker */}
                    <div className="absolute top-[-4px] h-2 w-2 rounded-full bg-white" />

                    {/* The dashed line */}
                    <div className="h-full border-l border-dashed border-white/90" />
                  </div>
                ) : (
                  /* Blurred / locked peer average marker for Free tier */
                  <div
                    className="absolute top-0 bottom-0 z-10 w-1 -translate-x-1/2 bg-white/10 blur-[1px]"
                    style={{ left: `${peerVal}%` }}
                    title="Upgrade to Pro to see peer average"
                  />
                )}
              </div>

              {/* Labels under progress bar */}
              <div className="relative mt-1 h-4 text-[10px] text-white/30">
                <span className="absolute left-1">0</span>

                {isPro ? (
                  <span
                    className="absolute -translate-x-1/2 font-medium whitespace-nowrap text-white/60 transition-all"
                    style={{ left: `${peerVal}%` }}
                  >
                    Peer Avg ({peerPoints})
                  </span>
                ) : (
                  <span
                    className="absolute flex -translate-x-1/2 items-center gap-0.5 font-medium whitespace-nowrap text-white/50 blur-[0.5px] filter"
                    style={{ left: `${peerVal}%` }}
                  >
                    <Lock className="h-2 w-2" /> Peer Avg
                  </span>
                )}

                <span className="absolute right-1">{comp.weight}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
