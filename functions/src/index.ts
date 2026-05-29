// Cloud Functions entry point — exports all Gen 2 functions.
// Add new functions here as they are implemented.

export { storeGitHubToken } from './github/storeGitHubToken';
export { fetchGitHubActivity } from './github/fetchActivity';
export { generateInsights } from './insights/generateInsights';
export { deleteAccount } from './auth/deleteAccount';

// Phase 2:
export { scheduledAnalysis } from './scheduler/runBackgroundAnalysis';
