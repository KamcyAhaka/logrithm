'use client';

import { useState } from 'react';
import { GithubAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { storeGitHubToken } from '@/lib/functions';

export function useGitHubReconnect() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const reconnect = async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const provider = new GithubAuthProvider();
      provider.addScope('read:user');
      provider.addScope('repo');
      provider.addScope('read:org');

      const result = await signInWithPopup(auth, provider);
      const credential = GithubAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;

      if (!token) {
        throw new Error('No GitHub access token returned.');
      }

      await storeGitHubToken(token);
      setSuccess(true);
      return true;
    } catch (err: unknown) {
      console.error('[useGitHubReconnect] Reconnect error:', err);
      const code = (err as { code?: string })?.code;
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setError(null);
      } else if (code === 'auth/network-request-failed') {
        setError('Network error. Check your connection and try again.');
      } else {
        setError('Failed to reconnect GitHub account. Try again.');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { reconnect, loading, error, success };
}
