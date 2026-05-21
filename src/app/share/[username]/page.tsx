import type { Metadata } from 'next';
import Link from 'next/link';
import { getAdminDb } from '@/lib/firebase-admin';
import type { InsightObject, UserProfile } from '@/types/github';
import ShareCard from '@/components/share/ShareCard';

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
        // Get the latest insights
        const uid = profileDoc.ref.parent.parent!.id;
        const insightSnap = await adminDb.doc(`users/${uid}/insights/latest`).get();

        if (!insightSnap.exists) {
          errorReason = 'no-insights';
        } else {
          const data = insightSnap.data() as {
            data: InsightObject;
            generatedAt: string;
          };
          profile = p;
          insights = data.data;
          generatedAt = data.generatedAt;
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
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}
    >
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
        generatedAt={generatedAt}
      />

      <Link
        href="/dashboard"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          textDecoration: 'none',
          marginTop: '2rem',
        }}
      >
        ← return to dashboard
      </Link>
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
  const message =
    reason === 'demo'
      ? 'Public sharing is only available with a live account.'
      : reason === 'no-insights'
        ? `@${username} hasn't generated any insights yet.`
        : `No public insights for @${username}.`;

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
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '2rem',
          color: 'var(--text-muted)',
        }}
      >
        404
      </p>
      <h1
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '1.1rem',
          color: 'var(--text-primary)',
        }}
      >
        {message}
      </h1>
      <Link
        href="/"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          color: 'var(--green)',
          textDecoration: 'none',
          marginTop: '0.5rem',
        }}
      >
        ← logrithm.dev
      </Link>
    </main>
  );
}
