'use client';

import { useRef, useState } from 'react';
import { Download, Link2, Check, User, Flame, Award, BarChart3, Gift } from 'lucide-react';
import type { InsightObject, ShareCardType } from '@/types/github';

// Subcomponents for each variant
import AboutCard from './AboutCard';
import ScoreCard from './ScoreCard';
import StreakCard from './StreakCard';
import WrappedCard from './WrappedCard';
import PrStatsCard from './PrStatsCard';

export interface ShareCardSnapshot {
  snapshotId: string;
  totalCommits: number;
  totalPRsMerged: number;
  totalIssuesOpened: number;
  activeRepoCount: number;
  languageTotals: Record<string, number>;
  currentStreak: number;
  longestStreak: number;
  longestStreakStart?: string;
  longestStreakEnd?: string;
}

interface ShareCardProps {
  login: string;
  avatarUrl: string;
  insights: InsightObject;
  snapshot?: ShareCardSnapshot;
  generatedAt: string; // ISO string
}

export default function ShareCard({
  login,
  avatarUrl,
  insights,
  snapshot,
  generatedAt,
}: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [activeVariant, setActiveVariant] = useState<ShareCardType>('about');

  const generationMonth = new Date(generatedAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const shareUrl =
    typeof window !== 'undefined' ? window.location.href : `https://logrithm.dev/share/${login}`;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        skipFonts: true,
        backgroundColor: '#0a0a0a',
        style: {
          transform: 'scale(1)',
          margin: '0',
        },
      });
      const link = document.createElement('a');
      link.download = `logrithm-${login}-${activeVariant}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('[ShareCard] html-to-image error:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('[ShareCard] Clipboard error:', err);
    }
  };

  // Safe default calculations for missing snapshot data
  const currentStreak = snapshot?.currentStreak ?? 0;
  const longestStreak = snapshot?.longestStreak ?? 0;
  const totalCommits = snapshot?.totalCommits ?? 0;
  const totalPRs = snapshot?.totalPRsMerged ?? 0;
  const totalIssues = snapshot?.totalIssuesOpened ?? 0;
  const activeRepos = snapshot?.activeRepoCount ?? 0;

  const renderCardContent = () => {
    switch (activeVariant) {
      case 'score':
        return <ScoreCard activityScore={insights.activityScore} />;

      case 'streak':
        return (
          <StreakCard
            currentStreak={currentStreak}
            longestStreak={longestStreak}
            longestStreakStart={snapshot?.longestStreakStart}
            longestStreakEnd={snapshot?.longestStreakEnd}
            patterns={insights.patterns}
          />
        );

      case 'wrapped':
        return (
          <WrappedCard
            totalCommits={totalCommits}
            activeRepos={activeRepos}
            languageTotals={snapshot?.languageTotals || {}}
          />
        );

      case 'pr_stats':
        return <PrStatsCard totalPRs={totalPRs} totalIssues={totalIssues} />;

      default:
      case 'about':
        return <AboutCard insights={insights} />;
    }
  };

  const menuItems: { id: ShareCardType; label: string; icon: React.ReactNode }[] = [
    { id: 'about', label: 'Persona', icon: <User size={12} /> },
    { id: 'score', label: 'Score', icon: <Award size={12} /> },
    { id: 'streak', label: 'Streak', icon: <Flame size={12} /> },
    { id: 'wrapped', label: 'Wrapped', icon: <Gift size={12} /> },
    { id: 'pr_stats', label: 'PR Stats', icon: <BarChart3 size={12} /> },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        alignItems: 'center',
        width: '100%',
      }}
    >
      {/* ── Selection Pills ── */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '9999px',
          padding: '0.25rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {menuItems.map((item) => {
          const isActive = activeVariant === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveVariant(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                fontWeight: 500,
                color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.4)',
                background: isActive ? '#1D9E75' : 'transparent',
                border: 'none',
                borderRadius: '9999px',
                padding: '0.35rem 0.75rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </div>

      {/* ── Captured card wrapper for consistent PNGs across devices ── */}
      <div
        style={{
          width: '100%',
          overflowX: 'auto',
          display: 'flex',
          justifyContent: 'center',
          paddingBottom: '1rem',
        }}
      >
        <div
          ref={cardRef}
          style={{
            background: '#0a0a0a',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '2rem',
            width: 480,
            minWidth: 480,
            fontFamily: 'sans-serif',
            overflow: 'hidden',
            boxSizing: 'border-box',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginBottom: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt={`@${login}`}
                width={44}
                height={44}
                style={{ borderRadius: '50%', border: '2px solid rgba(29,158,117,0.4)' }}
                crossOrigin="anonymous"
              />
              <div>
                <p
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: '#fff',
                    margin: 0,
                  }}
                >
                  @{login}
                </p>
                <p
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '0.72rem',
                    color: 'rgba(255,255,255,0.4)',
                    margin: 0,
                  }}
                >
                  Logrithm analysis
                </p>
              </div>
            </div>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#1D9E75',
                background: 'rgba(29,158,117,0.12)',
                border: '1px solid rgba(29,158,117,0.25)',
                borderRadius: 9999,
                display: 'inline-block',
                padding: '0.25rem 0.75rem',
              }}
            >
              score: {insights.activityScore}
            </span>
          </div>

          {/* Dynamic Card Variant Content */}
          {renderCardContent()}

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              paddingTop: '1rem',
              marginTop: 'auto',
            }}
          >
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '0.72rem',
                color: '#1D9E75',
                fontWeight: 500,
              }}
            >
              logrithm.dev
            </span>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '0.68rem',
                color: 'rgba(255,255,255,0.3)',
              }}
            >
              {generationMonth}
            </span>
          </div>
        </div>
      </div>

      {/* ── Action Buttons ── */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          marginTop: '0.5rem',
          flexWrap: 'wrap',
        }}
      >
        <button
          className="btn btn-primary"
          onClick={handleDownload}
          disabled={downloading}
          id="download-png-btn"
        >
          <Download size={14} />
          {downloading
            ? 'Generating...'
            : `Download ${menuItems.find((m) => m.id === activeVariant)?.label} PNG`}
        </button>
        <button className="btn btn-secondary" onClick={handleCopyLink} id="copy-link-btn">
          {copied ? <Check size={14} /> : <Link2 size={14} />}
          {copied ? 'Copied!' : 'Copy link'}
        </button>
      </div>
    </div>
  );
}
