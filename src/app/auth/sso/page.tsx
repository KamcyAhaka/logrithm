'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

export default function SSOPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Initializing secure session sync...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Read parameters directly from window.location on the client
    // This avoids Next.js useSearchParams() hydration/suspense delays
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
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

    // console.log('[SSO Page] useEffect mounted. Code:', code, 'RedirectTo:', redirectTo);

    async function ssoSignIn() {
      if (!code) {
        console.warn('[SSO Page] No authentication code provided in URL.');
        setError('Missing SSO authentication code.');
        return;
      }

      try {
        console.log('[SSO Page] Starting custom token exchange...');
        setStatus('Synchronizing secure session...');

        // Exchange authorization code for Custom Token
        const response = await fetch('/api/auth/sso-exchange', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        const data = await response.json();
        console.log('[SSO Page] Received exchange response:', response.status, data);

        if (!response.ok) {
          throw new Error(data.error || 'Authentication code exchange failed.');
        }

        const customToken = data.customToken;
        if (!customToken) {
          throw new Error('Received invalid empty session token.');
        }

        setStatus('Authenticating session...');
        console.log('[SSO Page] Signing in with Custom Token...');
        await signInWithCustomToken(auth, customToken);
        console.log('[SSO Page] Successfully signed in!');

        setStatus('Session synchronized. Redirecting...');

        // Clean URL to strip query parameters from history
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);

        console.log('[SSO Page] Navigating to target page:', redirectTo);
        router.replace(redirectTo);
      } catch (err: unknown) {
        console.error('[SSO Page] SSO error:', err);
        const message =
          err instanceof Error
            ? err.message
            : 'Single sign-on failed. Please try signing in manually.';
        setError(message);
      }
    }

    ssoSignIn();
  }, [router]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-6 text-center text-white">
        <div className="max-w-md space-y-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
          <h2 className="font-mono text-lg font-bold text-red-500">SSO Authentication Failed</h2>
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
