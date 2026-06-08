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
import { Loader2, Check, AlertCircle } from 'lucide-react';
import type { PrivacySettingsDocument } from '@/types/github';

// Default privacy settings fallback
const DEFAULT_PRIVACY: Omit<PrivacySettingsDocument, 'updatedAt'> = {
  analysis: { includePrivatePersonal: true, includeOrgRepos: false },
  display: {
    showPrivateRepoNames: false,
    showOrgRepoNames: false,
    shareCardDataScope: 'public_only',
    includeInComparisons: true,
    showComparisonOnProfile: false,
  },
  profile: { showScore: true, showLanguages: true, showRepoList: true, displayStyle: 'card' },
};

interface PrivacyFormState {
  analysis: {
    includePrivatePersonal: boolean;
    includeOrgRepos: boolean;
  };
  display: {
    showPrivateRepoNames: boolean;
    showOrgRepoNames: boolean;
    shareCardDataScope: 'public_only' | 'aggregated';
    includeInComparisons: boolean;
    showComparisonOnProfile: boolean;
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
  const [userPlan, setUserPlan] = useState<'free' | 'pro'>('free');
  const [githubLogin, setGithubLogin] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

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
        const plan = profileSnap.exists() ? (profileSnap.data()?.plan ?? 'free') : 'free';
        const login = profileSnap.exists() ? (profileSnap.data()?.githubLogin ?? null) : null;
        setUserPlan(plan);
        setGithubLogin(login);

        const initialState: PrivacyFormState = {
          analysis: {
            includePrivatePersonal:
              privacyData.analysis.includePrivatePersonal ??
              DEFAULT_PRIVACY.analysis.includePrivatePersonal,
            includeOrgRepos:
              privacyData.analysis.includeOrgRepos ?? DEFAULT_PRIVACY.analysis.includeOrgRepos,
          },
          display: {
            showPrivateRepoNames:
              privacyData.display?.showPrivateRepoNames ??
              DEFAULT_PRIVACY.display.showPrivateRepoNames,
            showOrgRepoNames:
              privacyData.display?.showOrgRepoNames ?? DEFAULT_PRIVACY.display.showOrgRepoNames,
            shareCardDataScope:
              privacyData.display?.shareCardDataScope ?? DEFAULT_PRIVACY.display.shareCardDataScope,
            includeInComparisons:
              privacyData.display?.includeInComparisons ??
              DEFAULT_PRIVACY.display.includeInComparisons,
            showComparisonOnProfile:
              privacyData.display?.showComparisonOnProfile ??
              DEFAULT_PRIVACY.display.showComparisonOnProfile,
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
          display: {
            showPrivateRepoNames: currentState.display.showPrivateRepoNames,
            showOrgRepoNames: currentState.display.showOrgRepoNames,
            shareCardDataScope: currentState.display.shareCardDataScope,
            includeInComparisons: currentState.display.includeInComparisons,
            showComparisonOnProfile: currentState.display.showComparisonOnProfile,
          },
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
    <div className="space-y-8 pb-24">
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
              {currentState.profile.isPublic && githubLogin && (
                <div className="mt-3 space-y-2 font-mono text-xs">
                  <div className="rounded-lg border border-white/5 bg-white/5 p-3">
                    <div className="mb-1 text-[10px] tracking-wider text-white/30 uppercase">
                      Public Profile Link
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="truncate text-white/60">
                        {typeof window !== 'undefined'
                          ? `${window.location.origin}/u/${githubLogin}`
                          : `https://logrithm.dev/u/${githubLogin}`}
                      </span>
                      <button
                        onClick={async () => {
                          const url =
                            typeof window !== 'undefined'
                              ? `${window.location.origin}/u/${githubLogin}`
                              : `https://logrithm.dev/u/${githubLogin}`;
                          try {
                            await navigator.clipboard.writeText(url);
                            setToastMessage({ type: 'success', text: 'Profile link copied!' });
                            setTimeout(() => setToastMessage(null), 2500);
                          } catch {
                            setToastMessage({ type: 'error', text: 'Failed to copy link.' });
                            setTimeout(() => setToastMessage(null), 2500);
                          }
                        }}
                        className="cursor-pointer text-[#1D9E75] hover:text-[#1D9E75]/80 hover:underline"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div className="rounded-lg border border-white/5 bg-white/5 p-3">
                    <div className="mb-1 text-[10px] tracking-wider text-white/30 uppercase">
                      Share Card Builder Link
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="truncate text-white/60">
                        {typeof window !== 'undefined'
                          ? `${window.location.origin}/share/${githubLogin}`
                          : `https://logrithm.dev/share/${githubLogin}`}
                      </span>
                      <button
                        onClick={async () => {
                          const url =
                            typeof window !== 'undefined'
                              ? `${window.location.origin}/share/${githubLogin}`
                              : `https://logrithm.dev/share/${githubLogin}`;
                          try {
                            await navigator.clipboard.writeText(url);
                            setToastMessage({ type: 'success', text: 'Share card link copied!' });
                            setTimeout(() => setToastMessage(null), 2500);
                          } catch {
                            setToastMessage({ type: 'error', text: 'Failed to copy link.' });
                            setTimeout(() => setToastMessage(null), 2500);
                          }
                        }}
                        className="cursor-pointer text-[#1D9E75] hover:text-[#1D9E75]/80 hover:underline"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              )}
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

        <div className="space-y-6">
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
                  Shared cards include combined totals from all analysed repos. You can choose
                  whether to reveal private or organization repo names below.
                </p>
              </div>
            </div>
          </RadioGroup>

          <div className="space-y-6 pt-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <label className="text-sm font-medium text-white">
                  Show private repository names
                </label>
                <p className="mt-1 text-sm text-white/40">
                  When enabled, names of private repositories are shown on your public profile or
                  shared cards. When disabled, they are masked (e.g., &quot;private-repo&quot;).
                </p>
              </div>
              <Switch
                checked={currentState.display.showPrivateRepoNames}
                onCheckedChange={(checked) =>
                  setCurrentState({
                    ...currentState,
                    display: { ...currentState.display, showPrivateRepoNames: checked },
                  })
                }
              />
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <label className="text-sm font-medium text-white">
                  Show organization repository names
                </label>
                <p className="mt-1 text-sm text-white/40">
                  When enabled, names of organization repositories are shown on your public profile
                  or shared cards. When disabled, they are masked (e.g., &quot;org-repo&quot;).
                </p>
              </div>
              <Switch
                checked={currentState.display.showOrgRepoNames}
                onCheckedChange={(checked) =>
                  setCurrentState({
                    ...currentState,
                    display: { ...currentState.display, showOrgRepoNames: checked },
                  })
                }
              />
            </div>
          </div>
        </div>
        <Separator className="mt-8 mb-8 bg-white/10" />
      </section>

      {/* Comparisons Section */}
      <section>
        <h2 className="mb-1 text-lg font-medium text-white">Comparisons</h2>
        <p className="mb-6 text-sm text-white/40">
          Compare your activity score with global peers, countries, and languages.
        </p>

        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <label className="text-sm font-medium text-white">
                Include in global and segment-specific comparisons (anonymous)
              </label>
              <p className="mt-1 text-sm text-white/40">
                When enabled, your anonymised scores are factored into aggregate performance
                statistics. Disabling this excludes you from all leaderboards and comparisons.
              </p>
            </div>
            <Switch
              checked={currentState.display.includeInComparisons}
              onCheckedChange={(checked) =>
                setCurrentState({
                  ...currentState,
                  display: { ...currentState.display, includeInComparisons: checked },
                })
              }
            />
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-white">
                  Display peer comparisons on your profile
                </label>
                {userPlan !== 'pro' && (
                  <span className="rounded bg-[#1D9E75]/10 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-[#1D9E75] uppercase">
                    PRO
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-white/40">
                Show how your score compares against the global average directly on your public
                profile.
              </p>
              {userPlan !== 'pro' && (
                <a
                  href="/settings/account"
                  className="mt-1 inline-block animate-pulse text-xs text-[#1D9E75] hover:underline"
                >
                  Upgrade to Pro to display comparison card on your profile →
                </a>
              )}
            </div>
            <Switch
              checked={currentState.display.showComparisonOnProfile && userPlan === 'pro'}
              disabled={userPlan !== 'pro'}
              onCheckedChange={(checked) =>
                setCurrentState({
                  ...currentState,
                  display: { ...currentState.display, showComparisonOnProfile: checked },
                })
              }
            />
          </div>
        </div>
        <Separator className="mt-8 mb-8 bg-white/10" />
      </section>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className="fixed bottom-6 left-1/2 z-50 flex w-auto max-w-[90vw] -translate-x-1/2 items-center gap-3 rounded-lg border border-white/10 bg-[#141414]/90 px-4 py-3 font-mono text-xs whitespace-nowrap text-white shadow-xl shadow-black/50 backdrop-blur-md"
          style={{ transition: 'all 0.3s ease' }}
        >
          {toastMessage.type === 'success' ? (
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1D9E75]/15 text-[#1D9E75]">
              <Check size={11} />
            </div>
          ) : (
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-500">
              <AlertCircle size={11} />
            </div>
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Floating Save Button Bar */}
      <div
        className={`fixed right-0 bottom-0 left-0 z-50 flex items-center justify-between border-t border-white/10 bg-[#0a0a0a]/90 p-4 px-6 backdrop-blur-md transition-transform duration-300 md:px-12 lg:px-24 ${
          isDirty ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex flex-col">
          <span className="text-sm font-medium text-white">Unsaved changes</span>
          <span className="hidden text-xs text-white/40 sm:block">
            You have modified your privacy settings
          </span>
        </div>
        <div className="flex items-center gap-4">
          {saveStatus === 'success' && <span className="text-sm text-[#1D9E75]">Saved ✓</span>}
          {saveStatus === 'error' && (
            <span className="text-sm text-red-500">Failed to save. Try again.</span>
          )}
          <Button
            onClick={handleSave}
            disabled={!isDirty || saving}
            className="min-w-[140px] bg-[#1D9E75] font-mono text-sm text-white hover:bg-[#1D9E75]/90"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </div>
      </div>
    </div>
  );
}
