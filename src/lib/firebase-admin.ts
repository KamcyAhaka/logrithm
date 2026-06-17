// Firebase Admin SDK — server-side only.
// Used by Server Components (e.g. /share/[username]).
// Never import this in 'use client' components.
// In demo mode or when credentials are absent, returns null gracefully.

import type { Firestore } from 'firebase-admin/firestore';

let adminDb: Firestore | null = null;
let initPromise: Promise<Firestore | null> | null = null;

// Lazy init — only runs server-side when actually needed
export async function getAdminDb(): Promise<Firestore | null> {
  // In demo mode, skip entirely — never crash
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return null;
  }

  if (adminDb) return adminDb;

  if (!initPromise) {
    initPromise = (async () => {
      try {
        const { getApps, getApp } = await import('firebase-admin/app');
        const { getFirestore } = await import('firebase-admin/firestore');

        if (getApps().length === 0) {
          const { initializeApp } = await import('firebase-admin/app');

          if (process.env.NEXT_PUBLIC_USE_EMULATOR === 'true') {
            // Configure admin SDK to connect to local Firestore and Auth emulators
            process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
            process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
            initializeApp({
              projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'logrithm-ai',
            });
          } else {
            const fs = await import('fs');
            const path = await import('path');
            const keyPath = path.join(process.cwd(), 'firebase-key.json');

            // Automatically fallback to local key file if available
            if (fs.existsSync(keyPath)) {
              const { cert } = await import('firebase-admin/app');
              initializeApp({
                credential: cert(keyPath),
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'logrithm-ai',
              });
            } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
              const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
              const absoluteCredPath = path.isAbsolute(credPath)
                ? credPath
                : path.resolve(process.cwd(), credPath);

              if (fs.existsSync(absoluteCredPath)) {
                const { cert } = await import('firebase-admin/app');
                initializeApp({
                  credential: cert(absoluteCredPath),
                  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'logrithm-ai',
                });
              } else {
                const { applicationDefault } = await import('firebase-admin/app');
                initializeApp({
                  credential: applicationDefault(),
                  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'logrithm-ai',
                });
              }
            } else {
              const { applicationDefault } = await import('firebase-admin/app');
              initializeApp({
                credential: applicationDefault(),
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'logrithm-ai',
              });
            }
          }
        }

        const app = getApp();
        adminDb = getFirestore(
          app,
          process.env.NODE_ENV === 'development' ? 'dev-db' : '(default)'
        );
        return adminDb;
      } catch (err) {
        // Graceful degradation: if credentials aren't available, return null.
        // This keeps `bun run dev` working with zero config.
        console.warn('[firebase-admin] Could not initialise admin SDK:', err);
        return null;
      }
    })();
  }

  return initPromise;
}

/**
 * Verifies the Firebase ID token passed in the Authorization header.
 * Returns the decoded token if valid, otherwise null.
 */
export async function verifyAuthToken(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split('Bearer ')[1];
  try {
    await getAdminDb(); // Ensure admin SDK is initialised
    const { getAuth } = await import('firebase-admin/auth');
    const decodedToken = await getAuth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('[firebase-admin] Error verifying auth token:', error);
    return null;
  }
}
