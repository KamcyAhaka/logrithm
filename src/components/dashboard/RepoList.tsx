import type { Repository } from '@/types/github';
import { Star, GitFork } from 'lucide-react';

interface RepoListProps {
  repositories: Repository[];
  maxHeight?: string;
  onReconnect?: () => void;
  reconnecting?: boolean;
  reconnectError?: string | null;
  reconnectSuccess?: boolean;
}

export default function RepoList({
  repositories,
  maxHeight = '550px',
  onReconnect,
  reconnecting,
  reconnectError,
  reconnectSuccess,
}: RepoListProps) {
  return (
    <div
      className="glass-card"
      style={{
        padding: '1.5rem',
        maxHeight,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <a
        href="/settings/repositories"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: '1rem',
        }}
        className="underline-offset-3 transition hover:underline"
      >
        Repositories →
      </a>

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

      {onReconnect && (
        <div
          style={{
            marginTop: '1rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            lineHeight: '1.4',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div>
              Missing repos from an organization?{' '}
              <button
                onClick={onReconnect}
                disabled={reconnecting}
                style={{
                  color: 'var(--green)',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                }}
                className="transition hover:text-[#1D9E75]/90 disabled:opacity-50"
              >
                {reconnecting ? 'Connecting...' : 'Reconnect GitHub'}
              </button>{' '}
              to refresh access.
            </div>
            {reconnectError && (
              <div
                style={{
                  color: 'rgba(255,100,100,0.85)',
                  fontSize: '0.65rem',
                  marginTop: '0.2rem',
                }}
              >
                {reconnectError}
              </div>
            )}
            {reconnectSuccess && (
              <div style={{ color: 'var(--green)', fontSize: '0.65rem', marginTop: '0.2rem' }}>
                Connected successfully! Syncing repositories...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
