'use client';

import { GitBranch, Layers, Share2 } from 'lucide-react';
import FadeInSection from './FadeInSection';

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      style={{
        padding: '6rem 1.5rem',
        backgroundColor: 'rgba(10, 10, 10, 0.5)',
        borderTop: '1px solid rgba(255, 255, 255, 0.03)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
        position: 'relative',
      }}
    >
      <div style={{ maxWidth: '80rem', margin: '0 auto', width: '100%' }}>
        <FadeInSection>
          <div style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: '#4ade80',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}
            >
              process workflow
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
              How it works
            </h2>
          </div>
        </FadeInSection>

        {/* Cards wrapper */}
        <div
          style={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '2.5rem',
          }}
          className="md:grid-cols-3"
        >
          {/* Steps */}
          {[
            {
              num: '01',
              title: 'Connect Account',
              desc: 'Connect your GitHub account securely via OAuth. We only request read access to your contribution history.',
              icon: <GitBranch size={20} style={{ color: '#4ade80' }} />,
            },
            {
              num: '02',
              title: 'Run Algorithm',
              desc: 'Logrithm analyzes 12 months of commit payloads using a deterministic 5-dimension scoring system.',
              icon: <Layers size={20} style={{ color: '#4ade80' }} />,
            },
            {
              num: '03',
              title: 'Share Identity',
              desc: 'Download your profile, detailed score analysis, and custom generated AI developer cards for sharing.',
              icon: <Share2 size={20} style={{ color: '#4ade80' }} />,
            },
          ].map((step) => (
            <FadeInSection key={step.num}>
              <div
                className="glass-card"
                style={{
                  padding: '2.5rem 2rem',
                  borderRadius: '1.5rem',
                  height: '100%',
                  position: 'relative',
                  background: 'rgba(17, 17, 17, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                  zIndex: 2,
                }}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      color: '#4ade80',
                    }}
                  >
                    {step.num}
                  </span>
                  <div
                    style={{
                      background: 'rgba(74, 222, 128, 0.06)',
                      border: '1px solid rgba(74, 222, 128, 0.15)',
                      borderRadius: '0.75rem',
                      padding: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {step.icon}
                  </div>
                </div>

                <h3
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.15rem',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    marginTop: '0.25rem',
                  }}
                >
                  {step.title}
                </h3>

                <p
                  style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {step.desc}
                </p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
}
