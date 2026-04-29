import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { fetchGitHubActivity as fetchLogic } from './github/fetchActivity';
import { generateInsights as insightLogic } from './insights/generateInsights';

admin.initializeApp();

export const fetchGitHubActivity = onCall({
  region: 'us-central1',
  maxInstances: 10,
}, async (request) => {
  const data = request.data || {};

  // Check auth
  if (!request.auth && !data.isDemoMode) {
    throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  let { token } = data;
  
  // If no token in request, try to fetch from Firestore
  if (!token && request.auth && !data.isDemoMode) {
    const tokenDoc = await admin.firestore()
      .collection('users')
      .doc(request.auth.uid)
      .collection('tokens')
      .doc('github')
      .get();
    
    token = tokenDoc.data()?.accessToken;
  }

  if (!token && !data.isDemoMode) {
    throw new HttpsError('invalid-argument', 'GitHub token is missing or not authorized.');
  }

  try {
    return await fetchLogic(token);
  } catch (error: any) {
    console.error('Fetch Activity Error:', error);
    throw new HttpsError('internal', error.message || 'Failed to fetch activity');
  }
});

export const generateInsights = onCall({
  region: 'us-central1',
  maxInstances: 10,
  secrets: ['GEMINI_API_KEY'], // Expose secret to this function
}, async (request) => {
  const data = request.data || {};

  if (!request.auth && !data.isDemoMode) {
    throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const { activity, isDemoMode } = data;
  const uid = request.auth?.uid || 'demo-uid';

  try {
    return await insightLogic(activity, uid, isDemoMode);
  } catch (error: any) {
    console.error('Generate Insights Error:', error);
    throw new HttpsError('internal', error.message || 'Failed to generate insights');
  }
});
