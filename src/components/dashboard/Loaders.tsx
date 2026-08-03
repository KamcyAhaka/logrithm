'use client';

import { useState, useEffect } from 'react';
import type { GitHubActivity, InsightObject } from '@/types/github';

// ----------------------------------------------------
// 1. Boot Sequence Loader
// ----------------------------------------------------
interface BootSequenceProps {
  activityLoading: boolean;
  insightsLoading: boolean;
  activity: GitHubActivity | null;
  insights: InsightObject | null;
}

export function BootSequence({
  activityLoading,
  insightsLoading,
  activity,
  insights,
}: BootSequenceProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (activityLoading) {
      const t0 = setTimeout(() => setStep(1), 0);
      const t1 = setTimeout(() => setStep(2), 600);
      const t2 = setTimeout(() => setStep(3), 1200);
      return () => {
        clearTimeout(t0);
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [activityLoading]);

  // Sync with loaded activity state
  useEffect(() => {
    if (activity && !activityLoading) {
      const t = setTimeout(() => setStep(4), 0);
      return () => clearTimeout(t);
    }
  }, [activity, activityLoading]);

  // Sync with starting insights run state
  useEffect(() => {
    if (insightsLoading) {
      const t = setTimeout(() => setStep(5), 0);
      return () => clearTimeout(t);
    }
  }, [insightsLoading]);

  // Sync with finished insights state
  useEffect(() => {
    if (insights && !insightsLoading) {
      const t = setTimeout(() => setStep(6), 0);
      return () => clearTimeout(t);
    }
  }, [insights, insightsLoading]);

  const lines: string[] = [];
  if (step >= 1) lines.push('Connecting to GitHub API...');
  if (step >= 2) lines.push('Connection established. Authentication successful.');
  if (step === 3) {
    lines.push('Retrieving commits...');
    lines.push('Retrieving repositories...');
  }
  if (step >= 4 && activity) {
    lines.push(`Fetched commits: ${activity.totalCommitContributions}`);
    lines.push(`Fetched repositories: ${activity.totalRepositoriesWithContributedCommits}`);
  }
  if (step >= 5) {
    lines.push('Running analytics engine...');
  }
  if (step >= 6) {
    lines.push('Analysis complete.');
  }

  return (
    <div className="min-h-[80px] space-y-1.5 font-mono text-xs text-[#4ade80]">
      {lines.map((line, idx) => (
        <div
          key={idx}
          className="opacity-100 transition-opacity duration-300 ease-in-out"
          style={{ contentVisibility: 'auto' }}
        >
          {line}
        </div>
      ))}
    </div>
  );
}

// ----------------------------------------------------
// 2. Cursor Prompt Loader
// ----------------------------------------------------
interface CursorPromptProps {
  text: string;
}

export function CursorPrompt({ text }: CursorPromptProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible((v) => !v);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center font-mono text-[13px] text-[#c8d8c8]">
      <span className="mr-2 text-[#5a6a5a]">$</span>
      <span>{text}</span>
      <span
        className="ml-1 inline-block h-[14px] w-[8px] bg-[#4ade80] align-middle transition-opacity duration-100"
        style={{ opacity: visible ? 1 : 0 }}
      />
    </div>
  );
}

// ----------------------------------------------------
// 3. Scanning Bar Loader
// ----------------------------------------------------
interface ScanningBarProps {
  text?: string;
}

export function ScanningBar({ text = 'fetching 12 months of activity...' }: ScanningBarProps) {
  const [percent, setPercent] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 98) return 98;
        const diff = (98 - prev) * 0.05;
        return Math.min(98, prev + diff);
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const displayPercent = Math.floor(percent);
  const totalChars = 24;
  const filledChars = Math.round((displayPercent / 100) * totalChars);
  const emptyChars = totalChars - filledChars;
  const bar =
    '='.repeat(filledChars) +
    (filledChars < totalChars ? '>' : '') +
    ' '.repeat(Math.max(0, emptyChars - (filledChars < totalChars ? 1 : 0)));

  return (
    <div className="space-y-1.5 py-4 text-center font-mono text-xs text-[#4ade80]">
      <div className="text-[#c8d8c8]">{text}</div>
      <div className="font-bold tracking-wider">
        [{bar}] {displayPercent}%
      </div>
    </div>
  );
}
