'use client'

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface LanguageBreakdownProps {
  data: { name: string; count: number; color: string }[];
}

export const LanguageBreakdown = ({ data }: LanguageBreakdownProps) => {
  return (
    <div className="glass-card p-6 rounded-2xl h-full flex flex-col">
      <h3 className="text-lg font-bold font-mono mb-6">Languages</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="count"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || `hsl(${index * 45}, 70%, 60%)`} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 space-y-2 overflow-y-auto max-h-24 pr-2">
        {data.map((lang, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: lang.color }} />
              <span className="text-white/60">{lang.name}</span>
            </div>
            <span className="font-mono">{lang.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
