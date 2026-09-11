interface PrStatsCardProps {
  totalPRs: number;
  totalIssues: number;
}

export default function PrStatsCard({ totalPRs, totalIssues }: PrStatsCardProps) {
  const totalCollaborations = totalPRs + totalIssues;
  const prPercentage =
    totalCollaborations > 0 ? Math.round((totalPRs / totalCollaborations) * 100) : 0;
  const issuePercentage =
    totalCollaborations > 0 ? Math.round((totalIssues / totalCollaborations) * 100) : 0;

  const totalBlocks = 24;
  const prBlocks = Math.round((prPercentage / 100) * totalBlocks);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      <div
        style={{
          color: '#5a6a5a',
          fontFamily: 'var(--font-mono), monospace',
          fontSize: '11px',
          marginBottom: '0.5rem',
        }}
      >
        $ logrithm stats --collaboration
      </div>

      <div className="border-term-border grid grid-cols-2 border border-dashed font-mono">
        {/* PRs Merged */}
        <div className="border-term-border flex flex-col justify-center border-r border-dashed p-4">
          <div className="text-term-dim text-[10px]">prs_merged</div>
          <div className="text-term-accent mt-1 text-xl font-bold">{totalPRs}</div>
        </div>

        {/* Issues Opened */}
        <div className="flex flex-col justify-center p-4">
          <div className="text-term-dim text-[10px]">issues_opened</div>
          <div className="text-term-accent mt-1 text-xl font-bold">{totalIssues}</div>
        </div>
      </div>

      {totalCollaborations > 0 && (
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.7rem',
              color: '#5a6a5a',
              fontFamily: 'var(--font-mono), monospace',
            }}
          >
            <span>PRs ({prPercentage}%)</span>
            <span>Issues ({issuePercentage}%)</span>
          </div>

          <div className="bg-term-block border-term-border flex w-full justify-between rounded-[2px] border p-[1.5px] font-mono">
            {Array.from({ length: totalBlocks }).map((_, i) => {
              const isPR = i < prBlocks;
              return (
                <div
                  key={i}
                  className={`h-3 w-1 shrink-0 sm:w-1.5 ${isPR ? 'bg-term-accent' : 'bg-term-dim'}`}
                  style={{ marginRight: i < totalBlocks - 1 ? '1px' : '0' }}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
