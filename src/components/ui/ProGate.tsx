'use client';

import { usePlan } from '@/hooks/usePlan';
import { isProUpgradeDisabled, type PlanFeatureKey } from '@/lib/planGating';

interface ProGateProps {
  /** The feature key this gate is protecting (for the upgrade prompt label) */
  feature: string;
  /** Optional: check a specific canXxx flag instead of just isPro */
  requires?: Extract<PlanFeatureKey, `can${string}`>;
  children: React.ReactNode;
  /** Optional: render something specific instead of the default UpgradePrompt */
  fallback?: React.ReactNode;
}

export function ProGate({ feature, requires, children, fallback }: ProGateProps) {
  const { isPro, can } = usePlan();

  const hasAccess = requires ? can(requires) : isPro;

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return <UpgradePrompt feature={feature} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Inline UpgradePrompt — kept in same file for colocation
// ─────────────────────────────────────────────────────────────────────────────

interface UpgradePromptProps {
  feature: string;
}

function UpgradePrompt({ feature }: UpgradePromptProps) {
  const disabled = isProUpgradeDisabled();

  return (
    <div
      className="rounded-lg border px-4 py-3 text-sm"
      style={{
        borderColor: disabled ? 'rgba(168,85,247,0.3)' : 'var(--green)',
        background: disabled ? 'rgba(168,85,247,0.05)' : 'rgba(29,158,117,0.05)',
      }}
    >
      <div className="flex items-start gap-3">
        <span
          style={{ color: disabled ? '#A855F7' : 'var(--green)', fontSize: '1rem', lineHeight: 1 }}
        >
          🔒
        </span>
        <div>
          <p
            className="font-medium"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
          >
            {feature} is available on Pro
          </p>
          <p className="mt-0.5" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Unlock unlimited analysis, all insight cards, and more.
          </p>
          {disabled ? (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/5 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-purple-400">
              <span className="h-1 w-1 animate-pulse rounded-full bg-purple-400" />
              Pro Coming Soon
            </div>
          ) : (
            <a
              href="/settings/account"
              className="mt-2 inline-block text-xs font-medium"
              style={{ color: 'var(--green)', fontFamily: 'var(--font-mono)' }}
            >
              Upgrade to Pro →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
