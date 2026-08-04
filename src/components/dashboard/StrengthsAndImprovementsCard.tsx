'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { useSequenceStep } from './SequenceContext';

interface StrengthsAndImprovementsCardProps {
  strengths: string[];
  improvements: string[];
}

export default function StrengthsAndImprovementsCard({
  strengths,
  improvements,
}: StrengthsAndImprovementsCardProps) {
  const { isCompleted, completeStep: completeStep10 } = useSequenceStep(10);
  const totalItems = strengths.length + improvements.length;
  const [activeItemIndex, setActiveItemIndex] = useState(() => (isCompleted ? totalItems : 0));

  useEffect(() => {
    if (isCompleted) {
      const t = setTimeout(() => setActiveItemIndex(totalItems), 0);
      return () => clearTimeout(t);
    }
  }, [isCompleted, totalItems]);

  useEffect(() => {
    if (activeItemIndex >= totalItems) {
      completeStep10();
      return;
    }

    const timer = setTimeout(() => {
      setActiveItemIndex((prev) => prev + 1);
    }, 150);

    return () => clearTimeout(timer);
  }, [activeItemIndex, totalItems, completeStep10]);

  if (strengths.length === 0 && improvements.length === 0) return null;

  return (
    <div className="flex flex-col gap-5 font-mono">
      {/* Section header */}
      <div className="text-term-dim font-mono text-[11px]">
        <span className="mr-1.5 text-white/40">$</span>
        <span>logrithm audit --insights</span>
      </div>
      {/* Key Strengths (Top) */}
      {strengths.length > 0 && (
        <div className="space-y-2">
          <p className="text-term-accent flex items-center gap-1.5 font-mono text-xs tracking-wider uppercase">
            <TrendingUp size={13} className="text-term-accent" />
            Key Strengths
          </p>
          <ul className="flex flex-col gap-2">
            {strengths.map((s, i) => {
              const isVisible = i < activeItemIndex;
              return (
                <li
                  key={i}
                  className={`border-term-border bg-term-block text-term-light rounded border p-3 font-mono text-xs leading-relaxed transition-all duration-300 ease-out ${
                    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
                  }`}
                >
                  {s}
                </li>
              );
            })}
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
            {improvements.map((s, i) => {
              const globalIdx = strengths.length + i;
              const isVisible = globalIdx < activeItemIndex;
              return (
                <li
                  key={i}
                  className={`border-term-border bg-term-block text-term-dim rounded border p-3 font-mono text-xs leading-relaxed transition-all duration-300 ease-out ${
                    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
                  }`}
                >
                  {s}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
