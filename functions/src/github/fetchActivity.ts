import * as functions from 'firebase-functions';

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';

export const fetchGitHubActivity = async (token: string) => {
  const query = `
    query {
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
        repositories(first: 50, orderBy: {field: UPDATED_AT, direction: DESC}, ownerAffiliations: [OWNER, COLLABORATOR, ORGANIZATION_MEMBER]) {
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

  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new functions.https.HttpsError('internal', `GitHub API error: ${errorText}`);
  }

  const data = await response.json() as any;
  
  if (data.errors) {
    throw new functions.https.HttpsError('internal', `GitHub GraphQL error: ${data.errors[0].message}`);
  }

  const viewer = data.data.viewer;
  
  // Normalize repository data to include commitCount
  const repositories = viewer.repositories.nodes.map((repo: any) => ({
    name: repo.name,
    url: repo.url,
    stargazerCount: repo.stargazerCount,
    forkCount: repo.forkCount,
    primaryLanguage: repo.primaryLanguage,
    commitCount: repo.defaultBranchRef?.target?.history?.totalCount || 0,
  }));

  return {
    login: viewer.login,
    name: viewer.name,
    avatarUrl: viewer.avatarUrl,
    totalCommitContributions: viewer.contributionsCollection.totalCommitContributions,
    totalPullRequestContributions: viewer.contributionsCollection.totalPullRequestContributions,
    totalIssueContributions: viewer.contributionsCollection.totalIssueContributions,
    totalRepositoriesWithContributedCommits: viewer.contributionsCollection.totalRepositoriesWithContributedCommits,
    contributionCalendar: viewer.contributionsCollection.contributionCalendar,
    repositories,
  };
};
