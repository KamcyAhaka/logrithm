'use client'

import React from 'react';

interface ActivityHeatmapProps {
  weeks: {
    contributionDays: {
      date: string;
      contributionCount: number;
    }[];
  }[];
}

export const ActivityHeatmap = ({ weeks }: ActivityHeatmapProps) => {
  const getColor = (count: number) => {
    if (count === 0) return 'bg-white/5';
    if (count < 3) return 'bg-primary/20';
    if (count < 6) return 'bg-primary/40';
    if (count < 10) return 'bg-primary/70';
    return 'bg-primary';
  };

  return (
    <div className="glass p-6 rounded-2xl border border-white/5 bg-white/[0.02] overflow-x-auto">
      <h3 className="text-lg font-bold font-mono mb-4">Contribution Grid</h3>
      <div className="inline-grid grid-cols-[repeat(52,1fr)] gap-1 min-w-[800px] w-full">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-rows-7 gap-1">
            {week.contributionDays.map((day, di) => (
              <div
                key={di}
                title={`${day.date}: ${day.contributionCount} contributions`}
                className={`w-3 h-3 rounded-sm ${getColor(day.contributionCount)} transition-colors hover:ring-2 hover:ring-white/20`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-end space-x-2 text-[10px] text-white/30">
        <span>Less</span>
        <div className="w-3 h-3 rounded-sm bg-white/5" />
        <div className="w-3 h-3 rounded-sm bg-primary/20" />
        <div className="w-3 h-3 rounded-sm bg-primary/50" />
        <div className="w-3 h-3 rounded-sm bg-primary" />
        <span>More</span>
      </div>
    </div>
  );
};
