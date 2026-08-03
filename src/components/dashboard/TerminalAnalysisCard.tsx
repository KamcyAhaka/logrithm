'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Copy, Share2, Zap, Check, RefreshCw } from 'lucide-react';
import type { GitHubActivity, InsightObject } from '@/types/github';
import { BootSequence, CursorPrompt } from './Loaders';

interface TerminalAnalysisCardProps {
  login: string;
  totalCommits: number;
  totalRepos: number;
  insights: InsightObject | null;
  loading: boolean;
  activityLoading?: boolean;
  activity?: GitHubActivity | null;
  error?: string | null;
  onRun?: () => void;
  isPublicView?: boolean;
  onComplete?: () => void;
}

export default function TerminalAnalysisCard({
  login,
  totalCommits,
  totalRepos,
  insights,
  loading,
  activityLoading,
  activity,
  error,
  onRun,
  isPublicView = false,
  onComplete,
}: TerminalAnalysisCardProps) {
  const [showToast, setShowToast] = useState(false);
  const playedInsightsRef = useRef<InsightObject | null>(null);
  const [streamStep, setStreamStep] = useState(1);

  const handleCopyProfileLink = async () => {
    if (!login) return;
    const profileUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/u/${login}`
        : `https://logrithm.dev/u/${login}`;

    try {
      await navigator.clipboard.writeText(profileUrl);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    } catch (err) {
      console.error('Failed to copy profile URL:', err);
    }
  };

  // Derive final target strengths directly from insights prop during render
  const finalBullets = (insights?.strengths ?? [])
    .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
    .slice(0, 3);

  // Monitor insights availability and reference change
  useEffect(() => {
    if (!insights) {
      playedInsightsRef.current = null;
      const t = setTimeout(() => setStreamStep(1), 0);
      return () => clearTimeout(t);
    }

    if (insights !== playedInsightsRef.current) {
      playedInsightsRef.current = insights;
      const t = setTimeout(() => setStreamStep(1), 0);
      return () => clearTimeout(t);
    }
  }, [insights]);

  // Handle the sequential reveal steps
  useEffect(() => {
    if (streamStep >= 4) {
      if (insights && playedInsightsRef.current === insights) {
        onComplete?.();
      }
      return;
    }

    const delay = 350; // 350ms per reveal step
    const timer = setTimeout(() => {
      setStreamStep((prev) => prev + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [streamStep, insights, onComplete]);

  const displayedInsights = finalBullets.slice(0, Math.min(streamStep, finalBullets.length));
  const isTyping = streamStep < 4;

  return (
    <div className="relative font-mono">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 z-50 flex w-auto max-w-[90vw] -translate-x-1/2 items-center gap-3 rounded-lg border border-white/10 bg-[#141414]/90 px-4 py-3 font-mono text-xs whitespace-nowrap text-white shadow-xl shadow-black/50 backdrop-blur-md">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1D9E75]/15 text-[#1D9E75]">
            <Check size={11} />
          </div>
          <span>Profile link copied to clipboard!</span>
        </div>
      )}

      {/* Section header row — comment label + action buttons inline */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="text-term-dim font-mono text-[11px]">
          <span className="mr-1 text-white/40">$</span>
          <span>logrithm analyze --user={login}</span>
        </div>

        {insights && !isPublicView && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyProfileLink}
              className="border-term-border bg-term-block text-term-light hover:bg-term-accent/15 flex items-center gap-1.5 rounded border px-2.5 py-1 font-mono text-[11px] transition-all hover:text-white"
              title="Copy Profile URL"
            >
              <Copy size={12} />
              <span className="hidden sm:inline">Copy link</span>
            </button>
            <Link
              href={`/share/${login}`}
              className="border-term-border bg-term-block text-term-light hover:bg-term-accent/15 flex items-center gap-1.5 rounded border px-2.5 py-1 font-mono text-[11px] transition-all hover:text-white"
              title="Share Card"
            >
              <Share2 size={12} />
              <span className="hidden sm:inline">Share card ↗</span>
            </Link>
            {onRun && (
              <button
                onClick={onRun}
                disabled={loading}
                className="border-term-border bg-term-accent/15 text-term-accent hover:bg-term-accent/30 flex items-center gap-1.5 rounded border px-2.5 py-1 font-mono text-[11px] font-medium transition-all disabled:opacity-50"
                title="Re-run Algorithm"
              >
                {loading ? (
                  <RefreshCw size={12} className="animate-spin" />
                ) : (
                  <Zap size={12} className="text-term-accent" />
                )}
                <span>Update</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="text-term-light font-mono text-xs leading-relaxed sm:text-sm">
        {loading || activityLoading || (!insights && !error) ? (
          <div className="space-y-3">
            <CursorPrompt
              text={
                loading
                  ? `analyzing @${login}`
                  : activityLoading
                    ? `connecting to GitHub API`
                    : `logrithm dashboard --user=${login}`
              }
            />
            <BootSequence
              activityLoading={!!activityLoading}
              insightsLoading={loading}
              activity={activity || null}
              insights={insights}
            />
          </div>
        ) : error ? (
          <div className="space-y-2">
            <div className="border-t border-red-500/20 pt-4 text-red-400">
              <p>✗ Analysis error: {error}</p>
              {onRun && (
                <button
                  onClick={onRun}
                  className="mt-3 flex items-center gap-1.5 rounded border border-red-500/30 bg-red-500/10 px-3 py-1 font-mono text-xs text-red-300 hover:bg-red-500/20"
                >
                  <RefreshCw size={12} />
                  Retry algorithm
                </button>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="text-term-dim mb-4 text-[11px]">
              &gt; {totalCommits.toLocaleString()} commits across {totalRepos} repos indexed · score
              computed
            </div>

            <div className="border-term-border border-t border-dashed pt-4">
              <div className="space-y-2">
                {displayedInsights
                  .filter((b) => Boolean(b && b.trim()))
                  .map((bullet, idx) => (
                    <div key={idx} className="text-term-accent flex items-start gap-2">
                      <span className="text-term-dim shrink-0">insight:</span>
                      <span className="leading-normal">{bullet}</span>
                    </div>
                  ))}
                {isTyping && (
                  <span className="bg-term-accent inline-block h-3.5 w-1.5 animate-pulse align-middle" />
                )}
              </div>

              {!isTyping && (
                <div className="border-term-border mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-dashed pt-4">
                  <div className="flex items-center gap-3">
                    <span className="text-term-dim">activity score:</span>
                    <span className="border-term-border bg-term-block text-term-accent rounded border px-2.5 py-1 text-sm font-bold">
                      {insights?.activityScore} / 100
                    </span>
                  </div>

                  {(insights?.tags?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {insights?.tags?.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="border-term-border bg-term-block text-term-dim rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
