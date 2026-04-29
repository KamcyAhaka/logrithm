'use client'

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface CommitChartProps {
  data: { date: string; count: number }[];
}

export const CommitChart = ({ data }: CommitChartProps) => {
  // Aggregate data by month for the chart if many points
  const displayData = data.slice(-30); // Last 30 days for clarity

  return (
    <div className="glass-card p-6 rounded-2xl h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold font-mono">Commit History</h3>
        <span className="text-xs text-white/40">Last 30 Days</span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={displayData}>
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
            tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
            itemStyle={{ color: 'var(--primary)' }}
            labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}
          />
          <Area 
            type="monotone" 
            dataKey="count" 
            stroke="var(--primary)" 
            fillOpacity={1} 
            fill="url(#colorCount)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
