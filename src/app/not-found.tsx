import Link from 'next/link';

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--bg-page)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div
        className="glass-card"
        style={{
          padding: '3rem 2rem',
          maxWidth: '400px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '3.5rem',
            fontWeight: 800,
            color: 'var(--green)',
            lineHeight: 1,
            letterSpacing: '-0.05em',
          }}
        >
          404
        </span>

        <div>
          <h2
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.9rem',
              color: 'var(--text-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              marginBottom: '0.5rem',
            }}
          >
            Page Not Found
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
            }}
          >
            The branch you are looking for doesn&apos;t exist or the request timed out.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="btn btn-primary"
          style={{ textDecoration: 'none', width: '100%', boxSizing: 'border-box' }}
        >
          Return to Dashboard
        </Link>
      </div>
    </main>
  );
}
