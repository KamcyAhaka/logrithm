'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Copy, Share2, Zap, Check, Terminal, RefreshCw } from 'lucide-react';
import type { InsightObject } from '@/types/github';

interface TerminalAnalysisCardProps {
  login: string;
  totalCommits: number;
  totalRepos: number;
  insights: InsightObject | null;
  loading: boolean;
  error?: string | null;
  onRun?: () => void;
  isPublicView?: boolean;
}

export default function TerminalAnalysisCard({
  login,
  totalCommits,
  totalRepos,
  insights,
  loading,
  error,
  onRun,
  isPublicView = false,
}: TerminalAnalysisCardProps) {
  const [showToast, setShowToast] = useState(false);
  const [visibleCount, setVisibleCount] = useState(1);

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

  // Progressive line animation — callback only, zero synchronous setState in effect body
  useEffect(() => {
    if (finalBullets.length <= 1) return;

    const interval = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev < finalBullets.length) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [insights, finalBullets.length]);

  const displayedInsights = finalBullets.slice(0, visibleCount);
  const isTyping = visibleCount < finalBullets.length;

  return (
    <div
      className="glass-card relative overflow-hidden transition-all duration-300 hover:border-emerald-500/30"
      style={{
        borderRadius: '1.25rem',
        background: 'rgba(10, 14, 12, 0.85)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(29, 158, 117, 0.2)',
        boxShadow: '0 12px 32px -8px rgba(0, 0, 0, 0.5), 0 0 20px rgba(29, 158, 117, 0.08)',
      }}
    >
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 z-50 flex w-auto max-w-[90vw] -translate-x-1/2 items-center gap-3 rounded-lg border border-white/10 bg-[#141414]/90 px-4 py-3 font-mono text-xs whitespace-nowrap text-white shadow-xl shadow-black/50 backdrop-blur-md">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1D9E75]/15 text-[#1D9E75]">
            <Check size={11} />
          </div>
          <span>Profile link copied to clipboard!</span>
        </div>
      )}

      {/* Terminal Title Bar */}
      <div
        className="flex items-center justify-between border-b border-white/10 px-4 py-3"
        style={{ background: 'rgba(255, 255, 255, 0.02)' }}
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
            <div className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
            <div className="h-3 w-3 rounded-full bg-[#28C840]" />
          </div>
          <span className="ml-2 font-mono text-xs tracking-wider text-white/50">
            logrithm — live_analysis.sh
          </span>
        </div>

        {/* Action Controls */}
        {insights && !isPublicView && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyProfileLink}
              className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[11px] text-white/70 transition-all hover:bg-white/10 hover:text-white"
              title="Copy Profile URL"
            >
              <Copy size={12} />
              <span className="hidden sm:inline">Copy link</span>
            </button>
            <Link
              href={`/share/${login}`}
              className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[11px] text-white/70 transition-all hover:bg-white/10 hover:text-white"
              title="Share Card"
            >
              <Share2 size={12} />
              <span className="hidden sm:inline">Share card ↗</span>
            </Link>
            {onRun && (
              <button
                onClick={onRun}
                disabled={loading}
                className="flex items-center gap-1.5 rounded-md border border-[#1D9E75]/30 bg-[#1D9E75]/15 px-2.5 py-1 font-mono text-[11px] font-medium text-[#4ade80] transition-all hover:bg-[#1D9E75]/25"
                title="Re-run Algorithm"
              >
                {loading ? (
                  <RefreshCw size={12} className="animate-spin" />
                ) : (
                  <Zap size={12} className="text-[#4ade80]" />
                )}
                <span>Update</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Terminal Content Body */}
      <div className="p-5 font-mono text-xs leading-relaxed text-white/80 sm:p-6 sm:text-sm">
        {/* CLI Command Line */}
        <div className="flex items-center gap-2 text-[#4ade80]">
          <span className="text-white/40">$</span>
          <span className="font-semibold">logrithm analyze @{login}</span>
        </div>

        {/* Initial Fetch Status */}
        <div className="mt-2 space-y-1 text-white/50">
          <p className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#1D9E75]" />
            fetching 12 months of activity...
          </p>

          <p className="text-emerald-400/90">
            ✓ {totalCommits.toLocaleString()} commits across {totalRepos} repos
          </p>

          <p className="flex items-center gap-2 text-emerald-400/90">
            ✓ running algorithm...
            {loading && <span className="ml-1 inline-block h-3 w-1 animate-pulse bg-[#4ade80]" />}
          </p>
        </div>

        {/* Dynamic Insight Bullet Output */}
        {loading ? (
          <div className="mt-4 space-y-2 border-t border-white/5 pt-4 text-emerald-400/70">
            <div className="flex items-center gap-2">
              <span className="animate-spin text-xs">⚡</span>
              <span>analyzing commit rhythms and code distribution...</span>
            </div>
            <div className="h-2 w-48 animate-pulse rounded bg-[#1D9E75]/20" />
            <div className="h-2 w-64 animate-pulse rounded bg-[#1D9E75]/15" />
          </div>
        ) : error ? (
          <div className="mt-4 border-t border-red-500/20 pt-4 text-red-400">
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
        ) : !insights ? (
          <div className="mt-4 border-t border-white/5 pt-4">
            <p className="text-white/40">No cached insights found for @{login}.</p>
            {onRun && (
              <button
                onClick={onRun}
                className="mt-3 flex items-center gap-2 rounded-lg bg-[#1D9E75] px-4 py-2 font-mono text-xs font-bold text-white transition-all hover:bg-[#1D9E75]/90 hover:shadow-lg hover:shadow-[#1D9E75]/30"
              >
                <Terminal size={14} />
                Run algorithm
              </button>
            )}
          </div>
        ) : (
          <div className="mt-4 border-t border-white/10 pt-4">
            <div className="space-y-2">
              {displayedInsights
                .filter((b) => Boolean(b && b.trim()))
                .map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-emerald-300/90">
                    <span className="shrink-0 text-white/40">insight:</span>
                    <span className="leading-normal">{bullet}</span>
                  </div>
                ))}
              {isTyping && (
                <span className="inline-block h-3.5 w-1.5 animate-pulse bg-[#4ade80] align-middle" />
              )}
            </div>

            {/* Score Banner Output */}
            {!isTyping && (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-4">
                <div className="flex items-center gap-3">
                  <span className="text-white/50">activity score:</span>
                  <span className="rounded-md border border-[#1D9E75]/40 bg-[#1D9E75]/20 px-2.5 py-1 text-sm font-bold text-[#4ade80]">
                    {insights.activityScore} / 100
                  </span>
                </div>

                {insights.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {insights.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] tracking-wider text-white/70 uppercase"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
