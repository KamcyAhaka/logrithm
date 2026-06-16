import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-signature');

    if (!signature) {
      console.warn('[Webhook] Missing x-signature header');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    if (!secret) {
      console.error('[Webhook] LEMONSQUEEZY_WEBHOOK_SECRET is not configured');
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(rawBody).digest('hex');

    const sigBuffer = Buffer.from(signature, 'utf8');
    const digestBuffer = Buffer.from(digest, 'utf8');

    // Secure timing-safe signature verification to prevent timing attacks
    if (
      sigBuffer.length !== digestBuffer.length ||
      !crypto.timingSafeEqual(sigBuffer, digestBuffer)
    ) {
      console.warn('[Webhook] Signature verification failed');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const eventName = body.meta?.event_name;

    // Handle order_created and order_refunded events
    if (eventName !== 'order_created' && eventName !== 'order_refunded') {
      console.log(`[Webhook] Ignoring event: ${eventName}`);
      return NextResponse.json({ message: `Ignored event: ${eventName}` }, { status: 200 });
    }

    const status = body.data?.attributes?.status;
    if (eventName === 'order_created' && status !== 'paid') {
      console.log(`[Webhook] Order status is ${status}, not paid. Skipping.`);
      return NextResponse.json({ message: 'Skipping unpaid order' }, { status: 200 });
    }

    const customData = body.meta?.custom_data;
    const userId = customData?.userId || customData?.user_id;

    if (!userId) {
      console.error(`[Webhook] Missing userId or user_id in custom_data for event ${eventName}`);
      return NextResponse.json({ error: 'Missing userId metadata' }, { status: 400 });
    }

    const orderId = body.data?.id;
    const customerId = body.data?.attributes?.customer_id;
    const attributes = body.data?.attributes || {};

    if (!orderId) {
      console.error(`[Webhook] Missing orderId in payload for event ${eventName}`);
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    if (!customerId) {
      console.error(`[Webhook] Missing customerId in payload for event ${eventName}`);
      return NextResponse.json({ error: 'Missing customerId' }, { status: 400 });
    }

    try {
      const adminDb = await getAdminDb();
      if (!adminDb) {
        throw new Error('Firestore admin SDK is not initialised');
      }

      const profileRef = adminDb.doc(`users/${userId}/profile/data`);
      const paymentRef = adminDb.doc(`users/${userId}/payments/${orderId}`);

      if (eventName === 'order_created') {
        // Upgrade to Pro in user profile
        await profileRef.set(
          {
            plan: 'pro',
            isPro: true,
            proActivatedAt: FieldValue.serverTimestamp(),
            lemonSqueezyOrderId: orderId,
            lemonSqueezyCustomerId: customerId,
          },
          { merge: true }
        );

        // Record payment data
        await paymentRef.set(
          {
            orderId: String(orderId),
            customerId: String(customerId),
            email: attributes.user_email || '',
            userName: attributes.user_name || '',
            amount: attributes.total || 0,
            currency: attributes.currency || 'USD',
            status: 'paid',
            receiptUrl: attributes.urls?.receipt || '',
            testMode: !!attributes.test_mode,
            createdAt: new Date(attributes.created_at || Date.now()),
            createdAtServer: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

        console.log(`[Webhook] User ${userId} upgraded to Pro. Order ${orderId}`);
      } else if (eventName === 'order_refunded') {
        // Downgrade to Free plan in user profile
        await profileRef.set(
          {
            plan: 'free',
            isPro: false,
            proDeactivatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

        // Record payment update as refunded
        await paymentRef.set(
          {
            orderId: String(orderId),
            customerId: String(customerId),
            email: attributes.user_email || '',
            userName: attributes.user_name || '',
            amount: attributes.total || 0,
            currency: attributes.currency || 'USD',
            status: 'refunded',
            receiptUrl: attributes.urls?.receipt || '',
            testMode: !!attributes.test_mode,
            createdAt: new Date(attributes.created_at || Date.now()),
            createdAtServer: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

        console.log(`[Webhook] User ${userId} refunded/downgraded. Order ${orderId}`);
      }

      return NextResponse.json({ success: true }, { status: 200 });
    } catch (firestoreError) {
      console.error('[Webhook] Failed to update Firestore:', firestoreError);
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
    }
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
