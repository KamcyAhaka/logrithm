import { getAdminDb } from '@/lib/firebase-admin';
import { CardProfile } from '@/components/profile/CardProfile';
import { FullProfile } from '@/components/profile/FullProfile';
import type {
  UserProfile,
  PrivacySettingsDocument,
  InsightObject,
  SnapshotDocument,
  RepoDocument,
} from '@/types/github';
import Link from 'next/link';
import { Metadata } from 'next';

interface ProfilePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `@${slug} | Logrithm`,
    description: `View @${slug}'s Logrithm GitHub activity analysis.`,
  };
}

export default async function PublicProfilePage({ params }: ProfilePageProps) {
  const { slug } = await params;
  const adminDb = await getAdminDb();

  if (!adminDb) {
    return <PrivateOrNotFound slug={slug} />;
  }

  // Step 1: Resolve slug to uid
  const slugDoc = await adminDb.doc(`slugs/${slug}`).get();
  let uid = '';

  if (slugDoc.exists) {
    uid = slugDoc.data()?.uid;
  } else {
    // Fallback: search profile/data by githubLogin (case-sensitive)
    const profileSnap = await adminDb
      .collectionGroup('profile')
      .where('githubLogin', '==', slug)
      .limit(1)
      .get();

    if (profileSnap.empty) {
      return <PrivateOrNotFound slug={slug} />;
    }
    uid = profileSnap.docs[0].ref.parent.parent!.id;
  }

  if (!uid) {
    return <PrivateOrNotFound slug={slug} />;
  }

  // Step 2: Check profile is public
  const profileDoc = await adminDb.doc(`users/${uid}/profile/data`).get();
  if (!profileDoc.exists) {
    return <PrivateOrNotFound slug={slug} />;
  }

  const rawProfileData = profileDoc.data() as UserProfile;
  if (rawProfileData.isPublic !== true) {
    return <PrivateOrNotFound slug={slug} />;
  }

  // Strip hidden Timestamp fields (like updatedAt, lastAnalyzedAt) that Next.js cannot serialize
  const profileData: UserProfile = {
    githubLogin: rawProfileData.githubLogin,
    displayName: rawProfileData.displayName,
    avatarUrl: rawProfileData.avatarUrl,
    createdAt: rawProfileData.createdAt,
    plan: rawProfileData.plan,
    isPublic: rawProfileData.isPublic,
  };

  // Step 3: Read privacy settings
  const privacyDoc = await adminDb.doc(`users/${uid}/settings/privacy`).get();
  const defaultPrivacy = {
    profile: { showScore: true, showLanguages: true, showRepoList: true, displayStyle: 'card' },
  };

  const privacySettings = privacyDoc.exists
    ? (privacyDoc.data() as PrivacySettingsDocument)
    : (defaultPrivacy as unknown as PrivacySettingsDocument); // Fallback defaults

  // Merge default just in case it's missing fields
  const settings = {
    ...privacySettings,
    profile: {
      ...defaultPrivacy.profile,
      ...(privacySettings.profile || {}),
    },
  };

  const displayStyle = settings.profile.displayStyle || 'card';

  // Step 4: Read latest insight
  const insightDoc = await adminDb.doc(`users/${uid}/insights/latest`).get();
  if (!insightDoc.exists) {
    // If they have no insights, we can't show a profile
    return <PrivateOrNotFound slug={slug} />;
  }

  const insightDataRaw = insightDoc.data() as { data: InsightObject };
  const insights = insightDataRaw.data;

  // Step 5: Read repos (if full or showRepoList)
  let repos: RepoDocument[] = [];
  if (displayStyle === 'full' || settings.profile.showRepoList) {
    const reposSnap = await adminDb
      .collection(`users/${uid}/repos`)
      .where('visibility', '==', 'public')
      .where('excludedByUser', '==', false)
      .orderBy('commitCount', 'desc')
      .limit(10)
      .get();

    repos = reposSnap.docs.map((doc) => doc.data() as RepoDocument);
  }

  // Step 6: Read latest snapshot
  let snapshot: SnapshotDocument | undefined;
  const snapshotSnap = await adminDb
    .collection(`users/${uid}/snapshots`)
    .orderBy('capturedAt', 'desc')
    .limit(1)
    .get();

  if (!snapshotSnap.empty) {
    snapshot = snapshotSnap.docs[0].data() as SnapshotDocument;
  }

  // Remove Timestamps to prevent Next.js serialization errors
  const safeSettings = {
    ...settings,
    updatedAt: null,
  } as unknown as PrivacySettingsDocument;

  const safeSnapshot = snapshot
    ? ({
        ...snapshot,
        capturedAt: null,
        periodStart: null,
        periodEnd: null,
      } as unknown as SnapshotDocument)
    : undefined;

  const safeRepos = repos.map(
    (repo) =>
      ({
        ...repo,
        lastCommitAt: null,
        syncedAt: null,
      }) as unknown as RepoDocument
  );

  if (displayStyle === 'full') {
    return (
      <FullProfile
        profile={profileData}
        privacySettings={safeSettings}
        insights={insights}
        snapshot={safeSnapshot}
        repos={safeRepos}
      />
    );
  }

  return (
    <CardProfile
      profile={profileData}
      privacySettings={safeSettings}
      insights={insights}
      totalCommits={safeSnapshot?.totalCommits}
    />
  );
}

function PrivateOrNotFound({ slug }: { slug: string }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-4 text-center font-sans">
      <h1 className="mb-6 font-mono text-4xl font-bold tracking-tight text-[#1D9E75]">logrithm</h1>
      <p className="mb-2 text-lg text-white/80">This profile is private or doesn&apos;t exist.</p>
      <p className="text-sm text-white/50">
        Are you @{slug}?{' '}
        <Link href="/" className="text-[#1D9E75] hover:underline">
          Sign in to manage your profile.
        </Link>
      </p>
    </main>
  );
}
