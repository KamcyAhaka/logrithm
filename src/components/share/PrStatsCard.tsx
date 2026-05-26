interface PrStatsCardProps {
  totalPRs: number;
  totalIssues: number;
}

export default function PrStatsCard({ totalPRs, totalIssues }: PrStatsCardProps) {
  const totalCollaborations = totalPRs + totalIssues;
  const prPercentage =
    totalCollaborations > 0 ? Math.round((totalPRs / totalCollaborations) * 100) : 0;
  const issuePercentage =
    totalCollaborations > 0 ? Math.round((totalIssues / totalCollaborations) * 100) : 0;

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
          <span
            style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}
          >
            PRS MERGED
          </span>
          <h3
            style={{
              margin: '0.25rem 0 0',
              fontSize: '2.25rem',
              color: '#fff',
              fontFamily: 'monospace',
              fontWeight: 700,
            }}
          >
            {totalPRs}
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
          <span
            style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}
          >
            ISSUES OPENED
          </span>
          <h3
            style={{
              margin: '0.25rem 0 0',
              fontSize: '2.25rem',
              color: '#fff',
              fontFamily: 'monospace',
              fontWeight: 700,
            }}
          >
            {totalIssues}
          </h3>
        </div>
      </div>

      {totalCollaborations > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.7rem',
              color: 'rgba(255,255,255,0.4)',
              fontFamily: 'monospace',
            }}
          >
            <span>PRs ({prPercentage}%)</span>
            <span>Issues ({issuePercentage}%)</span>
          </div>
          <div
            style={{
              display: 'flex',
              height: 6,
              width: '100%',
              borderRadius: 99,
              overflow: 'hidden',
            }}
          >
            <div style={{ width: `${prPercentage}%`, background: '#1D9E75' }} />
            <div style={{ width: `${issuePercentage}%`, background: 'rgba(255,255,255,0.15)' }} />
          </div>
        </div>
      )}
    </div>
  );
}
