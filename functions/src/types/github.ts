import { Timestamp } from 'firebase-admin/firestore';

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
  // New fields — additive only
  repoId?: string;
  fullName?: string;
  description?: string | null;
  visibility?: 'public' | 'private_personal' | 'private_org';
  ownerType?: 'user' | 'organization';
  ownerLogin?: string;
  isArchived?: boolean;
  isFork?: boolean;
  isPrivate?: boolean;
  prCount?: number;
  issueCount?: number;
  languages?: Record<string, number>;
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

export interface ScoreEntry {
  score: number;
  computedAt: Timestamp;
  periodLabel: string;
}

export interface SkillEntry {
  name: string;
  tags: string[];
  indicators: string[];
  evidenceRepos: string[];
}

export interface RepoDocument extends Repository {
  repoId: string;
  fullName: string;
  description: string | null;
  visibility: 'public' | 'private_personal' | 'private_org';
  ownerType: 'user' | 'organization';
  ownerLogin: string;
  isArchived: boolean;
  isFork: boolean;
  isPrivate: boolean;
  prCount: number;
  issueCount: number;
  languages: Record<string, number>;
  includedInLastAnalysis: boolean;
  excludedByUser: boolean;
  lastCommitAt: Timestamp | null;
  syncedAt: Timestamp;
}

export interface InsightDocument extends InsightObject {
  insightId: string;
  generatedAt: Timestamp;
  geminiModel: string;
  repoScope: {
    totalReposAnalyzed: number;
    publicReposCount: number;
    privatePersonalCount: number;
    orgReposCount: number;
    excludedCount: number;
  };
  skills: SkillEntry[];
  shareCardImageUrl: string | null;
  shareCardGeneratedAt: Timestamp | null;
  shareCount: number;
  signupsAttributed: number;
}

export interface DailyCommit {
  date: string;
  count: number;
}

export interface HeatmapEntry {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface SnapshotDocument {
  snapshotId: string;
  capturedAt: Timestamp;
  periodStart: Timestamp;
  periodEnd: Timestamp;
  totalCommits: number;
  totalPRsMerged: number;
  totalIssuesOpened: number;
  activeRepoCount: number;
  calendarContributions: number;
  languageTotals: Record<string, number>;
  dailyCommits: DailyCommit[];
  contributionHeatmap: HeatmapEntry[];
  currentStreak: number;
  longestStreak: number;
}

export interface PrivacySettingsDocument {
  analysis: {
    includePrivatePersonal: boolean;
    includeOrgRepos: boolean;
  };
  display: {
    showPrivateRepoNames: boolean;
    showOrgRepoNames: boolean;
    shareCardDataScope: 'public_only' | 'aggregated';
  };
  profile: {
    showScore: boolean;
    showLanguages: boolean;
    showRepoList: boolean;
    displayStyle: 'full' | 'card';
  };
  updatedAt: Timestamp;
}

export interface ShareEventDocument {
  eventId: string;
  userId: string;
  insightId: string;
  cardType: 'about' | 'score' | 'streak' | 'top_repo' | 'pr_stats' | 'wrapped';
  sharedAt: Timestamp;
  referralCode: string;
  convertedSignups: number;
  lastConversionAt: Timestamp | null;
}
