import { Flame, Award } from 'lucide-react';

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  patterns?: string;
}

export default function StreakCard({ currentStreak, longestStreak, patterns }: StreakCardProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', margin: '1.5rem 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '0.75rem',
            padding: '1.25rem',
            textAlign: 'center',
          }}
        >
          <Flame size={20} color="#1D9E75" style={{ margin: '0 auto 0.5rem' }} />
          <p
            style={{
              margin: 0,
              fontSize: '0.7rem',
              color: 'rgba(255,255,255,0.4)',
              fontFamily: 'monospace',
            }}
          >
            CURRENT STREAK
          </p>
          <h3
            style={{
              margin: '0.25rem 0 0',
              fontSize: '2rem',
              color: '#fff',
              fontFamily: 'monospace',
              fontWeight: 700,
            }}
          >
            {currentStreak}{' '}
            <span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#1D9E75' }}>days</span>
          </h3>
        </div>
        <div
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '0.75rem',
            padding: '1.25rem',
            textAlign: 'center',
          }}
        >
          <Award size={20} color="#1D9E75" style={{ margin: '0 auto 0.5rem' }} />
          <p
            style={{
              margin: 0,
              fontSize: '0.7rem',
              color: 'rgba(255,255,255,0.4)',
              fontFamily: 'monospace',
            }}
          >
            LONGEST STREAK
          </p>
          <h3
            style={{
              margin: '0.25rem 0 0',
              fontSize: '2rem',
              color: '#fff',
              fontFamily: 'monospace',
              fontWeight: 700,
            }}
          >
            {longestStreak}{' '}
            <span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#1D9E75' }}>days</span>
          </h3>
        </div>
      </div>
      <p
        style={{
          fontFamily: 'sans-serif',
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
