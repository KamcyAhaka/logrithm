'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  GithubAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { storeGitHubToken } from '@/lib/functions';
import { GitBranch, Zap } from 'lucide-react';

export default function LoginClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGitHubLogin = async () => {
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
          plan: 'free', // hardcoded — pro comes in Phase 2
          isPublic: false, // user must opt in
        });
      } else {
        // Only update safely overwritable fields for returning users
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

      // Write to slugs collection for public profile resolution
      const slugRef = doc(db, 'slugs', githubUsername.toLowerCase());
      await setDoc(slugRef, { uid: user.uid }, { merge: true });

      // Store GitHub token securely via Cloud Function → Secret Manager
      // SECURITY: raw token never stored in Firestore
      await user.getIdToken(true);
      await storeGitHubToken(token);

      router.push('/dashboard');
    } catch (err: unknown) {
      console.error('[LoginClient] Auth error:', err);
      const code = (err as { code?: string })?.code;
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setError(null); // user dismissed — not an error
      } else if (code === 'auth/network-request-failed') {
        setError('Network error. Check your connection and try again.');
      } else {
        setError('The log is empty. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    router.push('/dashboard?demo');
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        background: 'var(--bg-page)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Navbar for logged in user */}
      {!authChecking && currentUser && (
        <nav
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            padding: '1.5rem 2rem',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            zIndex: 10,
          }}
        >
          <div
            onClick={() => router.push('/dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer',
              background: 'rgba(255,255,255,0.05)',
              padding: '0.5rem 1rem',
              borderRadius: '2rem',
              border: '1px solid var(--border)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                color: 'var(--text-primary)',
              }}
            >
              Dashboard
            </span>
            {currentUser.photoURL && (
              <Image
                src={currentUser.photoURL}
                alt="Profile"
                width={28}
                height={28}
                style={{ borderRadius: '50%', objectFit: 'cover' }}
              />
            )}
          </div>
        </nav>
      )}

      {/* Ambient glow */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          height: 600,
          background: 'radial-gradient(circle, rgba(29,158,117,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Hero badges */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {['open source', 'free to use'].map((label) => (
          <span key={label} className="pill pill-white">
            ● {label}
          </span>
        ))}
      </div>

      {/* Wordmark */}
      <h1
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(2.5rem, 6vw, 4rem)',
          fontWeight: 500,
          letterSpacing: '-0.04em',
          color: 'var(--text-primary)',
          marginBottom: '0.5rem',
          lineHeight: 1.1,
        }}
      >
        log<span style={{ color: 'var(--green)' }}>r</span>ithm
      </h1>

      {/* Tagline */}
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
          color: 'var(--text-muted)',
          marginBottom: '3rem',
          letterSpacing: '0.01em',
        }}
      >
        Your commit history. <span style={{ color: 'var(--green)' }}>Analyzed.</span>
      </p>

      {/* Terminal preview card */}
      <div
        className="glass-card"
        style={{
          padding: '1.25rem 1.5rem',
          marginBottom: '2.5rem',
          maxWidth: 420,
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.875rem' }}>
          {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
          ))}
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              marginLeft: '0.375rem',
            }}
          >
            logrithm — analysis
          </span>
        </div>
        {[
          { prefix: '$ ', cmd: 'logrithm analyze @demo-dev', color: '#1D9E75' },
          {
            prefix: '  ',
            cmd: 'fetching 12 months of activity...',
            color: 'rgba(255,255,255,0.4)',
          },
          { prefix: '✓ ', cmd: '847 commits across 12 repos', color: 'rgba(255,255,255,0.4)' },
          { prefix: '✓ ', cmd: 'running algorithm...', color: 'rgba(255,255,255,0.4)' },
          null,
          { prefix: '  insight: ', cmd: 'peak velocity Tue–Wed 10am–2pm', color: '#1D9E75' },
          { prefix: '  insight: ', cmd: 'TypeScript dominance — 68% of output', color: '#1D9E75' },
          { prefix: '  insight: ', cmd: 'sprint-and-rest pattern detected', color: '#1D9E75' },
          null,
          {
            prefix: '  ',
            cmd: 'activity score: 82/100',
            color: 'rgba(29,158,117,0.8)',
            bold: true,
          },
        ].map((line, i) =>
          line === null ? (
            <div key={i} style={{ height: '0.5rem' }} />
          ) : (
            <p
              key={i}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: line.color,
                fontWeight: line.bold ? 600 : 400,
                lineHeight: 1.7,
              }}
            >
              <span style={{ opacity: 0.5 }}>{line.prefix}</span>
              {line.cmd}
            </p>
          )
        )}
      </div>

      {/* CTAs */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          width: '100%',
          maxWidth: 320,
          alignItems: 'center',
        }}
      >
        {!authChecking && currentUser ? (
          <button
            id="go-dashboard-btn"
            className="btn btn-primary"
            onClick={() => router.push('/dashboard')}
            style={{ width: '100%', padding: '0.875rem 1.5rem', fontSize: '0.9rem' }}
          >
            <GitBranch size={16} />
            Go to Dashboard →
          </button>
        ) : (
          <button
            id="connect-github-btn"
            className="btn btn-primary"
            onClick={handleGitHubLogin}
            disabled={loading || authChecking}
            style={{ width: '100%', padding: '0.875rem 1.5rem', fontSize: '0.9rem' }}
          >
            <GitBranch size={16} />
            {loading ? 'Running the algorithm...' : 'Connect with GitHub'}
          </button>
        )}

        <button
          id="try-demo-btn"
          className="btn btn-secondary"
          onClick={handleDemo}
          style={{ width: '100%', padding: '0.75rem 1.5rem', fontSize: '0.875rem' }}
        >
          <Zap size={14} />
          Try the Demo →
        </button>
      </div>

      {/* Error message */}
      {error && (
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: 'rgba(255,100,100,0.85)',
            marginTop: '1rem',
            textAlign: 'center',
          }}
        >
          {error}
        </p>
      )}

      {/* Footer */}
      <p
        style={{
          position: 'absolute',
          bottom: '1.5rem',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.68rem',
          color: 'var(--text-muted)',
          textAlign: 'center',
          padding: '0 1rem',
        }}
      >
        AGPL 3.0 License · Open Source ·{' '}
        <a
          href="https://github.com/divine/logrithm"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--green)', textDecoration: 'none' }}
        >
          GitHub ↗
        </a>
      </p>
    </main>
  );
}
