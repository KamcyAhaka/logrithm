import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import type { GitHubActivity } from '../types/github';
import { upsertRepo } from '../lib/firestoreService';

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
          defaultBranchRef {
            target {
              ... on Commit {
                history(first: 1) {
                  totalCount
                }
              }
            }
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
          defaultBranchRef {
            target {
              ... on Commit {
                history(first: 1) {
                  totalCount
                }
              }
            }
          }
        }
      }
    }
  }
`;

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

    // Retrieve GitHub token from Secret Manager
    // SECURITY: token never passes through the client
    let token: string;
    try {
      const secretName = `projects/${PROJECT_ID}/secrets/github-token-${uid}/versions/latest`;
      const [version] = await secretClient.accessSecretVersion({ name: secretName });
      const payload = version.payload?.data;
      if (!payload) {
        throw new Error('Empty secret payload');
      }
      token = typeof payload === 'string' ? payload : Buffer.from(payload).toString('utf8');
    } catch (err) {
      console.error('[fetchGitHubActivity] Could not retrieve token from Secret Manager:', err);
      throw new HttpsError('unauthenticated', 'GitHub token not found. Please sign in again.');
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
      throw new HttpsError(
        'unavailable',
        'Could not reach GitHub API. The log is empty. Try again.'
      );
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
          contributionsCollection: {
            totalCommitContributions: number;
            totalPullRequestContributions: number;
            totalIssueContributions: number;
            totalRepositoriesWithContributedCommits: number;
            contributionCalendar: {
              totalContributions: number;
              weeks: { contributionDays: { date: string; contributionCount: number }[] }[];
            };
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
              defaultBranchRef: {
                target: { history: { totalCount: number } } | null;
              } | null;
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
              defaultBranchRef: {
                target: { history: { totalCount: number } } | null;
              } | null;
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
        commitCount: repo.defaultBranchRef?.target?.history?.totalCount ?? 0,
      }))
      .slice(0, 15);

    // Persist repos to Firestore for privacy filtering in generateInsights
    // Fire-and-forget with Promise.allSettled — never block or throw on upsert failures
    try {
      await Promise.allSettled(
        repositories.map((repo) => upsertRepo(uid, repo, repo.ownerType as 'user' | 'organization'))
      );
      console.log(`[fetchGitHubActivity] Upserted ${repositories.length} repos for ${uid}`);
    } catch (err) {
      // Non-fatal — generateInsights falls back to activity.repositories if Firestore is empty
      console.warn('[fetchGitHubActivity] Could not upsert repos:', err);
    }

    return {
      login: viewer.login,
      name: viewer.name,
      avatarUrl: viewer.avatarUrl,
      totalCommitContributions: contributionsCollection.totalCommitContributions,
      totalPullRequestContributions: contributionsCollection.totalPullRequestContributions,
      totalIssueContributions: contributionsCollection.totalIssueContributions,
      totalRepositoriesWithContributedCommits:
        contributionsCollection.totalRepositoriesWithContributedCommits,
      contributionCalendar: contributionsCollection.contributionCalendar,
      repositories,
    };
  }
);
