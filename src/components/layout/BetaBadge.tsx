'use client';

import { useEffect, useState } from 'react';

export default function BetaBadge() {
  const [isBeta, setIsBeta] = useState(false);

  useEffect(() => {
    const hostname = window.location.hostname;
    const isBetaHost = hostname === 'beta.logrithm.dev' || hostname === '127.0.0.1';
    if (isBetaHost) {
      const frame = requestAnimationFrame(() => setIsBeta(true));
      return () => cancelAnimationFrame(frame);
    }
  }, []);

  if (!isBeta) return null;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'rgba(29, 158, 117, 0.15)',
        border: '1px solid rgba(29, 158, 117, 0.3)',
        color: '#1D9E75',
        fontSize: '0.65rem',
        fontWeight: 'bold',
        fontFamily: 'var(--font-mono)',
        padding: '0.125rem 0.375rem',
        borderRadius: '9999px',
        marginLeft: '0.5rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        userSelect: 'none',
      }}
    >
      Beta
    </span>
  );
}
