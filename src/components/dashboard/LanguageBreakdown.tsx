'use client';

import type { Repository } from '@/types/github';

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

  if (data.length === 0) return null;

  return (
    <div
      className="glass-card relative overflow-hidden p-5 transition-all duration-300"
      style={{
        borderRadius: '1.25rem',
        background: 'rgba(10, 14, 12, 0.65)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <div className="flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-xs tracking-wider text-white/50 uppercase">
            Language Breakdown
          </h3>
          <span className="font-mono text-xs text-white/40">
            {total.toLocaleString()} commits total
          </span>
        </div>

        {/* Multi-segment Horizontal Progress Bar */}
        <div className="flex h-3.5 w-full overflow-hidden rounded-full border border-white/10 bg-white/5 p-0.5">
          {data.map((lang) => {
            const pct = Math.max(2, Math.round((lang.value / total) * 100));
            return (
              <div
                key={lang.name}
                style={{
                  width: `${pct}%`,
                  backgroundColor: lang.color,
                  transition: 'width 0.5s ease-in-out',
                }}
                className="h-full first:rounded-l-full last:rounded-r-full hover:brightness-125"
                title={`${lang.name}: ${lang.value} commits (${pct}%)`}
              />
            );
          })}
        </div>

        {/* Horizontal Language Legend */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
          {data.map((lang) => {
            const pct = Math.round((lang.value / total) * 100);
            return (
              <div key={lang.name} className="flex items-center gap-2 font-mono text-xs">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: lang.color }}
                />
                <span className="font-medium text-white/80">{lang.name}</span>
                <span className="text-white/40">
                  {lang.value} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
