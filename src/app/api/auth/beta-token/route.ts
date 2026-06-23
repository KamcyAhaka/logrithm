import { NextResponse } from 'next/server';
import { getAdminDb, verifyAuthToken } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5; // 5 requests per minute

function isRateLimited(uid: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(uid);

  if (!limit) {
    rateLimitMap.set(uid, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (now > limit.resetTime) {
    rateLimitMap.set(uid, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (limit.count >= MAX_REQUESTS) {
    return true;
  }

  limit.count++;
  return false;
}

export async function POST(req: Request) {
  try {
    const decodedToken = await verifyAuthToken(req);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const uid = decodedToken.uid;

    if (isRateLimited(uid)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
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
    const customToken = await getAuth().createCustomToken(uid);

    return NextResponse.json({ customToken });
  } catch (error: unknown) {
    console.error('[Beta Token API] Error generating beta handoff token:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
