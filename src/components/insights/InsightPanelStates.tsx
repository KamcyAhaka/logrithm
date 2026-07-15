'use client';

import Link from 'next/link';
import { AlertCircle, Zap, Terminal } from 'lucide-react';
import { isProUpgradeDisabled } from '@/lib/planGating';

interface ErrorStateProps {
  error: string;
  onRun?: () => void;
}

export function ErrorState({ error, onRun }: ErrorStateProps) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        textAlign: 'center',
      }}
    >
      <AlertCircle size={32} style={{ color: 'rgba(255,100,100,0.7)' }} />
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          color: 'rgba(255,100,100,0.8)',
        }}
      >
        {error}
      </p>
      {error.includes('Upgrade to Pro') || error.includes('Pro upgrades') ? (
        isProUpgradeDisabled() ? (
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/5 px-3 py-1.5 font-mono text-[11px] font-semibold text-purple-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-400" />
            Pro Coming Soon
          </div>
        ) : (
          <Link
            href="/settings/account"
            className="btn btn-primary"
            style={{ marginTop: '0.5rem', background: 'var(--green)', border: 'none' }}
          >
            Upgrade to Pro →
          </Link>
        )
      ) : (
        <button className="btn btn-secondary" onClick={onRun} style={{ marginTop: '0.5rem' }}>
          Try again
        </button>
      )}
    </div>
  );
}

interface ReadyStateProps {
  onRun?: () => void;
}

export function ReadyState({ onRun }: ReadyStateProps) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'rgba(29,158,117,0.1)',
          border: '1px solid rgba(29,158,117,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Terminal size={24} style={{ color: 'var(--green)' }} />
      </div>
      <div>
        <h4
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.95rem',
            color: 'var(--text-primary)',
            marginBottom: '0.375rem',
          }}
        >
          Ready for analysis
        </h4>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            maxWidth: 280,
          }}
        >
          Gemini will analyse your activity and surface patterns, strengths, and blind spots.
        </p>
      </div>
      <button className="btn btn-primary" onClick={onRun} id="run-algorithm-btn">
        <Zap size={14} />
        Run the algorithm
      </button>
    </div>
  );
}
