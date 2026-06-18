import 'server-only';

import { lemonSqueezySetup, createCheckout, issueOrderRefund } from '@lemonsqueezy/lemonsqueezy.js';

let isInitialized = false;

function initLemonSqueezy() {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY as string;
  const storeId = process.env.LEMONSQUEEZY_STORE_ID as string;
  const variantId = process.env.LEMONSQUEEZY_PRO_VARIANT_ID as string;

  if (!apiKey) {
    throw new Error('LEMONSQUEEZY_API_KEY is not defined in environment variables.');
  }
  if (!storeId) {
    throw new Error('LEMONSQUEEZY_STORE_ID is not defined in environment variables.');
  }
  if (!variantId) {
    throw new Error('LEMONSQUEEZY_PRO_VARIANT_ID is not defined in environment variables.');
  }

  if (!isInitialized) {
    lemonSqueezySetup({
      apiKey,
    });
    isInitialized = true;
  }

  return { storeId, variantId };
}

/**
 * Creates a LemonSqueezy checkout session for a one-time upgrade to Pro.
 * Returns the checkout URL on success.
 */
export async function createCheckoutUrl(
  userEmail: string,
  userId: string,
  origin?: string
): Promise<{ url: string; checkoutId: string }> {
  const { storeId, variantId } = initLemonSqueezy();
  let baseUrl = origin || process.env.NEXT_PUBLIC_APP_URL;

  if (!baseUrl) {
    if (process.env.NODE_ENV !== 'development') {
      throw new Error('NEXT_PUBLIC_APP_URL is required in non-development environments.');
    }
    baseUrl = 'http://localhost:3000';
  }

  // Normalize by removing trailing slashes
  baseUrl = baseUrl.replace(/\/+$/, '');

  const { data, error } = await createCheckout(storeId, variantId, {
    productOptions: {
      redirectUrl: `${baseUrl}/pro/success`,
    },
    checkoutData: {
      email: userEmail,
      custom: {
        // Both userId and user_id are intentionally included to support webhook fallback compatibility,
        // as the webhook handler checks for both naming conventions.
        userId,
        user_id: userId,
      },
    },
  });

  if (error) {
    console.error('[lemonsqueezy] SDK Error:', error);
    throw new Error(error.message);
  }

  const url = data?.data?.attributes?.url;
  const checkoutId = data?.data?.id;

  if (!url || !checkoutId) {
    throw new Error('Failed to retrieve checkout URL from LemonSqueezy');
  }

  return { url, checkoutId: String(checkoutId) };
}

/**
 * Issues a full refund of an order in LemonSqueezy.
 */
export async function issueRefund(orderId: string, amount: number): Promise<void> {
  initLemonSqueezy();
  const { error } = await issueOrderRefund(orderId, amount);
  if (error) {
    console.error('[lemonsqueezy] issueOrderRefund SDK Error:', error);
    throw new Error(error.message);
  }
}
