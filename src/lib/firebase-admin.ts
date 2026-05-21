// Firebase Admin SDK — server-side only.
// Used by Server Components (e.g. /share/[username]).
// Never import this in 'use client' components.
// In demo mode or when credentials are absent, returns null gracefully.

import type { Firestore } from 'firebase-admin/firestore';

let adminDb: Firestore | null = null;

// Lazy init — only runs server-side when actually needed
export async function getAdminDb(): Promise<Firestore | null> {
  // In demo mode, skip entirely — never crash
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return null;
  }

  if (adminDb) return adminDb;

  try {
    const { initializeApp, getApps, cert } = await import('firebase-admin/app');
    const { getFirestore } = await import('firebase-admin/firestore');

    if (getApps().length === 0) {
      // In Cloud Run, Application Default Credentials are used automatically.
      // Locally, set GOOGLE_APPLICATION_CREDENTIALS to a service account key path.
      initializeApp({
        credential: cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'logrithm-ai',
          // ADC — no explicit key file needed in Cloud Run
          // For local dev: export GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json
        } as Parameters<typeof cert>[0]),
      });
    }

    adminDb = getFirestore();
    return adminDb;
  } catch (err) {
    // Graceful degradation: if credentials aren't available, return null.
    // This keeps `bun run dev` working with zero config.
    console.warn('[firebase-admin] Could not initialise admin SDK:', err);
    return null;
  }
}
