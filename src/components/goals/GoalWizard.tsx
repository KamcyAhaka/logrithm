'use client';

import { ChevronRight, Loader2, Calendar, CheckCircle2, Lock } from 'lucide-react';
import type { GoalActionPlanResult } from '@/lib/functions';
import type { InsightObject } from '@/types/github';
import type { Preset } from '@/types/goals';

interface GoalWizardProps {
  step: 1 | 2;
  selectedTarget: Preset | null;
  setSelectedTarget: (preset: Preset) => void;
  filteredPresets: Preset[];
  userInsights: InsightObject | null;
  generatingPlan: boolean;
  actionPlan: GoalActionPlanResult | null;
  savingGoal: boolean;
  isPro: boolean;
  onUpgradeClick: () => void;
  onCancel: () => void;
  onNext: () => void;
  onBack: () => void;
  onConfirm: () => void;
}

export default function GoalWizard({
  step,
  selectedTarget,
  setSelectedTarget,
  filteredPresets,
  userInsights,
  generatingPlan,
  actionPlan,
  savingGoal,
  isPro,
  onUpgradeClick,
  onCancel,
  onNext,
  onBack,
  onConfirm,
}: GoalWizardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
      {step === 1 ? (
        <div className="animate-fadeIn space-y-6">
          <div>
            <h2 className="font-mono text-lg font-bold text-white">Step 1 — Choose your target</h2>
            <p className="text-xs text-white/40">
              Select an activity score preset to commit toward. Higher presets require higher
              volume, consistency, and diversity.
            </p>
          </div>

          {/* Score breakdown warning */}
          {!userInsights && (
            <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4 font-mono text-xs leading-relaxed text-yellow-500/90">
              ⚠️ Please generate your activity insights on the dashboard first so Gemini can analyze
              your weakest dimensions.
            </div>
          )}

          {filteredPresets.length === 0 ? (
            <div className="flex flex-col items-center justify-center space-y-3 py-10 text-center">
              <CheckCircle2 className="h-10 w-10 text-[#1D9E75]" />
              <h3 className="font-mono font-bold text-white">Perfect Score Achieved!</h3>
              <p className="max-w-md text-xs text-white/40">
                Your current score is already at maximum levels. Keep contributions active to
                maintain consistency!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filteredPresets.map((preset) => {
                const isLocked = preset.isProOnly && !isPro;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      if (isLocked) {
                        onUpgradeClick();
                      } else {
                        setSelectedTarget(preset);
                      }
                    }}
                    className={`flex flex-col rounded-2xl border p-5 text-left transition-all ${
                      selectedTarget?.label === preset.label
                        ? 'border-[#1D9E75] bg-[#1D9E75]/5'
                        : 'border-white/5 bg-black/20 hover:border-white/10'
                    } ${isLocked ? 'cursor-pointer hover:border-purple-500/30' : ''}`}
                  >
                    <div className="mb-1 flex w-full items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">{preset.label}</span>
                        {preset.isProOnly && (
                          <span className="flex items-center gap-1 rounded-full border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 font-mono text-[9px] font-bold text-purple-400">
                            <Lock size={9} /> PRO
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-sm font-semibold text-[#1D9E75]">
                        Target: {preset.score}
                      </span>
                    </div>
                    <p className="text-xs text-white/40">{preset.description}</p>
                  </button>
                );
              })}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between border-t border-white/5 pt-4">
            <button
              onClick={onCancel}
              type="button"
              className="px-4 py-2 font-mono text-xs font-semibold text-white/60 transition-colors hover:text-white"
            >
              Cancel
            </button>
            <button
              disabled={!selectedTarget || !userInsights}
              onClick={onNext}
              type="button"
              className="flex items-center gap-1 rounded-full bg-[#1D9E75] px-5 py-2 font-mono text-xs font-bold text-white transition-all hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="animate-fadeIn space-y-6">
          <div>
            <h2 className="font-mono text-lg font-bold text-white">
              Step 2 — Review your action plan
            </h2>
            <p className="font-mono text-xs text-white/40">
              Gemini is compiling a personal trajectory to hit {selectedTarget?.label} (
              {selectedTarget?.score}).
            </p>
          </div>

          {generatingPlan && (
            <div className="flex flex-col items-center justify-center space-y-4 py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#1D9E75]" />
              <p className="animate-pulse font-mono text-xs text-[#1D9E75]">
                generating your action plan...
              </p>
            </div>
          )}

          {!generatingPlan && actionPlan && (
            <div className="space-y-6">
              {/* Summary paragraph */}
              <div className="rounded-2xl border border-white/5 bg-black/20 p-5 text-sm leading-relaxed text-white/70">
                <p>{actionPlan.summary}</p>
              </div>

              {/* Dimension Gaps Table */}
              <div className="overflow-hidden rounded-2xl border border-white/5 bg-black/10">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-white/5 text-white/40">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Dimension</th>
                      <th className="px-4 py-3 text-right font-semibold">Current</th>
                      <th className="px-4 py-3 text-right font-semibold">Required</th>
                      <th className="px-4 py-3 text-right font-semibold text-[#1D9E75]">Gap</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/70">
                    {actionPlan.dimensionGaps?.map(
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
                            <td className="px-4 py-3 font-medium">{dim}</td>
                            <td className="px-4 py-3 text-right">{cur}</td>
                            <td className="px-4 py-3 text-right">{req}</td>
                            <td className="px-4 py-3 text-right font-bold text-[#1D9E75]">{gap}</td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>

              {/* Weekly Actions List */}
              <div className="space-y-3">
                <h3 className="font-mono text-xs font-bold tracking-wider text-white uppercase">
                  Weekly Guidelines
                </h3>
                <div className="space-y-2.5">
                  {actionPlan.weeklyActions?.map((action: string, idx: number) => (
                    <div key={idx} className="flex gap-3 text-sm leading-relaxed text-white/60">
                      <span className="font-mono font-bold text-[#1D9E75]">{idx + 1}.</span>
                      <p>{action}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeframe weeks */}
              <div className="flex w-fit items-center gap-2 rounded-xl border border-[#1D9E75]/10 bg-[#1D9E75]/5 p-3 font-mono text-xs text-[#1D9E75]">
                <Calendar className="h-4 w-4" />
                <span>Estimated completion timeframe: {actionPlan.timeframeWeeks} weeks</span>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between border-t border-white/5 pt-4">
            <button
              disabled={savingGoal}
              onClick={onBack}
              type="button"
              className="px-4 py-2 font-mono text-xs font-semibold text-white/60 transition-colors hover:text-white"
            >
              Back
            </button>
            <button
              disabled={savingGoal || generatingPlan || !actionPlan}
              onClick={onConfirm}
              type="button"
              className="flex items-center gap-1.5 rounded-full bg-[#1D9E75] px-5 py-2 font-mono text-xs font-bold text-white transition-all hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
            >
              {savingGoal ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                'Confirm goal'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
