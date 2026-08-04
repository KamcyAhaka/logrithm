'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
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
  'var(--color-term-block)', // 0 — empty
  'rgba(74, 222, 128, 0.15)', // 1 — light
  'rgba(74, 222, 128, 0.4)', // 2 — medium
  'rgba(74, 222, 128, 0.7)', // 3 — dark
  'var(--color-term-accent)', // 4 — full
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

  // Single onMouseMove handler on the entire grid container.
  // Uses elementFromPoint + data-tooltip attribute to determine which cell is hovered.
  // This completely avoids the rapid onMouseLeave/onMouseEnter toggling that happens
  // when the cursor crosses the CSS gap space between cells.
  const handleGridMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    const text = el?.dataset?.tooltip;
    if (text) {
      const rect = el!.getBoundingClientRect();
      setTooltip({ text, x: e.clientX, y: rect.top });
    } else {
      setTooltip(null);
    }
  };

  return (
    <div>
      <div className="text-term-dim mb-4 font-mono text-[11px]">
        <div className="flex items-center gap-1.5">
          <span className="text-white/40">$</span>
          <span>logrithm heatmap --contributions</span>
        </div>
        <div className="text-term-dim mt-1">
          &gt; {contributionCalendar.totalContributions.toLocaleString()} total contributions
          indexed
        </div>
      </div>

      {/* Scroll wrapper for small screens */}
      <div style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <div style={{ position: 'relative', minWidth: totalWidth + 32, width: '100%' }}>
          {/* Grid — all mouse tracking is here; individual cells have no event handlers */}
          <div
            style={{ display: 'flex', gap: cellGap, width: '100%', marginTop: '20px' }}
            onMouseMove={handleGridMouseMove}
            onMouseLeave={() => setTooltip(null)}
          >
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
              const mLabel = monthLabels.find((m) => m.colIndex === wi);
              return (
                <div
                  key={wi}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: cellGap,
                    flex: 1,
                    position: 'relative',
                  }}
                >
                  {mLabel && (
                    <span
                      style={{
                        position: 'absolute',
                        top: -20,
                        left: 0,
                        fontFamily: 'var(--font-mono)',
                        fontSize: '9px',
                        color: 'rgba(255,255,255,0.3)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {mLabel.label}
                    </span>
                  )}
                  {week.contributionDays.map((day, di) => {
                    const level = getIntensityLevel(day.contributionCount);
                    const tooltipText = `${day.contributionCount} contribution${day.contributionCount !== 1 ? 's' : ''} on ${day.date}`;
                    return (
                      <div
                        key={di}
                        data-tooltip={tooltipText}
                        style={{
                          width: '100%',
                          aspectRatio: '1 / 1',
                          borderRadius: 0,
                          background: LEVEL_COLORS[level],
                          cursor: 'default',
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
              <div key={i} style={{ width: 10, height: 10, borderRadius: 0, background: color }} />
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

      {/* Tooltip — portal-mounted directly on document.body, outside the layout tree. */}
      {tooltip &&
        typeof document !== 'undefined' &&
        createPortal(
          (() => {
            const TOOLTIP_EST_WIDTH = 220;
            const EDGE_MARGIN = 12;
            const vw = document.documentElement.clientWidth;
            const safeLeft = Math.max(
              EDGE_MARGIN,
              Math.min(tooltip.x, vw - TOOLTIP_EST_WIDTH - EDGE_MARGIN)
            );
            return (
              <div
                style={{
                  position: 'fixed',
                  left: safeLeft,
                  top: tooltip.y - 36,
                  background: 'var(--color-term-bg)',
                  border: '1px solid var(--color-term-border)',
                  borderRadius: '0px',
                  padding: '4px 10px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  color: 'var(--color-term-light)',
                  pointerEvents: 'none',
                  zIndex: 2147483647,
                  whiteSpace: 'nowrap',
                  maxWidth: vw - EDGE_MARGIN * 2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {tooltip.text}
              </div>
            );
          })(),
          document.body
        )}
    </div>
  );
}
