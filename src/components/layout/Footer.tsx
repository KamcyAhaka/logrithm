import Link from 'next/link';

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-subtle)',
        background: 'color-mix(in srgb, var(--bg-card) 85%, transparent)',
        padding: '1.5rem 2rem',
        marginTop: 'auto',
      }}
      className="transition-colors duration-200"
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          maxWidth: '80rem',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '1.5rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
          }}
        >
          <Link
            href="/terms"
            className="text-[var(--text-secondary)] transition-colors hover:text-[#1D9E75]"
            style={{ textDecoration: 'none' }}
          >
            terms
          </Link>
          <Link
            href="/privacy"
            className="text-[var(--text-secondary)] transition-colors hover:text-[#1D9E75]"
            style={{ textDecoration: 'none' }}
          >
            privacy
          </Link>
          <Link
            href="/refund"
            className="text-[var(--text-secondary)] transition-colors hover:text-[#1D9E75]"
            style={{ textDecoration: 'none' }}
          >
            refunds
          </Link>
        </div>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.68rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
            margin: 0,
          }}
        >
          &copy; 2026 Logrithm. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
