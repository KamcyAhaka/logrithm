'use client'

import React from 'react';

interface TerminalWindowProps {
  username?: string;
  commits?: number;
  repos?: number;
  score?: number | string;
  insights?: string[];
  isVisible?: boolean;
}

export const TerminalWindow = ({ 
  username = "demo-dev", 
  commits = 847, 
  repos = 12, 
  score = 82, 
  insights = [
    "Peak velocity Tue-Wed 10am-2pm",
    "TypeScript dominance — 68% of output",
    "sprint-and-rest pattern detected"
  ],
  isVisible = true 
}: TerminalWindowProps) => {
  if (!isVisible) return null;

  return (
    <div className="terminal-window rounded-xl overflow-hidden max-w-2xl w-full mx-auto font-mono text-sm shadow-2xl">
      {/* Header */}
      <div className="bg-[#1A1A1A] px-4 py-2 border-b border-[#333] flex items-center justify-between">
        <div className="flex space-x-1.5">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
        </div>
        <div className="text-[10px] uppercase tracking-widest text-white/20">logrithm — analysis</div>
      </div>
      
      {/* Body */}
      <div className="p-6 space-y-4 text-white/80">
        <div className="flex space-x-2">
          <span className="text-primary">$</span>
          <span>log<span className="text-primary">rithm</span> analyze @{username}</span>
        </div>
        
        <div className="text-white/40 italic">fetching 12 months of activity...</div>
        
        <div className="space-y-1 text-left">
          <div className="flex items-center space-x-2 text-primary">
            <span>✓</span>
            <span>{commits} commits across {repos} repos</span>
          </div>
          <div className="flex items-center space-x-2 text-primary">
            <span>✓</span>
            <span className={score === '--' ? 'animate-pulse' : ''}>
              {score === '--' ? 'running algorithm...' : 'algorithm complete'}
            </span>
          </div>
        </div>

        {insights && insights.length > 0 && (
          <div className="pt-2 space-y-1 text-left">
            {insights.slice(0, 3).map((insight, i) => (
              <div key={i} className="flex space-x-2">
                <span className="text-accent">insight:</span>
                <span>{insight}</span>
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 text-primary font-bold text-left">
          activity score: {score}/100
        </div>
      </div>
    </div>
  );
};
