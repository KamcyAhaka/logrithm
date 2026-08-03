'use client';

import { TrendingUp, AlertCircle } from 'lucide-react';

interface StrengthsAndImprovementsCardProps {
  strengths: string[];
  improvements: string[];
}

export default function StrengthsAndImprovementsCard({
  strengths,
  improvements,
}: StrengthsAndImprovementsCardProps) {
  if (strengths.length === 0 && improvements.length === 0) return null;

  return (
    <div
      className="glass-card relative overflow-hidden p-5 transition-all duration-300"
      style={{
        borderRadius: '1.25rem',
        background: 'rgba(10, 14, 12, 0.65)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <div className="flex flex-col gap-5">
        {/* Key Strengths (Top) */}
        {strengths.length > 0 && (
          <div className="space-y-2">
            <p className="flex items-center gap-1.5 font-mono text-xs tracking-wider text-emerald-400 uppercase">
              <TrendingUp size={13} className="text-[#4ade80]" />
              Key Strengths
            </p>
            <ul className="flex flex-col gap-2">
              {strengths.map((s, i) => (
                <li
                  key={i}
                  className="rounded-lg border border-[#1D9E75]/25 bg-[#1D9E75]/10 p-3 font-sans text-xs leading-relaxed text-emerald-200/90"
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Areas to Explore (Bottom - Stacked Vertically) */}
        {improvements.length > 0 && (
          <div className="space-y-2 border-t border-white/5 pt-2">
            <p className="flex items-center gap-1.5 font-mono text-xs tracking-wider text-amber-400 uppercase">
              <AlertCircle size={13} className="text-amber-400" />
              Areas to Explore
            </p>
            <ul className="flex flex-col gap-2">
              {improvements.map((s, i) => (
                <li
                  key={i}
                  className="rounded-lg border border-white/10 bg-white/5 p-3 font-sans text-xs leading-relaxed text-white/70"
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
