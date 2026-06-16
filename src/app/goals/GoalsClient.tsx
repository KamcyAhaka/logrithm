'use client';

import { useRouter } from 'next/navigation';
import { useGoals } from '@/hooks/useGoals';
import { Target, Loader2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import DemoBanner from '@/components/layout/DemoBanner';

// Goals subcomponents
import FreeGate from '@/components/goals/FreeGate';
import InviteModal from '@/components/goals/InviteModal';
import PartnersSection from '@/components/goals/PartnersSection';
import ActiveGoalCard from '@/components/goals/ActiveGoalCard';
import GoalWizard from '@/components/goals/GoalWizard';
import PendingInvitesBanner from '@/components/goals/PendingInvitesBanner';
import SupportingGoalsList from '@/components/goals/SupportingGoalsList';
import PastGoalsList from '@/components/goals/PastGoalsList';
import UpgradeModal from '@/components/goals/UpgradeModal';

export default function GoalsClient() {
  const router = useRouter();

  const {
    isDemoMode,
    authLoading,
    isPro,
    totalGoalsCount,
    pastGoals,
    showUpgradeModal,
    setShowUpgradeModal,
    checkoutLoading,
    checkoutError,
    userInsights,
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
    estimatedWeeksText,

    // Handlers
    handleRespondToInvite,
    handleProceedToStep2,
    handleConfirmGoal,
    handleAbandonGoal,
    handleChangeGoal,
    handleInvitePartner,
    handleGetPro,
  } = useGoals();

  // ─── Render guards ────────────────────────────────────────────────────────
  const isInitializing = !isDemoMode && (authLoading || loadingProfile || isPro === null);
  if (isInitializing) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
        }}
      >
        Running the algorithm...
      </div>
    );
  }

  if (!isDemoMode && isPro === false && totalGoalsCount >= 1 && activeGoal === null) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
        <Navbar />
        <FreeGate
          title="Goal limit reached"
          message="You have set your 1 free goal. Upgrade to Pro to set unlimited goals, track progress, and invite accountability partners."
        />
      </div>
    );
  }

  // ─── Page ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <Navbar />
      {isDemoMode && <DemoBanner />}

      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="flex items-center gap-2 font-mono text-2xl font-bold text-white">
            <Target className="h-6 w-6 text-[#1D9E75]" />
            Goals
          </h1>
          <p className="text-xs text-white/40">
            Commit to growth, check actions compiled by Gemini, and build accountability.
          </p>
        </div>

        {/* Pending partner invitations */}
        <PendingInvitesBanner
          invites={pendingInvites}
          processingInviteId={processingInviteId}
          onRespond={handleRespondToInvite}
        />

        {/* Loading spinner */}
        {loadingGoal && (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#1D9E75]" />
          </div>
        )}

        {/* Goal creation wizard */}
        {!loadingGoal && (isCreatingGoal || !activeGoal) && (
          <GoalWizard
            step={step}
            selectedTarget={selectedTarget}
            setSelectedTarget={setSelectedTarget}
            filteredPresets={filteredPresets}
            userInsights={userInsights}
            generatingPlan={generatingPlan}
            actionPlan={actionPlan}
            planError={planError}
            savingGoal={savingGoal}
            isPro={isDemoMode ? true : !!isPro}
            onUpgradeClick={() => setShowUpgradeModal(true)}
            onCancel={() => (activeGoal ? setIsCreatingGoal(false) : router.push('/dashboard'))}
            onNext={handleProceedToStep2}
            onBack={() => setStep(1)}
            onConfirm={handleConfirmGoal}
          />
        )}

        {/* Active goal dashboard */}
        {!loadingGoal && activeGoal && !isCreatingGoal && (
          <div className="space-y-6">
            <ActiveGoalCard
              activeGoal={activeGoal}
              currentScore={currentScore}
              estimatedWeeksText={estimatedWeeksText}
              progressPercent={progressPercent}
              isPro={isDemoMode ? true : !!isPro}
              onUpgradeClick={() => setShowUpgradeModal(true)}
              onChangeGoal={handleChangeGoal}
              onAbandonGoal={handleAbandonGoal}
            />
            <PartnersSection
              partners={partners}
              loading={loadingPartners}
              targetScore={activeGoal.targetScore}
              onInviteClick={() => setIsInviteModalOpen(true)}
            />
          </div>
        )}

        {/* Goals you're supporting */}
        {!loadingGoal && !isCreatingGoal && (
          <SupportingGoalsList goals={invitedGoals} loading={loadingInvitedGoals} />
        )}

        {/* Goal History */}
        {!loadingGoal && !isCreatingGoal && <PastGoalsList goals={pastGoals} />}
      </main>

      {isInviteModalOpen && (
        <InviteModal
          isOpen={isInviteModalOpen}
          onClose={() => {
            setIsInviteModalOpen(false);
            setInviteError(null);
            setInviteSuccess(false);
          }}
          onInvite={handleInvitePartner}
          inviting={inviting}
          error={inviteError}
          success={inviteSuccess}
        />
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        checkoutLoading={checkoutLoading}
        checkoutError={checkoutError}
        onGetPro={handleGetPro}
      />
    </div>
  );
}
