import 'server-only';

import { lemonSqueezySetup, createCheckout } from '@lemonsqueezy/lemonsqueezy.js';

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

// Initialise the SDK with the API key from environments
lemonSqueezySetup({
  apiKey,
});

/**
 * Creates a LemonSqueezy checkout session for a one-time upgrade to Pro.
 * Returns the checkout URL on success.
 */
export async function createCheckoutUrl(userEmail: string, userId: string): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

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
  if (!url) {
    throw new Error('Failed to retrieve checkout URL from LemonSqueezy');
  }

  return url;
}
