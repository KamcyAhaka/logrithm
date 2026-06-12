'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { signOut } from 'firebase/auth';
import { auth, db, functions } from '@/lib/firebase';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TermsModalProps {
  uid: string;
  onAccept: () => void;
}

export default function TermsModal({ uid, onAccept }: TermsModalProps) {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Deletion state flow
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAccept = async () => {
    if (!agreed) return;
    setIsSubmitting(true);
    try {
      const profileRef = doc(db, 'users', uid, 'profile', 'data');
      await updateDoc(profileRef, {
        agreedToTerms: true,
        agreedAt: new Date().toISOString(),
      });
      onAccept();
    } catch (err) {
      console.error('[TermsModal] Failed to accept terms:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE') return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const deleteAccountFn = httpsCallable(functions, 'deleteAccount');
      await deleteAccountFn();
      await signOut(auth);
      router.push('/');
    } catch (err: unknown) {
      console.error('[TermsModal] Failed to delete account:', err);
      const error = err as Error;
      setDeleteError(error.message || 'An error occurred during account deletion.');
      setIsDeleting(false);
    }
  };

  if (showConfirmDelete) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(10, 10, 10, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}
      >
        <div
          className="glass-card"
          style={{
            maxWidth: '480px',
            width: '100%',
            padding: '2.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            border: '1px solid rgba(239, 68, 68, 0.2)', // reddish border
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShieldAlert className="text-red-500" size={28} />
            <h2
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1.25rem',
                color: '#fff',
                fontWeight: 600,
                margin: 0,
              }}
            >
              Delete Account & Data?
            </h2>
          </div>

          <p
            style={{
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            Declining the terms will permanently delete your Logrithm account and all associated
            data from our database. This action is irreversible.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 500 }}>
              Type <span style={{ color: 'var(--green)', fontWeight: 'bold' }}>DELETE</span> to
              confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-std)',
                borderRadius: '0.5rem',
                padding: '0.625rem 0.875rem',
                color: '#fff',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
            {deleteError && (
              <p
                style={{
                  color: 'rgba(239, 68, 68, 0.85)',
                  fontSize: '0.75rem',
                  margin: '0.25rem 0 0 0',
                }}
              >
                {deleteError}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button
              onClick={() => {
                setShowConfirmDelete(false);
                setConfirmText('');
                setDeleteError(null);
              }}
              variant="outline"
              disabled={isDeleting}
              style={{ flex: 1, border: '1px solid var(--border-std)' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteAccount}
              disabled={confirmText !== 'DELETE' || isDeleting}
              className="bg-red-600 text-white hover:bg-red-700"
              style={{ flex: 1 }}
            >
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirm Delete
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(10, 10, 10, 0.8)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: '520px',
          width: '100%',
          padding: '2.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          <h2
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1.35rem',
              color: '#fff',
              fontWeight: 600,
              marginBottom: '0.5rem',
            }}
          >
            Terms & Conditions Update
          </h2>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            To continue using Logrithm, please review and accept our updated Terms of Service,
            Privacy Policy, and Refund Policy.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            padding: '1rem',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '0.5rem',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <input
            id="terms-modal-checkbox"
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            style={{
              marginTop: '0.2rem',
              cursor: 'pointer',
              accentColor: 'var(--green)',
            }}
          />
          <label
            htmlFor="terms-modal-checkbox"
            style={{
              cursor: 'pointer',
              lineHeight: 1.4,
              fontSize: '0.825rem',
              color: 'var(--text-secondary)',
            }}
          >
            I agree to the{' '}
            <Link
              href="/terms"
              style={{ color: 'var(--green)', textDecoration: 'none' }}
              className="hover:underline"
            >
              Terms of Service
            </Link>
            ,{' '}
            <Link
              href="/privacy"
              style={{ color: 'var(--green)', textDecoration: 'none' }}
              className="hover:underline"
            >
              Privacy Policy
            </Link>
            , and{' '}
            <Link
              href="/refund"
              style={{ color: 'var(--green)', textDecoration: 'none' }}
              className="hover:underline"
            >
              Refund Policy
            </Link>
          </label>
        </div>

        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}
        >
          <Button
            onClick={handleAccept}
            disabled={!agreed || isSubmitting}
            className="w-full bg-[#1D9E75] font-mono text-white hover:bg-[#1D9E75]/90"
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Accept & Continue
          </Button>

          <Button
            onClick={() => setShowConfirmDelete(true)}
            variant="ghost"
            className="w-full font-mono text-xs text-white/40 hover:bg-transparent hover:text-red-400"
          >
            Decline & Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
}
