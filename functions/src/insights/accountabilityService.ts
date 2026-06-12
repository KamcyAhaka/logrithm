import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();

export const inviteAccountabilityPartner = onCall({ region: 'us-central1' }, async (request) => {
  const { goalId, username } = request.data as {
    goalId: string;
    username: string;
  };

  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  if (!goalId || !username) {
    throw new HttpsError('invalid-argument', 'goalId and username are required.');
  }

  const callerUid = request.auth.uid;

  try {
    // Find caller's own profile to get their own username
    const callerProfileSnap = await db
      .collection('users')
      .doc(callerUid)
      .collection('profile')
      .doc('data')
      .get();
    const callerProfile = callerProfileSnap.data();
    const callerUsername = callerProfile?.githubLogin;

    if (callerUsername && callerUsername.toLowerCase() === username.toLowerCase()) {
      return {
        success: false,
        error: 'You cannot invite yourself as an accountability partner.',
      };
    }

    // 1. Look up the invited user by their GitHub username in the profile/data subcollection group
    const profileSnap = await db
      .collectionGroup('profile')
      .where('githubLogin', '==', username)
      .limit(1)
      .get();

    if (profileSnap.empty) {
      return {
        success: false,
        error: "This user either hasn't joined Logrithm or is not on a Pro plan",
      };
    }

    const profileDoc = profileSnap.docs[0];
    const profileData = profileDoc.data();

    // 2. Validate that the user is on the Pro plan
    if (profileData.plan !== 'pro') {
      return {
        success: false,
        error: "This user either hasn't joined Logrithm or is not on a Pro plan",
      };
    }

    // 3. Fetch the caller's active goal
    const goalRef = db.doc(`users/${callerUid}/goals/${goalId}`);
    const goalSnap = await goalRef.get();

    if (!goalSnap.exists) {
      throw new HttpsError('not-found', 'Active goal not found.');
    }

    const goalData = goalSnap.data() || {};
    const pendingInvites = (goalData.pendingInvites as string[]) || [];
    const invitedUsers = (goalData.invitedUsers as string[]) || [];
    const partnerUsername = profileData.githubLogin as string;

    if (invitedUsers.includes(partnerUsername)) {
      return {
        success: false,
        error: `${partnerUsername} is already your accountability partner.`,
      };
    }

    // 4. Update the pendingInvites array if the partner isn't already added
    if (!pendingInvites.includes(partnerUsername)) {
      await goalRef.update({
        pendingInvites: [...pendingInvites, partnerUsername],
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    return {
      success: true,
      partner: {
        githubLogin: partnerUsername,
        avatarUrl: profileData.avatarUrl || '',
        currentScore: profileData.currentScore || 0,
        status: 'pending',
      },
    };
  } catch (err) {
    console.error('[inviteAccountabilityPartner] Error inviting partner:', err);
    if (err instanceof HttpsError) {
      throw err;
    }
    throw new HttpsError('internal', 'Failed to invite accountability partner.');
  }
});

export const getAccountabilityPartners = onCall({ region: 'us-central1' }, async (request) => {
  const { invitedUsers } = request.data as {
    invitedUsers: string[];
  };

  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  if (!invitedUsers || !Array.isArray(invitedUsers)) {
    return { partners: [] };
  }

  try {
    // Fetch profile details for all invited usernames in parallel
    const partnerPromises = invitedUsers.map(async (username) => {
      const snap = await db
        .collectionGroup('profile')
        .where('githubLogin', '==', username)
        .limit(1)
        .get();

      if (snap.empty) {
        return null;
      }

      const data = snap.docs[0].data();
      return {
        githubLogin: data.githubLogin as string,
        avatarUrl: (data.avatarUrl as string) || '',
        currentScore: (data.currentScore as number) || 0,
      };
    });

    const results = await Promise.all(partnerPromises);
    const partners = results.filter(Boolean);

    return { partners };
  } catch (err) {
    console.error('[getAccountabilityPartners] Error fetching partners:', err);
    throw new HttpsError('internal', 'Failed to fetch accountability partners.');
  }
});

export const getPendingInvites = onCall({ region: 'us-central1' }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const callerUid = request.auth.uid;

  try {
    // 1. Get caller's githubLogin
    const profileSnap = await db
      .collection('users')
      .doc(callerUid)
      .collection('profile')
      .doc('data')
      .get();

    if (!profileSnap.exists) {
      return { invites: [] };
    }

    const githubLogin = profileSnap.data()?.githubLogin;
    if (!githubLogin) {
      return { invites: [] };
    }

    // 2. Query all goals where pendingInvites contains githubLogin
    const goalsSnap = await db
      .collectionGroup('goals')
      .where('pendingInvites', 'array-contains', githubLogin)
      .get();

    const invitesPromises = goalsSnap.docs.map(async (doc) => {
      const goalData = doc.data();
      const goalId = doc.id;
      const goalOwnerUid = doc.ref.parent.parent?.id;

      if (!goalOwnerUid) return null;

      // Fetch owner's profile details
      const ownerProfileSnap = await db
        .collection('users')
        .doc(goalOwnerUid)
        .collection('profile')
        .doc('data')
        .get();

      const ownerData = ownerProfileSnap.data();

      return {
        goalId,
        goalOwnerUid,
        ownerUsername: ownerData?.githubLogin || 'developer',
        ownerAvatarUrl: ownerData?.avatarUrl || '',
        targetScore: goalData.targetScore || 0,
        targetLabel: goalData.targetLabel || '',
      };
    });

    const invites = (await Promise.all(invitesPromises)).filter(Boolean);
    return { invites };
  } catch (err) {
    console.error('[getPendingInvites] Error fetching pending invites:', err);
    throw new HttpsError('internal', 'Failed to fetch pending invites.');
  }
});

export const respondToAccountabilityInvite = onCall({ region: 'us-central1' }, async (request) => {
  const { goalId, ownerUid, accept } = request.data as {
    goalId: string;
    ownerUid: string;
    accept: boolean;
  };

  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  if (!goalId || !ownerUid) {
    throw new HttpsError('invalid-argument', 'goalId and ownerUid are required.');
  }

  const callerUid = request.auth.uid;

  try {
    // 1. Get caller's githubLogin
    const profileSnap = await db
      .collection('users')
      .doc(callerUid)
      .collection('profile')
      .doc('data')
      .get();

    if (!profileSnap.exists) {
      throw new HttpsError('not-found', 'Caller profile not found.');
    }

    const githubLogin = profileSnap.data()?.githubLogin;
    if (!githubLogin) {
      throw new HttpsError('failed-precondition', 'Caller githubLogin not set.');
    }

    // 2. Fetch the goal
    const goalRef = db.doc(`users/${ownerUid}/goals/${goalId}`);
    const goalSnap = await goalRef.get();

    if (!goalSnap.exists) {
      throw new HttpsError('not-found', 'Goal not found.');
    }

    const goalData = goalSnap.data() || {};
    const pendingInvites = (goalData.pendingInvites as string[]) || [];
    const invitedUsers = (goalData.invitedUsers as string[]) || [];

    if (!pendingInvites.includes(githubLogin)) {
      throw new HttpsError(
        'failed-precondition',
        'You do not have a pending invitation to this goal.'
      );
    }

    // 3. Update pendingInvites and invitedUsers arrays
    const updatedPending = pendingInvites.filter((u) => u !== githubLogin);
    const updatedInvited =
      accept && !invitedUsers.includes(githubLogin)
        ? [...invitedUsers, githubLogin]
        : [...invitedUsers];

    await goalRef.update({
      pendingInvites: updatedPending,
      invitedUsers: updatedInvited,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (err) {
    console.error('[respondToAccountabilityInvite] Error responding to invite:', err);
    if (err instanceof HttpsError) throw err;
    throw new HttpsError('internal', 'Failed to respond to accountability invite.');
  }
});

export const getInvitedGoals = onCall({ region: 'us-central1' }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const callerUid = request.auth.uid;

  try {
    // 1. Get caller's githubLogin
    const profileSnap = await db
      .collection('users')
      .doc(callerUid)
      .collection('profile')
      .doc('data')
      .get();

    if (!profileSnap.exists) {
      return { goals: [] };
    }

    const githubLogin = profileSnap.data()?.githubLogin;
    if (!githubLogin) {
      return { goals: [] };
    }

    // 2. Query all goals where invitedUsers contains githubLogin
    const goalsSnap = await db
      .collectionGroup('goals')
      .where('invitedUsers', 'array-contains', githubLogin)
      .get();

    const goalsPromises = goalsSnap.docs.map(async (doc) => {
      const goalData = doc.data();
      const goalId = doc.id;
      const goalOwnerUid = doc.ref.parent.parent?.id;

      if (!goalOwnerUid) return null;

      // Fetch owner's profile details
      const ownerProfileSnap = await db
        .collection('users')
        .doc(goalOwnerUid)
        .collection('profile')
        .doc('data')
        .get();

      const ownerData = ownerProfileSnap.data();

      // Calculate progress percentage
      const currentScore = ownerData?.currentScore ?? 0;
      const scoreAtCreation = goalData.scoreAtCreation ?? 0;
      const targetScore = goalData.targetScore ?? 0;
      const range = targetScore - scoreAtCreation;
      const progressPercent =
        range > 0
          ? Math.min(100, Math.max(0, Math.round(((currentScore - scoreAtCreation) / range) * 100)))
          : 0;

      return {
        id: goalId,
        userId: goalOwnerUid,
        ownerUsername: ownerData?.githubLogin || 'developer',
        ownerAvatarUrl: ownerData?.avatarUrl || '',
        ownerCurrentScore: currentScore,
        targetScore,
        targetLabel: goalData.targetLabel || '',
        progressPercent,
        status: goalData.status || 'active',
        weeklyActions: goalData.weeklyActions || [],
        geminiSummary: goalData.geminiSummary || '',
        timeframeWeeks: goalData.timeframeWeeks || 0,
      };
    });

    const goals = (await Promise.all(goalsPromises)).filter(Boolean);
    return { goals };
  } catch (err) {
    console.error('[getInvitedGoals] Error fetching invited goals:', err);
    throw new HttpsError('internal', 'Failed to fetch invited goals.');
  }
});
