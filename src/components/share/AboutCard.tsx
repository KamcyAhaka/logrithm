import type { InsightObject } from '@/types/github';

interface AboutCardProps {
  insights: InsightObject;
}

export default function AboutCard({ insights }: AboutCardProps) {
  return (
    <>
      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.875rem',
          color: 'rgba(255,255,255,0.75)',
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
                fontFamily: "'JetBrains Mono', monospace",
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

      {insights.topLanguages.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '1.5rem' }}>
          {insights.topLanguages.map((lang) => (
            <span
              key={lang}
              style={{
                display: 'inline-block',
                fontFamily: "'JetBrains Mono', monospace",
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
    </>
  );
}
