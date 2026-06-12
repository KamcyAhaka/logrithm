'use client';

import Image from 'next/image';

import { Loader2 } from 'lucide-react';
import type { PendingInvite } from '@/lib/functions';

interface PendingInvitesBannerProps {
  invites: PendingInvite[];
  processingInviteId: string | null;
  onRespond: (goalId: string, ownerUid: string, accept: boolean) => void;
}

export default function PendingInvitesBanner({
  invites,
  processingInviteId,
  onRespond,
}: PendingInvitesBannerProps) {
  if (invites.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {invites.map((invite) => (
        <div
          key={invite.goalId}
          className="animate-fadeIn relative overflow-hidden rounded-2xl border border-[#1D9E75]/20 bg-[#1D9E75]/5 p-4 backdrop-blur-md md:p-5"
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            {/* Owner info */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#1D9E75]/20 bg-[#1D9E75]/10 font-mono font-bold text-[#1D9E75]">
                {invite.ownerAvatarUrl ? (
                  <Image
                    src={invite.ownerAvatarUrl}
                    alt={invite.ownerUsername}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  invite.ownerUsername.slice(0, 2).toUpperCase()
                )}
              </div>
              <div>
                <p className="text-sm leading-tight font-semibold text-white">
                  Accountability Partner Invitation
                </p>
                <p className="text-xs text-white/50">
                  @{invite.ownerUsername} invited you to support them in reaching a{' '}
                  <span className="font-bold text-[#1D9E75]">{invite.targetLabel}</span> score of{' '}
                  {invite.targetScore}.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-2">
              <button
                disabled={processingInviteId !== null}
                onClick={() => onRespond(invite.goalId, invite.goalOwnerUid, false)}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 font-mono text-xs font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
              >
                Reject
              </button>
              <button
                disabled={processingInviteId !== null}
                onClick={() => onRespond(invite.goalId, invite.goalOwnerUid, true)}
                className="flex items-center gap-1.5 rounded-full bg-[#1D9E75] px-4 py-1.5 font-mono text-xs font-bold text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {processingInviteId === invite.goalId ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  'Accept'
                )}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
