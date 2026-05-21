import { onCall, HttpsError } from 'firebase-functions/v2/https';
import type { GitHubActivity } from '../types/github';

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
          name
          url
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
          name
          url
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
    const { token } = request.data as { token: string };

    if (!token || typeof token !== 'string') {
      throw new HttpsError('invalid-argument', 'GitHub token is required.');
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
              name: string;
              url: string;
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
              name: string;
              url: string;
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

    const uniqueReposMap = new Map<string, typeof allRepos[0]>();
    for (const repo of allRepos) {
      if (!uniqueReposMap.has(repo.url)) {
        uniqueReposMap.set(repo.url, repo);
      }
    }

    const repositories: GitHubActivity['repositories'] = Array.from(uniqueReposMap.values())
      .map((repo) => ({
        name: repo.name,
        url: repo.url,
        stargazerCount: repo.stargazerCount,
        forkCount: repo.forkCount,
        primaryLanguage: repo.primaryLanguage ?? null,
        commitCount: repo.defaultBranchRef?.target?.history?.totalCount ?? 0,
      }))
      .slice(0, 15);

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
