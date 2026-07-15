'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Lock, X } from 'lucide-react';
import { isProUpgradeDisabled } from '@/lib/planGating';

interface LimitModalProps {
  isOpen: boolean;
  error: string | null;
  onClose: () => void;
}

export default function LimitModal({ isOpen, error, onClose }: LimitModalProps) {
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

  return (
    <div
      className="animate-fadeIn fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0a0a0a]/95 p-8 text-center shadow-2xl backdrop-blur-md"
        style={{
          animation: 'scaleUp 0.2s ease-out',
        }}
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

        <h3 className="mb-2 font-mono text-lg font-bold text-white">Daily Limit Reached</h3>

        <p className="mb-6 font-sans text-sm leading-relaxed text-white/70">{error}</p>

        <div className="flex flex-col gap-3">
          {isProUpgradeDisabled() ? (
            <>
              <div className="mx-auto mb-2 inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/5 px-3 py-1.5 font-mono text-[11px] font-semibold text-purple-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-400" />
                Pro Coming Soon
              </div>
              <button
                onClick={onClose}
                className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 font-mono text-sm font-semibold text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                Close
              </button>
            </>
          ) : (
            <>
              <Link
                href="/settings/account"
                onClick={onClose}
                className="btn btn-primary w-full"
                style={{ background: 'var(--green)', border: 'none' }}
              >
                Upgrade to Pro →
              </Link>
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
