import { NextResponse } from 'next/server';
import { getAdminDb, verifyAuthToken } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const decodedToken = await verifyAuthToken(req);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const uid = decodedToken.uid;
    const adminDb = await getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: 'Firestore admin SDK not initialized' }, { status: 500 });
    }

    // Check if user is a beta tester/user in Firestore
    const profileRef = adminDb.doc(`users/${uid}/profile/data`);
    const profileSnap = await profileRef.get();

    if (!profileSnap.exists) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const profileData = profileSnap.data() || {};
    const isBeta = profileData.isBetaUser === true || profileData.isBetaTester === true;

    if (!isBeta) {
      return NextResponse.json({ error: 'User is not a beta tester' }, { status: 403 });
    }

    // Generate Firebase Custom Token using the Admin SDK
    const { getAuth } = await import('firebase-admin/auth');
    const customToken = await getAuth().createCustomToken(uid);

    return NextResponse.json({ customToken });
  } catch (error: unknown) {
    console.error('[Beta Token API] Error generating beta handoff token:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
