'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export function useCheckout(onUnauthenticated?: () => void) {
  const { user } = useAuth();
  const router = useRouter();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleGetPro = async () => {
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      if (!user) {
        if (onUnauthenticated) {
          onUnauthenticated();
        } else {
          router.push('/');
        }
        return;
      }

      const token = await user.getIdToken();
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Checkout API failed');
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Checkout URL is empty');
      }
    } catch (err) {
      console.error('[useCheckout] Checkout error:', err);
      setCheckoutError('Something went wrong. Please try again.');
      setTimeout(() => setCheckoutError(null), 5000);
    } finally {
      setCheckoutLoading(false);
    }
  };

  return {
    checkoutLoading,
    checkoutError,
    handleGetPro,
  };
}
