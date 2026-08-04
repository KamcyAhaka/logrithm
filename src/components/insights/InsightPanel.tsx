'use client';

import { useState, useEffect } from 'react';

import type { InsightObject } from '@/types/github';
import ScoreBreakdown from './ScoreBreakdown';
import type { ComparisonStats } from '@/hooks/useComparisonStats';
import LimitModal from './LimitModal';
import { ErrorState } from './InsightPanelStates';
import TerminalAnalysisCard from '../dashboard/TerminalAnalysisCard';
import type { GitHubActivity } from '@/types/github';

import RevealSection from '../dashboard/RevealSection';

interface InsightPanelProps {
  insights: InsightObject | null;
  loading: boolean;
  activityLoading?: boolean;
  activity?: GitHubActivity | null;
  error: string | null;
  onRun?: () => void;
  onClearError?: () => void;
  login?: string;
  countryCode?: string | null;
  globalStats?: ComparisonStats | null;
  languageStats?: ComparisonStats | null;
  countryStats?: ComparisonStats | null;
  isPublicView?: boolean;
  hideDetails?: boolean;
  totalCommits?: number;
  totalRepos?: number;
  onComplete?: () => void;
}

export default function InsightPanel({
  insights,
  loading,
  activityLoading,
  activity,
  error,
  onRun,
  onClearError,
  login = 'developer',
  globalStats,
  isPublicView = false,
  totalCommits = 0,
  totalRepos = 0,
  onComplete,
}: InsightPanelProps) {
  const [showFullReport, setShowFullReport] = useState(true);
  const [isConsoleComplete, setIsConsoleComplete] = useState(false);

  useEffect(() => {
    if (!insights || loading) {
      const t = setTimeout(() => setIsConsoleComplete(false), 0);
      return () => clearTimeout(t);
    }
  }, [insights, loading]);

  const handleConsoleComplete = () => {
    setIsConsoleComplete(true);
    onComplete?.();
  };

  const isLimitError = error
    ? error.toLowerCase().includes('limit reached') || error.toLowerCase().includes('pro upgrades')
    : false;

  return (
    <div className="flex flex-col gap-4">
      {/* Terminal Analysis Console */}
      <TerminalAnalysisCard
        login={login}
        totalCommits={totalCommits}
        totalRepos={totalRepos}
        insights={insights}
        loading={loading}
        activityLoading={activityLoading}
        activity={activity}
        error={error}
        onRun={onRun}
        isPublicView={isPublicView}
        onComplete={handleConsoleComplete}
      />

      {/* Step 2: Deep-Dive Report Summary */}
      {insights && !loading && !error && isConsoleComplete && (
        <RevealSection stepIndex={2}>
          <div>
            {/* Header & Toggle */}
            <div className="flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-2">
                <div className="text-term-dim font-mono text-[11px]">
                  <span className="mr-1.5 text-white/40">$</span>
                  <span>logrithm report --summary</span>
                </div>
                <span className="text-term-accent text-[10px] font-bold opacity-80">
                  Gemini 2.5 Flash
                </span>
              </div>

              <button
                onClick={() => setShowFullReport((prev) => !prev)}
                className="text-term-dim hover:text-term-light flex items-center gap-1 text-[11px] transition-colors"
              >
                <span>{showFullReport ? 'collapse' : 'expand'}</span>
              </button>
            </div>

            {/* Expandable Report Content */}
            <div
              className={`grid transition-all duration-300 ease-in-out ${
                showFullReport
                  ? 'mt-4 grid-rows-[1fr] opacity-100'
                  : 'mt-0 grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <div className="border-term-border flex flex-col gap-5 border-t border-dashed pt-4 font-mono">
                  {/* Summary Paragraph */}
                  <p className="text-term-light font-mono text-xs leading-relaxed sm:text-sm">
                    {insights.summary}
                  </p>

                  {/* Tags & Stacks */}
                  <div className="flex flex-wrap items-center gap-2">
                    {insights.tags.map((tag) => (
                      <span
                        key={tag}
                        className="border-term-border bg-term-block text-term-dim rounded border px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase"
                      >
                        {tag}
                      </span>
                    ))}
                    {insights.topLanguages.map((lang) => (
                      <span
                        key={lang}
                        className="border-term-border bg-term-accent/15 text-term-accent rounded border px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </RevealSection>
      )}

      {/* Step 3: Score Breakdown */}
      {insights && !loading && !error && isConsoleComplete && (
        <RevealSection stepIndex={3}>
          <ScoreBreakdown
            scoreBreakdown={insights.scoreBreakdown}
            globalStats={globalStats ?? null}
          />
        </RevealSection>
      )}

      {/* Error state */}
      {!loading && error && !isLimitError && <ErrorState error={error} onRun={onRun} />}

      {/* Limit Modal */}
      <LimitModal isOpen={isLimitError} error={error} onClose={onClearError || (() => {})} />
    </div>
  );
}
