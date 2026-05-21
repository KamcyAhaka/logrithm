import type { ReactNode } from 'react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  sub?: string;
}

export default function StatsCard({ label, value, icon, sub }: StatsCardProps) {
  return (
    <div
      className="glass-card"
      style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
    >
      {icon && (
        <div
          style={{
            color: 'var(--green)',
            marginBottom: '0.25rem',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {icon}
        </div>
      )}
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '2rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1.1,
          letterSpacing: '-0.03em',
        }}
      >
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          fontWeight: 400,
        }}
      >
        {label}
      </span>
      {sub && (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            color: 'var(--green)',
            marginTop: '0.25rem',
          }}
        >
          {sub}
        </span>
      )}
    </div>
  );
}
