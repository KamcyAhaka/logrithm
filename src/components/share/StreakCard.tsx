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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', margin: '1.5rem 0' }}>
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}
      >
        <div
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '0.75rem',
            padding: '1.25rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Flame size={20} color="#1D9E75" style={{ margin: '0 auto 0.5rem' }} />
          <p
            style={{
              margin: 0,
              fontSize: '0.7rem',
              color: 'rgba(255,255,255,0.4)',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            CURRENT STREAK
          </p>
          <h3
            style={{
              margin: '0.25rem 0 0',
              fontSize: currentStreak > 0 ? '2rem' : '1.25rem',
              color: currentStreak > 0 ? '#fff' : 'rgba(255,255,255,0.25)',
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
            }}
          >
            {currentStreak > 0 ? (
              <>
                {currentStreak}{' '}
                <span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#1D9E75' }}>
                  day {currentStreak >= 2 ? 's' : ''}
                </span>
              </>
            ) : (
              '—'
            )}
          </h3>
        </div>
        <div
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '0.75rem',
            padding: '1.25rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Award size={20} color="#1D9E75" style={{ margin: '0 auto 0.5rem' }} />
          <p
            style={{
              margin: 0,
              fontSize: '0.7rem',
              color: 'rgba(255,255,255,0.4)',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            LONGEST STREAK
          </p>
          <h3
            style={{
              margin: '0.25rem 0 0',
              fontSize: '2rem',
              color: '#fff',
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
            }}
          >
            {longestStreak}{' '}
            <span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#1D9E75' }}>days</span>
          </h3>
          {longestStreakDateRange && longestStreak > 0 && (
            <p
              style={{
                margin: '0.25rem 0 0 0',
                fontSize: '0.65rem',
                color: 'rgba(255,255,255,0.4)',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              ({longestStreakDateRange})
            </p>
          )}
        </div>
      </div>
      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.8rem',
          color: 'rgba(255,255,255,0.6)',
          textAlign: 'center',
          lineHeight: 1.5,
        }}
      >
        {patterns || 'Consistency is the engine of high performance.'}
      </p>
    </div>
  );
}
