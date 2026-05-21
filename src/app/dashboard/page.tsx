import { Suspense } from 'react';
import type { Metadata } from 'next';
import DashboardClient from './DashboardClient';

// Dashboard requires auth at runtime — disable static prerender
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Dashboard — Logrithm',
  description: 'Your GitHub activity analysis powered by Gemini AI.',
};

export default function DashboardPage() {
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
      <DashboardClient />
    </Suspense>
  );
}
