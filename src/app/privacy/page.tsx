import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';

export const metadata = {
  title: 'Privacy Policy — Logrithm',
  description: 'Learn how Logrithm collects, uses, and protects your developer data.',
};

export default function PrivacyPage() {
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
          Privacy Policy
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
              1. Information We Collect
            </h2>
            <p>
              When you connect your GitHub account to Logrithm via OAuth, we retrieve and collect
              certain public (and if authorized, private) developer activity data:
            </p>
            <ul
              style={{
                paddingLeft: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <li>Commit history details (timestamps, active hours, and total counts)</li>
              <li>Pull requests and open/closed issue logs</li>
              <li>Connected repositories list and repository names</li>
              <li>Programming language usage data</li>
            </ul>
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
              2. How We Store Your Data
            </h2>
            <p>
              We securely store your GitHub username, avatar URL, and fetched activity data in our
              Firestore database to compute metrics and render your profile.
            </p>
            <p style={{ color: 'var(--green)' }}>
              <strong>Security Note:</strong> We do not store your GitHub OAuth access tokens in our
              database.
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
              3. Payments & Billing
            </h2>
            <p>
              Payment transactions and subscriptions are handled completely and securely by our
              billing partner, <strong>Lemon Squeezy</strong>. Logrithm does not process, capture,
              or store your credit card, billing, or other sensitive payment information.
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
              4. Deleting Your Account
            </h2>
            <p>
              You have absolute control over your developer profile. You can permanently delete your
              account and purge all associated data from our database at any time by going to the
              <strong> Settings &gt; Account </strong> tab and clicking &ldquo;Delete
              Account&rdquo;.
            </p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Note: To prevent billing abuse and enforce our one-refund-ever policy, a persistent
              record tracking refunded GitHub usernames is retained outside the user profile
              directory for a maximum of seven (7) years from the date of the refund. Under
              compliance frameworks such as GDPR Article 17(3)(e), this data is excluded from
              account deletion requests as it is strictly processed for the prevention of fraud and
              billing abuse, and the establishment, exercise, or defense of legal claims. Users
              retain the right to query, verify, or dispute the existence of these records by
              contacting support.
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
              5. Third Parties & Data Sharing
            </h2>
            <p>
              We do not sell, rent, trade, or distribute your personal or repository data to third
              parties. All data collected is used solely to generate your commit activity scores,
              visual charts, and custom AI insights.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
