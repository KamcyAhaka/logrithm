'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useDemoMode } from '@/hooks/useDemoMode';
import { useCheckout } from '@/hooks/useCheckout';
import { useDashboardStore } from '@/store/useDashboardStore';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
  orderBy,
  limit,
} from 'firebase/firestore';
import {
  generateGoalActionPlan,
  inviteAccountabilityPartner,
  getAccountabilityPartners,
  getPendingInvites,
  respondToAccountabilityInvite,
  getInvitedGoals,
  createGoal,
  type GoalActionPlanResult,
  type PendingInvite,
  type InvitedGoal,
} from '@/lib/functions';
import type { UserProfile, InsightObject } from '@/types/github';
import type { ComparisonStats } from '@/hooks/useComparisonStats';
import { type GoalDocument, PRESETS } from '@/types/goals';

// ─── Demo fixtures ─────────────────────────────────────────────────────────────
const DEMO_PROFILE: UserProfile = {
  githubLogin: 'demo-dev',
  displayName: 'Demo Developer',
  avatarUrl: '',
  createdAt: new Date().toISOString(),
  plan: 'pro',
  isPublic: false,
};

const DEMO_STATS: ComparisonStats = {
  p25: 30,
  p50: 45,
  p75: 65,
  p90: 85,
  mean: 44,
  totalUsers: 100,
};

const DEMO_INSIGHTS: InsightObject = {
  summary: 'Demo Full-stack developer insights',
  strengths: [],
  improvements: [],
  patterns: '',
  topLanguages: ['TypeScript', 'JavaScript'],
  activityScore: 74,
  tags: [],
  scoreBreakdown: { volume: 60, consistency: 55, collaboration: 48, diversity: 42, momentum: 38 },
};

const DEMO_PENDING_INVITES: PendingInvite[] = [
  {
    goalId: 'demo-invite-1',
    goalOwnerUid: 'demo-owner-1',
    ownerUsername: 'git_guru',
    ownerAvatarUrl: '',
    targetScore: 85,
    targetLabel: 'Great',
  },
];

const DEMO_INVITED_GOALS: InvitedGoal[] = [
  {
    id: 'demo-invited-goal-1',
    userId: 'demo-owner-2',
    ownerUsername: 'code_wizard',
    ownerAvatarUrl: '',
    ownerCurrentScore: 82,
    targetScore: 90,
    targetLabel: 'Elite',
    progressPercent: 65,
    status: 'active',
    weeklyActions: [
      'Maintain a 5-day weekly commit streak to maximize Weekly Consistency.',
      'Aim for 4 peer code reviews every week to boost Collaboration.',
    ],
    geminiSummary:
      'Code Wizard is doing fantastic, but needs a boost in Weekly Consistency and Collaboration to hit Elite status.',
    timeframeWeeks: 6,
  },
];

export function useGoals() {
  const isDemoMode = useDemoMode();
  const { user, loading: authLoading } = useAuth();
  const setPlan = useDashboardStore((s) => s.setPlan);
  const router = useRouter();

  // isPro is derived directly from Firestore (not Zustand) to survive hard refreshes
  const [isPro, setIsPro] = useState<boolean | null>(null);
  const [totalGoalsCount, setTotalGoalsCount] = useState(0);
  const [pastGoals, setPastGoals] = useState<GoalDocument[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { checkoutLoading, checkoutError, handleGetPro } = useCheckout();

  // Profile / stats / history
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [globalStats, setGlobalStats] = useState<ComparisonStats | null>(null);
  const [userInsights, setUserInsights] = useState<InsightObject | null>(null);
  const [insightsHistory, setInsightsHistory] = useState<
    Array<{ activityScore: number; generatedAt: Date }>
  >([]);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Active goal & partners
  const [activeGoal, setActiveGoal] = useState<GoalDocument | null>(null);
  const [partners, setPartners] = useState<
    Array<{ githubLogin: string; avatarUrl: string; currentScore: number }>
  >([]);
  const [loadingGoal, setLoadingGoal] = useState(true);
  const [loadingPartners, setLoadingPartners] = useState(false);

  // Wizard
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedTarget, setSelectedTarget] = useState<(typeof PRESETS)[0] | null>(null);
  const [actionPlan, setActionPlan] = useState<GoalActionPlanResult | null>(null);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [savingGoal, setSavingGoal] = useState(false);
  const [goalError, setGoalError] = useState<string | null>(null);

  // Invite modal
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  // Accountability invites & supporting goals
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [invitedGoals, setInvitedGoals] = useState<InvitedGoal[]>([]);
  const [loadingInvitedGoals, setLoadingInvitedGoals] = useState(false);
  const [processingInviteId, setProcessingInviteId] = useState<string | null>(null);

  // ─── Auth guard ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isDemoMode && !authLoading && !user) router.replace('/');
  }, [isDemoMode, authLoading, user, router]);

  // ─── Load profile / stats / history ──────────────────────────────────────
  useEffect(() => {
    if (!user?.uid && !isDemoMode) return;

    const load = async () => {
      try {
        if (isDemoMode) {
          setProfileData(DEMO_PROFILE);
          setGlobalStats(DEMO_STATS);
          setUserInsights(DEMO_INSIGHTS);
          setInsightsHistory([
            { activityScore: 70, generatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
            { activityScore: 74, generatedAt: new Date() },
          ]);
          setIsPro(true);
          return;
        }
        if (!user) return;
        const profileSnap = await getDoc(doc(db, 'users', user.uid, 'profile', 'data'));
        if (profileSnap.exists()) {
          const profile = profileSnap.data() as UserProfile;
          setProfileData(profile);
          const userIsPro = profile.plan === 'pro';
          setIsPro(userIsPro);
          setPlan(profile.plan ?? 'free');
        } else {
          setIsPro(false);
        }

        const insightSnap = await getDoc(doc(db, 'users', user.uid, 'insights', 'latest'));
        if (insightSnap.exists()) setUserInsights(insightSnap.data().data as InsightObject);

        const statsSnap = await getDoc(doc(db, 'stats', 'global'));
        if (statsSnap.exists()) setGlobalStats(statsSnap.data() as ComparisonStats);

        const histSnap = await getDocs(
          query(
            collection(db, 'users', user.uid, 'insights'),
            orderBy('generatedAt', 'desc'),
            limit(10)
          )
        );
        const historyData = histSnap.docs.map((d) => {
          const raw = d.data();
          const genAt =
            raw.generatedAt && typeof raw.generatedAt.toDate === 'function'
              ? raw.generatedAt.toDate()
              : new Date(raw.generatedAt);
          return { activityScore: raw.activityScore, generatedAt: genAt };
        });
        historyData.reverse();
        setInsightsHistory(historyData);
      } catch (err) {
        console.warn('[GoalsClient] Failed to load profile data:', err);
        setIsPro(false);
      } finally {
        setLoadingProfile(false);
      }
    };

    load();
  }, [user, isDemoMode, setPlan]);

  // ─── Load partners ────────────────────────────────────────────────────────
  const loadPartners = useCallback(
    async (goal: GoalDocument) => {
      if (isDemoMode) return;
      const invited = goal.invitedUsers || [];
      if (invited.length === 0) {
        setPartners([]);
        return;
      }
      setLoadingPartners(true);
      try {
        const res = await getAccountabilityPartners({ invitedUsers: invited });
        setPartners(res.partners);
      } catch (err) {
        console.error('[GoalsClient] Failed to load partners:', err);
      } finally {
        setLoadingPartners(false);
      }
    },
    [isDemoMode]
  );

  // ─── Load active goal ─────────────────────────────────────────────────────
  const loadActiveGoal = useCallback(async () => {
    if (isDemoMode) {
      setLoadingGoal(false);
      return;
    }
    if (!user?.uid) return;
    setLoadingGoal(true);
    try {
      const goalsSnap = await getDocs(
        query(collection(db, 'users', user.uid, 'goals'), orderBy('createdAt', 'desc'))
      );
      setTotalGoalsCount(goalsSnap.size);

      const allGoals = goalsSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as GoalDocument);
      const active = allGoals.find((g) => g.status === 'active') || null;
      const past = allGoals.filter((g) => g.status !== 'active');

      setActiveGoal(active);
      setPastGoals(past);

      if (active) {
        await loadPartners(active);
      } else {
        setPartners([]);
      }
    } catch (err) {
      console.error('[GoalsClient] Failed to load goals:', err);
    } finally {
      setLoadingGoal(false);
    }
  }, [user, isDemoMode, loadPartners]);

  useEffect(() => {
    if (!user?.uid && !isDemoMode) return;
    const run = async () => {
      await loadActiveGoal();
    };
    void run();
  }, [user, isDemoMode, loadActiveGoal]);

  // ─── Load accountability data ─────────────────────────────────────────────
  const loadAccountabilityData = useCallback(async () => {
    if (isDemoMode) {
      setPendingInvites(DEMO_PENDING_INVITES);
      setInvitedGoals(DEMO_INVITED_GOALS);
      return;
    }
    if (!user?.uid) return;

    try {
      const res = await getPendingInvites();
      setPendingInvites(res.invites || []);
    } catch (err) {
      console.error('[GoalsClient] Failed to load pending invites:', err);
    }

    setLoadingInvitedGoals(true);
    try {
      const res = await getInvitedGoals();
      setInvitedGoals(res.goals || []);
    } catch (err) {
      console.error('[GoalsClient] Failed to load invited goals:', err);
    } finally {
      setLoadingInvitedGoals(false);
    }
  }, [user, isDemoMode]);

  useEffect(() => {
    if (!user?.uid && !isDemoMode) return;
    const run = async () => {
      await loadAccountabilityData();
    };
    void run();
  }, [user, isDemoMode, loadAccountabilityData]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleRespondToInvite = async (goalId: string, ownerUid: string, accept: boolean) => {
    setProcessingInviteId(goalId);
    try {
      if (isDemoMode) {
        setPendingInvites((prev) => prev.filter((inv) => inv.goalId !== goalId));
        if (accept) {
          setInvitedGoals((prev) => [
            ...prev,
            {
              id: goalId,
              userId: ownerUid,
              ownerUsername: 'git_guru',
              ownerAvatarUrl: '',
              ownerCurrentScore: 78,
              targetScore: 85,
              targetLabel: 'Great',
              progressPercent: 40,
              status: 'active',
              weeklyActions: ['Commit daily', 'Proactive PRs'],
              geminiSummary: 'Helping Git Guru hit Great.',
              timeframeWeeks: 8,
            },
          ]);
        }
        return;
      }
      await respondToAccountabilityInvite({ goalId, ownerUid, accept });
      await loadAccountabilityData();
      await loadActiveGoal();
    } catch (err) {
      console.error('[GoalsClient] Failed to respond to invite:', err);
    } finally {
      setProcessingInviteId(null);
    }
  };

  const getPeerPoints = (weight: number, peerEst: number) => {
    if (!globalStats) return peerEst;
    const factor = globalStats.mean / 41;
    const val = Math.min(Math.max(Math.round(peerEst * factor), 10), 90);
    return Math.round((val * weight) / 10) / 10;
  };

  // ─── Derived values ───────────────────────────────────────────────────────
  const currentScore = profileData?.currentScore ?? userInsights?.activityScore ?? 0;
  const filteredPresets = PRESETS.filter((p) => p.score > currentScore);
  const scoreAtCreation = activeGoal?.scoreAtCreation ?? 0;
  const range = (activeGoal?.targetScore ?? 0) - scoreAtCreation;
  const progressPercent =
    range > 0
      ? Math.min(100, Math.max(0, Math.round(((currentScore - scoreAtCreation) / range) * 100)))
      : 0;

  const getEstimatedWeeksText = () => {
    if (!activeGoal) return '';
    if (currentScore >= activeGoal.targetScore) return 'Completed!';
    if (insightsHistory.length < 2) return 'Keep contributing to see an estimate';
    const oldest = insightsHistory[0];
    const newest = insightsHistory[insightsHistory.length - 1];
    const timeDiffWeeks =
      (newest.generatedAt.getTime() - oldest.generatedAt.getTime()) / (1000 * 60 * 60 * 24 * 7);
    const scoreDiff = newest.activityScore - oldest.activityScore;
    if (timeDiffWeeks > 0.1 && scoreDiff > 0) {
      const weeks = Math.ceil(
        (activeGoal.targetScore - currentScore) / (scoreDiff / timeDiffWeeks)
      );
      if (weeks > 0 && weeks < 100)
        return `At your current pace, you'll reach this in approximately ${weeks} weeks`;
    }
    return 'Keep contributing to see an estimate';
  };

  const handleProceedToStep2 = async () => {
    if (!selectedTarget) return;
    setStep(2);
    setGeneratingPlan(true);
    setActionPlan(null);
    setPlanError(null);
    setGoalError(null);

    const breakdown = userInsights?.scoreBreakdown || {
      volume: 0,
      consistency: 0,
      collaboration: 0,
      diversity: 0,
      momentum: 0,
    };
    const uV = Math.round((breakdown.volume * 30) / 10) / 10;
    const uC = Math.round((breakdown.consistency * 25) / 10) / 10;
    const uCo = Math.round((breakdown.collaboration * 20) / 10) / 10;
    const uD = Math.round((breakdown.diversity * 15) / 10) / 10;
    const uM = Math.round((breakdown.momentum * 10) / 10) / 10;
    const username = profileData?.githubLogin || 'developer';

    const promptText = `You (@${username}) currently have a Logrithm activity score of ${currentScore}.
Your score breakdown is:
- Commit Volume: ${uV}/30 (peer avg: ${getPeerPoints(30, 42)})
- Weekly Consistency: ${uC}/25 (peer avg: ${getPeerPoints(25, 48)})
- Collaboration: ${uCo}/20 (peer avg: ${getPeerPoints(20, 35)})
- Diversity: ${uD}/15 (peer avg: ${getPeerPoints(15, 30)})
- Momentum: ${uM}/10 (peer avg: ${getPeerPoints(10, 50)})

Your goal is to reach a score of ${selectedTarget.score}.

Calculate exactly how much each of your dimensions needs to increase to reach your target score. Then provide:
1. Your specific dimension gaps (current vs required value for each).
2. 3 to 5 concrete weekly actions you should take, tied directly to your weakest dimensions.
3. A realistic timeframe estimate in weeks assuming consistent effort.

To ensure stability across runs:
- Calculate timeframeWeeks mathematically using this formula: ceil(${selectedTarget.score} - ${currentScore}). For example, if target is 85 and current is 75.5, the score gap is 9.5 points. timeframeWeeks must be ceil(9.5) = 10.
- Never use markdown bold double asterisks (**) or single asterisks (*) anywhere in the JSON values. Use plain text only.

Return ONLY a valid JSON object with keys:
- dimensionGaps: array of objects with exactly these keys: dimension (string), current (string e.g. "18.6/30"), required (string e.g. "22.1/30"), gap (string e.g. "+3.5 pts")
- weeklyActions: array of strings (no markdown formatting or asterisks allowed)
- timeframeWeeks: number (calculated using the formula above)
- summary: string (2-3 sentences in the second-person, no markdown formatting or asterisks allowed)`;

    try {
      const result = await generateGoalActionPlan({ promptText, isDemoMode });
      setActionPlan(result);
    } catch (err: unknown) {
      console.error('[GoalsClient] Action plan generation failed:', err);
      const msg = err instanceof Error ? err.message : String(err);
      setPlanError(msg || 'Failed to generate action plan. Please try again.');
    } finally {
      setGeneratingPlan(false);
    }
  };

  const handleConfirmGoal = async () => {
    if (!selectedTarget || !actionPlan) return;
    if (isDemoMode) {
      setActiveGoal({
        id: 'dummy-goal-id',
        userId: 'demo-uid',
        targetScore: selectedTarget.score,
        targetLabel: selectedTarget.label,
        scoreAtCreation: currentScore,
        dimensionGapsAtCreation: actionPlan.dimensionGaps,
        weeklyActions: actionPlan.weeklyActions,
        timeframeWeeks: actionPlan.timeframeWeeks,
        geminiSummary: actionPlan.summary,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        achievedAt: null,
        invitedUsers: ['alpha_coder', 'beta_builder'],
      });
      setTotalGoalsCount((prev) => prev + 1);
      setPartners([
        { githubLogin: 'alpha_coder', avatarUrl: '', currentScore: 82 },
        { githubLogin: 'beta_builder', avatarUrl: '', currentScore: 77 },
      ]);
      setIsCreatingGoal(false);
      setStep(1);
      return;
    }
    if (!user?.uid) return;
    setSavingGoal(true);
    setGoalError(null);
    try {
      await createGoal({
        targetScore: selectedTarget.score,
        targetLabel: selectedTarget.label,
        scoreAtCreation: currentScore,
        dimensionGapsAtCreation: actionPlan.dimensionGaps,
        weeklyActions: actionPlan.weeklyActions,
        timeframeWeeks: actionPlan.timeframeWeeks,
        geminiSummary: actionPlan.summary,
      });
      setIsCreatingGoal(false);
      setStep(1);
      await loadActiveGoal();
    } catch (err: unknown) {
      console.error('[GoalsClient] Goal activation failed:', err);
      const msg = err instanceof Error ? err.message : String(err);
      setGoalError(msg || 'Failed to activate goal. Please try again.');
    } finally {
      setSavingGoal(false);
    }
  };

  const handleAbandonGoal = async () => {
    if (!confirm('Are you sure you want to mark this goal as abandoned? This cannot be undone.'))
      return;
    if (isDemoMode) {
      if (activeGoal) {
        setPastGoals((prev) => [
          { ...activeGoal, status: 'abandoned', updatedAt: new Date() },
          ...prev,
        ]);
      }
      setActiveGoal(null);
      setPartners([]);
      return;
    }
    if (!user?.uid || !activeGoal?.id) return;
    try {
      await updateDoc(doc(db, 'users', user.uid, 'goals', activeGoal.id), {
        status: 'abandoned',
        updatedAt: serverTimestamp(),
      });
      await loadActiveGoal();
    } catch (err) {
      console.error('[GoalsClient] Goal abandonment failed:', err);
    }
  };

  const handleChangeGoal = async () => {
    if (!confirm('Replacing this goal will mark the current one as abandoned. Continue?')) return;
    if (isDemoMode) {
      if (activeGoal) {
        setPastGoals((prev) => [
          { ...activeGoal, status: 'abandoned', updatedAt: new Date() },
          ...prev,
        ]);
      }
      setActiveGoal(null);
      setPartners([]);
      setIsCreatingGoal(true);
      return;
    }
    if (!user?.uid || !activeGoal?.id) return;
    try {
      await updateDoc(doc(db, 'users', user.uid, 'goals', activeGoal.id), {
        status: 'abandoned',
        updatedAt: serverTimestamp(),
      });
      setActiveGoal(null);
      setPartners([]);
      setIsCreatingGoal(true);
    } catch (err) {
      console.error('[GoalsClient] Goal replacement failed:', err);
    }
  };

  const handleInvitePartner = async (username: string): Promise<boolean> => {
    setInviting(true);
    setInviteError(null);
    setInviteSuccess(false);
    if (isDemoMode) {
      return new Promise((resolve) =>
        setTimeout(() => {
          if (partners.some((p) => p.githubLogin.toLowerCase() === username.toLowerCase())) {
            setInviteError('This user is already an accountability partner.');
            setInviting(false);
            resolve(false);
          } else {
            setPartners((prev) => [
              ...prev,
              { githubLogin: username, avatarUrl: '', currentScore: 75 },
            ]);
            setInviteSuccess(true);
            setInviting(false);
            resolve(true);
          }
        }, 1000)
      );
    }
    if (!user?.uid || !activeGoal?.id) {
      setInviting(false);
      return false;
    }
    try {
      const result = await inviteAccountabilityPartner({ goalId: activeGoal.id, username });
      if (result.success && result.partner) {
        setInviteSuccess(true);
        await loadPartners(activeGoal);
        setInviting(false);
        return true;
      }
      setInviteError(result.error || 'Failed to invite user.');
      setInviting(false);
      return false;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setInviteError(msg || "This user either hasn't joined Logrithm or is not on a Pro plan");
      setInviting(false);
      return false;
    }
  };

  // handleGetPro is handled via the useCheckout hook

  return {
    isDemoMode,
    user,
    authLoading,
    isPro,
    totalGoalsCount,
    pastGoals,
    showUpgradeModal,
    setShowUpgradeModal,
    checkoutLoading,
    checkoutError,
    profileData,
    globalStats,
    userInsights,
    insightsHistory,
    loadingProfile,
    activeGoal,
    partners,
    loadingGoal,
    loadingPartners,
    isCreatingGoal,
    setIsCreatingGoal,
    step,
    setStep,
    selectedTarget,
    setSelectedTarget,
    actionPlan,
    generatingPlan,
    planError,
    savingGoal,
    goalError,
    isInviteModalOpen,
    setIsInviteModalOpen,
    inviting,
    inviteError,
    setInviteError,
    inviteSuccess,
    setInviteSuccess,
    pendingInvites,
    invitedGoals,
    loadingInvitedGoals,
    processingInviteId,
    currentScore,
    filteredPresets,
    progressPercent,
    estimatedWeeksText: getEstimatedWeeksText(),

    // Handlers
    handleRespondToInvite,
    handleProceedToStep2,
    handleConfirmGoal,
    handleAbandonGoal,
    handleChangeGoal,
    handleInvitePartner,
    handleGetPro,
  };
}
