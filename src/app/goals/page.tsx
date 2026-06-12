import { Suspense } from 'react';
import type { Metadata } from 'next';
import GoalsClient from './GoalsClient';

// Goals requires auth at runtime — disable static prerender
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Goals — Logrithm',
  description: 'Set developer activity goals, track progress, and invite accountability partners.',
};

export default function GoalsPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
          }}
        >
          Running the algorithm...
        </div>
      }
    >
      <GoalsClient />
    </Suspense>
  );
}
