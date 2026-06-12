'use client';

import { useState } from 'react';
import { X, Users, Loader2 } from 'lucide-react';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (username: string) => Promise<boolean>;
  inviting: boolean;
  error: string | null;
  success: boolean;
}

export default function InviteModal({
  isOpen,
  onClose,
  onInvite,
  inviting,
  error,
  success,
}: InviteModalProps) {
  const [username, setUsername] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || inviting) return;
    const ok = await onInvite(username.trim());
    if (ok) {
      setUsername('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="animate-scaleIn relative w-full max-w-md space-y-5 rounded-3xl border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 transition-colors hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="space-y-1">
          <h3 className="text-md flex items-center gap-1.5 font-mono font-bold text-white">
            <Users className="h-5 w-5 text-[#1D9E75]" />
            Invite Accountability Partner
          </h3>
          <p className="text-xs text-white/40">
            Type the GitHub username of a registered Pro user.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] text-white/40 uppercase">GitHub Username</label>
            <input
              type="text"
              required
              placeholder="e.g. github_dev"
              disabled={inviting || success}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-mono text-sm text-white focus:border-[#1D9E75] focus:outline-none disabled:opacity-50"
            />
          </div>

          {error && (
            <p className="rounded-xl border border-red-500/10 bg-red-400/5 p-3 font-mono text-xs text-red-400">
              ⚠️ {error}
            </p>
          )}

          {success && (
            <p className="rounded-xl border border-[#1D9E75]/10 bg-[#1D9E75]/5 p-3 font-mono text-xs text-[#1D9E75]">
              🚀 accountability partner successfully invited!
            </p>
          )}

          <button
            type="submit"
            disabled={inviting || success || !username.trim()}
            className="flex w-full items-center justify-center gap-1.5 rounded-full bg-[#1D9E75] py-2.5 font-mono text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
          >
            {inviting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Inviting...
              </>
            ) : (
              'Send Invitation'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
