'use client'

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isUp: boolean;
  };
}

export const StatsCard = ({ label, value, icon: Icon, trend }: StatsCardProps) => {
  return (
    <div className="glass-card p-6 rounded-2xl space-y-4">
      <div className="flex justify-between items-start text-white/30">
        <Icon size={20} strokeWidth={1.5} />
        {trend && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            trend.isUp ? 'bg-primary/10 text-primary' : 'bg-red-400/10 text-red-400'
          }`}>
            {trend.value}
          </span>
        )}
      </div>
      
      <div className="space-y-1">
        <h3 className="text-2xl font-black font-mono tracking-tight">{value}</h3>
        <p className="text-[10px] uppercase tracking-widest font-bold text-white/30">{label}</p>
      </div>
    </div>
  );
};
