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
            Invite partners to keep you accountable and check in on your progress.
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
            Invite partners to keep you accountable and check in on your progress
          </p>
        </div>
      )}

      {!loading && partners.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {partners.map((partner) => {
            return (
              <div
                key={partner.githubLogin}
                className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/20 p-4"
              >
                <div className="flex items-center gap-3">
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
                  <div>
                    <span className="block font-mono text-xs font-bold text-white">
                      @{partner.githubLogin}
                    </span>
                    <span className="font-mono text-[10px] text-white/40">
                      Score: {partner.currentScore}
                    </span>
                  </div>
                </div>

                <span className="rounded-full border border-[#1D9E75]/20 bg-[#1D9E75]/10 px-2.5 py-0.5 font-mono text-[9px] font-bold text-[#1D9E75] uppercase">
                  Supporting
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
