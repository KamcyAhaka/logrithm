'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

export default function BetaHandoffPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Initializing secure beta session...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const rawRedirectTo = params.get('redirectTo') || '/dashboard';

    // Validate redirectTo path to prevent open redirect vulnerabilities
    let redirectTo = '/dashboard';
    try {
      const trimmed = rawRedirectTo.trim();
      // Must start with '/' and not be protocol-relative ('//' or '/\')
      if (
        trimmed.startsWith('/') &&
        !trimmed.startsWith('//') &&
        !trimmed.startsWith('/\\') &&
        !trimmed.startsWith('/ ')
      ) {
        const parsed = new URL(trimmed, 'http://localhost');
        if (parsed.hostname === 'localhost' && parsed.protocol === 'http:') {
          redirectTo = trimmed;
        }
      }
    } catch {
      redirectTo = '/dashboard';
    }

    console.log(
      '[Beta Handoff] useEffect mounted. Token exists:',
      !!token,
      'RedirectTo:',
      redirectTo
    );

    async function processHandoff() {
      if (!token) {
        console.warn('[Beta Handoff] No authentication token provided in URL.');
        setError('Missing beta handoff token.');
        return;
      }

      try {
        console.log('[Beta Handoff] Starting handoff authentication...');
        setStatus('Authenticating secure session...');

        // Authenticate with custom token
        await signInWithCustomToken(auth, token);
        console.log('[Beta Handoff] Successfully authenticated on beta platform!');

        setStatus('Redirecting...');

        // Clean URL to strip query parameters from history so the token is not leaked
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);

        console.log('[Beta Handoff] Navigating to:', redirectTo);
        router.replace(redirectTo);
      } catch (err: unknown) {
        console.error('[Beta Handoff] Handoff sign-in failed:', err);
        const message =
          err instanceof Error
            ? err.message
            : 'Beta handoff failed. Please try signing in manually.';
        setError(message);
      }
    }

    processHandoff();
  }, [router]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-6 text-center text-white">
        <div className="max-w-md space-y-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
          <h2 className="font-mono text-lg font-bold text-red-500">Beta Auth Failed</h2>
          <p className="text-sm text-white/60">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="rounded-full bg-[#1D9E75] px-5 py-2 font-mono text-xs font-bold text-white transition-all hover:scale-105 active:scale-95"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] text-white">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#1D9E75]" />
        <p className="font-mono text-xs text-white/50">{status}</p>
      </div>
    </div>
  );
}
