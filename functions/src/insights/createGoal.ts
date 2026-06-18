import { HttpsError } from 'firebase-functions/v2/https';
import { onCall, db } from '../lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';

export const createGoal = onCall({ region: 'us-central1' }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const {
    targetScore,
    targetLabel,
    scoreAtCreation,
    dimensionGapsAtCreation,
    weeklyActions,
    timeframeWeeks,
    geminiSummary,
  } = request.data as {
    targetScore: number;
    targetLabel: string;
    scoreAtCreation: number;
    dimensionGapsAtCreation: Array<{
      dimension: string;
      current: string;
      required: string;
      gap: string;
    }>;
    weeklyActions: string[];
    timeframeWeeks: number;
    geminiSummary: string;
  };

  // Runtime Type Validation
  if (
    typeof targetScore !== 'number' ||
    !Number.isFinite(targetScore) ||
    typeof scoreAtCreation !== 'number' ||
    !Number.isFinite(scoreAtCreation)
  ) {
    throw new HttpsError(
      'invalid-argument',
      'targetScore and scoreAtCreation must be finite numbers.'
    );
  }

  if (typeof targetLabel !== 'string' || targetLabel.trim().length === 0) {
    throw new HttpsError('invalid-argument', 'targetLabel must be a non-empty string.');
  }

  if (dimensionGapsAtCreation !== undefined && dimensionGapsAtCreation !== null) {
    if (!Array.isArray(dimensionGapsAtCreation)) {
      throw new HttpsError('invalid-argument', 'dimensionGapsAtCreation must be an array.');
    }
    for (const item of dimensionGapsAtCreation) {
      if (
        typeof item !== 'object' ||
        item === null ||
        typeof item.dimension !== 'string' ||
        typeof item.current !== 'string' ||
        typeof item.required !== 'string' ||
        typeof item.gap !== 'string'
      ) {
        throw new HttpsError(
          'invalid-argument',
          'Each item in dimensionGapsAtCreation must be an object with string properties: dimension, current, required, and gap.'
        );
      }
    }
  }

  // Business Logic Validation
  if (targetScore < 0 || scoreAtCreation < 0) {
    throw new HttpsError('invalid-argument', 'Scores must be non-negative.');
  }

  if (targetScore <= scoreAtCreation) {
    throw new HttpsError('invalid-argument', 'targetScore must be greater than scoreAtCreation.');
  }

  const uid = request.auth.uid;
  const userGoalsRef = db.collection('users').doc(uid).collection('goals');

  try {
    const result = await db.runTransaction(async (transaction) => {
      let hasActiveGoal = false;

      // Read active goal sentinel inside the transaction to obtain a lock
      const activeGoalSentinelRef = db.doc(`users/${uid}/goals_active/lock`);
      const sentinelSnap = await transaction.get(activeGoalSentinelRef);

      if (sentinelSnap.exists) {
        const sentinelData = sentinelSnap.data();
        if (sentinelData?.status === 'active') {
          if (sentinelData?.activeGoalId) {
            const activeGoalRef = userGoalsRef.doc(sentinelData.activeGoalId);
            const activeGoalSnap = await transaction.get(activeGoalRef);
            if (activeGoalSnap.exists && activeGoalSnap.data()?.status === 'active') {
              hasActiveGoal = true;
            }
          } else {
            hasActiveGoal = true;
          }
        }
      } else {
        // Fallback for legacy users where the sentinel doc does not exist yet:
        // Query active goals inside the transaction
        const activeGoalsQuery = userGoalsRef.where('status', '==', 'active').limit(1);
        const activeGoalsSnap = await transaction.get(activeGoalsQuery);
        if (!activeGoalsSnap.empty) {
          hasActiveGoal = true;
        }
      }

      if (hasActiveGoal) {
        throw new HttpsError('failed-precondition', 'You already have an active goal.');
      }

      // Create new goal doc reference
      const newGoalRef = userGoalsRef.doc();

      const newGoalData = {
        userId: uid,
        targetScore,
        targetLabel,
        scoreAtCreation,
        dimensionGapsAtCreation: Array.isArray(dimensionGapsAtCreation)
          ? dimensionGapsAtCreation
          : [],
        weeklyActions: Array.isArray(weeklyActions) ? weeklyActions : [],
        timeframeWeeks:
          typeof timeframeWeeks === 'number' && Number.isFinite(timeframeWeeks)
            ? timeframeWeeks
            : 0,
        geminiSummary: typeof geminiSummary === 'string' ? geminiSummary : '',
        status: 'active',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        achievedAt: null,
        invitedUsers: [],
        pendingInvites: [],
      };

      transaction.set(newGoalRef, newGoalData);
      transaction.set(activeGoalSentinelRef, {
        status: 'active',
        activeGoalId: newGoalRef.id,
        updatedAt: FieldValue.serverTimestamp(),
      });
      return { success: true, goalId: newGoalRef.id };
    });

    return result;
  } catch (err) {
    console.error('[createGoal] Error creating goal:', err);
    if (err instanceof HttpsError) throw err;
    throw new HttpsError('internal', 'Failed to create goal.');
  }
});
