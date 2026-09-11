interface WrappedCardProps {
  totalCommits: number;
  activeRepos: number;
  languageTotals: Record<string, number>;
}

export default function WrappedCard({
  totalCommits,
  activeRepos,
  languageTotals,
}: WrappedCardProps) {
  // Language percentage calculations
  const totalCommitLanguages = Object.values(languageTotals).reduce((a, b) => a + b, 0) || 1;
  const sortedLanguages = Object.entries(languageTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({
      name,
      percentage: Math.round((count / totalCommitLanguages) * 100),
    }));

  const LANG_COLORS = ['#4ade80', '#3b82f6', '#f59e0b'];

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
        $ logrithm wrapped --year
      </div>

      <div className="border-term-border grid grid-cols-2 border border-dashed font-mono">
        {/* Stat Column */}
        <div className="border-term-border flex flex-col border-r border-dashed">
          {/* Total Commits */}
          <div className="border-term-border flex flex-1 flex-col justify-center border-b border-dashed p-4">
            <div className="text-term-dim text-[10px]">total_commits</div>
            <div className="text-term-accent mt-1 text-xl font-bold">
              {totalCommits.toLocaleString()}
            </div>
          </div>
          {/* Active Repos */}
          <div className="flex flex-1 flex-col justify-center p-4">
            <div className="text-term-dim text-[10px]">active_repos</div>
            <div className="text-term-accent mt-1 text-xl font-bold">
              {activeRepos.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Language Column */}
        <div className="flex flex-col justify-center gap-3 p-4">
          <div className="text-term-dim text-[10px]">top_languages</div>

          {sortedLanguages.length > 0 ? (
            <div className="flex flex-col gap-3">
              {/* Multi-segment horizontal progress bar */}
              <div className="border-term-border bg-term-bg flex h-3 w-full overflow-hidden rounded-[1px] border p-[1.5px]">
                {sortedLanguages.map((lang, i) => (
                  <div
                    key={lang.name}
                    style={{
                      width: `${lang.percentage}%`,
                      backgroundColor: LANG_COLORS[i % LANG_COLORS.length],
                    }}
                    className="h-full"
                  />
                ))}
              </div>

              {/* Language list legend */}
              <div className="flex flex-col gap-1">
                {sortedLanguages.map((lang, i) => (
                  <div key={lang.name} className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: LANG_COLORS[i % LANG_COLORS.length] }}
                      />
                      <span className="text-term-light font-medium">{lang.name}</span>
                    </div>
                    <span className="text-term-dim">{lang.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-term-dim text-xs">No language data</div>
          )}
        </div>
      </div>
    </div>
  );
}
