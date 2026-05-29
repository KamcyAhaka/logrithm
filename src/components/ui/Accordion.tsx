'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  opacity?: number;
}

export default function Accordion({
  title,
  children,
  defaultOpen = false,
  opacity = 1,
}: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="glass-card" style={{ overflow: 'hidden', opacity }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.5rem',
          background: 'rgba(0, 0, 0, 0.2)',
          border: 'none',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          textAlign: 'left',
          fontFamily: 'var(--font-mono)',
        }}
      >
        <span style={{ fontSize: '1.25rem' }}>{title}</span>
        <ChevronDown
          size={20}
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            color: 'var(--text-muted)',
          }}
        />
      </button>
      <div
        style={{
          display: 'grid',
          gridTemplateRows: isOpen ? '1fr' : '0fr',
          transition: 'grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          <div
            style={{
              padding: '0 1.5rem 1.5rem 1.5rem',
              opacity: isOpen ? 1 : 0,
              transform: isOpen ? 'translateY(0)' : 'translateY(-10px)',
              transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
