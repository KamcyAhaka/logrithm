'use client';

import React from 'react';

interface TerminalCardProps {
  title: string;
  children: React.ReactNode;
  maxHeight?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function TerminalCard({
  title,
  children,
  maxHeight,
  className = '',
  style = {},
}: TerminalCardProps) {
  return (
    <div
      className={`border-term-border bg-term-bg relative overflow-hidden border font-mono ${className}`}
      style={{
        borderRadius: '8px',
        maxHeight,
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
    >
      {/* Terminal Title Bar */}
      <div className="border-term-border bg-term-hover flex items-center gap-2 border-b px-4 py-2.5 select-none">
        <div className="flex shrink-0 items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-[#FF5F57] opacity-60" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E] opacity-60" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#28C840] opacity-60" />
        </div>
        <span className="text-term-dim ml-2 text-[11px] tracking-wide">logrithm — {title}</span>
      </div>
      <div className="flex flex-1 flex-col overflow-hidden p-5" style={{ minHeight: 0 }}>
        {children}
      </div>
    </div>
  );
}
