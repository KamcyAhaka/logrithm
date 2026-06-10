'use client';

import Image from 'next/image';
import FadeInSection from './FadeInSection';
import ShareCardsCarousel from './ShareCardsCarousel';

export default function FeatureHighlightsSection() {
  return (
    <section
      style={{ padding: '8rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '8rem' }}
    >
      <div
        style={{
          maxWidth: '80rem',
          margin: '0 auto',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '8rem',
        }}
      >
        {/* Feature 1 — Activity Dashboard */}
        <FadeInSection>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '3.5rem',
              alignItems: 'center',
            }}
            className="lg:grid-cols-12"
          >
            <div
              className="lg:col-span-5"
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: '#4ade80',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                }}
              >
                visual tracking
              </span>
              <h3
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                  fontWeight: 500,
                  lineHeight: 1.2,
                  letterSpacing: '-0.02em',
                }}
              >
                See your full commit story
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                Track your commits, PRs, open issues, and active repos across 12 months. Visualize
                your work rhythm with a 30-day activity chart and annual heatmap. Get a rich
                developer overview all on a single modern dashboard.
              </p>
            </div>

            <div className="lg:col-span-7" style={{ display: 'flex', justifyContent: 'center' }}>
              <div
                style={{
                  width: '100%',
                  maxWidth: '640px',
                  borderRadius: '1.25rem',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 20px 40px -15px rgba(29, 158, 117, 0.2)',
                  background: 'rgba(20, 20, 20, 0.4)',
                }}
              >
                <Image
                  src="/previews/preview-activity.png"
                  alt="Activity Dashboard Preview"
                  width={720}
                  height={405}
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    objectFit: 'contain',
                  }}
                />
              </div>
            </div>
          </div>
        </FadeInSection>

        {/* Feature 2 — Score Breakdown */}
        <FadeInSection>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '3.5rem',
              alignItems: 'center',
            }}
            className="lg:grid-cols-12"
          >
            <div
              className="lg:order-2 lg:col-span-7"
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: '#4ade80',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                }}
              >
                algorithmic scoring
              </span>
              <h3
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                  fontWeight: 500,
                  lineHeight: 1.2,
                  letterSpacing: '-0.02em',
                }}
              >
                A score that actually means something
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                Your activity score is calculated across 5 deterministic dimensions — Volume,
                Consistency, Collaboration, Diversity, and Momentum — each benchmarked against your
                peers. No gimmicks, just pure repository telemetry analyzed fairly.
              </p>
            </div>

            <div
              className="lg:order-1 lg:col-span-5"
              style={{ display: 'flex', justifyContent: 'center' }}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: '640px',
                  borderRadius: '1.25rem',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 20px 40px -15px rgba(29, 158, 117, 0.2)',
                  background: 'rgba(20, 20, 20, 0.4)',
                }}
              >
                <Image
                  src="/previews/preview-score.png"
                  alt="Score Breakdown Preview"
                  width={720}
                  height={405}
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    objectFit: 'contain',
                  }}
                />
              </div>
            </div>
          </div>
        </FadeInSection>

        {/* Feature 3 — Peer Comparison */}
        <FadeInSection>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '3.5rem',
              alignItems: 'center',
            }}
            className="lg:grid-cols-12"
          >
            <div
              className="lg:col-span-5"
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: '#4ade80',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                }}
              >
                global benchmarks
              </span>
              <h3
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                  fontWeight: 500,
                  lineHeight: 1.2,
                  letterSpacing: '-0.02em',
                }}
              >
                See where you stand
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                Compare your score against developers globally, by language, or by country. Know
                your percentile rank and how you stack up against your cohort. Real-world
                positioning that provides genuine context.
              </p>
            </div>

            <div className="lg:col-span-7" style={{ display: 'flex', justifyContent: 'center' }}>
              <div
                style={{
                  width: '100%',
                  maxWidth: '640px',
                  borderRadius: '1.25rem',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 20px 40px -15px rgba(29, 158, 117, 0.2)',
                  background: 'rgba(20, 20, 20, 0.4)',
                }}
              >
                <Image
                  src="/previews/preview-peer.png"
                  alt="Peer Comparison Preview"
                  width={720}
                  height={405}
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    objectFit: 'contain',
                  }}
                />
              </div>
            </div>
          </div>
        </FadeInSection>

        {/* Feature 4 — Share Cards (Carousel) */}
        <FadeInSection>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '3.5rem',
              alignItems: 'center',
            }}
            className="lg:grid-cols-12"
          >
            <div
              className="lg:order-2 lg:col-span-7"
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: '#4ade80',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                }}
              >
                social sharing
              </span>
              <h3
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                  fontWeight: 500,
                  lineHeight: 1.2,
                  letterSpacing: '-0.02em',
                }}
              >
                Share your dev identity
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                Download and share your Persona, Score, Streak, Wrapped, and PR Stats cards. Five
                highly polished, aesthetically striking ways to show the developer community exactly
                what kind of developer you are.
              </p>
            </div>

            <div
              className="lg:order-1 lg:col-span-5"
              style={{ display: 'flex', justifyContent: 'center', width: '100%' }}
            >
              <ShareCardsCarousel />
            </div>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
}
