'use client';

import { Lock, Loader2 } from 'lucide-react';
import { useCheckout } from '@/hooks/useCheckout';

interface FreeGateProps {
  title?: string;
  message?: string;
}

export default function FreeGate({
  title = 'Goals is a Pro feature',
  message = 'Upgrade to Pro to set goals, track progress, and invite accountability partners',
}: FreeGateProps) {
  const { checkoutLoading, checkoutError, handleGetPro } = useCheckout();

  return (
    <main className="mx-auto flex max-w-7xl flex-col items-center justify-center px-6 py-20">
      <div className="animate-fadeIn flex max-w-md flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-md">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#1D9E75]/20 bg-[#1D9E75]/10 text-[#1D9E75]">
          <Lock className="h-6 w-6" />
        </div>
        <h2 className="mb-2 font-mono text-xl font-bold text-white">{title}</h2>
        <p className="mb-6 text-sm leading-relaxed text-white/40">{message}</p>

        {checkoutError && (
          <p className="mb-3 text-center font-mono text-xs text-red-500">{checkoutError}</p>
        )}

        <button
          onClick={handleGetPro}
          disabled={checkoutLoading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1D9E75] py-2.5 font-mono text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-85"
        >
          {checkoutLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {checkoutLoading ? 'Redirecting to checkout...' : 'Get Pro'}
        </button>
      </div>
    </main>
  );
}
