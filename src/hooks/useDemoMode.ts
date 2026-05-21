'use client';

// Single source of truth for demo mode detection.
// Always use this hook — never check env vars directly in components.
// Wrap consumers in <Suspense> boundary (useSearchParams requirement).

import { useSearchParams } from 'next/navigation';

export function useDemoMode(): boolean {
  const searchParams = useSearchParams();
  return (
    process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
    searchParams.has('demo')
  );
}
