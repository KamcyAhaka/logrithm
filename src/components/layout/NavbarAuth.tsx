'use client';

import { useAuth } from '@/hooks/useAuth';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Image from 'next/image';
import Link from 'next/link';
import { LogOut, User as UserIcon, Settings, Share2 } from 'lucide-react';
import { useDashboardStore } from '@/store/useDashboardStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function NavbarAuth() {
  const { user, loading } = useAuth();
  const { activity, clearStore } = useDashboardStore();

  if (loading) {
    return <div className="skeleton" style={{ width: 30, height: 30, borderRadius: '50%' }} />;
  }

  if (!user) return null;

  const handleSignOut = async () => {
    try {
      clearStore();
      await signOut(auth);
      window.location.href = '/';
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const username = activity?.login;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
      <Link
        href="/settings"
        style={{
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          transition: 'color 0.15s',
        }}
        className="hover:text-white"
        aria-label="Settings"
      >
        <Settings size={16} />
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              borderRadius: '50%',
              outline: 'none',
            }}
          >
            {user.photoURL ? (
              <Image
                src={user.photoURL}
                alt={user.displayName ?? 'User avatar'}
                width={30}
                height={30}
                style={{ borderRadius: '50%', border: '1px solid var(--border-std)' }}
              />
            ) : (
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: 'var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--border-std)',
                }}
              >
                <UserIcon size={16} color="var(--text-muted)" />
              </div>
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="border-border-subtle bg-card text-card-foreground w-56 font-mono text-sm"
        >
          <DropdownMenuLabel className="text-muted-foreground text-xs font-normal tracking-wider uppercase">
            My Account
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border-subtle" />

          {username ? (
            <>
              <Link href={`/u/${username}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <DropdownMenuItem className="cursor-pointer transition-colors focus:bg-white/10 focus:text-white">
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Public Profile</span>
                </DropdownMenuItem>
              </Link>
              <Link
                href={`/share/${username}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <DropdownMenuItem className="cursor-pointer transition-colors focus:bg-white/10 focus:text-white">
                  <Share2 className="mr-2 h-4 w-4" />
                  <span>Share Card</span>
                </DropdownMenuItem>
              </Link>
            </>
          ) : (
            <>
              <DropdownMenuItem disabled className="opacity-50">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Public Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem disabled className="opacity-50">
                <Share2 className="mr-2 h-4 w-4" />
                <span>Share Card</span>
              </DropdownMenuItem>
            </>
          )}

          <Link href="/settings" style={{ textDecoration: 'none', color: 'inherit' }}>
            <DropdownMenuItem className="cursor-pointer transition-colors focus:bg-white/10 focus:text-white">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
          </Link>

          <DropdownMenuSeparator className="bg-border-subtle" />

          <DropdownMenuItem
            onClick={handleSignOut}
            className="cursor-pointer text-red-400 transition-colors focus:bg-red-400/10 focus:text-red-400"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
