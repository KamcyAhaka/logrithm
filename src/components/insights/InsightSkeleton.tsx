export default function InsightSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '50%' }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 14, width: '55%', marginBottom: 6 }} />
          <div className="skeleton" style={{ height: 11, width: '35%' }} />
        </div>
        <div className="skeleton" style={{ height: 22, width: 72, borderRadius: 999 }} />
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div className="skeleton" style={{ height: 12, width: '100%' }} />
        <div className="skeleton" style={{ height: 12, width: '90%' }} />
        <div className="skeleton" style={{ height: 12, width: '75%' }} />
      </div>

      {/* Tags row */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {[72, 88, 64, 96, 80].map((w, i) => (
          <div key={i} className="skeleton" style={{ height: 22, width: w, borderRadius: 999 }} />
        ))}
      </div>

      {/* Strengths */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton" style={{ height: 40, borderRadius: '0.5rem' }} />
        ))}
      </div>
    </div>
  );
}
