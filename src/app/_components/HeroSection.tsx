'use client';

import Link from 'next/link';
import { GitBranch, Zap } from 'lucide-react';
import AnimatedTerminal from './AnimatedTerminal';

interface HeroSectionProps {
  loading: boolean;
  error: string | null;
  agreed: boolean;
  setAgreed: (val: boolean) => void;
  handleGitHubLogin: () => void;
  handleDemo: () => void;
}

export default function HeroSection({
  loading,
  error,
  agreed,
  setAgreed,
  handleGitHubLogin,
  handleDemo,
}: HeroSectionProps) {
  return (
    <section
      style={{
        position: 'relative',
        padding: '6rem 1.5rem 8rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        overflow: 'hidden',
        background:
          'radial-gradient(circle at center, transparent 35%, #0a0a0a 100%), radial-gradient(rgba(29, 158, 117, 0.07) 1.5px, transparent 1.5px)',
        backgroundSize: '100% 100%, 28px 28px',
      }}
    >
      {/* Glow behind terminal */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '55%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 700,
          height: 700,
          background: 'radial-gradient(circle, rgba(29,158,117,0.11) 0%, transparent 65%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '80rem',
          width: '100%',
          margin: '0 auto',
        }}
      >
        {/* Badges */}
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            justifyContent: 'center',
            marginBottom: '1.75rem',
          }}
        >
          <span
            className="pill"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'rgba(255, 255, 255, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '0.3rem 0.8rem',
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
            }}
          >
            ● OPEN SOURCE
          </span>
          <span
            className="pill"
            style={{
              background: 'rgba(74, 222, 128, 0.06)',
              color: '#4ade80',
              border: '1px solid rgba(74, 222, 128, 0.18)',
              padding: '0.3rem 0.8rem',
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
            }}
          >
            ● FREE TO USE
          </span>
        </div>

        {/* Heading Tagline */}
        <h1
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(2.5rem, 6.5vw, 4.5rem)',
            fontWeight: 500,
            letterSpacing: '-0.04em',
            color: 'var(--text-primary)',
            lineHeight: 1.1,
            marginBottom: '1.25rem',
            maxWidth: '850px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Your commit history. <span style={{ color: '#4ade80' }}>Analyzed.</span>
        </h1>

        {/* Subtext description */}
        <p
          style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            margin: '0 auto 3.5rem',
            lineHeight: 1.6,
          }}
        >
          Connect your GitHub account and let our deterministic scoring engine and AI insights
          unlock the real stories hidden inside your repository contributions.
        </p>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2.5rem',
            width: '100%',
          }}
        >
          {/* Grid of Interactive CTAs + Sync check */}
          <div
            style={{
              width: '100%',
              maxWidth: '460px',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            {/* Terms Checkbox */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                textAlign: 'left',
                background: 'rgba(255, 255, 255, 0.02)',
                padding: '0.85rem 1rem',
                borderRadius: '0.75rem',
                border: '1px solid rgba(255, 255, 255, 0.04)',
              }}
            >
              <input
                id="terms-checkbox-hero"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                style={{
                  marginTop: '0.15rem',
                  cursor: 'pointer',
                  accentColor: '#4ade80',
                  width: '15px',
                  height: '15px',
                }}
              />
              <label
                htmlFor="terms-checkbox-hero"
                style={{ cursor: 'pointer', lineHeight: 1.4 }}
                className="transition-colors hover:text-white"
              >
                I agree to the{' '}
                <Link
                  href="/terms"
                  style={{ color: '#4ade80', textDecoration: 'none' }}
                  className="hover:underline"
                >
                  Terms of Service
                </Link>
                ,{' '}
                <Link
                  href="/privacy"
                  style={{ color: '#4ade80', textDecoration: 'none' }}
                  className="hover:underline"
                >
                  Privacy Policy
                </Link>
                , and{' '}
                <Link
                  href="/refund"
                  style={{ color: '#4ade80', textDecoration: 'none' }}
                  className="hover:underline"
                >
                  Refund Policy
                </Link>
              </label>
            </div>

            {/* Action buttons */}
            <div className="flex w-full flex-col gap-3 lg:flex-row">
              <button
                id="connect-github-btn-hero"
                className="btn btn-primary whitespace-nowrap"
                onClick={handleGitHubLogin}
                disabled={loading || !agreed}
                style={{
                  flex: 1,
                  padding: '0.625rem 1.25rem',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  borderRadius: '9999px',
                  backgroundColor: agreed ? '#1d9e75' : 'rgba(29, 158, 117, 0.4)',
                  cursor: agreed ? 'pointer' : 'not-allowed',
                  opacity: agreed ? 1 : 0.6,
                  whiteSpace: 'nowrap',
                }}
              >
                <GitBranch size={15} />
                {loading ? 'Analyzing...' : 'Connect with GitHub'}
              </button>

              <button
                id="try-demo-btn-hero"
                className="btn btn-secondary whitespace-nowrap"
                onClick={handleDemo}
                style={{
                  flex: 0.9,
                  padding: '0.625rem 1.25rem',
                  fontSize: '0.825rem',
                  borderRadius: '9999px',
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  whiteSpace: 'nowrap',
                }}
              >
                <Zap size={13} />
                Try the Demo
              </button>
            </div>
          </div>

          {/* Error display */}
          {error && (
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'rgba(255,100,100,0.85)',
                marginTop: '-1rem',
              }}
            >
              {error}
            </p>
          )}

          {/* Terminal Preview Card */}
          <div
            style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '1rem' }}
          >
            <AnimatedTerminal />
          </div>
        </div>
      </div>
    </section>
  );
}
