"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSecret = getSecret;
const secret_manager_1 = require("@google-cloud/secret-manager");
const client = new secret_manager_1.SecretManagerServiceClient();
async function getSecret(secretName) {
    try {
        const projectId = process.env.GCP_PROJECT || process.env.FIREBASE_CONFIG ? JSON.parse(process.env.FIREBASE_CONFIG).projectId : null;
        if (!projectId) {
            console.warn('GCP_PROJECT not found in environment');
            return null;
        }
        const [version] = await client.accessSecretVersion({
            name: `projects/${projectId}/secrets/${secretName}/versions/latest`,
        });
        const payload = version.payload?.data?.toString();
        return payload || null;
    }
    catch (error) {
        console.error(`Error fetching secret ${secretName}:`, error);
        return null;
    }
}
//# sourceMappingURL=getSecret.js.map