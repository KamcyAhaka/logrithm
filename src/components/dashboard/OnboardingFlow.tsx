import { useState } from 'react';
import type { GitHubActivity, Repository } from '@/types/github';
import { db } from '@/lib/firebase';
import { doc, writeBatch } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { Check, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingFlowProps {
  activity: GitHubActivity;
  onComplete: () => void;
}

export default function OnboardingFlow({ activity, onComplete }: OnboardingFlowProps) {
  const { user } = useAuth();
  const [selectedRepos, setSelectedRepos] = useState<Set<string>>(
    new Set(activity.repositories.map((r) => String(r.repoId ?? r.name)))
  );
  const [isSaving, setIsSaving] = useState(false);

  const toggleRepo = (repoId: string) => {
    const next = new Set(selectedRepos);
    if (next.has(repoId)) {
      next.delete(repoId);
    } else {
      next.add(repoId);
    }
    setSelectedRepos(next);
  };

  const handleContinue = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      const batch = writeBatch(db);

      // Find repos that were deselected
      const unselectedRepos = activity.repositories.filter(
        (r) => !selectedRepos.has(String(r.repoId ?? r.name))
      );

      // Mark unselected repos as excludedByUser: true
      for (const repo of unselectedRepos) {
        const repoId = String(repo.repoId ?? repo.name);
        const repoRef = doc(db, `users/${user.uid}/repos/${repoId}`);
        batch.set(repoRef, { excludedByUser: true }, { merge: true });
      }

      // Mark onboarding as complete
      const profileRef = doc(db, `users/${user.uid}/profile/data`);
      batch.set(profileRef, { onboardingCompleted: true }, { merge: true });

      await batch.commit();
      onComplete();
    } catch (err) {
      console.error('[OnboardingFlow] Failed to save selection:', err);
      // In case of error, still allow them to proceed so they aren't stuck
      onComplete();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2rem 1rem',
        maxWidth: 600,
        margin: '0 auto',
        width: '100%',
        minHeight: '80vh',
        justifyContent: 'center',
      }}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          <h2
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1.25rem',
              color: 'var(--text-primary)',
              marginBottom: '0.5rem',
            }}
          >
            Select Repositories
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Choose which repositories you want Logrithm to analyze to generate your insights. You
            can always change this later in Settings.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            maxHeight: '400px',
            overflowY: 'auto',
            paddingRight: '0.5rem',
          }}
        >
          {activity.repositories.map((repo) => {
            const id = String(repo.repoId ?? repo.name);
            const isSelected = selectedRepos.has(id);
            return (
              <div
                key={id}
                onClick={() => toggleRepo(id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.875rem 1rem',
                  background: isSelected ? 'rgba(29, 158, 117, 0.1)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${
                    isSelected ? 'rgba(29, 158, 117, 0.4)' : 'rgba(255,255,255,0.05)'
                  }`,
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  gap: '1rem',
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    border: `1px solid ${isSelected ? 'var(--green)' : 'rgba(255,255,255,0.2)'}`,
                    background: isSelected ? 'var(--green)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isSelected && <Check size={14} color="#000" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {repo.name}
                  </p>
                </div>
                {repo.primaryLanguage && (
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {repo.primaryLanguage.name}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            padding: '1rem',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '0.5rem',
            border: '1px solid rgba(255,255,255,0.05)',
            marginTop: '0.5rem',
          }}
        >
          <Lock size={16} color="var(--text-muted)" style={{ marginTop: 2 }} />
          <div>
            <p
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-primary)',
                marginBottom: '0.25rem',
                fontWeight: 500,
              }}
            >
              Your data is private by default
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Only you can see your insights. To share your profile or insight cards with others,
              you must explicitly opt-in by making your profile public in Settings.
            </p>
          </div>
        </div>

        <Button
          onClick={handleContinue}
          disabled={isSaving}
          className="w-full bg-[#1D9E75] font-mono text-white hover:bg-[#1D9E75]/90"
          style={{ marginTop: '0.5rem' }}
        >
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Continue to Dashboard
        </Button>
      </div>
    </div>
  );
}
