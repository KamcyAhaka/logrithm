'use client';

import Image from 'next/image';
import { Users, Plus, Compass, Loader2, User as UserIcon } from 'lucide-react';

interface Partner {
  githubLogin: string;
  avatarUrl: string;
  currentScore: number;
}

interface PartnersSectionProps {
  partners: Partner[];
  loading: boolean;
  targetScore: number;
  onInviteClick: () => void;
}

export default function PartnersSection({
  partners,
  loading,
  targetScore,
  onInviteClick,
}: PartnersSectionProps) {
  return (
    <div className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-md flex items-center gap-2 font-mono font-bold text-white">
            <Users className="h-4 w-4 text-[#1D9E75]" />
            Accountability Partners
          </h3>
          <p className="text-xs text-white/40">
            Invite Pro users to share this goal and track progress together.
          </p>
        </div>

        <button
          onClick={onInviteClick}
          className="flex items-center gap-1 rounded-full bg-[#1D9E75] px-4 py-2 font-mono text-xs font-bold text-white transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="h-3.5 w-3.5" />
          Invite a partner
        </button>
      </div>

      {loading && (
        <div className="flex h-24 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-[#1D9E75]" />
        </div>
      )}

      {!loading && partners.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/5 py-10 text-center">
          <Compass className="mb-2 h-8 w-8 text-white/20" />
          <p className="max-w-sm text-xs leading-relaxed text-white/40">
            Invite Pro users to share this goal and track progress together
          </p>
        </div>
      )}

      {!loading && partners.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {partners.map((partner) => {
            const progress = Math.min(
              100,
              Math.max(0, Math.round((partner.currentScore / targetScore) * 100))
            );
            return (
              <div
                key={partner.githubLogin}
                className="flex items-center gap-4 rounded-2xl border border-white/5 bg-black/20 p-4"
              >
                {partner.avatarUrl ? (
                  <Image
                    src={partner.avatarUrl}
                    alt={partner.githubLogin}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full border border-white/10"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5">
                    <UserIcon className="h-5 w-5 text-white/40" />
                  </div>
                )}
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-white">
                      @{partner.githubLogin}
                    </span>
                    <span className="font-mono text-xs text-[#1D9E75]">
                      Score: {partner.currentScore}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] text-white/40">
                      <span>Progress toward target ({targetScore})</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                      <div className="h-full bg-[#1D9E75]" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
