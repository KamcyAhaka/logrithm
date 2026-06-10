'use client';

import Link from 'next/link';
import { GitBranch } from 'lucide-react';
import FadeInSection from './FadeInSection';

interface FinalCtaSectionProps {
  loading: boolean;
  agreed: boolean;
  setAgreed: (val: boolean) => void;
  handleGitHubLogin: () => void;
}

export default function FinalCtaSection({
  loading,
  agreed,
  setAgreed,
  handleGitHubLogin,
}: FinalCtaSectionProps) {
  return (
    <section
      style={{
        padding: '8rem 1.5rem',
        textAlign: 'center',
        background:
          'radial-gradient(circle at bottom, rgba(29, 158, 117, 0.08) 0%, transparent 60%)',
        borderTop: '1px solid rgba(255, 255, 255, 0.03)',
      }}
    >
      <div style={{ maxWidth: '40rem', margin: '0 auto', width: '100%' }}>
        <FadeInSection>
          <h2
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 500,
              letterSpacing: '-0.03em',
              marginBottom: '1rem',
              color: 'white',
            }}
          >
            Start analyzing your commits
          </h2>
          <p
            style={{
              fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)',
              color: 'var(--text-secondary)',
              marginBottom: '3.5rem',
              lineHeight: 1.6,
            }}
          >
            Free to try. No credit card required. Connect with GitHub to begin analyzing your
            workflow.
          </p>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              maxWidth: '360px',
              margin: '0 auto',
              alignItems: 'center',
            }}
          >
            {/* Syched Checkbox */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                textAlign: 'left',
                width: '100%',
                background: 'rgba(255, 255, 255, 0.02)',
                padding: '0.85rem 1rem',
                borderRadius: '0.75rem',
                border: '1px solid rgba(255, 255, 255, 0.04)',
              }}
            >
              <input
                id="terms-checkbox-final"
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
                htmlFor="terms-checkbox-final"
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

            <button
              className="btn btn-primary"
              onClick={handleGitHubLogin}
              disabled={loading || !agreed}
              style={{
                width: '100%',
                padding: '1rem 1.5rem',
                fontSize: '0.95rem',
                fontWeight: 600,
                borderRadius: '9999px',
                backgroundColor: agreed ? '#1d9e75' : 'rgba(29, 158, 117, 0.4)',
                cursor: agreed ? 'pointer' : 'not-allowed',
                opacity: agreed ? 1 : 0.6,
              }}
            >
              <GitBranch size={16} />
              {loading ? 'Analyzing...' : 'Connect with GitHub'}
            </button>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
}
