'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TrendingUp, AlertCircle, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import InsightSkeleton from './InsightSkeleton';
import type { InsightObject } from '@/types/github';
import ScoreBreakdown from './ScoreBreakdown';
import type { ComparisonStats } from '@/hooks/useComparisonStats';
import LimitModal from './LimitModal';
import { ErrorState, ReadyState } from './InsightPanelStates';
import TerminalAnalysisCard from '../dashboard/TerminalAnalysisCard';

interface InsightPanelProps {
  insights: InsightObject | null;
  loading: boolean;
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
}

export default function InsightPanel({
  insights,
  loading,
  error,
  onRun,
  onClearError,
  login = 'developer',
  globalStats,
  isPublicView = false,
  hideDetails = false,
  totalCommits = 0,
  totalRepos = 0,
}: InsightPanelProps) {
  const [showFullReport, setShowFullReport] = useState(true);

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
        error={error}
        onRun={onRun}
        isPublicView={isPublicView}
      />

      {/* Deep-Dive Report & Insights Breakdown */}
      {insights && !loading && !error && (
        <div
          className="glass-card relative overflow-hidden transition-all duration-300"
          style={{
            padding: '1.25rem 1.5rem',
            borderRadius: '1.25rem',
            background: 'rgba(10, 14, 12, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {/* Header & Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="font-mono text-xs tracking-wider text-white/50 uppercase">
                Full AI Analysis & Breakdown
              </h4>
              <span className="font-mono text-[10px] text-[#4ade80] opacity-80">
                Gemini 2.5 Flash
              </span>
            </div>

            <button
              onClick={() => setShowFullReport((prev) => !prev)}
              className="flex items-center gap-1 font-mono text-xs text-white/60 transition-colors hover:text-white"
            >
              <span>{showFullReport ? 'Collapse report' : 'Expand report'}</span>
              {showFullReport ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {/* Expandable Report Content */}
          {showFullReport && (
            <div className="mt-4 flex flex-col gap-5 border-t border-white/5 pt-4">
              {/* Summary Paragraph */}
              <p className="font-sans text-sm leading-relaxed text-white/80">{insights.summary}</p>

              {/* Tags & Stacks */}
              <div className="flex flex-wrap items-center gap-2">
                {insights.tags.map((tag) => (
                  <span key={tag} className="pill pill-white">
                    {tag}
                  </span>
                ))}
                {insights.topLanguages.map((lang) => (
                  <span key={lang} className="pill pill-green">
                    {lang}
                  </span>
                ))}
              </div>

              {/* Score Breakdown */}
              {insights.scoreBreakdown && (
                <ScoreBreakdown
                  scoreBreakdown={insights.scoreBreakdown}
                  globalStats={globalStats ?? null}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Loading Skeleton fallback if needed */}
      {loading && !insights && <InsightSkeleton />}

      {/* Error state */}
      {!loading && error && !isLimitError && <ErrorState error={error} onRun={onRun} />}

      {/* Limit Modal */}
      <LimitModal isOpen={isLimitError} error={error} onClose={onClearError || (() => {})} />
    </div>
  );
}
