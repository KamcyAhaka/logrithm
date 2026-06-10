'use client';

import { useState, useEffect } from 'react';

const TERMINAL_LINES = [
  { prefix: '$ ', cmd: 'logrithm analyze @demo-dev', color: '#4ade80' },
  { prefix: '  ', cmd: 'fetching 12 months of activity...', color: 'rgba(255,255,255,0.4)' },
  { prefix: '✓ ', cmd: '847 commits across 12 repos', color: 'rgba(255,255,255,0.4)' },
  { prefix: '✓ ', cmd: 'running algorithm...', color: 'rgba(255,255,255,0.4)' },
  { prefix: '', cmd: '', color: 'transparent' },
  { prefix: '  insight: ', cmd: 'peak velocity Tue–Wed 10am–2pm', color: '#4ade80' },
  { prefix: '  insight: ', cmd: 'TypeScript dominance — 68% of output', color: '#4ade80' },
  { prefix: '  insight: ', cmd: 'sprint-and-rest pattern detected', color: '#4ade80' },
  { prefix: '', cmd: '', color: 'transparent' },
  { prefix: '  ', cmd: 'activity score: 82/100', color: '#4ade80', bold: true },
];

export default function AnimatedTerminal() {
  const [visibleLines, setVisibleLines] = useState<typeof TERMINAL_LINES>([]);
  const [currentLineIdx, setCurrentLineIdx] = useState(0);
  const [typedCmd, setTypedCmd] = useState('');

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    if (currentLineIdx === 0) {
      const cmdText = TERMINAL_LINES[0].cmd;
      if (typedCmd.length < cmdText.length) {
        timeout = setTimeout(
          () => {
            setTypedCmd((prev) => prev + cmdText[typedCmd.length]);
          },
          40 + Math.random() * 40
        );
      } else {
        timeout = setTimeout(() => {
          setVisibleLines([{ ...TERMINAL_LINES[0], cmd: cmdText }]);
          setCurrentLineIdx(1);
        }, 600);
      }
    } else if (currentLineIdx < TERMINAL_LINES.length) {
      timeout = setTimeout(
        () => {
          const line = TERMINAL_LINES[currentLineIdx];
          setVisibleLines((prev) => [...prev, line]);
          setCurrentLineIdx((prev) => prev + 1);
        },
        currentLineIdx === 4 || currentLineIdx === 8
          ? 200
          : currentLineIdx >= 5 && currentLineIdx <= 7
            ? 800
            : 500
      );
    } else {
      timeout = setTimeout(() => {
        setVisibleLines([]);
        setCurrentLineIdx(0);
        setTypedCmd('');
      }, 10000);
    }
    return () => clearTimeout(timeout);
  }, [currentLineIdx, typedCmd]);

  return (
    <div
      className="glass-card"
      style={{
        padding: '1.5rem',
        borderRadius: '1.5rem',
        boxShadow:
          '0 20px 50px -12px rgba(29, 158, 117, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        maxWidth: '460px',
        width: '100%',
        margin: '0 auto',
        textAlign: 'left',
        background: 'rgba(17, 17, 17, 0.75)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      {/* Title bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          paddingBottom: '0.75rem',
        }}
      >
        {['#FF5F57', '#FEBC2E', '#28C840'].map((color) => (
          <div
            key={color}
            style={{ width: 10, height: 10, borderRadius: '50%', background: color }}
          />
        ))}
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            marginLeft: '0.5rem',
            letterSpacing: '0.05em',
          }}
        >
          logrithm — live_analysis.sh
        </span>
      </div>

      {/* Terminal logs */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '230px',
          fontFamily: 'var(--font-mono)',
        }}
      >
        {currentLineIdx === 0 && (
          <p style={{ fontSize: '0.75rem', color: '#4ade80', lineHeight: 1.7 }}>
            <span style={{ opacity: 0.5 }}>$ </span>
            {typedCmd}
            <span className="ml-[2px] inline-block h-[12px] w-[1.5px] animate-pulse bg-[#4ade80] align-middle" />
          </p>
        )}

        {visibleLines.map((line, i) =>
          line.cmd === '' ? (
            <div key={i} style={{ height: '0.5rem' }} />
          ) : (
            <p
              key={i}
              style={{
                fontSize: '0.75rem',
                color: line.color,
                fontWeight: line.bold ? 600 : 400,
                lineHeight: 1.7,
              }}
            >
              <span style={{ opacity: 0.5 }}>{line.prefix}</span>
              {line.cmd}
              {i === 0 && currentLineIdx === 1 && (
                <span className="ml-[2px] inline-block h-[12px] w-[1.5px] animate-pulse bg-[#4ade80] align-middle" />
              )}
            </p>
          )
        )}
      </div>
    </div>
  );
}
