'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Loader2, Search, Check, AlertCircle, Lock, Globe, ExternalLink } from 'lucide-react';
import type { Repository } from '@/types/github';

interface SettingsRepo extends Omit<
  Repository,
  'updatedAt' | 'lastCommitAt' | 'syncedAt' | 'repoId'
> {
  repoId: string;
  excludedByUser: boolean;
}

export default function RepositoriesSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const [repos, setRepos] = useState<SettingsRepo[]>([]);
  const [initialRepos, setInitialRepos] = useState<SettingsRepo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchRepos() {
      if (!user) return;
      try {
        const reposRef = collection(db, `users/${user.uid}/repos`);
        const querySnap = await getDocs(reposRef);

        const loadedRepos: SettingsRepo[] = [];
        querySnap.forEach((docSnap) => {
          const data = docSnap.data();
          loadedRepos.push({
            repoId: docSnap.id,
            name: data.name || '',
            url: data.url || '',
            isPrivate: data.isPrivate || false,
            ownerLogin: data.ownerLogin || '',
            ownerType: data.ownerType || 'user',
            stargazerCount: data.stargazerCount || 0,
            forkCount: data.forkCount || 0,
            primaryLanguage: data.primaryLanguage || null,
            commitCount: data.commitCount || 0,
            excludedByUser: data.excludedByUser || false,
          });
        });

        // Sort: Included first, then by commit count desc
        loadedRepos.sort((a, b) => {
          if (a.excludedByUser !== b.excludedByUser) {
            return a.excludedByUser ? 1 : -1;
          }
          return b.commitCount - a.commitCount;
        });

        setRepos(loadedRepos);
        setInitialRepos(JSON.parse(JSON.stringify(loadedRepos)));
      } catch (err) {
        console.error('Failed to load user repositories:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRepos();
  }, [user]);

  const isDirty = JSON.stringify(repos) !== JSON.stringify(initialRepos);

  const handleToggleExclude = (repoId: string) => {
    setRepos((prev) =>
      prev.map((r) => (r.repoId === repoId ? { ...r, excludedByUser: !r.excludedByUser } : r))
    );
  };

  const handleSave = async () => {
    if (!user || !isDirty) return;
    setSaving(true);
    setSaveStatus('idle');

    try {
      const batch = writeBatch(db);

      // Save only changed repository documents
      const changedRepos = repos.filter((r, idx) => {
        return r.excludedByUser !== initialRepos[idx]?.excludedByUser;
      });

      for (const repo of changedRepos) {
        const repoRef = doc(db, `users/${user.uid}/repos/${repo.repoId}`);
        batch.set(repoRef, { excludedByUser: repo.excludedByUser }, { merge: true });
      }

      await batch.commit();
      setInitialRepos(JSON.parse(JSON.stringify(repos)));
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (err) {
      console.error('Failed to save repository selections:', err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } finally {
      setSaving(false);
    }
  };

  const filteredRepos = repos.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div>
          <Skeleton className="mb-2 h-8 w-64 bg-white/5" />
          <Skeleton className="h-4 w-96 bg-white/5" />
        </div>
        <Separator className="bg-white/10" />
        <div className="space-y-6">
          <Skeleton className="h-12 w-full bg-white/5" />
          <Skeleton className="h-16 w-full bg-white/5" />
          <Skeleton className="h-16 w-full bg-white/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24">
      <div>
        <h1 className="mb-2 font-sans text-2xl font-bold text-white">Repositories</h1>
        <p className="text-sm text-white/40">
          Exclude specific repositories from being analyzed for your activity score and insights.
        </p>
      </div>

      <Separator className="bg-white/10" />

      {/* Search Input */}
      <div className="relative max-w-md">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
          <Search size={16} className="text-white/40" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search repositories..."
          className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pr-4 pl-10 font-mono text-sm text-white placeholder:text-white/20 focus:border-[#1D9E75] focus:outline-none"
        />
      </div>

      {/* Repositories List */}
      <div className="space-y-4">
        {filteredRepos.length === 0 ? (
          <p className="py-6 text-center font-mono text-sm text-white/20">
            {searchQuery ? 'No matching repositories found.' : 'No repositories connected yet.'}
          </p>
        ) : (
          filteredRepos.map((repo) => (
            <div
              key={repo.repoId}
              className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-white/3 p-4 transition-colors hover:bg-white/5"
            >
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <div className="mt-1 flex shrink-0 items-center justify-center text-white/40">
                  {repo.isPrivate ? (
                    <Lock size={15} className="text-[#1D9E75]/80" />
                  ) : (
                    <Globe size={15} />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-mono text-sm font-medium text-white">
                      {repo.name}
                    </span>
                    {repo.primaryLanguage && (
                      <span className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[9px] text-white/40">
                        {repo.primaryLanguage.name}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-white/40">
                    <span>{repo.commitCount} commits</span>
                    <span>•</span>
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-[#1D9E75] hover:underline"
                    >
                      GitHub <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Exclusion toggle */}
              <div className="flex items-center gap-3">
                <span className="hidden font-mono text-xs text-white/30 sm:inline">
                  {repo.excludedByUser ? 'Excluded' : 'Included'}
                </span>
                <Switch
                  checked={!repo.excludedByUser}
                  onCheckedChange={() => handleToggleExclude(repo.repoId)}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Toast Notification */}
      {saveStatus !== 'idle' && (
        <div
          className="fixed bottom-6 left-1/2 z-50 flex w-auto max-w-[90vw] -translate-x-1/2 items-center gap-3 rounded-lg border border-white/10 bg-[#141414]/90 px-4 py-3 font-mono text-xs whitespace-nowrap text-white shadow-xl shadow-black/50 backdrop-blur-md"
          style={{ transition: 'all 0.3s ease' }}
        >
          {saveStatus === 'success' ? (
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1D9E75]/15 text-[#1D9E75]">
              <Check size={11} />
            </div>
          ) : (
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-500">
              <AlertCircle size={11} />
            </div>
          )}
          <span>
            {saveStatus === 'success' ? 'Repository selections saved!' : 'Failed to save settings.'}
          </span>
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
            You have modified your repository inclusion list
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={handleSave}
            disabled={saving}
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
