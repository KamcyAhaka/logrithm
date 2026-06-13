'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
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

  return (
    <div
      className="glass-card"
      style={{
        padding: '1.5rem',
        height: '100%',
        minHeight: '280px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <h3
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: '1rem',
        }}
      >
        Languages
      </h3>

      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, i) => (
                <Cell key={`cell-${i}`} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: '#1a1a1a',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '0.5rem',
                fontFamily: 'JetBrains Mono',
                fontSize: '0.75rem',
              }}
              formatter={(value, name) => [
                `${value ?? 0} commits (${Math.round((((value as number) ?? 0) / total) * 100)}%)`,
                name as string,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {data.map((lang) => (
          <div
            key={lang.name}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: lang.color,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                }}
              >
                {lang.name}
              </span>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
              }}
            >
              {lang.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
