interface WrappedCardProps {
  totalCommits: number;
  activeRepos: number;
  languageTotals: Record<string, number>;
}

export default function WrappedCard({
  totalCommits,
  activeRepos,
  languageTotals,
}: WrappedCardProps) {
  // Language percentage calculations
  const totalCommitLanguages = Object.values(languageTotals).reduce((a, b) => a + b, 0) || 1;
  const sortedLanguages = Object.entries(languageTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({
      name,
      percentage: Math.round((count / totalCommitLanguages) * 100),
    }));

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', margin: '1.5rem 0 1rem' }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
        {/* Stat Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '0.75rem',
              padding: '0.75rem 1rem',
            }}
          >
            <span
              style={{
                fontSize: '0.65rem',
                color: 'rgba(255,255,255,0.4)',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              TOTAL COMMITS
            </span>
            <h4
              style={{
                margin: 0,
                fontSize: '1.5rem',
                color: '#fff',
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
              }}
            >
              {totalCommits}
            </h4>
          </div>
          <div
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '0.75rem',
              padding: '0.75rem 1rem',
            }}
          >
            <span
              style={{
                fontSize: '0.65rem',
                color: 'rgba(255,255,255,0.4)',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              ACTIVE REPOSITORIES
            </span>
            <h4
              style={{
                margin: 0,
                fontSize: '1.5rem',
                color: '#fff',
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
              }}
            >
              {activeRepos}
            </h4>
          </div>
        </div>

        {/* Language Column */}
        <div
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '0.75rem',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
        >
          <span
            style={{
              fontSize: '0.65rem',
              color: 'rgba(255,255,255,0.4)',
              fontFamily: "'JetBrains Mono', monospace",
              marginBottom: '0.25rem',
            }}
          >
            TOP LANGUAGES
          </span>
          {sortedLanguages.length > 0 ? (
            sortedLanguages.map((lang) => (
              <div
                key={lang.name}
                style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    fontFamily: "'JetBrains Mono', monospace",
                    color: '#fff',
                  }}
                >
                  <span>{lang.name}</span>
                  <span style={{ color: '#1D9E75' }}>{lang.percentage}%</span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: 4,
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: 99,
                  }}
                >
                  <div
                    style={{
                      width: `${lang.percentage}%`,
                      height: '100%',
                      background: '#1D9E75',
                      borderRadius: 99,
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <span
              style={{
                fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.3)',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              No language data
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
