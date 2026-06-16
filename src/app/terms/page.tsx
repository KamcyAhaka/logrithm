import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';

export const metadata = {
  title: 'Terms of Service — Logrithm',
  description: 'Understand the terms and rules of using the Logrithm platform.',
};

export default function TermsPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-page)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-sans)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Navbar />

      <main
        style={{
          flex: 1,
          maxWidth: '800px',
          margin: '0 auto',
          width: '100%',
          padding: '3rem 1.5rem',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ marginBottom: '2rem' }}>
          <Link
            href="/"
            className="font-mono text-xs text-white/40 transition-colors hover:text-[#1D9E75]"
            style={{ textDecoration: 'none' }}
          >
            ← return home
          </Link>
        </div>

        <h1
          style={{
            fontSize: '2.5rem',
            marginBottom: '0.5rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            letterSpacing: '-0.02em',
          }}
        >
          Terms of Service
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            marginBottom: '3rem',
          }}
        >
          Last updated: June 9, 2026
        </p>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
            lineHeight: 1.7,
            fontSize: '0.95rem',
            color: 'var(--text-secondary)',
          }}
        >
          <section style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h2
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1.25rem',
                color: 'var(--text-primary)',
                fontWeight: 600,
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '0.5rem',
              }}
            >
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using Logrithm, you agree to comply with and be bound by these Terms
              of Service. If you do not agree, please do not connect your GitHub account or use the
              service.
            </p>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h2
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1.25rem',
                color: 'var(--text-primary)',
                fontWeight: 600,
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '0.5rem',
              }}
            >
              2. User Account Requirements
            </h2>
            <p>
              To access the features of Logrithm, you must have a valid GitHub account. You
              authorize Logrithm to connect to your account via OAuth to fetch and read developer
              activity patterns.
            </p>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h2
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1.25rem',
                color: 'var(--text-primary)',
                fontWeight: 600,
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '0.5rem',
              }}
            >
              3. Service Provided &ldquo;As-Is&rdquo;
            </h2>
            <p>
              Logrithm is provided to you on an &ldquo;as-is&rdquo; and &ldquo;as-available&rdquo;
              basis. We make no representations or warranties of any kind, express or implied,
              regarding the accuracy, reliability, availability, or suitability of the score
              calculation or generative AI insights.
            </p>
            <p>
              Logrithm is operated by Logrithm, which is an independent developer product. It is not
              affiliated with, endorsed by, or sponsored by GitHub, Inc., Microsoft, or Google.
            </p>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h2
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1.25rem',
                color: 'var(--text-primary)',
                fontWeight: 600,
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '0.5rem',
              }}
            >
              4. Code of Conduct & Score Manipulation
            </h2>
            <p>
              You agree not to misuse or attempt to manipulate your activity score. This includes,
              but is not limited to, using script-generated dummy repositories, automated commit
              spamming, or any other mechanisms intended to artificially inflate or falsify your
              GitHub contributions score.
            </p>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h2
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1.25rem',
                color: 'var(--text-primary)',
                fontWeight: 600,
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '0.5rem',
              }}
            >
              5. Account Suspension & Termination
            </h2>
            <p>
              We reserve the right, in our sole discretion, to suspend or terminate accounts that
              violate these terms, manipulate calculations, abuse the platform resources, or engage
              in behavior deemed harmful to other users or the service&apos;s operations.
            </p>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h2
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1.25rem',
                color: 'var(--text-primary)',
                fontWeight: 600,
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '0.5rem',
              }}
            >
              6. Billing and Refunds
            </h2>
            <p>
              Logrithm offers a paid Pro plan for a one-time purchase. We offer a full 7-day refund
              window from the date of purchase. Refunds are strictly limited to one refund request
              per GitHub account ever. If you request a refund and it is processed, you will be
              ineligible for any future refunds from Logrithm, regardless of subsequent purchases,
              account deletions, or re-registrations.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
