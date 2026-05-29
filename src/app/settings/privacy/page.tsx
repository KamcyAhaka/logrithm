'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { doc, getDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import type { PrivacySettingsDocument } from '@/types/github';

// Default privacy settings fallback
const DEFAULT_PRIVACY: Omit<PrivacySettingsDocument, 'updatedAt'> = {
  analysis: { includePrivatePersonal: true, includeOrgRepos: false },
  display: {
    showPrivateRepoNames: false,
    showOrgRepoNames: false,
    shareCardDataScope: 'public_only',
  },
  profile: { showScore: true, showLanguages: true, showRepoList: true, displayStyle: 'card' },
};

interface PrivacyFormState {
  analysis: {
    includePrivatePersonal: boolean;
    includeOrgRepos: boolean;
  };
  display: {
    shareCardDataScope: 'public_only' | 'aggregated';
  };
  profile: {
    isPublic: boolean;
    showScore: boolean;
    showLanguages: boolean;
    showRepoList: boolean;
    displayStyle: 'full' | 'card';
  };
}

export default function PrivacySettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const [savedState, setSavedState] = useState<PrivacyFormState | null>(null);
  const [currentState, setCurrentState] = useState<PrivacyFormState | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const privacyRef = doc(db, `users/${user.uid}/settings/privacy`);
        const profileRef = doc(db, `users/${user.uid}/profile/data`);

        const [privacySnap, profileSnap] = await Promise.all([
          getDoc(privacyRef),
          getDoc(profileRef),
        ]);

        const privacyData = privacySnap.exists()
          ? (privacySnap.data() as PrivacySettingsDocument)
          : DEFAULT_PRIVACY;

        const isPublic = profileSnap.exists() ? !!profileSnap.data()?.isPublic : false;

        const initialState: PrivacyFormState = {
          analysis: {
            includePrivatePersonal:
              privacyData.analysis.includePrivatePersonal ??
              DEFAULT_PRIVACY.analysis.includePrivatePersonal,
            includeOrgRepos:
              privacyData.analysis.includeOrgRepos ?? DEFAULT_PRIVACY.analysis.includeOrgRepos,
          },
          display: {
            shareCardDataScope:
              privacyData.display.shareCardDataScope ?? DEFAULT_PRIVACY.display.shareCardDataScope,
          },
          profile: {
            isPublic,
            showScore: privacyData.profile.showScore ?? DEFAULT_PRIVACY.profile.showScore,
            showLanguages:
              privacyData.profile.showLanguages ?? DEFAULT_PRIVACY.profile.showLanguages,
            showRepoList: privacyData.profile.showRepoList ?? DEFAULT_PRIVACY.profile.showRepoList,
            displayStyle: privacyData.profile.displayStyle ?? DEFAULT_PRIVACY.profile.displayStyle,
          },
        };

        setSavedState(initialState);
        setCurrentState(initialState);
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }

    if (user) fetchData();
  }, [user]);

  const isDirty = JSON.stringify(savedState) !== JSON.stringify(currentState);

  const handleSave = async () => {
    if (!user || !currentState) return;
    setSaving(true);
    setSaveStatus('idle');

    try {
      const batch = writeBatch(db);

      const privacyRef = doc(db, `users/${user.uid}/settings/privacy`);
      batch.set(
        privacyRef,
        {
          analysis: currentState.analysis,
          display: currentState.display,
          profile: {
            showScore: currentState.profile.showScore,
            showLanguages: currentState.profile.showLanguages,
            showRepoList: currentState.profile.showRepoList,
            displayStyle: currentState.profile.displayStyle,
          },
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      const profileRef = doc(db, `users/${user.uid}/profile/data`);
      batch.set(
        profileRef,
        {
          isPublic: currentState.profile.isPublic,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      await batch.commit();

      setSavedState(currentState);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading || !currentState) {
    return (
      <div className="animate-pulse space-y-8">
        <div>
          <Skeleton className="mb-2 h-8 w-64 bg-white/5" />
          <Skeleton className="h-4 w-96 bg-white/5" />
        </div>
        <Separator className="bg-white/10" />
        <div className="space-y-6">
          <Skeleton className="h-16 w-full bg-white/5" />
          <Skeleton className="h-16 w-full bg-white/5" />
          <Skeleton className="h-16 w-full bg-white/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="mb-2 font-sans text-2xl font-bold text-white">Privacy & Visibility</h1>
        <p className="text-sm text-white/40">
          Control what Logrithm analyses and what others can see.
        </p>
      </div>

      {/* Analysis Section */}
      <section>
        <h2 className="mb-1 text-lg font-medium text-white">Analysis</h2>
        <p className="mb-6 text-sm text-white/40">
          Choose which repositories are included when generating your insights.
        </p>

        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <label className="text-sm font-medium text-white">
                Include your own private repos in analysis
              </label>
              <p className="mt-1 text-sm text-white/40">
                Your private repos stay private — only commit metadata is used, never code.
              </p>
            </div>
            <Switch
              checked={currentState.analysis.includePrivatePersonal}
              onCheckedChange={(checked) =>
                setCurrentState({
                  ...currentState,
                  analysis: { ...currentState.analysis, includePrivatePersonal: checked },
                })
              }
            />
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <label className="text-sm font-medium text-white">
                Include org repos you&apos;ve contributed to
              </label>
              <p className="mt-1 text-sm text-white/40">
                Organisation repos are excluded by default. Enable only if you own or have
                permission to analyse them.
              </p>
            </div>
            <Switch
              checked={currentState.analysis.includeOrgRepos}
              onCheckedChange={(checked) =>
                setCurrentState({
                  ...currentState,
                  analysis: { ...currentState.analysis, includeOrgRepos: checked },
                })
              }
            />
          </div>
        </div>
        <Separator className="mt-8 mb-8 bg-white/10" />
      </section>

      {/* Profile Section */}
      <section id="profile-visibility">
        <h2 className="mb-1 text-lg font-medium text-white">Profile</h2>
        <p className="mb-6 text-sm text-white/40">Control what appears on your public profile.</p>

        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <label className="text-sm font-medium text-white">
                Make your profile publicly accessible
              </label>
              <p className="mt-1 text-sm text-white/40">
                When enabled, anyone with your profile link can view your insights.
              </p>
            </div>
            <Switch
              checked={currentState.profile.isPublic}
              onCheckedChange={(checked) =>
                setCurrentState({
                  ...currentState,
                  profile: { ...currentState.profile, isPublic: checked },
                })
              }
            />
          </div>

          <div className="flex items-start justify-between gap-4 opacity-90">
            <div>
              <label className="text-sm font-medium text-white">
                Display your activity score on your profile
              </label>
            </div>
            <Switch
              checked={currentState.profile.showScore}
              onCheckedChange={(checked) =>
                setCurrentState({
                  ...currentState,
                  profile: { ...currentState.profile, showScore: checked },
                })
              }
              disabled={!currentState.profile.isPublic}
            />
          </div>

          <div className="flex items-start justify-between gap-4 opacity-90">
            <div>
              <label className="text-sm font-medium text-white">
                Display your top languages on your profile
              </label>
            </div>
            <Switch
              checked={currentState.profile.showLanguages}
              onCheckedChange={(checked) =>
                setCurrentState({
                  ...currentState,
                  profile: { ...currentState.profile, showLanguages: checked },
                })
              }
              disabled={!currentState.profile.isPublic}
            />
          </div>

          <div className="flex items-start justify-between gap-4 opacity-90">
            <div>
              <label className="text-sm font-medium text-white">
                Display your active repositories on your profile
              </label>
            </div>
            <Switch
              checked={currentState.profile.showRepoList}
              onCheckedChange={(checked) =>
                setCurrentState({
                  ...currentState,
                  profile: { ...currentState.profile, showRepoList: checked },
                })
              }
              disabled={!currentState.profile.isPublic}
            />
          </div>

          <div className="pt-4 opacity-90">
            <label className="mb-4 block text-sm font-medium text-white">Profile Style</label>
            <RadioGroup
              value={currentState.profile.displayStyle}
              onValueChange={(val: 'full' | 'card') =>
                setCurrentState({
                  ...currentState,
                  profile: { ...currentState.profile, displayStyle: val },
                })
              }
              disabled={!currentState.profile.isPublic}
              className="space-y-4"
            >
              <div className="flex items-start space-x-3">
                <RadioGroupItem
                  value="full"
                  id="style_full"
                  className="mt-1 border-white/40 text-[#1D9E75]"
                />
                <div className="grid gap-1.5">
                  <label
                    htmlFor="style_full"
                    className="cursor-pointer text-sm leading-none font-medium text-white"
                  >
                    Full Profile
                  </label>
                  <p className="text-sm text-white/40">
                    A comprehensive view with detailed statistics, charts, and activity.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <RadioGroupItem
                  value="card"
                  id="style_card"
                  className="mt-1 border-white/40 text-[#1D9E75]"
                />
                <div className="grid gap-1.5">
                  <label
                    htmlFor="style_card"
                    className="cursor-pointer text-sm leading-none font-medium text-white"
                  >
                    Summary Card
                  </label>
                  <p className="text-sm text-white/40">
                    A compact, shareable overview of your GitHub activity.
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>
        </div>
        <Separator className="mt-8 mb-8 bg-white/10" />
      </section>

      {/* Sharing Section */}
      <section>
        <h2 className="mb-1 text-lg font-medium text-white">Sharing</h2>
        <p className="mb-6 text-sm text-white/40">
          Control what data appears in shared insight cards.
        </p>

        <RadioGroup
          value={currentState.display.shareCardDataScope}
          onValueChange={(val: 'public_only' | 'aggregated') =>
            setCurrentState({
              ...currentState,
              display: { ...currentState.display, shareCardDataScope: val },
            })
          }
          className="space-y-4"
        >
          <div className="flex items-start space-x-3">
            <RadioGroupItem
              value="public_only"
              id="public_only"
              className="mt-1 border-white/40 text-[#1D9E75]"
            />
            <div className="grid gap-1.5">
              <label
                htmlFor="public_only"
                className="cursor-pointer text-sm leading-none font-medium text-white"
              >
                Public data only
              </label>
              <p className="text-sm text-white/40">
                Shared cards only include stats from public repositories.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <RadioGroupItem
              value="aggregated"
              id="aggregated"
              className="mt-1 border-white/40 text-[#1D9E75]"
            />
            <div className="grid gap-1.5">
              <label
                htmlFor="aggregated"
                className="cursor-pointer text-sm leading-none font-medium text-white"
              >
                Aggregated totals
              </label>
              <p className="text-sm text-white/40">
                Shared cards include combined totals from all analysed repos without revealing
                private repo names.
              </p>
            </div>
          </div>
        </RadioGroup>
        <Separator className="mt-8 mb-8 bg-white/10" />
      </section>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <Button
          onClick={handleSave}
          disabled={!isDirty || saving}
          className="min-w-[140px] bg-[#1D9E75] font-mono text-sm text-white hover:bg-[#1D9E75]/90"
        >
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {!isDirty && !saving ? 'No changes' : 'Save changes'}
        </Button>
        {saveStatus === 'success' && <span className="text-sm text-[#1D9E75]">Saved ✓</span>}
        {saveStatus === 'error' && (
          <span className="text-sm text-red-500">Failed to save. Try again.</span>
        )}
      </div>
    </div>
  );
}
