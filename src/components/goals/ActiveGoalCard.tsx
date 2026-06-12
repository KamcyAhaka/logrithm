'use client';

import { Trash2, TrendingUp, Calendar } from 'lucide-react';
import type { GoalDocument } from '@/types/goals';

interface ActiveGoalCardProps {
  activeGoal: GoalDocument;
  currentScore: number;
  estimatedWeeksText: string;
  progressPercent: number;
  onChangeGoal: () => void;
  onAbandonGoal: () => void;
}

export default function ActiveGoalCard({
  activeGoal,
  currentScore,
  estimatedWeeksText,
  progressPercent,
  onChangeGoal,
  onAbandonGoal,
}: ActiveGoalCardProps) {
  return (
    <div className="animate-fadeIn space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="space-y-1">
          <span className="rounded-full border border-[#1D9E75]/20 bg-[#1D9E75]/10 px-2.5 py-0.5 font-mono text-[10px] tracking-wider text-[#1D9E75] uppercase">
            Active Goal
          </span>
          <h2 className="font-mono text-xl font-bold text-white">
            Reach a {activeGoal.targetLabel} score
          </h2>
          <p className="text-xs text-white/40">
            Calculated from historical and daily commit sequences.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onChangeGoal}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 font-mono text-xs font-medium text-white transition-colors hover:bg-white/10"
          >
            Change goal
          </button>
          <button
            onClick={onAbandonGoal}
            className="flex items-center gap-1 rounded-full border border-red-500/20 bg-red-500/5 px-4 py-1.5 font-mono text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Abandon
          </button>
        </div>
      </div>

      {/* Progress and Score stats */}
      <div className="grid grid-cols-1 gap-6 border-t border-white/5 pt-4 md:grid-cols-3">
        <div className="space-y-2">
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-white/60">Current Progress</span>
            <span className="font-mono text-lg font-bold text-[#1D9E75]">{progressPercent}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full bg-linear-to-r from-[#1D9E75]/70 to-[#1D9E75] transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-black/20 p-4">
          <TrendingUp className="h-5 w-5 text-[#1D9E75]" />
          <div>
            <span className="block text-[10px] text-white/40 uppercase">Current Score</span>
            <span className="font-mono text-sm font-bold text-white">
              {currentScore}{' '}
              <span className="text-xs text-white/40">
                / {activeGoal.targetScore} (Start: {activeGoal.scoreAtCreation})
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-black/20 p-4">
          <Calendar className="h-5 w-5 text-[#1D9E75]" />
          <div>
            <span className="block text-[10px] text-white/40 uppercase">Completion Estimate</span>
            <span className="font-mono text-xs font-semibold text-white/80">
              {estimatedWeeksText}
            </span>
          </div>
        </div>
      </div>

      {/* Action plan summary & guidelines */}
      <div className="space-y-4 border-t border-white/5 pt-4">
        <div className="space-y-1">
          <h3 className="font-mono text-xs font-bold tracking-wider text-white uppercase">
            Plan from Gemini
          </h3>
          <p className="text-sm leading-relaxed text-white/70">{activeGoal.geminiSummary}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 pt-2 md:grid-cols-2">
          {/* Actions list */}
          <div className="space-y-3">
            <h4 className="font-mono text-[11px] font-bold text-white/40 uppercase">
              Weekly Actions
            </h4>
            <div className="space-y-2">
              {activeGoal.weeklyActions?.map((action: string, idx: number) => (
                <div key={idx} className="flex gap-2 text-xs leading-relaxed text-white/60">
                  <span className="font-mono font-bold text-[#1D9E75]">{idx + 1}.</span>
                  <p>{action}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Initial Dimension Gaps */}
          <div className="space-y-3">
            <h4 className="font-mono text-[11px] font-bold text-white/40 uppercase">
              Dimension gaps at creation
            </h4>
            <div className="overflow-hidden rounded-xl border border-white/5 bg-black/15">
              <table className="w-full text-left font-mono text-[10px]">
                <thead className="bg-white/5 text-white/40">
                  <tr>
                    <th className="px-3 py-2">Dimension</th>
                    <th className="px-3 py-2 text-right">Current</th>
                    <th className="px-3 py-2 text-right">Required</th>
                    <th className="px-3 py-2 text-right text-[#1D9E75]">Gap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/70">
                  {activeGoal.dimensionGapsAtCreation?.map(
                    (
                      gapItem: {
                        dimension?: string;
                        name?: string;
                        current?: string | number;
                        currentValue?: string | number;
                        required?: string | number;
                        requiredValue?: string | number;
                        gap?: string | number;
                        difference?: string | number;
                      },
                      index: number
                    ) => {
                      const dim = gapItem.dimension || gapItem.name || '';
                      const cur =
                        gapItem.current !== undefined
                          ? gapItem.current
                          : (gapItem.currentValue ?? '');
                      const req =
                        gapItem.required !== undefined
                          ? gapItem.required
                          : (gapItem.requiredValue ?? '');
                      const gap =
                        gapItem.gap !== undefined ? gapItem.gap : (gapItem.difference ?? '');

                      return (
                        <tr key={index} className="hover:bg-white/5">
                          <td className="px-3 py-2 font-medium">{dim}</td>
                          <td className="px-3 py-2 text-right">{cur}</td>
                          <td className="px-3 py-2 text-right">{req}</td>
                          <td className="px-3 py-2 text-right font-bold text-[#1D9E75]">{gap}</td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
