'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface ReadmeBadgeProps {
  username: string;
}

export default function ReadmeBadge({ username }: ReadmeBadgeProps) {
  const [copied, setCopied] = useState(false);

  const badgeUrl = `https://logrithm.dev/api/badge/${username}`;
  const profileUrl = `https://logrithm.dev/u/${username}`;
  const markdownSnippet = `[![Logrithm Score](${badgeUrl})](${profileUrl})`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdownSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy markdown:', err);
    }
  };

  return (
    <div
      className="glass-card"
      style={{
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <div>
        <h4
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '0.5rem',
          }}
        >
          README Badge
        </h4>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
          }}
        >
          Showcase your Logrithm activity score directly on your GitHub profile README.
        </p>
      </div>

      {/* Live Preview Row */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.375rem',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            letterSpacing: '0.05em',
          }}
        >
          LIVE PREVIEW
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/badge/${username}`}
          alt="Logrithm Badge Preview"
          width={160}
          height={20}
          style={{ display: 'block', borderRadius: '3px' }}
        />
      </div>

      {/* Code Block & Copy Button */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        <div className="flex w-full flex-col items-stretch gap-2 sm:flex-row">
          {/* Styled Code Block */}
          <div
            style={{
              background: '#070707',
              border: '1px solid var(--border-subtle)',
              borderRadius: '0.5rem',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
            }}
            className="min-w-0 flex-1 overflow-x-auto"
          >
            <code
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--green)',
                whiteSpace: 'nowrap',
              }}
            >
              {markdownSnippet}
            </code>
          </div>

          {/* Copy Button using existing dashboard styles */}
          <button
            onClick={handleCopy}
            className="btn btn-secondary flex w-full shrink-0 items-center justify-center gap-1.5 px-5 text-xs sm:w-auto"
            style={{
              height: 'auto',
            }}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span>{copied ? 'Copied!' : 'Copy markdown'}</span>
          </button>
        </div>

        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
          }}
        >
          Add this badge to your GitHub README to show your Logrithm score
        </span>
      </div>
    </div>
  );
}
