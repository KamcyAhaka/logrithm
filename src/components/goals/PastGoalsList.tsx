'use client';

import { Award, XCircle, Calendar, TrendingUp } from 'lucide-react';
import type { GoalDocument } from '@/types/goals';

interface PastGoalsListProps {
  goals: GoalDocument[];
}

export default function PastGoalsList({ goals }: PastGoalsListProps) {
  if (goals.length === 0) return null;

  const formatDate = (dateVal: unknown) => {
    if (!dateVal) return '';
    const d =
      typeof dateVal === 'object' &&
      dateVal !== null &&
      'toDate' in dateVal &&
      typeof (dateVal as { toDate: unknown }).toDate === 'function'
        ? (dateVal as { toDate: () => Date }).toDate()
        : new Date(dateVal as string | number | Date);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-4 border-t border-white/5 pt-8">
      <div className="space-y-1">
        <h2 className="font-mono text-lg font-bold text-white">Goal History</h2>
        <p className="text-xs text-white/40">Your archived progression and past commitments.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {goals.map((goal) => {
          const isAchieved = goal.status === 'achieved';
          const dateLabel = isAchieved ? 'Achieved' : 'Ended';
          const dateVal = isAchieved ? goal.achievedAt : goal.updatedAt;

          return (
            <div
              key={goal.id}
              className="flex flex-col justify-between space-y-4 rounded-2xl border border-white/5 bg-black/20 p-5 transition-all hover:border-white/10"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 font-mono text-[9px] font-semibold tracking-wide uppercase ${
                      isAchieved
                        ? 'border border-[#1D9E75]/20 bg-[#1D9E75]/10 text-[#1D9E75]'
                        : 'border border-white/10 bg-white/5 text-white/45'
                    }`}
                  >
                    {goal.status}
                  </span>
                  <h3 className="mt-2 font-mono text-base font-bold text-white">
                    Reach a {goal.targetLabel} score
                  </h3>
                </div>
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border ${
                    isAchieved
                      ? 'border-[#1D9E75]/20 bg-[#1D9E75]/10 text-[#1D9E75]'
                      : 'border-red-500/20 bg-red-500/10 text-red-400'
                  }`}
                >
                  {isAchieved ? (
                    <Award className="h-4.5 w-4.5" />
                  ) : (
                    <XCircle className="h-4.5 w-4.5" />
                  )}
                </div>
              </div>

              <p className="text-xs leading-relaxed text-white/60">
                &ldquo;{goal.geminiSummary}&rdquo;
              </p>

              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-3 text-[10px] text-white/40">
                <div className="flex items-center gap-1.5 font-mono">
                  <TrendingUp className="h-3.5 w-3.5 text-[#1D9E75]/70" />
                  <span>
                    Score: {goal.scoreAtCreation} &rarr; {goal.targetScore}
                  </span>
                </div>
                <div className="flex items-center justify-end gap-1.5 font-mono">
                  <Calendar className="h-3.5 w-3.5 text-white/30" />
                  <span>
                    {dateLabel}: {formatDate(dateVal)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
