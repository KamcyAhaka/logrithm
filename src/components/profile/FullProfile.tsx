'use client';

import Link from 'next/link';

import { ProfileHeader } from './ProfileHeader';
import type {
  UserProfile,
  PrivacySettingsDocument,
  InsightObject,
  SnapshotDocument,
  RepoDocument,
} from '@/types/github';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
} from 'recharts';

interface FullProfileProps {
  profile: UserProfile;
  privacySettings: PrivacySettingsDocument;
  insights: InsightObject;
  snapshot?: SnapshotDocument;
  repos?: RepoDocument[];
}

export function FullProfile({
  profile,
  privacySettings,
  insights,
  snapshot,
  repos,
}: FullProfileProps) {
  const isLanguageTag = (tag: string) =>
    insights.topLanguages.some((l) => l.toLowerCase() === tag.toLowerCase());

  // Prepare data for donut chart
  const pieData = snapshot?.languageTotals
    ? Object.entries(snapshot.languageTotals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, value]) => ({ name, value }))
    : [];

  const COLORS = ['#1D9E75', '#2E8B57', '#3CB371', '#20B2AA', '#48D1CC'];

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] font-sans text-white/80 selection:bg-[#1D9E75]/30">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 p-4 md:flex-row md:p-8 lg:p-12">
        {/* Sidebar */}
        <aside className="shrink-0 md:w-72">
          <div className="sticky top-12 space-y-8 rounded-2xl border border-white/5 bg-[#0f0f0f] p-6 shadow-2xl">
            <ProfileHeader
              login={profile.githubLogin}
              avatarUrl={profile.avatarUrl}
              displayName={profile.displayName}
            />

            {privacySettings.profile.showScore && (
              <div className="text-center">
                <span className="inline-block rounded-full border border-[#1D9E75]/30 bg-[#1D9E75]/10 px-4 py-1 text-sm font-semibold text-[#1D9E75]">
                  Score: {insights.activityScore}
                </span>
              </div>
            )}

            {insights.tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {insights.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`rounded-full border px-2 py-1 font-mono text-[9px] font-medium tracking-widest uppercase ${
                      isLanguageTag(tag)
                        ? 'border-[#1D9E75]/30 bg-[#1D9E75]/10 text-[#1D9E75]'
                        : 'border-white/10 bg-white/5 text-white/50'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 border-y border-white/10 py-6 text-center">
              <div>
                <p className="font-mono text-xl font-semibold text-white">
                  {snapshot?.totalCommits ?? '-'}
                </p>
                <p className="mt-1 text-[10px] tracking-wider text-white/40 uppercase">Commits</p>
              </div>
              <div>
                <p className="font-mono text-xl font-semibold text-white">
                  {snapshot?.totalPRsMerged ?? '-'}
                </p>
                <p className="mt-1 text-[10px] tracking-wider text-white/40 uppercase">
                  PRs Merged
                </p>
              </div>
            </div>

            {privacySettings.profile.showLanguages && pieData.length > 0 && (
              <div className="h-48 w-full">
                <h3 className="mb-2 text-center text-[10px] tracking-wider text-white/40 uppercase">
                  Language Distribution
                </h3>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111',
                        borderColor: 'rgba(255,255,255,0.1)',
                      }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="pt-2 text-center">
              <Link href="/" className="font-mono text-xs text-[#1D9E75] hover:underline">
                logrithm.dev
              </Link>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 space-y-8">
          {/* Summary */}
          <section className="rounded-2xl border border-white/5 bg-[#0f0f0f] p-8">
            <h2 className="mb-4 font-mono text-sm tracking-widest text-[#1D9E75] uppercase">
              AI Analysis
            </h2>
            <p className="text-[15px] leading-relaxed text-white/80">{insights.summary}</p>
          </section>

          {/* Strengths & Explore */}
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="space-y-4">
              <h3 className="font-mono text-xs tracking-widest text-white/40 uppercase">
                Strengths
              </h3>
              {insights.strengths.map((str, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-l-2 border-white/5 border-l-[#1D9E75] bg-white/5 p-4"
                >
                  <p className="text-sm text-white/70">{str}</p>
                </div>
              ))}
            </section>
            <section className="space-y-4">
              <h3 className="font-mono text-xs tracking-widest text-white/40 uppercase">
                Areas to Explore
              </h3>
              {insights.improvements.map((imp, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-l-2 border-white/5 border-l-yellow-500/70 bg-white/5 p-4"
                >
                  <p className="text-sm text-white/70">{imp}</p>
                </div>
              ))}
            </section>
          </div>

          {/* Patterns */}
          <section className="rounded-2xl border border-white/5 bg-[#0f0f0f] p-8">
            <h3 className="mb-4 font-mono text-xs tracking-widest text-white/40 uppercase">
              Identified Patterns
            </h3>
            <blockquote className="border-l-2 border-[#1D9E75]/30 pl-4 text-white/60 italic">
              &quot;{insights.patterns}&quot;
            </blockquote>
          </section>

          {/* Activity Chart */}
          {snapshot?.dailyCommits && snapshot.dailyCommits.length > 0 && (
            <section className="rounded-2xl border border-white/5 bg-[#0f0f0f] p-8">
              <h3 className="mb-6 font-mono text-xs tracking-widest text-white/40 uppercase">
                30-Day Activity
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={snapshot.dailyCommits}>
                    <defs>
                      <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1D9E75" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#1D9E75" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      stroke="rgba(255,255,255,0.1)"
                      tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                      tickFormatter={(val) =>
                        new Date(val).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                      }}
                      itemStyle={{ color: '#1D9E75' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#1D9E75"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorCommits)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          {/* Heatmap Custom implementation */}
          {snapshot?.contributionHeatmap && snapshot.contributionHeatmap.length > 0 && (
            <section className="rounded-2xl border border-white/5 bg-[#0f0f0f] p-8">
              <h3 className="mb-6 font-mono text-xs tracking-widest text-white/40 uppercase">
                Contribution Heatmap
              </h3>
              <div className="grid grid-flow-col grid-rows-7 gap-[2px] overflow-x-auto pb-2">
                {snapshot.contributionHeatmap.map((day, i) => {
                  const bgClass =
                    day.level === 0
                      ? 'bg-white/5'
                      : day.level === 1
                        ? 'bg-[#1D9E75]/30'
                        : day.level === 2
                          ? 'bg-[#1D9E75]/60'
                          : day.level === 3
                            ? 'bg-[#1D9E75]/80'
                            : 'bg-[#1D9E75]';

                  return (
                    <div
                      key={i}
                      className={`h-3 w-3 rounded-sm ${bgClass}`}
                      title={`${day.date}: ${day.count} contributions`}
                    />
                  );
                })}
              </div>
            </section>
          )}

          {/* Repositories */}
          {privacySettings.profile.showRepoList && repos && repos.length > 0 && (
            <section className="rounded-2xl border border-white/5 bg-[#0f0f0f] p-8">
              <h3 className="mb-6 font-mono text-xs tracking-widest text-white/40 uppercase">
                Active Repositories
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {repos.map((repo) => (
                  <a
                    key={repo.repoId}
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col justify-between rounded-xl border border-white/5 bg-white/5 p-4 transition-colors hover:border-[#1D9E75]/30 hover:bg-white/10"
                  >
                    <div>
                      <h4 className="font-semibold text-white transition-colors group-hover:text-[#1D9E75]">
                        {repo.name}
                      </h4>
                      <p className="mt-2 line-clamp-2 text-xs text-white/50">
                        {repo.description || 'No description provided.'}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-xs text-white/40">
                      {repo.primaryLanguage && (
                        <div className="flex items-center gap-1.5">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: repo.primaryLanguage.color || '#1D9E75' }}
                          />
                          {repo.primaryLanguage.name}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <span>★</span> {repo.stargazerCount}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-[10px]">C:</span> {repo.commitCount}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
