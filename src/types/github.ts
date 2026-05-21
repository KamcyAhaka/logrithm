// TypeScript interfaces for Logrithm.
// Update all consumers if shapes change — see contributor-safety skill.

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
  summary: string; // 2-3 sentence developer persona
  strengths: string[]; // exactly 3 items, full sentences
  improvements: string[]; // exactly 3 items, full sentences
  patterns: string; // paragraph on timing and consistency
  topLanguages: string[]; // top 3 language names
  activityScore: number; // 1-100
  tags: string[]; // 5-7 tags, max 2 words, lowercase, no punctuation
}

export interface UserProfile {
  githubLogin: string;
  displayName: string;
  avatarUrl: string;
  createdAt: string; // ISO string
  plan: 'free'; // hardcoded — pro comes in Phase 2
  isPublic: boolean; // controls /share/[username] visibility
}

// Phase 2 data model shapes — scaffolded now, written by scheduler later
export interface InsightHistoryEntry {
  data: InsightObject;
  generatedAt: string; // ISO string
}

export interface ActivitySnapshot {
  activity: GitHubActivity;
  capturedAt: string; // ISO string
}
