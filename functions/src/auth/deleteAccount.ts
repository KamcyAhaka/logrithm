import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { computeAnonymousId } from '../lib/leaderboardService';

const secretClient = new SecretManagerServiceClient();
const PROJECT_ID = process.env.GCLOUD_PROJECT ?? 'logrithm-ai';

export const deleteAccount = onCall(
  { region: 'us-central1' },
  async (request): Promise<{ success: boolean }> => {
    // 1. Validate request is authenticated
    if (!request.auth?.uid) {
      throw new HttpsError('unauthenticated', 'Must be signed in to delete an account.');
    }

    const uid = request.auth.uid;
    const db = getFirestore();
    const auth = getAuth();

    try {
      // 2. Retrieve the user's githubLogin to delete the slug
      const profileSnap = await db.doc(`users/${uid}/profile/data`).get();
      const githubLogin = profileSnap.data()?.githubLogin as string | undefined;

      // 3. Delete the user's GitHub token from Secret Manager
      const secretName = `projects/${PROJECT_ID}/secrets/github-token-${uid}`;
      try {
        await secretClient.deleteSecret({ name: secretName });
      } catch (err: unknown) {
        // Code 5 is NOT_FOUND, which is fine (maybe they never connected GitHub)
        const error = err as { code?: number };
        if (error.code !== 5) {
          // We don't throw here to ensure the rest of the account still gets deleted
        }
      }

      // 4. Delete the corresponding vanity slug document in the `slugs` collection
      if (githubLogin) {
        try {
          await db.doc(`slugs/${githubLogin.toLowerCase()}`).delete();
        } catch (err) {
          console.error(`[deleteAccount] Failed to delete slug for ${githubLogin}:`, err);
        }
      }

      // 4b. Delete the user's anonymous leaderboard entry
      try {
        const anonymousId = await computeAnonymousId(uid);
        await db.doc(`leaderboard/${anonymousId}`).delete();
      } catch (err) {
        console.error(`[deleteAccount] Failed to delete leaderboard entry for ${uid}:`, err);
      }

      // 5. Delete all Firestore data for the user recursively
      try {
        await db.recursiveDelete(db.doc(`users/${uid}`));
      } catch (err) {
        console.error(
          `[deleteAccount] Failed to recursively delete Firestore data for ${uid}:`,
          err
        );
        throw new HttpsError('internal', 'Failed to delete user data from database.');
      }

      // 6. Delete the Firebase Auth user record
      try {
        await auth.deleteUser(uid);
      } catch (err) {
        console.error(`[deleteAccount] Failed to delete Auth record for ${uid}:`, err);
        throw new HttpsError('internal', 'Failed to delete authentication record.');
      }

      return { success: true };
    } catch (error) {
      console.error(`[deleteAccount] Fatal error deleting account for ${uid}:`, error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', 'An unexpected error occurred during account deletion.');
    }
  }
);
