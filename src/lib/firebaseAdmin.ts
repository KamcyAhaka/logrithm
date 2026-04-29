import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  const isEmulator = process.env.NEXT_PUBLIC_USE_EMULATOR === 'true';

  if (isEmulator) {
    // Emulator mode: no credentials needed — the emulator accepts any connection.
    // FIRESTORE_EMULATOR_HOST tells the Admin SDK to talk to the local emulator
    // instead of production Firestore.
    // Use 127.0.0.1 instead of localhost to prevent IPv6 ::1 ECONNREFUSED errors in Node 17+.
    process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';

    admin.initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  } else {
    // Production / CI: use a service account key (env var) or ADC (Cloud Run).
    try {
      const credential = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
        ? admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY))
        : admin.credential.applicationDefault();

      admin.initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        credential,
      });
    } catch (error) {
      console.error('Firebase admin initialization error', error);
    }
  }
}

export const db = admin.firestore();
export { admin };

