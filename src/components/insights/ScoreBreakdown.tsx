'use client';

import { useState, useEffect } from 'react';
import { usePlan } from '@/hooks/usePlan';
import { HelpCircle } from 'lucide-react';
import type { ComparisonStats } from '@/hooks/useComparisonStats';
import { useSequenceStep } from '../dashboard/SequenceContext';

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
  const { isCompleted, completeStep: completeStep3 } = useSequenceStep(3);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [activeBarIndex, setActiveBarIndex] = useState(() => (isCompleted ? 5 : 0));

  useEffect(() => {
    if (isCompleted) {
      const t = setTimeout(() => setActiveBarIndex(5), 0);
      return () => clearTimeout(t);
    }
  }, [isCompleted]);

  useEffect(() => {
    if (activeBarIndex >= 5) {
      completeStep3();
      return;
    }

    const timer = setTimeout(() => {
      setActiveBarIndex((prev) => prev + 1);
    }, 280);

    return () => clearTimeout(timer);
  }, [activeBarIndex, completeStep3]);

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
    const factor = globalStats.mean / 41;
    return Math.min(Math.max(Math.round(peerEst * factor), 10), 90);
  };

  return (
    <div className="border-term-border mt-5 border-t border-dashed pt-5 font-mono">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-term-dim font-mono text-[11px]">
            <span className="mr-1.5 text-white/40">$</span>
            <span>logrithm score --breakdown</span>
          </div>
          <p className="text-term-dim mt-0.5 text-[11px]">
            How your deterministic activity score is calculated
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {SCORE_COMPONENTS.map((comp, compIdx) => {
          const isRowActive = compIdx <= activeBarIndex;
          const score = isRowActive ? breakdown[comp.key] : 0;
          const peerVal = getPeerVal(comp.peerEst);

          // Calculate weighted points
          const userPoints = Math.round((score * comp.weight) / 10) / 10;
          const peerPoints = Math.round((peerVal * comp.weight) / 10) / 10;

          const keyLabels: Record<string, string> = {
            volume: 'commit_volume',
            consistency: 'consistency',
            collaboration: 'collaboration',
            diversity: 'diversity',
            momentum: 'momentum',
          };
          const labelStr = (keyLabels[comp.key] || comp.key).padEnd(15);

          const totalBlocks = 24;
          const filledBlocks = Math.round((score / 100) * totalBlocks);

          return (
            <div
              key={comp.key}
              className={`flex flex-col gap-2 font-mono text-xs transition-all duration-300 ease-out sm:flex-row sm:items-center sm:gap-4 ${
                isRowActive ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
              }`}
            >
              {/* Bracketed Label */}
              <div className="flex w-44 shrink-0 items-center gap-1.5">
                <span className="text-term-dim font-mono">[{labelStr.trim()}]</span>

                {/* Tooltip trigger */}
                <div className="relative flex items-center">
                  <button
                    onMouseEnter={() => setActiveTooltip(comp.key)}
                    onMouseLeave={() => setActiveTooltip(null)}
                    onClick={() => setActiveTooltip(activeTooltip === comp.key ? null : comp.key)}
                    className="text-term-dim hover:text-term-accent focus:outline-none"
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                  </button>
                  {activeTooltip === comp.key && (
                    <div className="border-term-border bg-term-bg text-term-light absolute bottom-6 left-0 z-50 w-64 rounded border p-3 font-sans text-xs normal-case shadow-xl backdrop-blur-md">
                      {comp.description}
                    </div>
                  )}
                </div>
              </div>

              {/* Block Segment Progress Bar */}
              <div className="flex max-w-50 min-w-37.5 flex-1 items-center">
                <div className="bg-term-block border-term-border flex w-full justify-between rounded-xs border p-[1.5px]">
                  {Array.from({ length: totalBlocks }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-3 w-1 shrink-0 transition-colors duration-200 sm:w-1.5 ${
                        i < filledBlocks ? 'bg-term-accent' : 'bg-transparent'
                      }`}
                      style={{ marginRight: i < totalBlocks - 1 ? '1px' : '0' }}
                    />
                  ))}
                </div>
              </div>

              {/* User Points */}
              <span className="text-term-accent w-16 shrink-0 font-mono font-semibold sm:text-right">
                {userPoints.toFixed(1)}/{comp.weight}
              </span>

              {/* Peer Average Inline (with blur if not pro) */}
              <span className="text-term-dim w-24 shrink-0 font-mono">
                {isPro ? (
                  <>peer:{peerPoints.toFixed(1)}</>
                ) : (
                  <span className="inline-flex items-center">
                    peer:
                    <span className="ml-1 blur-[2.5px] select-none">{peerPoints.toFixed(1)}</span>
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
