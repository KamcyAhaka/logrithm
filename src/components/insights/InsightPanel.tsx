'use client'

import React from 'react';
import { Sparkles, Terminal } from 'lucide-react';

interface Insights {
  summary: string;
  strengths: string[];
  improvements: string[];
  patterns: string;
  topLanguages: string[];
  activityScore: number;
  tags: string[];
}

interface InsightPanelProps {
  insights: Insights | null;
  isLoading: boolean;
  onGenerate: () => void;
  username?: string;
}

export const InsightPanel = ({ insights, isLoading, onGenerate, username = "demo-dev" }: InsightPanelProps) => {
const shareUrl = `${window.location.origin}/share/${username}`;


  if (!insights && !isLoading) {
    return (
      <div className="glass-card p-12 rounded-3xl flex flex-col items-center justify-center text-center space-y-6">
        <div className="p-4 rounded-2xl bg-primary/10 text-primary">
          <Terminal size={40} />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold font-mono tracking-tight">Ready for analysis</h3>
          <p className="text-white/40 max-w-sm text-sm">
            Logrithm is waiting to decode your development patterns using Gemini 2.5 Flash.
          </p>
        </div>
        <button 
          onClick={onGenerate}
          className="px-8 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
        >
          Run the algorithm
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="glass-card p-8 rounded-3xl space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-6 bg-white/10 rounded w-1/4" />
          <div className="h-10 bg-white/10 rounded-full w-24" />
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-white/10 rounded w-full" />
          <div className="h-4 bg-white/10 rounded w-5/6" />
        </div>
        <div className="flex gap-2">
          <div className="h-6 bg-white/10 rounded-full w-20" />
          <div className="h-6 bg-white/10 rounded-full w-20" />
        </div>
      </div>
    );
  }

  // Combine tags for the UI, fallback to languages if tags are missing
  const allTags = insights?.tags?.length ? insights.tags : (insights?.topLanguages ?? []);

  return (
    <div className="glass-card p-8 rounded-3xl space-y-8 animate-in relative overflow-hidden">
      <div className="flex justify-between items-start">
        <div className="space-y-0.5">
          <h3 className="text-xl font-bold font-mono tracking-tight">@{username} — Logrithm analysis</h3>
          <span className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold">Generated just now</span>
        </div>
        <div className="px-4 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono text-sm font-bold">
          score: {insights!.activityScore}
        </div>
      </div>

      <div className="space-y-6">
        <p className="text-white/70 text-lg leading-relaxed font-medium">
          {insights!.summary}
        </p>

        <div className="flex flex-wrap gap-2">
          {allTags.map((tag, i) => (
            <span 
              key={i} 
              className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-wider font-bold text-white/50"
            >
              {tag}
            </span>
          ))}
          {/* <button className="px-2 py-1 text-white/20 hover:text-white/40 transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </button> */}
        </div>
        <button onClick={() => window.open(shareUrl, '_blank')} className="...">
  Share insight ↗
</button>

      </div>
    </div>
  );
};
