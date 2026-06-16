'use client';

import Image from 'next/image';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useCheckout } from '@/hooks/useCheckout';
import { auth, db, functions } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { signOut } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function AccountSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [githubLogin, setGithubLogin] = useState<string | null>(null);
  const [plan, setPlan] = useState<'free' | 'pro'>('free');

  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { checkoutLoading, checkoutError, handleGetPro } = useCheckout();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const profileRef = doc(db, `users/${user.uid}/profile/data`);
        const snap = await getDoc(profileRef);
        if (snap.exists()) {
          const data = snap.data();
          setGithubLogin(data.githubLogin || null);
          setPlan(data.plan || 'free');
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const handleDeleteAccount = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (confirmText !== 'DELETE') return;

    setIsDeleting(true);
    setDeleteError(null);
    try {
      const deleteAccountFn = httpsCallable(functions, 'deleteAccount');
      await deleteAccountFn();
      await signOut(auth);
      router.push('/');
    } catch (err: unknown) {
      console.error('Failed to delete account:', err);
      const error = err as Error;
      setDeleteError(error.message || 'An error occurred during account deletion.');
      setIsDeleting(false);
    }
  };

  // handleGetPro is managed via the useCheckout hook

  if (authLoading || loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div>
          <Skeleton className="mb-2 h-8 w-64 bg-white/5" />
          <Skeleton className="h-4 w-96 bg-white/5" />
        </div>
        <Separator className="bg-white/10" />
        <Skeleton className="h-24 w-full bg-white/5" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="mb-2 font-sans text-2xl font-bold text-white">Account</h1>
        <p className="text-sm text-white/40">Manage your Logrithm account.</p>
      </div>

      {/* Plan Section */}
      <section>
        <h2 className="mb-4 text-lg font-medium text-white">Plan</h2>

        <div className="mb-3 flex items-center gap-4">
          {plan === 'free' ? (
            <Badge variant="outline" className="border-white/20 font-mono text-white/70">
              Free
            </Badge>
          ) : (
            <Badge className="bg-[#1D9E75] font-mono text-white hover:bg-[#1D9E75]/90">Pro</Badge>
          )}
        </div>

        {plan === 'free' ? (
          <div className="space-y-4">
            <p className="text-sm text-white/40">
              Upgrade to Pro to set unlimited goals, track progress, invite partners, and rank your
              activity.
            </p>
            {checkoutError && <p className="font-mono text-xs text-red-500">{checkoutError}</p>}
            <Button
              className="bg-[#1D9E75] font-mono text-white transition-all hover:scale-105 hover:bg-[#1D9E75]/90 active:scale-95"
              onClick={handleGetPro}
              disabled={checkoutLoading}
            >
              {checkoutLoading && <Loader2 className="mr-2 inline-block h-4 w-4 animate-spin" />}
              {checkoutLoading ? 'Redirecting to checkout...' : 'Get Pro'}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-white/40">
            You are currently on the Pro plan. All premium features are active.
          </p>
        )}

        <Separator className="mt-8 mb-8 bg-white/10" />
      </section>

      {/* Connected Account Section */}
      <section>
        <h2 className="mb-4 text-lg font-medium text-white">Connected Account</h2>

        <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
          {user?.photoURL ? (
            <Image
              src={user.photoURL}
              alt="Avatar"
              width={48}
              height={48}
              className="h-12 w-12 rounded-full border border-white/10"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-white/10" />
          )}
          <div>
            <div className="font-medium text-white">{user?.displayName || 'GitHub User'}</div>
            <div className="text-sm text-white/60">@{githubLogin || 'unknown'}</div>
          </div>
        </div>
        <p className="mt-3 text-sm text-white/40">Connected via GitHub OAuth</p>

        <Separator className="mt-8 mb-8 bg-white/10" />
      </section>

      {/* Danger Zone Section */}
      <section>
        <div className="rounded-xl border border-red-900/50 bg-red-950/10 p-6">
          <h2 className="mb-1 text-lg font-medium text-red-500">Danger Zone</h2>
          <p className="mb-6 text-sm text-white/40">
            Permanently delete your account and all associated data.
          </p>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="border-red-900 font-mono text-red-500 hover:bg-red-950 hover:text-red-400"
                onClick={() => {
                  setConfirmText('');
                  setDeleteError(null);
                }}
              >
                Delete account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-white/10 bg-[#0a0a0a] text-white">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription className="text-white/60">
                  This will permanently delete your Logrithm account and all associated data. This
                  action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="my-2">
                <label className="mb-2 block text-sm font-medium text-white/80">
                  Please type <span className="font-bold text-red-500">DELETE</span> to confirm.
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:border-red-500 focus:outline-none"
                  placeholder="DELETE"
                />
                {deleteError && <p className="mt-2 text-xs text-red-500">{deleteError}</p>}
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel
                  className="border-white/10 bg-transparent text-white hover:bg-white/5 hover:text-white"
                  disabled={isDeleting}
                >
                  Cancel
                </AlertDialogCancel>
                <Button
                  onClick={handleDeleteAccount}
                  disabled={confirmText !== 'DELETE' || isDeleting}
                  className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Delete account
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>
    </div>
  );
}
