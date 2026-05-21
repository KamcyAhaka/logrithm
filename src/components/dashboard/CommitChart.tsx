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
  // Flatten all days and take the last 30
  const allDays = contributionCalendar.weeks
    .flatMap((w) => w.contributionDays)
    .slice(-30)
    .map((day) => ({
      date: formatDate(day.date),
      commits: day.contributionCount,
    }));

  return (
    <div className="glass-card" style={{ padding: '1.5rem', height: '100%', minHeight: '280px' }}>
      <div style={{ marginBottom: '1rem' }}>
        <h3
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          Commit Activity — Last 30 Days
        </h3>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={allDays} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="commitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1D9E75" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#1D9E75" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontFamily: 'JetBrains Mono', fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
            tickLine={false}
            axisLine={false}
            interval={6}
          />
          <YAxis
            tick={{ fontFamily: 'JetBrains Mono', fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: '#1a1a1a',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '0.5rem',
              fontFamily: 'JetBrains Mono',
              fontSize: '0.75rem',
              color: '#fff',
            }}
            labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}
            itemStyle={{ color: '#1D9E75' }}
            cursor={{ stroke: 'rgba(29,158,117,0.3)', strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="commits"
            stroke="#1D9E75"
            strokeWidth={2}
            fill="url(#commitGradient)"
            dot={false}
            activeDot={{ r: 4, fill: '#1D9E75', stroke: 'transparent' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
