import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient();

export async function getSecret(secretName: string): Promise<string | null> {
  try {
    const projectId = process.env.GCP_PROJECT || process.env.FIREBASE_CONFIG ? JSON.parse(process.env.FIREBASE_CONFIG!).projectId : null;
    if (!projectId) {
      console.warn('GCP_PROJECT not found in environment');
      return null;
    }

    const [version] = await client.accessSecretVersion({
      name: `projects/${projectId}/secrets/${secretName}/versions/latest`,
    });

    const payload = version.payload?.data?.toString();
    return payload || null;
  } catch (error) {
    console.error(`Error fetching secret ${secretName}:`, error);
    return null;
  }
}
