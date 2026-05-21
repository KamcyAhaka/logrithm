import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient();

/**
 * Fetch a secret value from GCP Secret Manager.
 * Returns null if the secret doesn't exist or access fails.
 * Used by generateInsights to retrieve GEMINI_API_KEY in production.
 */
export async function getSecret(secretName: string): Promise<string | null> {
  try {
    const projectId = process.env.GCLOUD_PROJECT || 'logrithm-ai';
    const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;

    const [version] = await client.accessSecretVersion({ name });
    const payload = version.payload?.data;

    if (!payload) {
      console.warn(`[getSecret] Empty payload for secret: ${secretName}`);
      return null;
    }

    return typeof payload === 'string'
      ? payload
      : Buffer.from(payload).toString('utf8');
  } catch (err) {
    console.warn(`[getSecret] Could not access secret "${secretName}":`, err);
    return null;
  }
}
