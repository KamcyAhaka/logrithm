// TypeScript interfaces for Logrithm.
// Update all consumers if shapes change — see contributor-safety skill.
import type { Timestamp, FieldValue } from 'firebase/firestore';

export type Plan = 'free' | 'pro';

export type ShareCardType = 'about' | 'score' | 'streak' | 'top_repo' | 'pr_stats' | 'wrapped';

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
  location: string | null;
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
  scoreBreakdown?: {
    volume: number;
    consistency: number;
    collaboration: number;
    diversity: number;
    momentum: number;
  };
}

export interface UserProfile {
  githubLogin: string;
  displayName: string;
  avatarUrl: string;
  createdAt: string; // ISO string
  plan: Plan;
  isPublic: boolean; // controls /share/[username] visibility
  agreedToTerms?: boolean;
  agreedAt?: string;
  currentScore?: number;
  lastAnalyzedAt?: string;
  analysisStatus?: string;
  updatedAt?: string;
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

export interface PrivacySettingsDocument {
  analysis: {
    includePrivatePersonal: boolean;
    includeOrgRepos: boolean;
  };
  display: {
    showPrivateRepoNames: boolean;
    showOrgRepoNames: boolean;
    shareCardDataScope: 'public_only' | 'aggregated';
    includeInComparisons: boolean;
    showComparisonOnProfile: boolean;
  };
  profile: {
    showScore: boolean;
    showLanguages: boolean;
    showRepoList: boolean;
    displayStyle: 'full' | 'card';
  };
  updatedAt: Timestamp | FieldValue;
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
  longestStreakStart?: string;
  longestStreakEnd?: string;
}
