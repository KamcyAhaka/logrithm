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

  if (
    dimensionGapsAtCreation !== undefined &&
    dimensionGapsAtCreation !== null &&
    !Array.isArray(dimensionGapsAtCreation)
  ) {
    throw new HttpsError('invalid-argument', 'dimensionGapsAtCreation must be an array.');
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
      // Query active goals inside the transaction
      const activeGoalsQuery = userGoalsRef.where('status', '==', 'active').limit(1);
      const activeGoalsSnap = await transaction.get(activeGoalsQuery);

      if (!activeGoalsSnap.empty) {
        throw new HttpsError('failed-precondition', 'You already have an active goal.');
      }

      // Create new goal doc reference
      const newGoalRef = userGoalsRef.doc();

      const newGoalData = {
        userId: uid,
        targetScore,
        targetLabel,
        scoreAtCreation,
        dimensionGapsAtCreation: dimensionGapsAtCreation || [],
        weeklyActions: weeklyActions || [],
        timeframeWeeks: timeframeWeeks || 0,
        geminiSummary: geminiSummary || '',
        status: 'active',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        achievedAt: null,
        invitedUsers: [],
        pendingInvites: [],
      };

      transaction.set(newGoalRef, newGoalData);
      return { success: true, goalId: newGoalRef.id };
    });

    return result;
  } catch (err) {
    console.error('[createGoal] Error creating goal:', err);
    if (err instanceof HttpsError) throw err;
    throw new HttpsError('internal', 'Failed to create goal.');
  }
});
