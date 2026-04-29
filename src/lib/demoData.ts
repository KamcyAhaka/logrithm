/**
 * Static fixtures for demo/development. Not real user data.
 */

export const DUMMY_GITHUB_DATA = {
  login: "demo-dev",
  name: "Demo Developer",
  avatarUrl: "https://avatars.githubusercontent.com/u/583231",
  totalCommitContributions: 847,
  totalPullRequestContributions: 134,
  totalIssueContributions: 89,
  totalRepositoriesWithContributedCommits: 12,
  contributionCalendar: {
    totalContributions: 1070,
    weeks: Array.from({ length: 52 }, (_, i) => ({
      contributionDays: Array.from({ length: 7 }, (_, j) => {
        const dayOfWeek = j; // 0 is Sunday
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        let count = 0;
        if (!isWeekend) {
          count = Math.floor(Math.random() * 8) + 2; // Higher Mon-Fri
        } else if (Math.random() > 0.7) {
          count = Math.floor(Math.random() * 4) + 1; // Occasional weekends
        }
        return {
          date: new Date(Date.now() - (52 - i) * 7 * 24 * 60 * 60 * 1000 - (7 - j) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          contributionCount: count,
        };
      }),
    })),
  },
  repositories: [
    {
      name: "path-project-web",
      url: "https://github.com/demo-dev/path-project-web",
      stargazerCount: 128,
      forkCount: 45,
      primaryLanguage: { name: "TypeScript", color: "#3178c6" },
      commitCount: 342,
    },
    {
      name: "flutter-mobile-app",
      url: "https://github.com/demo-dev/flutter-mobile-app",
      stargazerCount: 92,
      forkCount: 18,
      primaryLanguage: { name: "Dart", color: "#00B4AB" },
      commitCount: 256,
    },
    {
      name: "firebase-utils",
      url: "https://github.com/demo-dev/firebase-utils",
      stargazerCount: 45,
      forkCount: 12,
      primaryLanguage: { name: "JavaScript", color: "#f1e05a" },
      commitCount: 89,
    },
    {
      name: "python-backend-api",
      url: "https://github.com/demo-dev/python-backend-api",
      stargazerCount: 67,
      forkCount: 22,
      primaryLanguage: { name: "Python", color: "#3572A5" },
      commitCount: 112,
    },
    {
      name: "styling-system",
      url: "https://github.com/demo-dev/styling-system",
      stargazerCount: 12,
      forkCount: 3,
      primaryLanguage: { name: "CSS", color: "#563d7c" },
      commitCount: 48,
    }
  ],
};

export const DUMMY_INSIGHTS = {
  summary: "Demo Developer is a highly active full-stack engineer with a strong focus on TypeScript and React ecosystems. 847 commits across 12 repos show consistent, sustained contribution habits.",
  strengths: [
    "Consistent daily commit cadence with strong Mon-Thu activity peaks",
    "Broad language versatility across TypeScript, Python, and Dart",
    "High PR merge rate indicating clean, review-ready code submissions"
  ],
  improvements: [
    "Issue response time could improve — open issues go 7+ days without updates",
    "Weekend gaps suggest potential for async deep work sessions",
    "Consider consolidating smaller utility repos to reduce context switching"
  ],
  patterns: "Peak activity Tue-Wed 10am-2pm. Quarterly streaks of 14+ days followed by short recovery periods — a sprint-and-rest pattern.",
  topLanguages: ["TypeScript", "JavaScript", "Dart"],
  activityScore: 82
};
