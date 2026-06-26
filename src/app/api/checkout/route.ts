import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken, getAdminDb } from '@/lib/firebase-admin';
import { createCheckoutUrl } from '@/lib/lemonsqueezy';
import { FieldValue } from 'firebase-admin/firestore';
import { isProUpgradeDisabled } from '@/lib/planGating';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    if (isProUpgradeDisabled()) {
      return NextResponse.json({ error: 'Pro upgrades are coming soon.' }, { status: 403 });
    }

    const decodedToken = await verifyAuthToken(req);
    if (!decodedToken || !decodedToken.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = decodedToken.uid;
    const userEmail = decodedToken.email;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'An email address is required to initiate checkout.' },
        { status: 400 }
      );
    }

    const adminDb = await getAdminDb();
    if (adminDb) {
      const profileRef = adminDb.doc(`users/${userId}/profile/data`);
      const profileSnap = await profileRef.get();
      if (profileSnap.exists) {
        const profileData = profileSnap.data();
        if (profileData && (profileData.plan === 'pro' || profileData.isPro === true)) {
          return NextResponse.json({ error: 'You are already a Pro subscriber.' }, { status: 409 });
        }
      }
    }

    let origin = req.headers.get('origin') || req.nextUrl.origin;

    // Validate the origin to prevent open redirect vulnerabilities
    const isAllowedOrigin = (url: string) => {
      try {
        const parsed = new URL(url);
        const hostname = parsed.hostname;
        return (
          hostname === 'localhost' ||
          hostname === '127.0.0.1' ||
          hostname === 'logrithm.dev' ||
          hostname.endsWith('.logrithm.dev')
        );
      } catch {
        return false;
      }
    };

    if (!isAllowedOrigin(origin)) {
      console.warn(`[Checkout API] Blocked suspicious origin: ${origin}. Falling back to default.`);
      origin = process.env.NEXT_PUBLIC_APP_URL || 'https://logrithm.dev';
    }

    const { url, checkoutId } = await createCheckoutUrl(userEmail, userId, origin);

    if (adminDb) {
      const reservationRef = adminDb.doc(`users/${userId}/checkout_reservations/${checkoutId}`);
      await reservationRef.set({
        checkoutId,
        userId,
        email: userEmail,
        status: 'initiated',
        createdAt: FieldValue.serverTimestamp(),
      });
    }

    return NextResponse.json({ url });
  } catch (error: unknown) {
    console.error('[Checkout API] Failed to create checkout:', error);
    const message =
      error instanceof Error ? error.message : 'Something went wrong. Please try again.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
