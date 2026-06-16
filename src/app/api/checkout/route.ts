import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/firebase-admin';
import { createCheckoutUrl } from '@/lib/lemonsqueezy';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
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

    const checkoutUrl = await createCheckoutUrl(userEmail, userId);
    return NextResponse.json({ url: checkoutUrl });
  } catch (error: unknown) {
    console.error('[Checkout API] Failed to create checkout:', error);
    const message =
      error instanceof Error ? error.message : 'Something went wrong. Please try again.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
