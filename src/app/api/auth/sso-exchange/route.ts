import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Authorization code is required' }, { status: 400 });
    }

    const adminDb = await getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: 'Firestore admin SDK not initialized' }, { status: 500 });
    }

    const ssoCodeRef = adminDb.doc(`sso_codes/${code}`);
    let uid: string;

    try {
      uid = await adminDb.runTransaction(async (transaction) => {
        const snap = await transaction.get(ssoCodeRef);
        if (!snap.exists) {
          throw new Error('INVALID_CODE');
        }

        const data = snap.data() || {};
        const getTimestamp = (val: unknown) => {
          if (!val) return 0;
          if (
            typeof val === 'object' &&
            val !== null &&
            'toDate' in val &&
            typeof (val as { toDate: unknown }).toDate === 'function'
          ) {
            const toDateFn = (val as { toDate: () => unknown }).toDate;
            const dateObj = toDateFn();
            if (dateObj instanceof Date) {
              return dateObj.getTime();
            }
          }
          const parsed = new Date(val as string | number | Date).getTime();
          return isNaN(parsed) ? 0 : parsed;
        };

        const createdAtMs = getTimestamp(data.createdAt);
        const diffMs = Date.now() - createdAtMs;
        const thirtySecondsMs = 30000;

        // Delete the code in all cases to prevent reuse attempts
        transaction.delete(ssoCodeRef);

        if (diffMs > thirtySecondsMs) {
          throw new Error('CODE_EXPIRED');
        }

        if (!data.uid) {
          throw new Error('INVALID_PAYLOAD');
        }

        return data.uid;
      });
    } catch (transactionError: unknown) {
      const msg = transactionError instanceof Error ? transactionError.message : '';
      if (msg === 'INVALID_CODE') {
        return NextResponse.json(
          { error: 'The authorization code is invalid or has already been used.' },
          { status: 400 }
        );
      }
      if (msg === 'CODE_EXPIRED') {
        return NextResponse.json(
          { error: 'The authorization code has expired (30s limit).' },
          { status: 400 }
        );
      }
      if (msg === 'INVALID_PAYLOAD') {
        return NextResponse.json({ error: 'Invalid authorization code payload.' }, { status: 400 });
      }
      throw transactionError;
    }

    // Generate Firebase Custom Token
    const app = getApp();
    const auth = getAuth(app);
    const customToken = await auth.createCustomToken(uid);

    return NextResponse.json({ customToken });
  } catch (error: unknown) {
    console.error('[SSO Exchange] Error exchanging SSO authorization code:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
