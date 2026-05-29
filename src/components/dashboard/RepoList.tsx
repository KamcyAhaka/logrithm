import type { Repository } from '@/types/github';
import { Star, GitFork } from 'lucide-react';

interface RepoListProps {
  repositories: Repository[];
}

export default function RepoList({ repositories }: RepoListProps) {
  return (
    <div
      className="glass-card"
      style={{
        padding: '1.5rem',
        height: '100%',
        minHeight: 0,
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
        Repositories
      </h3>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.625rem',
          flex: 1,
          overflowY: 'auto',
          minHeight: 0,
        }}
      >
        {repositories.map((repo) => (
          <a
            key={repo.name}
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.625rem 0.75rem',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '0.5rem',
              border: '1px solid rgba(255,255,255,0.04)',
              textDecoration: 'none',
              transition: 'background 0.15s, border-color 0.15s',
              gap: '0.5rem',
            }}
            className="hover:bg-white/5"
          >
            {/* Left: name + language */}
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  color: 'var(--text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {repo.name}
              </p>
              {repo.primaryLanguage && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    marginTop: '0.2rem',
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: repo.primaryLanguage.color ?? '#888',
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.68rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {repo.primaryLanguage.name}
                  </span>
                </div>
              )}
            </div>

            {/* Right: stats */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  color: 'var(--green)',
                  minWidth: 40,
                  textAlign: 'right',
                }}
              >
                {repo.commitCount} commits
              </span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: 'var(--text-muted)',
                }}
              >
                <Star size={11} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                  {repo.stargazerCount}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: 'var(--text-muted)',
                }}
              >
                <GitFork size={11} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                  {repo.forkCount}
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
