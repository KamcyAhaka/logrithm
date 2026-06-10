'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SHARE_CARDS = [
  { id: 'persona', label: 'Persona', src: '/previews/preview-share-persona.png' },
  { id: 'score', label: 'Score', src: '/previews/preview-share-score.png' },
  { id: 'streak', label: 'Streak', src: '/previews/preview-share-streak.png' },
  { id: 'wrapped', label: 'Wrapped', src: '/previews/preview-share-wrapped.png' },
  { id: 'prstats', label: 'PR Stats', src: '/previews/preview-share-prstats.png' },
];

export default function ShareCardsCarousel() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % SHARE_CARDS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isHovered]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
        width: '100%',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {SHARE_CARDS.map((card, idx) => (
          <button
            key={card.id}
            onClick={() => setActiveIdx(idx)}
            className="pill"
            style={{
              cursor: 'pointer',
              background:
                idx === activeIdx ? 'rgba(74, 222, 128, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              color: idx === activeIdx ? '#4ade80' : 'var(--text-secondary)',
              border:
                idx === activeIdx
                  ? '1px solid rgba(74, 222, 128, 0.4)'
                  : '1px solid rgba(255, 255, 255, 0.05)',
              transition: 'all 0.2s',
            }}
          >
            {card.label}
          </button>
        ))}
      </div>

      {/* Card Display with subtle borders and green shadow */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '380px',
          aspectRatio: '4 / 5',
          borderRadius: '1.5rem',
          overflow: 'hidden',
          boxShadow: '0 25px 60px -15px rgba(29, 158, 117, 0.35)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          background: 'rgba(20, 20, 20, 0.6)',
        }}
      >
        {SHARE_CARDS.map((card, idx) => (
          <div
            key={card.id}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: idx === activeIdx ? 1 : 0,
              transform:
                idx === activeIdx ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(10px)',
              transition:
                'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
              pointerEvents: idx === activeIdx ? 'auto' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.25rem',
            }}
          >
            <Image
              src={card.src}
              alt={`${card.label} share card preview`}
              width={400}
              height={500}
              priority={idx === 0}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: '0.75rem',
              }}
            />
          </div>
        ))}
      </div>

      {/* Manual buttons */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button
          onClick={() =>
            setActiveIdx((prev) => (prev - 1 + SHARE_CARDS.length) % SHARE_CARDS.length)
          }
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: 'white',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          className="hover:bg-white/10"
          aria-label="Previous card"
        >
          <ChevronLeft size={16} />
        </button>
        <span
          style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}
        >
          {activeIdx + 1} / {SHARE_CARDS.length}
        </span>
        <button
          onClick={() => setActiveIdx((prev) => (prev + 1) % SHARE_CARDS.length)}
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: 'white',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          className="hover:bg-white/10"
          aria-label="Next card"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
