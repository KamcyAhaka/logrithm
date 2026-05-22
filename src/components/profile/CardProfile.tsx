'use client';

import Link from 'next/link';

import { ProfileHeader } from './ProfileHeader';
import type { UserProfile, PrivacySettingsDocument, InsightObject } from '@/types/github';

interface CardProfileProps {
  profile: UserProfile;
  privacySettings: PrivacySettingsDocument;
  insights: InsightObject;
  totalCommits?: number;
}

export function CardProfile({
  profile,
  privacySettings,
  insights,
  totalCommits,
}: CardProfileProps) {
  // Helper to distinguish language tags from activity tags
  const isLanguageTag = (tag: string) =>
    insights.topLanguages.some((l) => l.toLowerCase() === tag.toLowerCase());

  return (
    <main className="flex min-h-screen flex-col items-center bg-[#0a0a0a] px-4 py-8 font-sans sm:py-16">
      <div className="w-full max-w-[680px] rounded-2xl border border-white/10 bg-[#0f0f0f] p-8 shadow-2xl sm:p-12">
        <ProfileHeader
          login={profile.githubLogin}
          avatarUrl={profile.avatarUrl}
          displayName={profile.displayName}
        />

        {privacySettings.profile.showScore && (
          <div className="mt-12 text-center">
            <h2 className="text-xs font-medium tracking-widest text-white/40 uppercase">
              Activity Score
            </h2>
            <div className="mt-2 flex items-center justify-center">
              <span className="text-6xl font-bold tracking-tight text-[#1D9E75]">
                {insights.activityScore}
              </span>
            </div>
            <p className="mt-2 text-xs text-white/40">Based on 12 months of GitHub activity</p>
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-[15px] leading-relaxed text-white/70">{insights.summary}</p>
        </div>

        {insights.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {insights.tags.map((tag) => (
              <span
                key={tag}
                className={`rounded-full border px-3 py-1 font-mono text-[10px] font-medium tracking-widest uppercase ${
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

        <div className="mt-12 grid grid-cols-3 gap-4 border-y border-white/10 py-8 text-center">
          {totalCommits !== undefined ? (
            <div>
              <p className="font-mono text-xl font-semibold text-white">{totalCommits}</p>
              <p className="mt-1 text-xs text-white/40">Commits</p>
            </div>
          ) : (
            <div>
              <p className="font-mono text-xl font-semibold text-white">{insights.activityScore}</p>
              <p className="mt-1 text-xs text-white/40">Score</p>
            </div>
          )}

          <div>
            <p className="font-mono text-xl font-semibold text-[#1D9E75]">
              {insights.topLanguages[0] || 'N/A'}
            </p>
            <p className="mt-1 text-xs text-white/40">Top Language</p>
          </div>
          <div>
            <p className="font-mono text-xl font-semibold text-white">{insights.tags.length}</p>
            <p className="mt-1 text-xs text-white/40">Skills</p>
          </div>
        </div>

        {privacySettings.profile.showLanguages && insights.topLanguages.length > 0 && (
          <div className="mt-10 text-center">
            <h3 className="mb-4 text-xs font-medium tracking-widest text-white/40 uppercase">
              Languages
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {insights.topLanguages.map((lang) => (
                <div
                  key={lang}
                  className="flex items-center gap-2 rounded-full border border-[#1D9E75]/20 bg-[#1D9E75]/5 px-3 py-1.5"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-[#1D9E75]" />
                  <span className="font-mono text-xs text-white/80">{lang}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 flex items-center justify-between border-t border-white/10 pt-6">
          <Link href="/" className="font-mono text-xs font-medium text-[#1D9E75] hover:underline">
            logrithm.dev
          </Link>
          <Link
            href="/"
            className="group flex items-center gap-2 font-mono text-xs text-white/60 transition-colors hover:text-white"
          >
            Get your analysis
            <span className="text-[#1D9E75] transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
