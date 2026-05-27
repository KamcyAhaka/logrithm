import { Timestamp } from 'firebase-admin/firestore';
import type { GitHubActivity, SnapshotDocument, HeatmapEntry } from '../types/github';

export function buildSnapshot(
  activity: GitHubActivity
): Omit<SnapshotDocument, 'snapshotId' | 'capturedAt'> {
  const languageTotals: Record<string, number> = {};

  for (const repo of activity.repositories) {
    if (repo.primaryLanguage && repo.primaryLanguage.name) {
      const lang = repo.primaryLanguage.name;
      languageTotals[lang] = (languageTotals[lang] || 0) + repo.commitCount;
    }
  }

  const dailyCommits = activity.contributionCalendar.weeks.flatMap((week) =>
    week.contributionDays.map((day) => ({
      date: day.date,
      count: day.contributionCount,
    }))
  );

  const contributionHeatmap: HeatmapEntry[] = dailyCommits.map((day) => {
    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (day.count > 0 && day.count < 3) level = 1;
    else if (day.count >= 3 && day.count < 6) level = 2;
    else if (day.count >= 6 && day.count < 10) level = 3;
    else if (day.count >= 10) level = 4;

    return {
      date: day.date,
      count: day.count,
      level,
    };
  });

  let longestStreak = 0;
  let currentStreak = 0;
  let currentStreakStart = '';
  let longestStreakStart = '';
  let longestStreakEnd = '';

  for (let i = 0; i < dailyCommits.length; i++) {
    if (dailyCommits[i].count > 0) {
      if (currentStreak === 0) {
        currentStreakStart = dailyCommits[i].date;
      }
      currentStreak++;
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
        longestStreakStart = currentStreakStart;
        longestStreakEnd = dailyCommits[i].date;
      }
    } else {
      // If today (the last day) has 0 commits, the streak isn't broken yet
      // because the user still has time to commit today.
      if (i !== dailyCommits.length - 1) {
        currentStreak = 0;
        currentStreakStart = '';
      }
    }
  }

  const now = new Date();
  const periodEnd = Timestamp.fromDate(now);

  // 12 months rolling window
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const periodStart = Timestamp.fromDate(oneYearAgo);

  return {
    periodStart,
    periodEnd,
    totalCommits: activity.totalCommitContributions,
    totalPRsMerged: activity.totalPullRequestContributions,
    totalIssuesOpened: activity.totalIssueContributions,
    activeRepoCount: activity.totalRepositoriesWithContributedCommits,
    calendarContributions: activity.contributionCalendar.totalContributions,
    languageTotals,
    dailyCommits,
    contributionHeatmap,
    currentStreak,
    longestStreak,
    longestStreakStart: longestStreak > 0 ? longestStreakStart : undefined,
    longestStreakEnd: longestStreak > 0 ? longestStreakEnd : undefined,
  };
}
