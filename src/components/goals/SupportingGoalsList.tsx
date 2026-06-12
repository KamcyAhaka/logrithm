'use client';

import Image from 'next/image';

import { Loader2 } from 'lucide-react';
import type { InvitedGoal } from '@/lib/functions';

interface SupportingGoalsListProps {
  goals: InvitedGoal[];
  loading: boolean;
}

function StatusBadge({ status }: { status: InvitedGoal['status'] }) {
  const styles =
    status === 'achieved'
      ? 'border border-[#1D9E75]/20 bg-[#1D9E75]/10 text-[#1D9E75]'
      : status === 'abandoned'
        ? 'border border-red-500/20 bg-red-500/10 text-red-400'
        : 'border border-blue-500/20 bg-blue-500/10 text-blue-400';
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 font-mono text-[9px] font-semibold tracking-wider uppercase ${styles}`}
    >
      {status}
    </span>
  );
}

function SupportingGoalCard({ goal }: { goal: InvitedGoal }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
      {/* Owner Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-black/30 font-mono text-xs font-bold text-white">
            {goal.ownerAvatarUrl ? (
              <Image
                src={goal.ownerAvatarUrl}
                alt={goal.ownerUsername}
                width={32}
                height={32}
                className="h-full w-full object-cover"
              />
            ) : (
              goal.ownerUsername.slice(0, 2).toUpperCase()
            )}
          </div>
          <div>
            <span className="block text-xs leading-none font-bold text-white">
              @{goal.ownerUsername}
            </span>
            <span className="text-[10px] tracking-wide text-white/45 uppercase">
              Target: {goal.targetLabel} ({goal.targetScore})
            </span>
          </div>
        </div>
        <StatusBadge status={goal.status} />
      </div>

      {/* Score & Progress */}
      <div className="space-y-2 border-t border-white/5 pt-3">
        <div className="flex items-baseline justify-between text-xs">
          <span className="text-white/50">Current Progress</span>
          <span className="font-mono font-bold text-[#1D9E75]">
            {goal.ownerCurrentScore} / {goal.targetScore} ({goal.progressPercent}%)
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full bg-linear-to-r from-[#1D9E75]/70 to-[#1D9E75] transition-all duration-500 ease-out"
            style={{ width: `${goal.progressPercent}%` }}
          />
        </div>
      </div>

      {/* Gemini Summary */}
      <p className="border-t border-white/5 pt-3 text-xs leading-relaxed text-white/60">
        &ldquo;{goal.geminiSummary}&rdquo;
      </p>

      {/* Footer: Timeframe & action count */}
      <div className="flex items-center justify-between border-t border-white/5 pt-3 font-mono text-[10px] text-white/40">
        <span>Timeframe: {goal.timeframeWeeks} weeks</span>
        <span>{goal.weeklyActions.length} weekly actions</span>
      </div>
    </div>
  );
}

export default function SupportingGoalsList({ goals, loading }: SupportingGoalsListProps) {
  if (!loading && goals.length === 0) return null;

  return (
    <div className="space-y-4 border-t border-white/5 pt-8">
      <div className="space-y-1">
        <h2 className="flex items-center gap-2 font-mono text-lg font-bold text-white">
          <span className="h-2 w-2 rounded-full bg-[#1D9E75]" />
          Goals you&apos;re supporting
        </h2>
        <p className="text-xs text-white/40">
          You are an accountability partner for these developers. Check in on their progress and
          recommendations.
        </p>
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#1D9E75]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {goals.map((goal) => (
            <SupportingGoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}
    </div>
  );
}
