import type { Metadata } from 'next';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { getAdminDb } from '@/lib/firebase-admin';
import type { InsightObject, UserProfile } from '@/types/github';
import ShareCard, { type ShareCardSnapshot } from '@/components/share/ShareCard';

interface SharePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `@${username} — Logrithm analysis`,
    description: `View ${username}'s AI-powered GitHub activity insights on Logrithm.`,
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const { username } = await params;

  // Try to read from Firestore via admin SDK
  const adminDb = await getAdminDb();

  if (!adminDb) {
    // Demo mode or missing credentials — show friendly message
    return <NoPublicInsights username={username} reason="demo" />;
  }

  let profile: UserProfile | null = null;
  let insights: InsightObject | null = null;
  let snapshot: ShareCardSnapshot | null = null;
  let generatedAt: string | null = null;
  let errorReason: 'not-found' | 'no-insights' | 'error' | null = null;

  try {
    // Look up user by githubLogin — query across users collection
    const usersSnap = await adminDb
      .collectionGroup('profile')
      .where('githubLogin', '==', username)
      .limit(1)
      .get();

    if (usersSnap.empty) {
      errorReason = 'not-found';
    } else {
      const profileDoc = usersSnap.docs[0];
      const p = profileDoc.data() as UserProfile;

      // isPublic must be true — users default to false
      if (!p.isPublic) {
        errorReason = 'not-found';
      } else {
        // Get the latest insights and snapshot
        const uid = profileDoc.ref.parent.parent!.id;
        const insightSnap = await adminDb.doc(`users/${uid}/insights/latest`).get();
        const snapshotSnap = await adminDb
          .collection(`users/${uid}/snapshots`)
          .orderBy('capturedAt', 'desc')
          .limit(1)
          .get();

        if (!insightSnap.exists) {
          errorReason = 'no-insights';
        } else {
          const rawData = insightSnap.data() as {
            data: InsightObject;
            generatedAt?: { toDate?: () => Date } | string;
          };
          profile = p;
          insights = rawData.data as InsightObject;

          if (!snapshotSnap.empty) {
            const data = snapshotSnap.docs[0].data();
            snapshot = {
              snapshotId: snapshotSnap.docs[0].id,
              totalCommits: data.totalCommits || 0,
              totalPRsMerged: data.totalPRsMerged || 0,
              totalIssuesOpened: data.totalIssuesOpened || 0,
              activeRepoCount: data.activeRepoCount || 0,
              languageTotals: data.languageTotals || {},
              currentStreak: data.currentStreak || 0,
              longestStreak: data.longestStreak || 0,
              longestStreakStart: data.longestStreakStart,
              longestStreakEnd: data.longestStreakEnd,
            };
          }

          const genAt = rawData.generatedAt;
          if (typeof genAt === 'string') {
            generatedAt = genAt;
          } else if (genAt && typeof genAt.toDate === 'function') {
            generatedAt = genAt.toDate().toISOString();
          } else {
            generatedAt = new Date().toISOString();
          }
        }
      }
    }
  } catch (err) {
    console.error('[SharePage] Error reading Firestore:', err);
    errorReason = 'error';
  }

  if (
    errorReason === 'not-found' ||
    errorReason === 'error' ||
    !profile ||
    !insights ||
    !generatedAt
  ) {
    return <NoPublicInsights username={username} />;
  }

  if (errorReason === 'no-insights') {
    return <NoPublicInsights username={username} reason="no-insights" />;
  }
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--bg-page)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2rem 1rem',
      }}
    >
      {/* Top Left Return Link */}
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <Link
          href="/dashboard"
          className="font-mono text-xs text-white/40 transition-colors hover:text-[#1D9E75]"
          style={{ textDecoration: 'none' }}
        >
          ← return to dashboard
        </Link>
        <Link
          href="/faq"
          className="rounded-full border border-[#1D9E75]/20 bg-[#1D9E75]/5 px-2.5 py-1 font-mono text-xs text-[#1D9E75] transition-colors hover:text-[#1D9E75]/80"
          style={{ textDecoration: 'none' }}
        >
          how is this score calculated? (FAQ)
        </Link>
      </div>

      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            marginBottom: '0.5rem',
          }}
        >
          logrithm analysis
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '1.5rem',
            color: 'var(--text-primary)',
          }}
        >
          @{username}
        </h1>
      </div>

      <ShareCard
        login={username}
        avatarUrl={profile.avatarUrl}
        insights={insights}
        snapshot={snapshot || undefined}
        generatedAt={generatedAt}
      />
    </main>
  );
}

function NoPublicInsights({
  username,
  reason,
}: {
  username: string;
  reason?: 'demo' | 'no-insights' | undefined;
}) {
  const isPrivate = !reason;

  const message =
    reason === 'demo'
      ? 'Public sharing is only available with a live account.'
      : reason === 'no-insights'
        ? `@${username} hasn't generated any insights yet.`
        : `The profile for @${username} is private.`;

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--bg-page)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      {!isPrivate && (
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '2rem',
            color: 'var(--text-muted)',
          }}
        >
          404
        </p>
      )}
      {isPrivate && (
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.5rem',
          }}
        >
          <Lock size={24} style={{ color: 'var(--text-muted)' }} />
        </div>
      )}
      <h1
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '1.1rem',
          color: 'var(--text-primary)',
        }}
      >
        {message}
      </h1>

      {isPrivate && (
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
            maxWidth: '300px',
            lineHeight: 1.5,
          }}
        >
          If this is your profile, you can make it public in your{' '}
          <Link
            href="/settings/privacy#profile-visibility"
            style={{ color: 'var(--green)', textDecoration: 'underline' }}
          >
            privacy settings
          </Link>
          .
        </p>
      )}

      <Link
        href="/"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          textDecoration: 'none',
          marginTop: '1rem',
        }}
      >
        ← back to logrithm.dev
      </Link>
    </main>
  );
}
