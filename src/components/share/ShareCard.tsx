'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Download, Link2, Check } from 'lucide-react';
import type { InsightObject } from '@/types/github';

interface ShareCardProps {
  login: string;
  avatarUrl: string;
  insights: InsightObject;
  generatedAt: string; // ISO string
}

export default function ShareCard({
  login,
  avatarUrl,
  insights,
  generatedAt,
}: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const generationMonth = new Date(generatedAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const shareUrl =
    typeof window !== 'undefined'
      ? window.location.href
      : `https://logrithm.dev/share/${login}`;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      // Dynamic import — avoids SSR crash
      // html-to-image uses SVG foreignObject which faithfully respects all CSS
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `logrithm-${login}.png`;
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

  return (
    <div>
      {/* ── Captured card div — everything inside becomes the PNG ── */}
      <div
        ref={cardRef}
        style={{
          background: '#0a0a0a',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '1.25rem',
          padding: '2rem',
          maxWidth: 560,
          fontFamily: 'sans-serif',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
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

        {/* Summary */}
        <p
          style={{
            fontFamily: 'sans-serif',
            fontSize: '0.875rem',
            color: 'rgba(255,255,255,0.75)',
            lineHeight: 1.65,
            marginBottom: '1.25rem',
          }}
        >
          {insights.summary}
        </p>

        {/* Tags */}
        {insights.tags.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.375rem',
              marginBottom: '0.875rem',
            }}
          >
            {insights.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  display: 'inline-block',
                  fontFamily: 'monospace',
                  fontSize: '0.65rem',
                  fontWeight: 500,
                  letterSpacing: '0.08em',
                  color: 'rgba(255,255,255,0.5)',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 9999,
                  padding: '0.25rem 0.6rem',
                }}
              >
                {tag.toUpperCase()}
              </span>
            ))}
          </div>
        )}

        {/* Top languages */}
        {insights.topLanguages.length > 0 && (
          <div
            style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '1.5rem' }}
          >
            {insights.topLanguages.map((lang) => (
              <span
                key={lang}
                style={{
                  display: 'inline-block',
                  fontFamily: 'monospace',
                  fontSize: '0.65rem',
                  fontWeight: 500,
                  letterSpacing: '0.08em',
                  color: '#1D9E75',
                  background: 'rgba(29,158,117,0.12)',
                  border: '1px solid rgba(29,158,117,0.25)',
                  borderRadius: 9999,
                  padding: '0.25rem 0.6rem',
                }}
              >
                {lang.toUpperCase()}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            paddingTop: '1rem',
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

      {/* ── Buttons OUTSIDE card div — not captured in PNG ── */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          marginTop: '1.5rem',
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
          {downloading ? 'Generating...' : 'Download PNG'}
        </button>
        <button
          className="btn btn-secondary"
          onClick={handleCopyLink}
          id="copy-link-btn"
        >
          {copied ? <Check size={14} /> : <Link2 size={14} />}
          {copied ? 'Copied!' : 'Copy link'}
        </button>
      </div>
    </div>
  );
}
