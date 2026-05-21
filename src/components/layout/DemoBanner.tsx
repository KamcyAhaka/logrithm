'use client';

// Single source of truth for demo mode — never check env vars directly.
// Parent must wrap this in <Suspense> because of useSearchParams.

import Link from 'next/link';

export default function DemoBanner() {
  return (
    <div
      style={{
        background: 'linear-gradient(90deg, rgba(29,158,117,0.12) 0%, rgba(29,158,117,0.06) 100%)',
        borderBottom: '1px solid rgba(29,158,117,0.25)',
      }}
      className="w-full py-3 flex items-center justify-center"
    >
      <div
        className="w-full flex items-center justify-between gap-4 flex-wrap px-6 sm:px-8 md:px-12"
        style={{ maxWidth: '80rem', margin: '0 auto' }}
      >
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
          }}
        >
          👋 You&apos;re viewing a demo with sample data.{' '}
          <span style={{ color: 'var(--green)' }}>@demo-dev</span> is not a real user.
        </p>
        <Link
          href="/"
          className="btn btn-primary"
          style={{ padding: '0.375rem 1rem', fontSize: '0.75rem' }}
        >
          Connect your GitHub →
        </Link>
      </div>
    </div>
  );
}
