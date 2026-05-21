// Shared TypeScript interfaces for Cloud Functions.
// Must stay in sync with src/types/github.ts in the Next.js app.

export interface ContributionDay {
  date: string;
  contributionCount: number;
}

export interface ContributionWeek {
  contributionDays: ContributionDay[];
}

export interface ContributionCalendar {
  totalContributions: number;
  weeks: ContributionWeek[];
}

export interface PrimaryLanguage {
  name: string;
  color: string | null;
}

export interface Repository {
  name: string;
  url: string;
  stargazerCount: number;
  forkCount: number;
  primaryLanguage: PrimaryLanguage | null;
  commitCount: number;
}

export interface GitHubActivity {
  login: string;
  name: string | null;
  avatarUrl: string;
  totalCommitContributions: number;
  totalPullRequestContributions: number;
  totalIssueContributions: number;
  totalRepositoriesWithContributedCommits: number;
  contributionCalendar: ContributionCalendar;
  repositories: Repository[];
}

export interface InsightObject {
  summary: string;
  strengths: string[];
  improvements: string[];
  patterns: string;
  topLanguages: string[];
  activityScore: number;
  tags: string[];
}
