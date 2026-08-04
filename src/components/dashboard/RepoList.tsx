'use client';

import { useState, useEffect } from 'react';
import type { Repository } from '@/types/github';
import { Star, GitFork } from 'lucide-react';
import { useSequenceStep } from './SequenceContext';

interface RepoListProps {
  repositories: Repository[];
  maxHeight?: string; // kept for API compat but unused
  onReconnect?: () => void;
  reconnecting?: boolean;
  reconnectError?: string | null;
  reconnectSuccess?: boolean;
}

export default function RepoList({
  repositories,
  onReconnect,
  reconnecting,
  reconnectError,
  reconnectSuccess,
}: RepoListProps) {
  const { isCompleted, completeStep: completeStep8 } = useSequenceStep(8);
  const [activeRepoIndex, setActiveRepoIndex] = useState(() =>
    isCompleted ? repositories.length : 0
  );
  const COLS = 4;
  const total = repositories.length;

  useEffect(() => {
    if (isCompleted) {
      const t = setTimeout(() => setActiveRepoIndex(repositories.length), 0);
      return () => clearTimeout(t);
    }
  }, [isCompleted, repositories.length]);

  useEffect(() => {
    if (activeRepoIndex >= repositories.length) {
      completeStep8();
      return;
    }

    const timer = setTimeout(() => {
      setActiveRepoIndex((prev) => prev + 1);
    }, 100);

    return () => clearTimeout(timer);
  }, [activeRepoIndex, repositories.length, completeStep8]);

  return (
    <div className="flex flex-col">
      {/* Section header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-term-dim font-mono text-[11px]">
          <span className="mr-1.5 text-white/40">$</span>
          <span>logrithm repos --list</span>
        </div>
        <a
          href="/settings/repositories"
          className="text-term-accent font-mono text-[11px] hover:underline"
        >
          settings →
        </a>
      </div>

      {/* Block grid — mirrors StatsGrid border convention exactly */}
      <div className="border-term-border grid grid-cols-2 border border-dashed lg:grid-cols-4">
        {repositories.map((repo, idx) => {
          const col = idx % COLS;
          const row = Math.floor(idx / COLS);
          const totalRows = Math.ceil(total / COLS);
          const isLastCol = col === COLS - 1;
          const isLastRow = row === totalRows - 1;

          // Inactive = nothing contributed to or starred
          const isInactive =
            repo.commitCount === 0 && repo.stargazerCount === 0 && repo.forkCount === 0;

          const isItemVisible = idx < activeRepoIndex;
          const nameColor = repo.primaryLanguage?.color ?? 'var(--color-term-light)';

          return (
            <a
              key={repo.name}
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className={[
                'flex flex-col justify-between p-3 font-mono transition-all duration-300 ease-out',
                isItemVisible ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0',
                !isLastCol ? 'border-term-border border-r border-dashed' : '',
                !isLastRow ? 'border-term-border border-b border-dashed' : '',
                isInactive ? 'opacity-80' : '',
                'hover:bg-term-hover',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{ textDecoration: 'none' }}
            >
              {/* Repo name — colored by primary language */}
              <span
                className="block truncate text-xs leading-tight font-semibold"
                style={{ color: nameColor }}
              >
                {repo.name}
              </span>

              {/* Stats line */}
              <span className="text-term-dim mt-1 flex flex-wrap items-center gap-x-2 text-[10px] leading-snug">
                {repo.primaryLanguage && <span>{repo.primaryLanguage.name}</span>}
                <span className="flex items-center gap-0.5">
                  <Star size={9} className="shrink-0" />
                  {repo.stargazerCount}
                </span>
                <span className="flex items-center gap-0.5">
                  <GitFork size={9} className="shrink-0" />
                  {repo.forkCount}
                </span>
                <span className="text-term-accent">{repo.commitCount}c</span>
              </span>
            </a>
          );
        })}
      </div>

      {/* Reconnect footer */}
      {onReconnect && (
        <div className="border-term-border text-term-dim mt-3.5 border-t border-dashed pt-3 font-mono text-[11px] leading-relaxed">
          <div className="flex flex-col gap-1">
            <div>
              Missing repos from an organization?{' '}
              <button
                onClick={onReconnect}
                disabled={reconnecting}
                className="text-term-accent hover:text-term-accent/90 cursor-pointer border-none bg-transparent p-0 font-mono text-[11px] transition hover:underline disabled:opacity-50"
              >
                {reconnecting ? 'Connecting...' : 'Reconnect GitHub'}
              </button>{' '}
              to refresh access.
            </div>
            {reconnectError && (
              <div className="mt-1 text-[10px] text-red-400">{reconnectError}</div>
            )}
            {reconnectSuccess && (
              <div className="text-term-accent mt-1 text-[10px]">
                Connected successfully! Syncing repositories...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
