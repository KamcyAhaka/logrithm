import Link from 'next/link';
import Accordion from '@/components/ui/Accordion';

export default function FAQPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-sans)',
        padding: '4rem 2rem',
      }}
    >
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
        }}
      >
        <div style={{ marginBottom: '2rem' }}>
          <Link
            href="/dashboard"
            className="font-mono text-xs text-white/40 transition-colors hover:text-[#1D9E75]"
            style={{ textDecoration: 'none' }}
          >
            ← return to dashboard
          </Link>
        </div>

        <h1
          style={{
            fontSize: '2.5rem',
            marginBottom: '2rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            letterSpacing: '-0.02em',
          }}
        >
          Frequently Asked Questions
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Activity Score Section */}
          <Accordion title="How is the Activity Score calculated?" defaultOpen={true}>
            <div
              style={{
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <p>
                The Activity Score (0-100) is a comprehensive metric that evaluates your entire year
                of GitHub contributions, weighting different aspects of your development habits to
                generate a final score.
              </p>
              <p>We calculate this score based on five key factors:</p>
              <ul
                style={{
                  paddingLeft: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <li>
                  <strong>Commit Volume (30%):</strong> Your total commit output, normalized against
                  an elite benchmark of 1,000 commits per year.
                </li>
                <li>
                  <strong>Consistency (25%):</strong> Your ability to maintain steady activity. The
                  target is 5 active days per week, penalizing long periods of inactivity.
                </li>
                <li>
                  <strong>Collaboration (20%):</strong> Your pull request ratio. We measure the
                  number of PRs relative to your commits, aiming for an ideal ratio of ~0.25 (1 PR
                  for every 4 commits).
                </li>
                <li>
                  <strong>Diversity (15%):</strong> The breadth of your work. This measures the
                  number of active repositories you contribute to, normalized against a target of 15
                  repositories.
                </li>
                <li>
                  <strong>Recent Momentum (10%):</strong> Your activity in the last 30 days compared
                  to your 12-month average, rewarding recent, sustained effort.
                </li>
              </ul>
              <p>
                This balanced approach ensures that the score rewards not just high volume, but also
                sustainable, collaborative, and consistent development practices.
              </p>
            </div>
          </Accordion>

          {/* Placeholder for future FAQs */}
          <Accordion title="More questions?" opacity={0.7}>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              We will populate this page with more frequently asked questions as the platform grows.
              Stay tuned!
            </p>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
