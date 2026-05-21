// Static fixtures for demo/development. Not real data.
// Used when NEXT_PUBLIC_DEMO_MODE=true or ?demo query param is present.
// Update DUMMY_INSIGHTS if InsightObject shape changes — see contributor-safety skill.

import type { GitHubActivity, InsightObject } from '@/types/github';

// ---------------------------------------------------------------------------
// Realistic 52-week contribution calendar for @demo-dev
// Higher Mon–Thu, some weekends, 2-3 streak periods, 1-2 vacation gaps
// ---------------------------------------------------------------------------
function buildDemoCalendar(): GitHubActivity['contributionCalendar'] {
  const weeks: GitHubActivity['contributionCalendar']['weeks'] = [];
  const baseDate = new Date('2024-04-28'); // start 52 weeks ago (Sunday)
  baseDate.setDate(baseDate.getDate() - 52 * 7);

  // Streak periods (week indices): 8-21 (14-week sprint), 33-44 (12-week sprint)
  const highStreakWeeks = new Set([
    8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42,
    43, 44,
  ]);
  // Vacation quiet periods (week indices): 25-27, 49-50
  const quietWeeks = new Set([25, 26, 27, 49, 50]);

  let totalContributions = 0;

  for (let w = 0; w < 52; w++) {
    const contributionDays = [];
    const isStreak = highStreakWeeks.has(w);
    const isQuiet = quietWeeks.has(w);

    for (let d = 0; d < 7; d++) {
      const currentDate = new Date(baseDate);
      currentDate.setDate(baseDate.getDate() + w * 7 + d);
      const dateStr = currentDate.toISOString().split('T')[0];

      // Day of week: 0=Sun, 1=Mon, ... 6=Sat
      const dayOfWeek = (d + 0) % 7; // d=0 is Sunday in this calendar
      const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 4; // Mon-Thu peak
      const isFriday = dayOfWeek === 5;
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      let count = 0;
      if (!isQuiet) {
        if (isStreak) {
          if (isWeekday)
            count = Math.floor(Math.random() * 8) + 4; // 4-11
          else if (isFriday)
            count = Math.floor(Math.random() * 5) + 2; // 2-6
          else count = Math.random() > 0.55 ? Math.floor(Math.random() * 3) + 1 : 0; // occasional weekend
        } else {
          if (isWeekday)
            count = Math.floor(Math.random() * 6) + 2; // 2-7
          else if (isFriday)
            count = Math.floor(Math.random() * 4) + 1; // 1-4
          else count = Math.random() > 0.7 ? Math.floor(Math.random() * 2) + 1 : 0; // rare weekend
        }
      } else {
        // Vacation: very sparse
        if (!isWeekend) count = Math.random() > 0.85 ? 1 : 0;
      }

      totalContributions += count;
      contributionDays.push({ date: dateStr, contributionCount: count });
    }

    weeks.push({ contributionDays });
  }

  return { totalContributions, weeks };
}

export const DUMMY_GITHUB_DATA: GitHubActivity = {
  login: 'demo-dev',
  name: 'Demo Developer',
  avatarUrl: 'https://avatars.githubusercontent.com/u/583231', // octocat
  totalCommitContributions: 847,
  totalPullRequestContributions: 134,
  totalIssueContributions: 89,
  totalRepositoriesWithContributedCommits: 12,
  contributionCalendar: buildDemoCalendar(),
  repositories: [
    {
      name: 'path-project-web',
      url: 'https://github.com/demo-dev/path-project-web',
      stargazerCount: 48,
      forkCount: 12,
      primaryLanguage: { name: 'TypeScript', color: '#3178c6' },
      commitCount: 284,
    },
    {
      name: 'flutter-mobile-app',
      url: 'https://github.com/demo-dev/flutter-mobile-app',
      stargazerCount: 31,
      forkCount: 7,
      primaryLanguage: { name: 'Dart', color: '#00B4AB' },
      commitCount: 156,
    },
    {
      name: 'firebase-utils',
      url: 'https://github.com/demo-dev/firebase-utils',
      stargazerCount: 89,
      forkCount: 23,
      primaryLanguage: { name: 'TypeScript', color: '#3178c6' },
      commitCount: 112,
    },
    {
      name: 'data-pipeline-scripts',
      url: 'https://github.com/demo-dev/data-pipeline-scripts',
      stargazerCount: 14,
      forkCount: 4,
      primaryLanguage: { name: 'Python', color: '#3572A5' },
      commitCount: 98,
    },
    {
      name: 'react-component-lib',
      url: 'https://github.com/demo-dev/react-component-lib',
      stargazerCount: 67,
      forkCount: 19,
      primaryLanguage: { name: 'JavaScript', color: '#f1e05a' },
      commitCount: 87,
    },
    {
      name: 'design-system',
      url: 'https://github.com/demo-dev/design-system',
      stargazerCount: 22,
      forkCount: 6,
      primaryLanguage: { name: 'CSS', color: '#563d7c' },
      commitCount: 54,
    },
    {
      name: 'api-gateway-service',
      url: 'https://github.com/demo-dev/api-gateway-service',
      stargazerCount: 11,
      forkCount: 3,
      primaryLanguage: { name: 'TypeScript', color: '#3178c6' },
      commitCount: 43,
    },
    {
      name: 'analytics-dashboard',
      url: 'https://github.com/demo-dev/analytics-dashboard',
      stargazerCount: 38,
      forkCount: 9,
      primaryLanguage: { name: 'JavaScript', color: '#f1e05a' },
      commitCount: 13,
    },
  ],
};

export const DUMMY_INSIGHTS: InsightObject = {
  summary:
    'Demo Developer is a highly active full-stack engineer with a strong focus on TypeScript and React ecosystems. 847 commits across 12 repos show consistent, sustained contribution habits — with clear sprint-and-rest cycles that suggest deliberate energy management rather than burnout-driven output.',
  strengths: [
    'Consistent daily commit cadence with strong Mon–Thu activity peaks, indicating disciplined deep work scheduling.',
    'Broad language versatility across TypeScript, Python, and Dart, enabling contribution across web, backend, and mobile stacks.',
    'High PR merge rate indicating clean, review-ready code submissions with low revision overhead.',
  ],
  improvements: [
    'Issue response time could improve — open issues trend toward 7+ days without updates, which may slow collaborator momentum.',
    'Weekend contribution gaps suggest potential for async deep-work sessions if schedule permits.',
    'Consider consolidating smaller utility repos to reduce context-switching overhead across 12 active repositories.',
  ],
  patterns:
    'Peak activity falls on Tuesday–Wednesday between 10am and 2pm. Quarterly streaks of 14+ days followed by short recovery periods reveal a sprint-and-rest pattern — likely aligned with project milestones rather than calendar weeks.',
  topLanguages: ['TypeScript', 'JavaScript', 'Dart'],
  activityScore: 82,
  tags: [
    'typescript',
    'high output',
    'multi-repo',
    'pr focused',
    'full-stack',
    'sprint cycles',
    'cross-platform',
  ],
};
