import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken, getAdminDb } from '@/lib/firebase-admin';
import { issueRefund } from '@/lib/lemonsqueezy';
import { FieldValue } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const decodedToken = await verifyAuthToken(req);
    if (!decodedToken || !decodedToken.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const uid = decodedToken.uid;

    const adminDb = await getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    // 1. Load user profile
    const profileRef = adminDb.doc(`users/${uid}/profile/data`);
    const profileSnap = await profileRef.get();
    if (!profileSnap.exists) {
      return NextResponse.json({ error: 'User profile not found.' }, { status: 400 });
    }

    const profileData = profileSnap.data() || {};
    const githubLogin = profileData.githubLogin;
    if (!githubLogin) {
      return NextResponse.json(
        { error: 'GitHub login not found in user profile.' },
        { status: 400 }
      );
    }

    const plan = profileData.plan;
    if (plan !== 'pro') {
      return NextResponse.json({ error: 'You are not on a Pro plan.' }, { status: 400 });
    }

    // 2. Convert GitHub username to lowercase and check root refunded_users collection
    const githubLoginLowercase = githubLogin.toLowerCase();
    const refundedRef = adminDb.doc(`refunded_users/${githubLoginLowercase}`);
    const paymentsRef = adminDb.collection(`users/${uid}/payments`);

    let orderId: string;
    let amount: number;
    let latestDocId: string;

    try {
      const transactionResult = await adminDb.runTransaction(async (transaction) => {
        const refundedSnap = await transaction.get(refundedRef);
        if (refundedSnap.exists) {
          throw new Error('ALREADY_REFUNDED');
        }

        // 3. Query the user's payments subcollection to find the paid purchase
        const paymentsSnap = await transaction.get(paymentsRef.where('status', '==', 'paid'));
        if (paymentsSnap.empty) {
          throw new Error('NO_PAYMENT');
        }

        // Get the latest paid payment doc
        let latestDoc = paymentsSnap.docs[0];
        for (const doc of paymentsSnap.docs) {
          const getTimestamp = (data: { createdAt?: unknown }) => {
            const createdAt = data.createdAt;
            if (!createdAt) return 0;
            if (
              createdAt &&
              typeof createdAt === 'object' &&
              'toDate' in createdAt &&
              typeof (createdAt as { toDate: unknown }).toDate === 'function'
            ) {
              return (createdAt as { toDate: () => Date }).toDate().getTime();
            }
            const parsed = new Date(createdAt as string | number | Date).getTime();
            return isNaN(parsed) ? 0 : parsed;
          };
          const t1 = getTimestamp(doc.data());
          const t2 = getTimestamp(latestDoc.data());
          if (t1 > t2) {
            latestDoc = doc;
          }
        }
        const paymentData = latestDoc.data();
        const pOrderId = paymentData.orderId;
        const pAmount = paymentData.amount;

        if (!pOrderId || typeof pAmount !== 'number' || !Number.isFinite(pAmount) || pAmount <= 0) {
          throw new Error('INVALID_PAYMENT');
        }

        // 4. Verify 7-day refund window limit
        let createdAtDate: Date;
        if (paymentData.createdAt && typeof paymentData.createdAt.toDate === 'function') {
          createdAtDate = paymentData.createdAt.toDate();
        } else if (paymentData.createdAt) {
          createdAtDate = new Date(paymentData.createdAt);
        } else {
          throw new Error('INVALID_PAYMENT');
        }

        if (isNaN(createdAtDate.getTime())) {
          throw new Error('INVALID_PAYMENT');
        }

        const diffMs = Date.now() - createdAtDate.getTime();
        if (isNaN(diffMs)) {
          throw new Error('INVALID_PAYMENT');
        }
        const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

        if (diffMs > sevenDaysMs) {
          throw new Error('WINDOW_EXPIRED');
        }

        // 5. Reserve the refunded username to prevent duplicate requests (optimistic locking)
        transaction.set(refundedRef, {
          refunded: true,
          refundedAt: FieldValue.serverTimestamp(),
          orderId: pOrderId,
          userId: uid,
        });

        return { orderId: pOrderId, amount: pAmount, latestDocId: latestDoc.id };
      });

      orderId = transactionResult.orderId;
      amount = transactionResult.amount;
      latestDocId = transactionResult.latestDocId;
    } catch (transactionError: unknown) {
      const errorMsg = transactionError instanceof Error ? transactionError.message : '';
      if (errorMsg === 'ALREADY_REFUNDED') {
        return NextResponse.json(
          {
            error:
              'You are not eligible for a refund because a refund was already processed for this GitHub account.',
          },
          { status: 400 }
        );
      }
      if (errorMsg === 'NO_PAYMENT') {
        return NextResponse.json({ error: 'No active Pro payment record found.' }, { status: 400 });
      }
      if (errorMsg === 'INVALID_PAYMENT') {
        return NextResponse.json({ error: 'Invalid payment record details.' }, { status: 400 });
      }
      if (errorMsg === 'WINDOW_EXPIRED') {
        return NextResponse.json(
          { error: 'Refund window has expired (7 days max from purchase).' },
          { status: 400 }
        );
      }
      throw transactionError;
    }

    // 6. Request LemonSqueezy to issue the refund
    try {
      await issueRefund(orderId, amount);
      console.log(
        `[Refund API] Successfully processed refund in LemonSqueezy for Order: ${orderId}`
      );
    } catch (lsError: unknown) {
      // Mark the reservation as failed, do NOT delete it.
      // This prevents the eligibility check from passing on retry.
      try {
        await refundedRef.set(
          {
            status: 'failed',
            failedAt: FieldValue.serverTimestamp(),
            failureReason:
              lsError instanceof Error ? lsError.message : 'Unknown error during refund call',
          },
          { merge: true }
        );
      } catch (dbErr) {
        console.error('[Refund API] Failed to update refundedRef status to failed:', dbErr);
      }
      console.error('[Refund API] LemonSqueezy refund failed:', lsError);
      const msg = lsError instanceof Error ? lsError.message : 'Refund processing failed.';
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    // 7. Update local Firestore state synchronously
    // Even if this fails, the LemonSqueezy refund was successfully executed,
    // so we keep the reservation to prevent duplicate requests and return success: true.
    // The LemonSqueezy webhook retries will eventually sync the local database if it fails here.
    try {
      await profileRef.set(
        {
          plan: 'free',
          isPro: false,
          proDeactivatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      const paymentRef = adminDb.doc(`users/${uid}/payments/${latestDocId}`);
      await paymentRef.set(
        {
          status: 'refunded',
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      console.log(
        `[Refund API] Synchronous plan downgrade and payment refund status updated for Order: ${orderId}`
      );
      return NextResponse.json({ success: true });
    } catch (dbError) {
      console.error(
        '[Refund API] Refund issued in LemonSqueezy, but local Firestore updates failed:',
        dbError
      );
      return NextResponse.json({
        success: true,
        warning: 'Refund processed successfully, but profile update is pending webhook sync.',
      });
    }
  } catch (error: unknown) {
    console.error('[Refund API] Uncaught handler error:', error);
    const msg = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
