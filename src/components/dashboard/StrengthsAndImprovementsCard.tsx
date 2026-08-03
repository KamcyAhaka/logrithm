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
    <div className="flex flex-col gap-5">
      {/* Section header */}
      <div className="text-term-dim font-mono text-[11px] font-semibold tracking-wider uppercase">
        {'// strengths_and_improvements.log'}
      </div>
      {/* Key Strengths (Top) */}
      {strengths.length > 0 && (
        <div className="space-y-2">
          <p className="text-term-accent flex items-center gap-1.5 font-mono text-xs tracking-wider uppercase">
            <TrendingUp size={13} className="text-term-accent" />
            Key Strengths
          </p>
          <ul className="flex flex-col gap-2">
            {strengths.map((s, i) => (
              <li
                key={i}
                className="border-term-border bg-term-block text-term-light rounded border p-3 font-mono text-xs leading-relaxed"
              >
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Areas to Explore (Bottom - Stacked Vertically) */}
      {improvements.length > 0 && (
        <div className="border-term-border space-y-2 border-t border-dashed pt-4">
          <p className="text-term-dim flex items-center gap-1.5 font-mono text-xs tracking-wider uppercase">
            <AlertCircle size={13} className="text-term-dim" />
            Areas to Explore
          </p>
          <ul className="flex flex-col gap-2">
            {improvements.map((s, i) => (
              <li
                key={i}
                className="border-term-border bg-term-block text-term-dim rounded border p-3 font-mono text-xs leading-relaxed"
              >
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
