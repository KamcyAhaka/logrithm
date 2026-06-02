import type { GitHubActivity } from '../types/github';

export interface ScoreBreakdown {
  total: number;
  components: {
    volume: number; // 0-100
    consistency: number; // 0-100
    collaboration: number; // 0-100
    diversity: number; // 0-100
    momentum: number; // 0-100
  };
  weights: {
    volume: number;
    consistency: number;
    collaboration: number;
    diversity: number;
    momentum: number;
  };
}

const WEIGHTS = {
  volume: 0.3,
  consistency: 0.25,
  collaboration: 0.2,
  diversity: 0.15,
  momentum: 0.1,
} as const;

/**
 * Calculates a deterministic activity score from GitHub activity data.
 * Returns a score 1-100 and a breakdown of each component.
 * Uses the exact scoring logic and weights originally implemented in generateInsights.ts.
 */
export function calculateActivityScore(activity: GitHubActivity): ScoreBreakdown {
  // ── Commit Volume (30%) ──
  // commit volume — normalize against an "elite" benchmark of 1000/year
  const volumeScore = Math.min(activity.totalCommitContributions / 1000, 1) * 100;

  // ── Consistency (25%) ──
  // consistency — percentage of weeks meeting a 5-day-a-week contribution target
  // Penalizes spikes followed by long periods of inactivity
  const weeks = activity.contributionCalendar.weeks;
  let totalWeeksScore = 0;
  for (const week of weeks) {
    const activeDaysInWeek = week.contributionDays.filter((d) => d.contributionCount > 0).length;
    // Target is 5 active days per week
    const weekScore = Math.min(activeDaysInWeek / 5, 1);
    totalWeeksScore += weekScore;
  }
  const consistencyScore = weeks.length > 0 ? (totalWeeksScore / weeks.length) * 100 : 0;

  // ── Collaboration (20%) ──
  // collaboration — PR ratio (PRs / commits, ideal ~0.25)
  const prRatio =
    activity.totalPullRequestContributions / Math.max(activity.totalCommitContributions, 1);
  const collaborationScore = Math.min(prRatio / 0.25, 1) * 100;

  // ── Diversity (15%) ──
  // diversity — active repos (normalize against 15 as "elite")
  const diversityScore = Math.min(activity.totalRepositoriesWithContributedCommits / 15, 1) * 100;

  // ── Momentum (10%) ──
  // recent momentum — last 30 days commits vs monthly average
  const monthlyAverage = activity.totalCommitContributions / 12;

  // Calculate actual recent contributions from calendar in the last 30 days
  const allDays = activity.contributionCalendar.weeks.flatMap((w) => w.contributionDays);
  const recentCommits = allDays.slice(-30).reduce((sum, d) => sum + d.contributionCount, 0);

  const momentumScore = Math.min(recentCommits / Math.max(monthlyAverage, 1), 2) * 50;

  // ── Weighted total ──
  const weighted =
    volumeScore * WEIGHTS.volume +
    consistencyScore * WEIGHTS.consistency +
    collaborationScore * WEIGHTS.collaboration +
    diversityScore * WEIGHTS.diversity +
    momentumScore * WEIGHTS.momentum;

  const total = Math.round(Math.min(Math.max(weighted, 1), 100));

  return {
    total,
    components: {
      volume: Math.round(volumeScore),
      consistency: Math.round(consistencyScore),
      collaboration: Math.round(collaborationScore),
      diversity: Math.round(diversityScore),
      momentum: Math.round(momentumScore),
    },
    weights: WEIGHTS,
  };
}
