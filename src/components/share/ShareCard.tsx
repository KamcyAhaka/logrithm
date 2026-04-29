// src/components/share/ShareCard.tsx
'use client'

import { useRef } from 'react';
import html2canvas from 'html2canvas';

export const ShareCard = ({ insight, username, avatarUrl, generatedAt }) => {
  const cardRef = useRef(null);

  const downloadPNG = async () => {
    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: '#0a0a0a',
      scale: 2, // retina quality
    });
    const link = document.createElement('a');
    link.download = `logrithm-${username}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const copyLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/share/${username}`
    );
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 gap-6">
      
      {/* The card — this is what gets captured as PNG */}
      <div ref={cardRef} className="w-[600px] bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={avatarUrl} className="w-10 h-10 rounded-full" />
            <div>
              <p className="font-mono font-bold">@{username}</p>
              <p className="text-white/30 text-xs font-mono">Logrithm analysis</p>
            </div>
          </div>
          <div className="px-4 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono text-sm font-bold">
            {insight.activityScore}/100
          </div>
        </div>

        {/* Summary */}
        <p className="text-white/70 leading-relaxed">{insight.summary}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {insight.tags?.map((tag: string) => (
            <span key={tag} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-white/50 uppercase tracking-wider">
              {tag}
            </span>
          ))}
        </div>

        {/* Top languages */}
        <div className="flex gap-3">
          {insight.topLanguages?.map((lang: string) => (
            <span key={lang} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono font-bold">
              {lang}
            </span>
          ))}
        </div>

        {/* Footer branding */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <span className="font-mono text-xs text-white/20">logrithm.dev</span>
          <span className="font-mono text-xs text-white/20">
            {new Date(generatedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Action buttons — outside the card so they don't appear in PNG */}
      <div className="flex gap-3">
        <button onClick={downloadPNG} className="px-6 py-2 bg-primary text-white font-mono text-sm rounded-xl">
          Download PNG
        </button>
        <button onClick={copyLink} className="px-6 py-2 border border-white/10 text-white/60 font-mono text-sm rounded-xl">
          Copy link
        </button>
      </div>

    </div>
  );
};
