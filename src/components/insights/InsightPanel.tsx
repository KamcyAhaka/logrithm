'use client';

import Link from 'next/link';
import { Terminal, Zap, TrendingUp, AlertCircle, Share2 } from 'lucide-react';
import InsightSkeleton from './InsightSkeleton';
import type { InsightObject } from '@/types/github';

interface InsightPanelProps {
  insights: InsightObject | null;
  loading: boolean;
  error: string | null;
  onRun?: () => void;
  login?: string;
}

export default function InsightPanel({
  insights,
  loading,
  error,
  onRun,
  login,
}: InsightPanelProps) {
  return (
    <div
      className="glass-card"
      style={{
        padding: '1.5rem',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
        }}
      >
        <h3
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          AI Insights
        </h3>
        {insights && login && (
          <Link
            href={`/share/${login}`}
            className="btn btn-secondary"
            style={{ padding: '0.3rem 0.875rem', fontSize: '0.72rem', gap: '0.3rem' }}
          >
            <Share2 size={12} />
            Share insight ↗
          </Link>
        )}
      </div>

      {/* ── State: Loading ── */}
      {loading && (
        <div style={{ flex: 1 }}>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--green)',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: 6,
                height: 6,
                background: 'var(--green)',
                borderRadius: '50%',
                animation: 'pulse 1s infinite',
              }}
            />
            Running the algorithm...
          </p>
          <InsightSkeleton />
        </div>
      )}

      {/* ── State: Error ── */}
      {!loading && error && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            textAlign: 'center',
          }}
        >
          <AlertCircle size={32} style={{ color: 'rgba(255,100,100,0.7)' }} />
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              color: 'rgba(255,100,100,0.8)',
            }}
          >
            {error}
          </p>
          <button className="btn btn-secondary" onClick={onRun} style={{ marginTop: '0.5rem' }}>
            Try again
          </button>
        </div>
      )}

      {/* ── State: Empty ── */}
      {!loading && !error && !insights && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(29,158,117,0.1)',
              border: '1px solid rgba(29,158,117,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Terminal size={24} style={{ color: 'var(--green)' }} />
          </div>
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.95rem',
                color: 'var(--text-primary)',
                marginBottom: '0.375rem',
              }}
            >
              Ready for analysis
            </h4>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                maxWidth: 280,
              }}
            >
              Gemini will analyse your activity and surface patterns, strengths, and blind spots.
            </p>
          </div>
          <button className="btn btn-primary" onClick={onRun} id="run-algorithm-btn">
            <Zap size={14} />
            Run the algorithm
          </button>
        </div>
      )}

      {/* ── State: Loaded ── */}
      {!loading && !error && insights && (
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {/* Header row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '0.75rem',
            }}
          >
            <div>
              <h4
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1rem',
                  color: 'var(--text-primary)',
                  marginBottom: '0.2rem',
                }}
              >
                @{login ?? 'developer'}
              </h4>
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                }}
              >
                Generated by Gemini 2.5 Flash
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span className="score-pill">score: {insights.activityScore}</span>
              <button
                className="btn btn-secondary"
                onClick={onRun}
                style={{ padding: '0.3rem 0.875rem', fontSize: '0.72rem', gap: '0.3rem' }}
                title="Update Insight"
              >
                <Zap size={12} />
                Update
              </button>
            </div>
          </div>

          {/* Summary */}
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.65,
            }}
          >
            {insights.summary}
          </p>

          {/* Tags — uppercase pills from InsightObject.tags (not derived from sentences) */}
          {insights.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {insights.tags.map((tag) => (
                <span key={tag} className="pill pill-white">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Top languages */}
          {insights.topLanguages.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {insights.topLanguages.map((lang) => (
                <span key={lang} className="pill pill-green">
                  {lang}
                </span>
              ))}
            </div>
          )}

          {/* Strengths */}
          <div>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
              }}
            >
              <TrendingUp size={11} />
              Strengths
            </p>
            <ul
              style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
            >
              {insights.strengths.map((s, i) => (
                <li
                  key={i}
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    padding: '0.625rem 0.875rem',
                    background: 'rgba(29,158,117,0.06)',
                    border: '1px solid rgba(29,158,117,0.12)',
                    borderRadius: '0.5rem',
                    lineHeight: 1.55,
                  }}
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Improvements */}
          <div>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
              }}
            >
              <AlertCircle size={11} />
              Areas to explore
            </p>
            <ul
              style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
            >
              {insights.improvements.map((s, i) => (
                <li
                  key={i}
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    padding: '0.625rem 0.875rem',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '0.5rem',
                    lineHeight: 1.55,
                  }}
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Patterns */}
          <div>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '0.5rem',
              }}
            >
              Patterns
            </p>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.65,
                fontStyle: 'italic',
                borderLeft: '2px solid rgba(29,158,117,0.4)',
                paddingLeft: '0.875rem',
              }}
            >
              {insights.patterns}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
