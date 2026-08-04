'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ContributionCalendar } from '@/types/github';

interface CommitChartProps {
  contributionCalendar: ContributionCalendar;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function CommitChart({ contributionCalendar }: CommitChartProps) {
  const allDays = contributionCalendar.weeks
    .flatMap((w) => w.contributionDays)
    .slice(-30)
    .map((day) => ({
      date: formatDate(day.date),
      commits: day.contributionCount,
    }));

  return (
    <div>
      <div className="mb-4">
        <div className="text-term-dim font-mono text-[11px]">
          <span className="mr-1.5 text-white/40">$</span>
          <span>logrithm commits --history --period=30d</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={allDays} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--color-term-dim)' }}
            tickLine={false}
            axisLine={false}
            interval={6}
          />
          <YAxis
            tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--color-term-dim)' }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--color-term-bg)',
              border: '1px solid var(--color-term-border)',
              borderRadius: '0px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--color-term-light)',
            }}
            labelStyle={{ color: 'var(--color-term-dim)', marginBottom: '4px' }}
            itemStyle={{ color: 'var(--color-term-accent)' }}
            cursor={{ stroke: 'var(--color-term-accent)', strokeWidth: 1, strokeOpacity: 0.2 }}
          />
          {/* Linear interpolation — sharp angular lines, no bezier smoothing.
              Flat fill at low opacity — no gradient, matches terminal aesthetic. */}
          <Area
            type="linear"
            dataKey="commits"
            stroke="var(--color-term-accent)"
            strokeWidth={1.5}
            fill="var(--color-term-accent)"
            fillOpacity={0.08}
            dot={false}
            activeDot={{ r: 3, fill: 'var(--color-term-accent)', stroke: 'transparent' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
