import Link from 'next/link';
import { GitBranch, Settings } from 'lucide-react';
import NavbarAuth from './NavbarAuth';

// Wordmark: "log" normal · "r" green · "ithm" normal — consistent with login page
export default function Navbar() {
  return (
    <nav
      style={{
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(10,10,10,0.9)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        maxWidth: '100%',
        overflowX: 'hidden',
      }}
      className="mx-auto flex w-full items-center justify-center"
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '60px',
          maxWidth: '80rem',
          margin: '0 auto',
          width: '100%',
          padding: '0 2rem',
        }}
      >
        {/* Wordmark */}
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '1.1rem',
            fontWeight: 500,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            textDecoration: 'none',
          }}
        >
          log<span style={{ color: 'var(--green)' }}>r</span>ithm
        </Link>

        {/* Nav links + auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <a
            href="https://github.com/KamcyAhaka/logrithm"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              transition: 'color 0.15s',
            }}
            className="hover:text-white"
          >
            <GitBranch size={13} />
            github
          </a>

          <Link
            href="/settings"
            style={{
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              transition: 'color 0.15s',
            }}
            className="hover:text-white"
            aria-label="Settings"
          >
            <Settings size={16} />
          </Link>

          {/* Client component handles auth state */}
          <NavbarAuth />
        </div>
      </div>
    </nav>
  );
}
