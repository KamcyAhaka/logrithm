'use client';

import { useState, useEffect } from 'react';
import type { Repository } from '@/types/github';
import { useSequenceStep } from './SequenceContext';

interface LanguageBreakdownProps {
  repositories: Repository[];
}

const FALLBACK_COLORS = [
  '#1D9E75',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
  '#98D8C8',
  '#F7DC6F',
];

export default function LanguageBreakdown({ repositories }: LanguageBreakdownProps) {
  const { isCompleted, completeStep: completeStep9 } = useSequenceStep(9);

  // Aggregate commit counts by language
  const langMap = repositories
    .filter((r) => r.primaryLanguage)
    .reduce<Record<string, { count: number; color: string }>>((acc, r) => {
      const { name, color } = r.primaryLanguage!;
      if (!acc[name]) acc[name] = { count: 0, color: color ?? '#888' };
      acc[name].count += r.commitCount;
      return acc;
    }, {});

  const data = Object.entries(langMap)
    .filter(([, { count }]) => count > 0)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 6)
    .map(([name, { count, color }], i) => ({
      name,
      value: count,
      color: color !== '#888' ? color : FALLBACK_COLORS[i % FALLBACK_COLORS.length],
    }));

  const total = data.reduce((s, d) => s + d.value, 0);

  const [isBarExpanded, setIsBarExpanded] = useState(isCompleted);
  const [legendIndex, setLegendIndex] = useState(() => (isCompleted ? data.length : 0));

  useEffect(() => {
    if (isCompleted) {
      const t = setTimeout(() => {
        setIsBarExpanded(true);
        setLegendIndex(data.length);
      }, 0);
      return () => clearTimeout(t);
    }
  }, [isCompleted, data.length]);

  useEffect(() => {
    const t = setTimeout(() => setIsBarExpanded(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (legendIndex >= data.length) {
      completeStep9();
      return;
    }

    const timer = setTimeout(() => {
      setLegendIndex((prev) => prev + 1);
    }, 120);

    return () => clearTimeout(timer);
  }, [legendIndex, data.length, completeStep9]);

  if (data.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-term-dim font-mono text-[11px]">
          <span className="mr-1.5 text-white/40">$</span>
          <span>logrithm languages --breakdown</span>
        </div>
        <span className="text-term-dim font-mono text-xs">
          {total.toLocaleString()} commits total
        </span>
      </div>

      {/* Multi-segment Horizontal Progress Bar */}
      <div className="border-term-border bg-term-block flex h-3.5 w-full overflow-hidden rounded-xs border p-0.5">
        {data.map((lang) => {
          const pct = Math.max(2, Math.round((lang.value / total) * 100));
          return (
            <div
              key={lang.name}
              style={{
                width: isBarExpanded ? `${pct}%` : '0%',
                backgroundColor: lang.color,
                transition: 'width 0.6s ease-out',
              }}
              className="h-full first:rounded-l-[1px] last:rounded-r-[1px] hover:brightness-125"
              title={`${lang.name}: ${lang.value} commits (${pct}%)`}
            />
          );
        })}
      </div>

      {/* Horizontal Language Legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
        {data.map((lang, idx) => {
          const pct = Math.round((lang.value / total) * 100);
          const isItemVisible = idx < legendIndex;
          return (
            <div
              key={lang.name}
              className={`flex items-center gap-2 font-mono text-xs transition-all duration-300 ease-out ${
                isItemVisible ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
              }`}
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: lang.color }}
              />
              <span className="text-term-light font-medium">{lang.name}</span>
              <span className="text-term-dim">
                {lang.value} ({pct}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
