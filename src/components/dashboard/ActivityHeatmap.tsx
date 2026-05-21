'use client';

import { useState } from 'react';
import type { ContributionCalendar } from '@/types/github';

interface ActivityHeatmapProps {
  contributionCalendar: ContributionCalendar;
}

// 5 intensity levels matching GitHub's style
function getIntensityLevel(count: number): number {
  if (count === 0) return 0;
  if (count <= 3) return 1;
  if (count <= 6) return 2;
  if (count <= 9) return 3;
  return 4;
}

const LEVEL_COLORS = [
  'rgba(255,255,255,0.05)',  // 0 — empty
  'rgba(29,158,117,0.25)',   // 1 — light
  'rgba(29,158,117,0.45)',   // 2 — medium
  'rgba(29,158,117,0.70)',   // 3 — dark
  'rgba(29,158,117,0.95)',   // 4 — full
];

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

export default function ActivityHeatmap({ contributionCalendar }: ActivityHeatmapProps) {
  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  const { weeks } = contributionCalendar;

  // Get month labels for the top axis
  const monthLabels: { label: string; colIndex: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, i) => {
    const firstDay = week.contributionDays[0];
    if (!firstDay) return;
    const month = new Date(firstDay.date).getMonth();
    if (month !== lastMonth) {
      monthLabels.push({
        label: new Date(firstDay.date).toLocaleDateString('en-US', { month: 'short' }),
        colIndex: i,
      });
      lastMonth = month;
    }
  });

  const cellSize = 14;
  const cellGap = 5;
  const totalWidth = weeks.length * (cellSize + cellGap);

  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <h3
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          Activity Heatmap —{' '}
          <span style={{ color: 'var(--green)' }}>
            {contributionCalendar.totalContributions.toLocaleString()}
          </span>{' '}
          contributions
        </h3>
      </div>

      {/* Scroll wrapper for small screens */}
      <div style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <div style={{ position: 'relative', minWidth: totalWidth + 32, width: '100%' }}>

          {/* Grid */}
          <div style={{ display: 'flex', gap: cellGap, width: "100%", marginTop: '20px' }}>
            {/* Day-of-week labels */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: cellGap,
                marginRight: 4,
              }}
            >
              {DAY_LABELS.map((label, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    width: 24,
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9px',
                    color: 'rgba(255,255,255,0.25)',
                    paddingRight: 2,
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
            
            {/* Weeks */}
            {weeks.map((week, wi) => {
              const mLabel = monthLabels.find(m => m.colIndex === wi);
              return (
                <div
                  key={wi}
                  style={{ display: 'flex', flexDirection: 'column', gap: cellGap, flex: 1, position: 'relative' }}
                >
                  {mLabel && (
                    <span style={{
                      position: 'absolute',
                      top: -20,
                      left: 0,
                      fontFamily: 'var(--font-mono)',
                      fontSize: '9px',
                      color: 'rgba(255,255,255,0.3)',
                      whiteSpace: 'nowrap',
                    }}>
                      {mLabel.label}
                    </span>
                  )}
                  {week.contributionDays.map((day, di) => {
                    const level = getIntensityLevel(day.contributionCount);
                    return (
                      <div
                        key={di}
                        style={{
                          width: '100%',
                          aspectRatio: '1 / 1',
                          borderRadius: 2,
                          background: LEVEL_COLORS[level],
                          cursor: 'default',
                          transition: 'transform 0.1s',
                        }}
                        onMouseEnter={(e) => {
                          const rect = (e.target as HTMLElement).getBoundingClientRect();
                          setTooltip({
                            text: `${day.contributionCount} contribution${day.contributionCount !== 1 ? 's' : ''} on ${day.date}`,
                            x: rect.left,
                            y: rect.top,
                          });
                          (e.target as HTMLElement).style.transform = 'scale(1.25)';
                        }}
                        onMouseLeave={(e) => {
                          setTooltip(null);
                          (e.target as HTMLElement).style.transform = 'scale(1)';
                        }}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Less → More legend */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              justifyContent: 'flex-end',
              marginTop: '0.75rem',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                color: 'rgba(255,255,255,0.25)',
              }}
            >
              Less
            </span>
            {LEVEL_COLORS.map((color, i) => (
              <div
                key={i}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: color,
                }}
              />
            ))}
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                color: 'rgba(255,255,255,0.25)',
              }}
            >
              More
            </span>
          </div>
        </div>
      </div>

      {/* Tooltip — fixed position */}
      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y - 36,
            background: '#1a1a1a',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '0.375rem',
            padding: '4px 10px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            color: '#fff',
            pointerEvents: 'none',
            zIndex: 100,
            whiteSpace: 'nowrap',
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
