'use client';

import { useState, useEffect } from 'react';
import { useSequenceStep } from './SequenceContext';

interface StatsGridProps {
  totalCommits: number | string;
  prsMerged: number | string;
  openIssues: number | string;
  activeRepos: number | string;
}

export default function StatsGrid({
  totalCommits,
  prsMerged,
  openIssues,
  activeRepos,
}: StatsGridProps) {
  const { isCompleted, completeStep: completeStep5 } = useSequenceStep(5);
  const [activeCardIndex, setActiveCardIndex] = useState(() => (isCompleted ? 4 : 0));

  useEffect(() => {
    if (isCompleted) {
      const t = setTimeout(() => setActiveCardIndex(4), 0);
      return () => clearTimeout(t);
    }
  }, [isCompleted]);

  useEffect(() => {
    if (activeCardIndex >= 4) {
      completeStep5();
      return;
    }

    const timer = setTimeout(() => {
      setActiveCardIndex((prev) => prev + 1);
    }, 150);

    return () => clearTimeout(timer);
  }, [activeCardIndex, completeStep5]);

  const formatVal = (val: number | string) => {
    return typeof val === 'number' ? val.toLocaleString() : val;
  };

  const STAT_ITEMS = [
    { key: 'total_commits', label: 'total_commits', val: formatVal(totalCommits) },
    { key: 'prs_merged', label: 'prs_merged', val: formatVal(prsMerged) },
    { key: 'open_issues', label: 'open_issues', val: formatVal(openIssues) },
    { key: 'active_repos', label: 'active_repos', val: formatVal(activeRepos) },
  ];

  return (
    <div className="border-term-border bg-term-block grid grid-cols-2 gap-0 rounded border border-dashed font-mono lg:grid-cols-4">
      {STAT_ITEMS.map((item, idx) => {
        const isVisible = idx < activeCardIndex;
        const isLastRowMobile = idx >= 2;
        const isLastColDesktop = idx === 3;
        const isBorderRight = idx % 2 === 0 || (idx === 1 && false);

        return (
          <div
            key={item.key}
            className={`p-4 transition-all duration-300 ease-out ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
            } ${isBorderRight ? 'border-term-border border-r border-dashed' : ''} ${
              !isLastRowMobile ? 'border-term-border border-b border-dashed lg:border-b-0' : ''
            } ${!isLastColDesktop ? 'lg:border-term-border lg:border-r lg:border-dashed' : ''}`}
          >
            <div className="text-term-dim text-[10px]">{item.label}</div>
            <div className="text-term-accent mt-1 text-xl font-bold">{item.val}</div>
          </div>
        );
      })}
    </div>
  );
}
