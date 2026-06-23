'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  GithubAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { storeGitHubToken } from '@/lib/functions';
import Navbar from '@/components/layout/Navbar';

import HeroSection from './HeroSection';
import HowItWorksSection from './HowItWorksSection';
import FeatureHighlightsSection from './FeatureHighlightsSection';
import PricingSection from './PricingSection';
import FinalCtaSection from './FinalCtaSection';

export default function HomeClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const isLoggingInRef = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthChecking(false);
      // Only redirect to /dashboard for existing sessions — no beta redirect.
      // The beta cross-domain redirect is only triggered on a fresh login
      // (inside handleGitHubLogin) so that visiting localhost:3000 while
      // already signed in works normally without looping to 127.0.0.1.
      if (user && !isLoggingInRef.current) {
        router.replace('/dashboard');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleGitHubLogin = async () => {
    isLoggingInRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const provider = new GithubAuthProvider();
      provider.addScope('read:user');
      provider.addScope('repo');

      const result = await signInWithPopup(auth, provider);
      const credential = GithubAuthProvider.credentialFromResult(result);
      const additionalInfo = getAdditionalUserInfo(result);
      const token = credential?.accessToken;
      const user = result.user;

      if (!token) {
        throw new Error('No GitHub access token returned.');
      }

      const githubUsername =
        additionalInfo?.username ??
        (user.providerData[0]?.uid ?? user.displayName ?? '').replace(/^github:/, '');

      // Write user profile to Firestore
      const profileRef = doc(db, 'users', user.uid, 'profile', 'data');
      const profileSnap = await getDoc(profileRef);

      if (!profileSnap.exists()) {
        await setDoc(profileRef, {
          githubLogin: githubUsername,
          displayName: user.displayName ?? '',
          avatarUrl: user.photoURL ?? '',
          createdAt: new Date().toISOString(),
          plan: 'free',
          isPublic: false,
          onboardingCompleted: false,
          agreedToTerms: true,
          agreedAt: new Date().toISOString(),
        });
      } else {
        await setDoc(
          profileRef,
          {
            githubLogin: githubUsername,
            displayName: user.displayName ?? '',
            avatarUrl: user.photoURL ?? '',
          },
          { merge: true }
        );
      }

      const slugRef = doc(db, 'slugs', githubUsername.toLowerCase());
      await setDoc(slugRef, { uid: user.uid }, { merge: true });

      await user.getIdToken(true);
      await storeGitHubToken(token);

      router.replace('/dashboard');
    } catch (err: unknown) {
      console.error('[HomeClient] Auth error:', err);
      if (auth.currentUser) {
        try {
          await signOut(auth);
        } catch (signOutErr) {
          console.error('[HomeClient] Error signing out after post-auth failure:', signOutErr);
        }
      }
      const code = (err as { code?: string })?.code;
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setError(null);
      } else if (code === 'auth/network-request-failed') {
        setError('Network error. Check your connection and try again.');
      } else {
        setError('The log is empty. Try again.');
      }
    } finally {
      setLoading(false);
      isLoggingInRef.current = false;
    }
  };

  const handleDemo = () => {
    router.push('/dashboard?demo');
  };

  if (authChecking || currentUser) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          background: 'var(--bg-page)',
        }}
      >
        Running the algorithm...
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'var(--bg-page)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        color: 'var(--text-primary)',
        overflowX: 'hidden',
      }}
    >
      <Navbar />

      <HeroSection
        loading={loading}
        error={error}
        agreed={agreed}
        setAgreed={setAgreed}
        handleGitHubLogin={handleGitHubLogin}
        handleDemo={handleDemo}
      />

      <HowItWorksSection />

      <FeatureHighlightsSection />

      <PricingSection />

      <FinalCtaSection
        loading={loading}
        agreed={agreed}
        setAgreed={setAgreed}
        handleGitHubLogin={handleGitHubLogin}
      />
    </div>
  );
}
