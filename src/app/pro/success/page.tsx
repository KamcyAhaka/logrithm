'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { CheckCircle, Loader2, ArrowRight, Target, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';

export default function ProSuccessPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<'checking' | 'success' | 'timeout'>('checking');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/');
      return;
    }

    const docRef = doc(db, 'users', user.uid, 'profile', 'data');
    let isCleanedUp = false;
    let isChecking = false;

    // Helper to check if isPro is set in Firestore
    const checkStatus = async () => {
      try {
        const snap = await getDoc(docRef);
        if (isCleanedUp) return false;
        if (snap.exists()) {
          const data = snap.data();
          if (data.isPro === true || data.plan === 'pro') {
            setStatus('success');
            return true;
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
      return false;
    };

    let interval: NodeJS.Timeout | undefined = undefined;

    checkStatus().then((isPro) => {
      if (isCleanedUp) return;
      if (isPro) return;

      let elapsed = 0;
      interval = setInterval(async () => {
        if (isCleanedUp) {
          if (interval) clearInterval(interval);
          return;
        }
        if (isChecking) return;
        isChecking = true;

        elapsed += 3;
        const success = await checkStatus();
        isChecking = false;

        if (isCleanedUp) {
          if (interval) clearInterval(interval);
          return;
        }

        if (success) {
          if (interval) clearInterval(interval);
        } else if (elapsed >= 30) {
          setStatus('timeout');
          if (interval) clearInterval(interval);
        }
      }, 3000);
    });

    return () => {
      isCleanedUp = true;
      if (interval !== undefined) clearInterval(interval);
    };
  }, [user, authLoading, router]);

  // Loading/checking auth state
  if (authLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#0a0a0a] font-mono text-xs text-white/40">
        <Loader2 className="h-6 w-6 animate-spin text-[#1D9E75]" />
        <span>Running the algorithm...</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a] text-white">
      <Navbar />

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center p-6">
        {status === 'checking' && (
          <div className="animate-fadeIn flex w-full flex-col items-center justify-center rounded-3xl border border-white/5 bg-white/5 p-8 text-center backdrop-blur-md">
            <Loader2 className="mb-6 h-12 w-12 animate-spin text-[#1D9E75]" />
            <h2 className="mb-2 font-mono text-lg font-bold text-white">
              Confirming your upgrade...
            </h2>
            <p className="text-xs leading-relaxed text-white/40">
              We are verifying your transaction with LemonSqueezy. This should take just a moment.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="animate-fadeIn flex w-full flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl shadow-[#1D9E75]/5 backdrop-blur-md">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[#1D9E75]/20 bg-[#1D9E75]/10 text-[#1D9E75]">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h2 className="mb-2 font-mono text-2xl font-bold text-white">You&apos;re now Pro</h2>
            <p className="mb-8 max-w-xs text-sm leading-relaxed text-white/50">
              Welcome to Logrithm Pro. All features are now unlocked.
            </p>
            <div className="w-full space-y-3">
              <Link
                href="/dashboard"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1D9E75] py-2.5 font-mono text-sm font-bold text-white shadow-lg shadow-[#1D9E75]/20 transition-all hover:scale-105 active:scale-95"
              >
                <LayoutDashboard className="h-4 w-4" />
                Go to dashboard
              </Link>
              <Link
                href="/goals"
                className="flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 py-2.5 font-mono text-sm font-semibold text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Target className="h-4 w-4" />
                View your goals
              </Link>
            </div>
          </div>
        )}

        {status === 'timeout' && (
          <div className="animate-fadeIn flex w-full flex-col items-center justify-center rounded-3xl border border-red-500/10 bg-white/5 p-8 text-center backdrop-blur-md">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-yellow-500/20 bg-yellow-500/10 text-yellow-400">
              <Loader2 className="h-8 w-8 animate-pulse" />
            </div>
            <h2 className="mb-2 font-mono text-lg font-bold text-white">Almost there</h2>
            <p className="mb-8 font-mono text-xs leading-relaxed text-white/40">
              Your payment was received. Your Pro access will be activated shortly.
            </p>
            <Link
              href="/dashboard"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1D9E75] py-2.5 font-mono text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
            >
              Go to dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
