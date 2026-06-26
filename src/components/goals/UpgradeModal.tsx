'use client';

import { useEffect } from 'react';
import { Lock, Loader2, X } from 'lucide-react';
import { isProUpgradeDisabled } from '@/lib/planGating';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkoutLoading: boolean;
  checkoutError: string | null;
  onGetPro: () => void;
}

export default function UpgradeModal({
  isOpen,
  onClose,
  checkoutLoading,
  checkoutError,
  onGetPro,
}: UpgradeModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const disabled = isProUpgradeDisabled();

  return (
    <div className="animate-fadeIn fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div
        className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0a0a0a]/90 p-8 text-center shadow-2xl backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-modal-title"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/45 transition-colors hover:text-white"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-purple-500/20 bg-purple-500/10 text-purple-400">
          <Lock className="h-6 w-6" />
        </div>
        <h2 id="upgrade-modal-title" className="mb-2 font-mono text-xl font-bold text-white">
          {disabled ? 'Pro Upgrade' : 'Upgrade to Pro'}
        </h2>
        {disabled && (
          <div className="mx-auto mb-4 inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/15 px-3 py-1 font-mono text-xs font-semibold text-purple-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-400" />
            Coming Soon
          </div>
        )}
        <p className="mb-6 text-sm leading-relaxed text-white/60">
          {disabled
            ? 'Unlock unlimited goals, invite accountability partners, and get premium trajectory estimates. Pro features are currently in active development.'
            : 'Unlock unlimited goals, invite accountability partners, and get premium trajectory estimates.'}
        </p>

        {checkoutError && (
          <p className="mb-3 text-center font-mono text-xs text-red-500">{checkoutError}</p>
        )}

        <div className="space-y-3">
          {disabled ? (
            <button
              onClick={onClose}
              className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 font-mono text-sm font-semibold text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              Close
            </button>
          ) : (
            <>
              <button
                onClick={onGetPro}
                disabled={checkoutLoading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1D9E75] py-2.5 font-mono text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-85"
              >
                {checkoutLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {checkoutLoading ? 'Redirecting to checkout...' : 'Get Pro'}
              </button>
              <button
                onClick={onClose}
                className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 font-mono text-sm font-semibold text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
