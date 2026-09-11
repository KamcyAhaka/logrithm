import type { InsightObject } from '@/types/github';

interface AboutCardProps {
  insights: InsightObject;
}

export default function AboutCard({ insights }: AboutCardProps) {
  return (
    <>
      <div
        style={{
          color: '#5a6a5a',
          fontFamily: 'var(--font-mono), monospace',
          fontSize: '11px',
          marginBottom: '0.75rem',
        }}
      >
        $ logrithm about --user
      </div>
      <p
        style={{
          fontFamily: 'var(--font-mono), monospace',
          fontSize: '0.875rem',
          color: '#c8d8c8',
          lineHeight: 1.65,
          margin: '1.25rem 0',
        }}
      >
        {insights.summary}
      </p>

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
                fontFamily: 'var(--font-mono), monospace',
                fontSize: '0.65rem',
                fontWeight: 500,
                letterSpacing: '0.08em',
                color: '#5a6a5a',
                background: '#141a14',
                border: '1px solid #1e2a1e',
                borderRadius: '2px',
                padding: '0.25rem 0.6rem',
              }}
            >
              {tag.toUpperCase()}
            </span>
          ))}
        </div>
      )}

      {insights.topLanguages.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '1.5rem' }}>
          {insights.topLanguages.map((lang) => (
            <span
              key={lang}
              style={{
                display: 'inline-block',
                fontFamily: 'var(--font-mono), monospace',
                fontSize: '0.65rem',
                fontWeight: 500,
                letterSpacing: '0.08em',
                color: '#4ade80',
                background: 'rgba(74, 222, 128, 0.12)',
                border: '1px solid rgba(74, 222, 128, 0.25)',
                borderRadius: '2px',
                padding: '0.25rem 0.6rem',
              }}
            >
              {lang.toUpperCase()}
            </span>
          ))}
        </div>
      )}
    </>
  );
}
