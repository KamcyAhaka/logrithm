"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchGitHubActivity = void 0;
const functions = __importStar(require("firebase-functions"));
const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';
const fetchGitHubActivity = async (token) => {
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
    const data = await response.json();
    if (data.errors) {
        throw new functions.https.HttpsError('internal', `GitHub GraphQL error: ${data.errors[0].message}`);
    }
    const viewer = data.data.viewer;
    const repositories = viewer.repositories.nodes.map((repo) => ({
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
exports.fetchGitHubActivity = fetchGitHubActivity;
//# sourceMappingURL=fetchActivity.js.map