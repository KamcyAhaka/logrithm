interface ScoreCardProps {
  activityScore: number;
}

export default function ScoreCard({ activityScore }: ScoreCardProps) {
  const strokeDashOffset = 251.2 - (251.2 * (activityScore || 0)) / 100;

  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          color: '#5a6a5a',
          fontFamily: 'var(--font-mono), monospace',
          fontSize: '11px',
          marginBottom: '1.25rem',
        }}
      >
        $ logrithm score --index
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          margin: '0.5rem 0 1rem',
        }}
      >
        <div style={{ position: 'relative', width: 140, height: 140 }}>
          <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="70"
              cy="70"
              r="40"
              stroke="rgba(74, 222, 128, 0.05)"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="70"
              cy="70"
              r="40"
              stroke="#4ade80"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray="251.2"
              strokeDashoffset={strokeDashOffset}
              strokeLinecap="square"
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
                fontFamily: 'var(--font-mono), monospace',
                fontSize: '2.5rem',
                fontWeight: 700,
                color: '#fff',
                lineHeight: 1,
              }}
            >
              {activityScore}
            </span>
            <span
              style={{
                fontSize: '0.6rem',
                color: '#5a6a5a',
                letterSpacing: '0.1em',
                fontFamily: 'var(--font-mono), monospace',
              }}
            >
              MAX 100
            </span>
          </div>
        </div>
        <h3
          style={{
            fontFamily: 'var(--font-mono), monospace',
            fontSize: '0.9rem',
            color: '#4ade80',
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
            fontFamily: 'var(--font-mono), monospace',
            fontSize: '0.8rem',
            color: '#c8d8c8',
            textAlign: 'center',
            maxWidth: 280,
            lineHeight: 1.5,
          }}
        >
          Evaluated based on codebase impact, commits frequency, and collaborative velocity.
        </p>
      </div>
    </div>
  );
}
