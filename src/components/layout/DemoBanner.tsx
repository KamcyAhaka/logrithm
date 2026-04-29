'use client'

import React from 'react';
import { Info } from 'lucide-react';
import Link from 'next/link';

export const DemoBanner = () => {
  return (
    <div className="bg-primary/10 border-b border-primary/20 py-2.5">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-center space-x-2 text-sm text-primary">
        <Info size={16} />
        <p>
          👋 You&apos;re viewing a demo with sample data.{' '}
          <Link href="/" className="font-bold underline hover:opacity-80">
            Connect your GitHub
          </Link>{' '}
          to see your own Logrithm.
        </p>
      </div>
    </div>
  );
};
