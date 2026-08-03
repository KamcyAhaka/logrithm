'use client';

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
  const formatVal = (val: number | string) => {
    return typeof val === 'number' ? val.toLocaleString() : val;
  };

  return (
    <div className="grid grid-cols-2 gap-0 rounded-lg border border-[#1e2a1e] bg-[#0a0d0a] font-mono lg:grid-cols-4">
      {/* total_commits */}
      <div className="border-r border-b border-dashed border-[#1e2a1e] p-4 lg:border-b-0">
        <div className="text-[10px] text-[#5a6a5a]">total_commits</div>
        <div className="mt-1 text-xl font-bold text-[#4ade80]">{formatVal(totalCommits)}</div>
      </div>

      {/* prs_merged */}
      <div className="border-b border-dashed border-[#1e2a1e] p-4 lg:border-r lg:border-b-0">
        <div className="text-[10px] text-[#5a6a5a]">prs_merged</div>
        <div className="mt-1 text-xl font-bold text-[#4ade80]">{formatVal(prsMerged)}</div>
      </div>

      {/* open_issues */}
      <div className="border-r border-dashed border-[#1e2a1e] p-4">
        <div className="text-[10px] text-[#5a6a5a]">open_issues</div>
        <div className="mt-1 text-xl font-bold text-[#4ade80]">{formatVal(openIssues)}</div>
      </div>

      {/* active_repos */}
      <div className="p-4">
        <div className="text-[10px] text-[#5a6a5a]">active_repos</div>
        <div className="mt-1 text-xl font-bold text-[#4ade80]">{formatVal(activeRepos)}</div>
      </div>
    </div>
  );
}
