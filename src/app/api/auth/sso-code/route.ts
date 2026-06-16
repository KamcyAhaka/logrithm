import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAdminDb, verifyAuthToken } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

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

    // Generate a secure random 32-character hex code
    const code = crypto.randomBytes(16).toString('hex');

    // Store the code in Firestore with the associated user ID and timestamp
    const ssoCodeRef = adminDb.doc(`sso_codes/${code}`);
    await ssoCodeRef.set({
      uid,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ code });
  } catch (error: unknown) {
    console.error('[SSO Code] Error generating SSO authorization code:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
