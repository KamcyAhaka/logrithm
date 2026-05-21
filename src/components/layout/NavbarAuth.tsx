'use client';

import { useAuth } from '@/hooks/useAuth';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Image from 'next/image';
import { LogOut } from 'lucide-react';

export default function NavbarAuth() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '50%' }} />;
  }

  if (!user) return null;

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      window.location.href = '/';
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      {user.photoURL && (
        <Image
          src={user.photoURL}
          alt={user.displayName ?? 'User avatar'}
          width={30}
          height={30}
          style={{ borderRadius: '50%', border: '1px solid var(--border-std)' }}
        />
      )}
      {/* Vertical divider */}
      <div
        style={{
          width: 1,
          height: 16,
          background: 'var(--border-subtle)',
          margin: '0 0.25rem',
        }}
      />
      <button
        onClick={handleSignOut}
        title="Sign out"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          transition: 'color 0.15s',
          padding: '4px',
        }}
        className="hover:text-white"
      >
        <LogOut size={14} />
      </button>
    </div>
  );
}
