import { HttpsError } from 'firebase-functions/v2/https';
import { onCall } from '../lib/firebase';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import type { GitHubActivity } from '../types/github';
import { db } from '../lib/firebase';
import { upsertRepo, saveSnapshot } from '../lib/firestoreService';
import { buildSnapshot } from '../lib/snapshotBuilder';
import { FieldValue } from 'firebase-admin/firestore';

const secretClient = new SecretManagerServiceClient();
const PROJECT_ID = process.env.GCLOUD_PROJECT ?? 'logrithm-ai';
// ---------------------------------------------------------------------------
// GitHub GraphQL query — fetches 12 months of activity for the authed user
// ---------------------------------------------------------------------------
const GITHUB_GRAPHQL_QUERY = `
  query GetContributions {
    viewer {
      login
      name
      avatarUrl
      location
      contributionsCollection {
        totalCommitContributions
        totalPullRequestContributions
        totalIssueContributions
        totalRepositoriesWithContributedCommits
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
        commitContributionsByRepository(maxRepositories: 100) {
          repository {
            databaseId
          }
          contributions {
            totalCount
          }
        }
      }
      repositories(first: 15, orderBy: { field: UPDATED_AT, direction: DESC }, ownerAffiliations: [OWNER, COLLABORATOR, ORGANIZATION_MEMBER]) {
        nodes {
          databaseId
          name
          url
          isPrivate
          owner {
            login
            __typename
          }
          stargazerCount
          forkCount
          primaryLanguage {
            name
            color
          }
        }
      }
      repositoriesContributedTo(first: 15, orderBy: { field: UPDATED_AT, direction: DESC }, contributionTypes: [COMMIT, PULL_REQUEST, ISSUE, REPOSITORY]) {
        nodes {
          databaseId
          name
          url
          isPrivate
          owner {
            login
            __typename
          }
          stargazerCount
          forkCount
          primaryLanguage {
            name
            color
          }
        }
      }
    }
  }
`;

export const fetchActivityInternal = async (uid: string): Promise<GitHubActivity> => {
  // Retrieve GitHub token — local dev override first, then Secret Manager.
  // In local dev, set GITHUB_TOKEN_OVERRIDE in functions/.env.local to skip Secret Manager.
  // SECURITY: token never passes through the client in production.
  let token: string;

  const localTokenOverride = process.env.GITHUB_TOKEN_OVERRIDE ?? null;
  if (localTokenOverride) {
    token = localTokenOverride;
  } else {
    try {
      // Get secretRef from Firestore users/{uid}/tokens/github
      const tokenDoc = await db.doc(`users/${uid}/tokens/github`).get();
      const secretRef = tokenDoc.exists ? tokenDoc.data()?.secretRef : null;

      // Fallback to default secret name path if secretRef is not set in Firestore
      const secretName =
        secretRef || `projects/${PROJECT_ID}/secrets/github-token-${uid}/versions/latest`;

      const [version] = await secretClient.accessSecretVersion({ name: secretName });
      const payload = version.payload?.data;
      if (!payload) {
        throw new Error('Empty secret payload');
      }
      token = typeof payload === 'string' ? payload : Buffer.from(payload).toString('utf8');
    } catch (err) {
      console.error(
        '[fetchGitHubActivity] Could not retrieve token from Secret Manager or Firestore:',
        err
      );
      throw new HttpsError('unauthenticated', 'GitHub token not found. Please sign in again.');
    }
  }

  let response: Response;
  try {
    response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Logrithm/1.0',
      },
      body: JSON.stringify({ query: GITHUB_GRAPHQL_QUERY }),
    });
  } catch (err) {
    console.error('[fetchGitHubActivity] Network error:', err);
    throw new HttpsError('unavailable', 'Could not reach GitHub API. The log is empty. Try again.');
  }

  if (!response.ok) {
    throw new HttpsError(
      'unavailable',
      `GitHub API returned ${response.status}. The log is empty. Try again.`
    );
  }

  const json = (await response.json()) as {
    data?: {
      viewer: {
        login: string;
        name: string | null;
        avatarUrl: string;
        location: string | null;
        contributionsCollection: {
          totalCommitContributions: number;
          totalPullRequestContributions: number;
          totalIssueContributions: number;
          totalRepositoriesWithContributedCommits: number;
          contributionCalendar: {
            totalContributions: number;
            weeks: { contributionDays: { date: string; contributionCount: number }[] }[];
          };
          commitContributionsByRepository: Array<{
            repository: {
              databaseId: number;
            };
            contributions: {
              totalCount: number;
            };
          }>;
        };
        repositories: {
          nodes: Array<{
            databaseId: number;
            name: string;
            url: string;
            isPrivate: boolean;
            owner: {
              login: string;
              __typename: string;
            };
            stargazerCount: number;
            forkCount: number;
            primaryLanguage: { name: string; color: string | null } | null;
          }>;
        };
        repositoriesContributedTo: {
          nodes: Array<{
            databaseId: number;
            name: string;
            url: string;
            isPrivate: boolean;
            owner: {
              login: string;
              __typename: string;
            };
            stargazerCount: number;
            forkCount: number;
            primaryLanguage: { name: string; color: string | null } | null;
          }>;
        };
      };
    };
    errors?: Array<{ message: string }>;
  };

  if (json.errors?.length) {
    console.error('[fetchGitHubActivity] GraphQL errors:', json.errors);
    throw new HttpsError('internal', json.errors[0].message);
  }

  const viewer = json.data?.viewer;
  if (!viewer) {
    throw new HttpsError('internal', 'Unexpected GitHub API response shape.');
  }

  const { contributionsCollection } = viewer;

  // Build a map of repo ID to user commit counts from contributionsCollection
  const userCommitsMap = new Map<number, number>();
  const commitContribs = contributionsCollection.commitContributionsByRepository || [];
  for (const contrib of commitContribs) {
    if (contrib.repository?.databaseId) {
      userCommitsMap.set(contrib.repository.databaseId, contrib.contributions?.totalCount ?? 0);
    }
  }

  // Merge repositories and repositoriesContributedTo, then deduplicate by URL
  const allRepos = [
    ...(viewer.repositories?.nodes || []),
    ...(viewer.repositoriesContributedTo?.nodes || []),
  ].filter(Boolean);

  const uniqueReposMap = new Map<string, (typeof allRepos)[0]>();
  for (const repo of allRepos) {
    if (!uniqueReposMap.has(repo.url)) {
      uniqueReposMap.set(repo.url, repo);
    }
  }

  const repositories: GitHubActivity['repositories'] = Array.from(uniqueReposMap.values())
    .map((repo) => ({
      repoId: String(repo.databaseId),
      name: repo.name,
      url: repo.url,
      isPrivate: repo.isPrivate,
      ownerLogin: repo.owner.login,
      ownerType: (repo.owner.__typename === 'Organization' ? 'organization' : 'user') as
        | 'user'
        | 'organization',
      stargazerCount: repo.stargazerCount,
      forkCount: repo.forkCount,
      primaryLanguage: repo.primaryLanguage ?? null,
      commitCount: userCommitsMap.get(repo.databaseId) ?? 0,
    }))
    .slice(0, 15);

  // Persist repos to Firestore for privacy filtering in generateInsights
  // Fire-and-forget with Promise.allSettled — never block or throw on upsert failures
  try {
    await Promise.allSettled(
      repositories.map((repo) => upsertRepo(uid, repo, repo.ownerType as 'user' | 'organization'))
    );
  } catch (err) {
    // Non-fatal — generateInsights falls back to activity.repositories if Firestore is empty
    console.warn('[fetchGitHubActivity] Could not upsert repos:', err);
  }

  // Self-Healing Plan Check:
  // If the user's synchronous local database write failed AND the LemonSqueezy webhook
  // failed to deliver, we check if the user is blacklisted in refunded_users. If they are,
  // but their profile still shows Pro, we automatically heal the database.
  try {
    const profileSnap = await db.doc(`users/${uid}/profile/data`).get();
    const profileData = profileSnap.exists ? profileSnap.data() || {} : {};
    if (profileData.plan === 'pro') {
      const loginLowercase = viewer.login.toLowerCase();
      const refundedSnap = await db.doc(`refunded_users/${loginLowercase}`).get();
      if (refundedSnap.exists) {
        await db.doc(`users/${uid}/profile/data`).set(
          {
            plan: 'free',
            isPro: false,
            proDeactivatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

        const orderId = refundedSnap.data()?.orderId;
        if (orderId) {
          const paymentsSnap = await db
            .collection(`users/${uid}/payments`)
            .where('orderId', '==', String(orderId))
            .get();

          if (!paymentsSnap.empty) {
            for (const doc of paymentsSnap.docs) {
              await doc.ref.set(
                {
                  status: 'refunded',
                  updatedAt: FieldValue.serverTimestamp(),
                },
                { merge: true }
              );
            }
          } else {
            await db.doc(`users/${uid}/payments/${orderId}`).set(
              {
                status: 'refunded',
                updatedAt: FieldValue.serverTimestamp(),
              },
              { merge: true }
            );
          }
        }

        console.warn(
          `[Self-Healing] Detected and healed inconsistent refunded state for user ${uid} (${viewer.login})`
        );
      }
    }
  } catch (healError) {
    // Non-fatal — never block activity fetching due to healing check failures
    console.error('[Self-Healing] Failed to perform self-healing plan check:', healError);
  }

  const activity: GitHubActivity = {
    login: viewer.login,
    name: viewer.name,
    avatarUrl: viewer.avatarUrl,
    location: viewer.location ?? null,
    totalCommitContributions: contributionsCollection.totalCommitContributions,
    totalPullRequestContributions: contributionsCollection.totalPullRequestContributions,
    totalIssueContributions: contributionsCollection.totalIssueContributions,
    totalRepositoriesWithContributedCommits:
      contributionsCollection.totalRepositoriesWithContributedCommits,
    contributionCalendar: contributionsCollection.contributionCalendar,
    repositories,
  };

  // Fire-and-forget snapshot — never block the response or throw on failure.
  // This ensures every user gets a snapshot on their first dashboard load,
  // without having to wait for the background scheduler to run.
  saveSnapshot(uid, buildSnapshot(activity)).catch((err) =>
    console.warn('[fetchGitHubActivity] Could not save snapshot (non-fatal):', err)
  );

  return activity;
};

export const fetchGitHubActivity = onCall(
  { region: 'us-central1' },
  async (request): Promise<GitHubActivity> => {
    const { uid } = request.data as { uid: string };

    if (!uid || typeof uid !== 'string') {
      throw new HttpsError('invalid-argument', 'uid is required.');
    }

    // Verify the request is authenticated and uid matches the caller
    if (!request.auth?.uid || request.auth.uid !== uid) {
      throw new HttpsError('unauthenticated', 'Must be signed in as this user.');
    }

    return fetchActivityInternal(uid);
  }
);
