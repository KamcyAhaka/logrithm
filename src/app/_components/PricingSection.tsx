'use client';

import { Check, Sparkles } from 'lucide-react';
import FadeInSection from './FadeInSection';

export default function PricingSection() {
  return (
    <section
      id="pricing"
      style={{
        padding: '8rem 1.5rem',
        backgroundColor: 'rgba(10, 10, 10, 0.4)',
        borderTop: '1px solid rgba(255, 255, 255, 0.03)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
      }}
    >
      <div style={{ maxWidth: '64rem', margin: '0 auto', width: '100%' }}>
        <FadeInSection>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: '#4ade80',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}
            >
              pricing models
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                fontWeight: 500,
                marginTop: '0.5rem',
                letterSpacing: '-0.02em',
              }}
            >
              Simple, transparent pricing
            </h2>
          </div>
        </FadeInSection>

        <div
          style={{
            display: 'grid',
            gap: '2.5rem',
          }}
          className="grid-cols-1 md:grid-cols-2"
        >
          {/* Free tier */}
          <FadeInSection>
            <div
              className="glass-card"
              style={{
                padding: '3rem 2.25rem',
                borderRadius: '1.75rem',
                height: '100%',
                background: 'rgba(17, 17, 17, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '2rem',
              }}
            >
              <div>
                <h3
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.5rem',
                    fontWeight: 500,
                    marginBottom: '0.5rem',
                  }}
                >
                  Free
                </h3>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '0.25rem',
                    marginBottom: '2rem',
                  }}
                >
                  <span style={{ fontSize: '2.5rem', fontWeight: 600, color: 'white' }}>$0</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>forever</span>
                </div>

                <ul
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                  }}
                >
                  {[
                    'Activity score and breakdown',
                    'AI insights and strengths analysis',
                    'Public shareable profile',
                    '30-day activity chart and heatmap',
                    'Share cards (Persona, Score, Streak, Wrapped, PR Stats)',
                  ].map((feat) => (
                    <li
                      key={feat}
                      style={{
                        display: 'flex',
                        gap: '0.75rem',
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <Check
                        size={16}
                        style={{ color: '#4ade80', flexShrink: 0, marginTop: '0.15rem' }}
                      />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => {
                  const el = document.getElementById('terms-checkbox-hero');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  padding: '0.85rem 1.5rem',
                  borderRadius: '9999px',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                }}
              >
                Get Started for Free
              </button>
            </div>
          </FadeInSection>

          {/* Pro tier */}
          <FadeInSection>
            <div
              className="glass-card animate-border-glow"
              style={{
                padding: '3rem 2.25rem',
                borderRadius: '1.75rem',
                height: '100%',
                background: 'rgba(17, 17, 17, 0.55)',
                border: '1.5px solid #1d9e75',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '2rem',
                position: 'relative',
                boxShadow: '0 20px 45px -10px rgba(29, 158, 117, 0.15)',
              }}
            >
              {/* Popular Badge */}
              <div
                style={{
                  position: 'absolute',
                  top: '-14px',
                  right: '2.25rem',
                  background: '#1d9e75',
                  color: 'white',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  padding: '0.25rem 0.85rem',
                  borderRadius: '9999px',
                  letterSpacing: '0.08em',
                  boxShadow: '0 4px 15px rgba(29, 158, 117, 0.3)',
                }}
              >
                UNLOCK EVERYTHING
              </div>

              <div>
                <h3
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.5rem',
                    fontWeight: 500,
                    marginBottom: '0.5rem',
                  }}
                >
                  Pro
                </h3>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '0.25rem',
                    marginBottom: '2rem',
                  }}
                >
                  <span style={{ fontSize: '2.5rem', fontWeight: 600, color: 'white' }}>$60</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>one-time</span>
                </div>

                <ul
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                  }}
                >
                  {[
                    'Everything in Free',
                    'Peer comparison and percentile ranking',
                    'Advanced AI analysis and pattern detection',
                    'Priority score updates and deep-dives',
                    'Exclusive pro share card custom themes',
                  ].map((feat, i) => (
                    <li
                      key={feat}
                      style={{
                        display: 'flex',
                        gap: '0.75rem',
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {i === 0 ? (
                        <Check
                          size={16}
                          style={{ color: '#4ade80', flexShrink: 0, marginTop: '0.15rem' }}
                        />
                      ) : (
                        <Sparkles
                          size={16}
                          style={{ color: '#4ade80', flexShrink: 0, marginTop: '0.15rem' }}
                        />
                      )}
                      <span style={{ fontWeight: i > 0 ? 500 : 400 }}>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.85rem 1.5rem',
                  borderRadius: '9999px',
                  background: '#1d9e75',
                  boxShadow: '0 8px 25px rgba(29, 158, 117, 0.25)',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  alert('Pro features will be fully unlocked in Phase 2 launch. Stay tuned!');
                }}
              >
                Get Pro
              </button>
            </div>
          </FadeInSection>
        </div>
      </div>
    </section>
  );
}
