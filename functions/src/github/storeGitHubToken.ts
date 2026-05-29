import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

if (getApps().length === 0) initializeApp();

const secretClient = new SecretManagerServiceClient();
const db = getFirestore();

const PROJECT_ID = process.env.GCLOUD_PROJECT ?? 'logrithm-ai';

async function upsertSecret(secretId: string, value: string): Promise<void> {
  const parent = `projects/${PROJECT_ID}`;
  const secretName = `${parent}/secrets/${secretId}`;

  // Try to create the secret — if it already exists, that's fine
  try {
    await secretClient.createSecret({
      parent,
      secretId,
      secret: {
        replication: { automatic: {} },
      },
    });
  } catch (err: unknown) {
    // ALREADY_EXISTS is code 6 — safe to ignore
    const code = (err as { code?: number })?.code;
    if (code !== 6) throw err;
  }

  // Add a new version with the token value
  await secretClient.addSecretVersion({
    parent: secretName,
    payload: {
      data: Buffer.from(value, 'utf8'),
    },
  });

  // Disable all previous versions to keep only latest active
  // (optional but keeps Secret Manager tidy)
  //   const [versions] = await secretClient.listSecretVersions({
  //     parent: secretName,
  //     filter: 'state:ENABLED',
  //   });
  //
  //   const disablePromises = versions
  //     .filter((v) => v.name && !v.name.endsWith('/versions/latest'))
  //     .map((v) =>
  //       secretClient.disableSecretVersion({ name: v.name! }).catch(() => {
  //         // Non-fatal if a version is already disabled
  //       })
  //     );
  //
  //   await Promise.allSettled(disablePromises);
}

export const storeGitHubToken = onCall(
  { region: 'us-central1' },
  async (request): Promise<{ success: boolean }> => {
    const { token } = request.data as { token: string };

    // Must be authenticated
    if (!request.auth?.uid) {
      throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    if (!token || typeof token !== 'string') {
      throw new HttpsError('invalid-argument', 'token is required.');
    }

    const uid = request.auth.uid;
    const secretId = `github-token-${uid}`;

    try {
      await upsertSecret(secretId, token);
    } catch (err) {
      console.error('[storeGitHubToken] Failed to store token in Secret Manager:', err);
      throw new HttpsError('internal', 'Failed to store token securely.');
    }

    // Update tokens/github in Firestore — store ONLY a reference, not the raw token
    // SECURITY: raw token is no longer stored here — only the Secret Manager resource name
    try {
      await db.doc(`users/${uid}/tokens/github`).set(
        {
          secretRef: `projects/${PROJECT_ID}/secrets/${secretId}/versions/latest`,
          updatedAt: FieldValue.serverTimestamp(),
          // accessToken field intentionally removed — never store raw token
        },
        { merge: false }
      ); // merge: false to overwrite and remove old accessToken field
    } catch (err) {
      console.warn('[storeGitHubToken] Could not update Firestore token ref:', err);
      // Non-fatal — Secret Manager is the source of truth
    }

    return { success: true };
  }
);
