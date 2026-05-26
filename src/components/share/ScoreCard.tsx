interface ScoreCardProps {
  activityScore: number;
}

export default function ScoreCard({ activityScore }: ScoreCardProps) {
  const strokeDashOffset = 251.2 - (251.2 * (activityScore || 0)) / 100;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        margin: '1.5rem 0 2rem',
      }}
    >
      <div style={{ position: 'relative', width: 140, height: 140 }}>
        <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx="70"
            cy="70"
            r="40"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="70"
            cy="70"
            r="40"
            stroke="#1D9E75"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray="251.2"
            strokeDashoffset={strokeDashOffset}
            strokeLinecap="round"
            style={{
              filter: 'drop-shadow(0 0 6px rgba(29, 158, 117, 0.5))',
            }}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '2.5rem',
              fontWeight: 700,
              color: '#fff',
              lineHeight: 1,
            }}
          >
            {activityScore}
          </span>
          <span
            style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}
          >
            MAX 100
          </span>
        </div>
      </div>
      <h3
        style={{
          fontFamily: 'monospace',
          fontSize: '0.9rem',
          color: '#1D9E75',
          letterSpacing: '0.15em',
          marginTop: '1.5rem',
          marginBottom: '0.5rem',
          fontWeight: 600,
        }}
      >
        LOGRITHM INDEX
      </h3>
      <p
        style={{
          fontFamily: 'sans-serif',
          fontSize: '0.8rem',
          color: 'rgba(255,255,255,0.6)',
          textAlign: 'center',
          maxWidth: 280,
          lineHeight: 1.5,
        }}
      >
        Evaluated based on codebase impact, commits frequency, and collaborative velocity.
      </p>
    </div>
  );
}
