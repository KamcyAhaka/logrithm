import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';

export const metadata = {
  title: 'Refund Policy — Logrithm',
  description: 'Learn about our refund eligibility criteria and process.',
};

export default function RefundPage() {
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
          Refund Policy
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
              1. Pro Plan Pricing
            </h2>
            <p style={{ marginBottom: '0.25rem' }}>
              Logrithm offers a Pro plan for a one-time purchase payment of <strong>$60</strong>.
              This fee and features are subject to change in the future. The Pro plan currently
              includes:
            </p>
            <ul
              style={{
                paddingLeft: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                marginBottom: '0.5rem',
              }}
            >
              <li>Advanced developer insight analyses powered by Gemini AI</li>
              <li>Automated background commit tracking and history syncs</li>
              <li>Customizable profile sharing metrics and download layouts</li>
            </ul>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Note: Additional features may be added to this list as the platform grows.
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
              2. 7-Day Refund Window
            </h2>
            <p>
              We want you to be completely satisfied with Logrithm. We offer a full{' '}
              <strong>7-day refund window </strong>
              from the date of purchase.
            </p>
            <p>
              If you request a refund within 7 days of your purchase transaction, we will reverse
              the charge and deactivate your Pro account status.
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
              3. Refund Request Submission
            </h2>
            <p>
              To request a refund, please send an email with your GitHub username and purchase
              receipt details to:
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--green)' }}>
              <strong>support@logrithm.dev</strong>
            </p>
            <p>
              We process eligible requests within 2 to 3 business days, after which funds will be
              returned to your original payment card / account (depending on bank processing
              speeds).
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
              4. Ineligibility after 7 Days
            </h2>
            <p>
              Refunds will not be issued for any request received after 7 days have elapsed from the
              date of purchase. By purchasing Logrithm Pro, you agree to this billing policy.
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
              5. Third-Party Payment Processor
            </h2>
            <p>
              All payments, billing details, and receipts are securely managed and processed on our
              behalf by <strong>Lemon Squeezy</strong>. Their specific checkout policies and
              transaction terms also apply to your purchase.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
