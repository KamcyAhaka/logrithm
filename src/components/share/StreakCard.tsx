import { Flame, Award } from 'lucide-react';

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  longestStreakStart?: string;
  longestStreakEnd?: string;
  patterns?: string;
}

function formatDateRange(start?: string, end?: string) {
  if (!start || !end) return null;
  const startObj = new Date(start);
  const endObj = new Date(end);
  const startStr = startObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endStr = endObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  if (
    startObj.getFullYear() !== endObj.getFullYear() ||
    startObj.getFullYear() !== new Date().getFullYear()
  ) {
    const startYearStr = startObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const endYearStr = endObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return `${startYearStr} - ${endYearStr}`;
  }

  return `${startStr} - ${endStr}`;
}

export default function StreakCard({
  currentStreak,
  longestStreak,
  longestStreakStart,
  longestStreakEnd,
  patterns,
}: StreakCardProps) {
  const longestStreakDateRange = formatDateRange(longestStreakStart, longestStreakEnd);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      <div
        style={{
          color: '#5a6a5a',
          fontFamily: 'var(--font-mono), monospace',
          fontSize: '11px',
          marginBottom: '0.5rem',
        }}
      >
        $ logrithm streak --history
      </div>

      <div className="border-term-border grid grid-cols-2 border border-dashed font-mono">
        {/* Current Streak */}
        <div className="border-term-border flex flex-col justify-center border-r border-dashed p-4">
          <div className="text-term-dim flex items-center gap-1 text-[10px]">
            <Flame size={12} className="text-term-accent" />
            <span>current_streak</span>
          </div>
          <div className="text-term-accent mt-1.5 text-xl font-bold">
            {currentStreak > 0 ? (
              <span>
                {currentStreak}
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 400,
                    marginLeft: '2px',
                    color: '#5a6a5a',
                  }}
                >
                  d
                </span>
              </span>
            ) : (
              '—'
            )}
          </div>
        </div>

        {/* Longest Streak */}
        <div className="flex flex-col justify-center p-4">
          <div className="text-term-dim flex items-center gap-1 text-[10px]">
            <Award size={12} className="text-term-accent" />
            <span>longest_streak</span>
          </div>
          <div className="text-term-accent mt-1.5 text-xl font-bold">
            {longestStreak > 0 ? (
              <span>
                {longestStreak}
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 400,
                    marginLeft: '2px',
                    color: '#5a6a5a',
                  }}
                >
                  d
                </span>
              </span>
            ) : (
              '—'
            )}
          </div>
          {longestStreakDateRange && longestStreak > 0 && (
            <div className="text-term-dim mt-0.5 text-[9px] font-normal">
              {longestStreakDateRange}
            </div>
          )}
        </div>
      </div>

      <p
        style={{
          fontFamily: 'var(--font-mono), monospace',
          fontSize: '0.8rem',
          color: '#c8d8c8',
          textAlign: 'center',
          lineHeight: 1.5,
          marginTop: '0.5rem',
        }}
      >
        {patterns || 'Consistency is the engine of high performance.'}
      </p>
    </div>
  );
}
