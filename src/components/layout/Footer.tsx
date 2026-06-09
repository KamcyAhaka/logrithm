import Link from 'next/link';

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(10, 10, 10, 0.9)',
        padding: '1.5rem 2rem',
        marginTop: 'auto',
      }}
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
            className="text-white/40 transition-colors hover:text-[#1D9E75]"
            style={{ textDecoration: 'none' }}
          >
            terms
          </Link>
          <Link
            href="/privacy"
            className="text-white/40 transition-colors hover:text-[#1D9E75]"
            style={{ textDecoration: 'none' }}
          >
            privacy
          </Link>
          <Link
            href="/refund"
            className="text-white/40 transition-colors hover:text-[#1D9E75]"
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
