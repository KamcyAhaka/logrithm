// src/app/share/[username]/page.tsx
// Server Component — reads from Firestore directly
import { ShareCard } from '@/components/share/ShareCard';
import { db } from '@/lib/firebaseAdmin'; // server-side admin SDK
import { DUMMY_GITHUB_DATA, DUMMY_INSIGHTS } from '@/lib/demoData';

export default async function SharePage({ 
  params 
}: { 
  params: Promise<{ username: string }> 
}) {
  const { username } = await params;

  // OSS / Local Dev Workflow: Bypass Firebase entirely if in demo mode.
  // NEXT_PUBLIC_USE_EMULATOR takes priority — emulator mode always fetches real data.
  const isDemoMode =
    process.env.NEXT_PUBLIC_DEMO_MODE === 'true' &&
    process.env.NEXT_PUBLIC_USE_EMULATOR !== 'true';

  if (isDemoMode) {
    return (
      <ShareCard 
        insight={DUMMY_INSIGHTS} 
        username={username}
        avatarUrl={DUMMY_GITHUB_DATA.avatarUrl}
        generatedAt={new Date().toISOString()}
      />
    );
  }

  // Look up user by githubLogin
  const usersRef = db.collection('users');
  const query = await usersRef
    .where('profile.githubLogin', '==', username)
    .limit(1)
    .get();

  if (query.empty) {
    return <div>No insights found for @{username}</div>;
  }

  const uid = query.docs[0].id;
  const insightDoc = await db
    .collection('users').doc(uid)
    .collection('insights').doc('latest')
    .get();

  const insight = insightDoc.data()?.data;
  const profile = query.docs[0].data().profile;

  return (
    <ShareCard 
      insight={insight} 
      username={username}
      avatarUrl={profile.avatarUrl}
      generatedAt={insightDoc.data()?.generatedAt}
    />
  );
}
