import Link from 'next/link';
import Image from 'next/image';
import { GitBranch } from 'lucide-react';
import NavbarAuth from './NavbarAuth';
import BetaBadge from './BetaBadge';
import ThemeToggle from './ThemeToggle';

// Wordmark: "log" normal · "r" green · "ithm" normal — consistent with login page
export default function Navbar() {
  return (
    <nav
      style={{
        borderBottom: '1px solid var(--border-subtle)',
        background: 'color-mix(in srgb, var(--bg-card) 85%, transparent)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        maxWidth: '100%',
        overflowX: 'hidden',
      }}
      className="mx-auto flex w-full items-center justify-center transition-colors duration-200"
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
        {/* Wordmark & Beta Badge */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
            }}
            className="select-none"
          >
            <div className="hidden dark:block">
              <Image
                src="/logrithm-logo-white.png"
                alt="logrithm logo"
                width={110}
                height={30}
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
            <div className="block font-mono text-xl font-medium tracking-tight text-[var(--text-primary)] dark:hidden">
              log<span className="font-semibold text-[#1D9E75]">r</span>ithm
            </div>
          </Link>
          <BetaBadge />
        </div>

        {/* Nav links + theme toggle + auth */}
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
            className="hover:text-[var(--text-primary)]"
          >
            <GitBranch size={13} />
            github
          </a>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Client component handles auth state */}
          <NavbarAuth />
        </div>
      </div>
    </nav>
  );
}
