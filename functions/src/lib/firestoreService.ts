import { db } from './firebase';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import {
  PrivacySettingsDocument,
  RepoDocument,
  Repository,
  InsightObject,
  InsightDocument,
  SnapshotDocument,
} from '../types/github';
import { defaultPrivacySettings } from './defaults';

// TODO: SECURITY tokens/github currently stores raw GitHub OAuth tokens in Firestore.
// These should be migrated to GCP Secret Manager with the Firestore document
// storing only a Secret Manager resource name reference e.g.:
// "projects/{projectId}/secrets/github-token-{uid}/versions/latest"
// Priority: HIGH — complete before public launch.

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export const initUserPrivacySettings = async (uid: string): Promise<void> => {
  const ref = db.doc(`users/${uid}/settings/privacy`);
  const doc = await ref.get();
  if (!doc.exists) {
    await ref.set(
      {
        ...defaultPrivacySettings,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }
};

export const getPrivacySettings = async (uid: string): Promise<PrivacySettingsDocument> => {
  const ref = db.doc(`users/${uid}/settings/privacy`);
  const doc = await ref.get();
  if (doc.exists) {
    return doc.data() as PrivacySettingsDocument;
  }
  return {
    ...defaultPrivacySettings,
    updatedAt: Timestamp.now(),
  };
};

export const updatePrivacySettings = async (
  uid: string,
  updates: DeepPartial<Omit<PrivacySettingsDocument, 'updatedAt'>>
): Promise<void> => {
  const ref = db.doc(`users/${uid}/settings/privacy`);
  await ref.set(
    {
      ...updates,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
};

export const getIncludedRepos = async (uid: string): Promise<RepoDocument[]> => {
  // This is the MOST privacy-critical function. It fetches repos from /users/{uid}/repos
  // and filters them based on the user's privacy settings.
  // 1. Filters OUT repos where excludedByUser === true
  // 2. Filters OUT private_personal repos if !settings.analysis.includePrivatePersonal
  // 3. Filters OUT private_org repos if !settings.analysis.includeOrgRepos
  const settings = await getPrivacySettings(uid);
  const reposRef = db.collection(`users/${uid}/repos`);
  const snapshot = await reposRef.get();

  const repos: RepoDocument[] = [];
  snapshot.forEach((doc) => {
    const repo = doc.data() as RepoDocument;

    if (repo.excludedByUser) return;

    if (repo.visibility === 'private_personal' && !settings.analysis.includePrivatePersonal) {
      return;
    }

    if (repo.visibility === 'private_org' && !settings.analysis.includeOrgRepos) {
      return;
    }

    repos.push(repo);
  });

  return repos;
};

export const upsertRepo = async (
  uid: string,
  githubRepo: Repository,
  ownerType: 'user' | 'organization'
): Promise<void> => {
  const repoId = String(githubRepo.repoId ?? githubRepo.name);
  let visibility: 'public' | 'private_personal' | 'private_org' = 'public';

  if (githubRepo.isPrivate === false) {
    visibility = 'public';
  } else if (githubRepo.isPrivate === true && ownerType === 'user') {
    visibility = 'private_personal';
  } else if (githubRepo.isPrivate === true && ownerType === 'organization') {
    visibility = 'private_org';
  }

  const ref = db.doc(`users/${uid}/repos/${repoId}`);
  await ref.set(
    {
      ...githubRepo,
      visibility,
      ownerType,
      syncedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
};

export const saveInsightHistory = async (
  uid: string,
  insight: InsightObject,
  meta: { geminiModel: string; repoScope: InsightDocument['repoScope'] }
): Promise<string> => {
  const historyRef = db.collection(`users/${uid}/insights`);
  const newInsightDoc = historyRef.doc();
  const timestamp = FieldValue.serverTimestamp();

  const insightData = {
    ...insight,
    insightId: newInsightDoc.id,
    generatedAt: timestamp,
    geminiModel: meta.geminiModel,
    repoScope: meta.repoScope,
  };

  const batch = db.batch();

  batch.set(newInsightDoc, insightData);

  const latestRef = db.doc(`users/${uid}/insights/latest`);
  batch.set(latestRef, {
    data: insight,
    generatedAt: timestamp,
  });

  const profileRef = db.doc(`users/${uid}/profile/data`);
  batch.set(
    profileRef,
    {
      currentScore: insight.activityScore,
      lastAnalyzedAt: timestamp,
      analysisStatus: 'complete',
      updatedAt: timestamp,
    },
    { merge: true }
  );

  await batch.commit();

  return newInsightDoc.id;
};

export const saveSnapshot = async (
  uid: string,
  snapshot: Omit<SnapshotDocument, 'snapshotId' | 'capturedAt'>
): Promise<void> => {
  const snapshotsRef = db.collection(`users/${uid}/snapshots`);
  const newSnapshotDoc = snapshotsRef.doc();

  await newSnapshotDoc.set({
    ...snapshot,
    snapshotId: newSnapshotDoc.id,
    capturedAt: FieldValue.serverTimestamp(),
  });
};

export const updateAnalysisStatus = async (
  uid: string,
  status: 'idle' | 'pending' | 'running' | 'complete' | 'error',
  error?: string
): Promise<void> => {
  const profileRef = db.doc(`users/${uid}/profile/data`);
  const updates: {
    analysisStatus: string;
    updatedAt: FieldValue;
    analysisError?: string | null;
  } = {
    analysisStatus: status,
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (error !== undefined) {
    updates.analysisError = error;
  } else {
    updates.analysisError = null;
  }

  await profileRef.set(updates, { merge: true });
};
