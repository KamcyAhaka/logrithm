'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

const TOTAL_STEPS = 10;
const FALLBACK_TIMEOUT_MS = 4500;

const SECTION_NAMES: Record<number, string> = {
  1: 'live_analysis',
  2: 'report_summary',
  3: 'score_breakdown',
  4: 'peer_comparison',
  5: 'activity_stats',
  6: 'commit_history',
  7: 'activity_heatmap',
  8: 'repositories',
  9: 'language_breakdown',
  10: 'audit_insights',
};

interface SequenceContextType {
  activeStep: number;
  isCompleted: boolean;
  completeStep: (stepIndex: number) => void;
  isStepVisible: (stepIndex: number) => boolean;
  isStepForceCompleted: (stepIndex: number) => boolean;
}

const SequenceContext = createContext<SequenceContextType | null>(null);

const STORAGE_KEY = 'logrithm_dashboard_seq_complete';

export function SequenceProvider({ children }: { children: ReactNode }) {
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [forceCompletedSteps, setForceCompletedSteps] = useState<Set<number>>(new Set());

  // Mark context as fully complete
  const markSequenceComplete = useCallback(() => {
    setIsCompleted(true);
    setActiveStep(TOTAL_STEPS + 1);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(STORAGE_KEY, 'true');
      } catch {
        // Ignore storage quota or disabled errors
      }
    }
  }, []);

  // Primary function for sections to notify completion
  const completeStep = useCallback(
    (stepIndex: number) => {
      if (isCompleted) return;

      setActiveStep((current) => {
        if (current === stepIndex) {
          const next = current + 1;
          if (next > TOTAL_STEPS) {
            setTimeout(markSequenceComplete, 0);
          }
          return next;
        }
        return current;
      });
    },
    [isCompleted, markSequenceComplete]
  );

  // Self-healing fallback timer per active step
  useEffect(() => {
    if (isCompleted || activeStep > TOTAL_STEPS) return;

    const stepForTimer = activeStep;
    const timer = setTimeout(() => {
      if (process.env.NODE_ENV !== 'production') {
        const sectionName = SECTION_NAMES[stepForTimer] || `step_${stepForTimer}`;
        console.warn(
          `[Sequencer] Section '${sectionName}' (Step ${stepForTimer}) did not complete within ${FALLBACK_TIMEOUT_MS}ms — force-advancing.`
        );
      }

      setForceCompletedSteps((prev) => new Set(prev).add(stepForTimer));

      setActiveStep((current) => {
        if (current === stepForTimer) {
          const next = current + 1;
          if (next > TOTAL_STEPS) {
            setTimeout(markSequenceComplete, 0);
          }
          return next;
        }
        return current;
      });
    }, FALLBACK_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [activeStep, isCompleted, markSequenceComplete]);

  const isStepVisible = useCallback(
    (stepIndex: number) => {
      return isCompleted || activeStep >= stepIndex;
    },
    [isCompleted, activeStep]
  );

  const isStepForceCompleted = useCallback(
    (stepIndex: number) => {
      return forceCompletedSteps.has(stepIndex);
    },
    [forceCompletedSteps]
  );

  return (
    <SequenceContext.Provider
      value={{
        activeStep,
        isCompleted,
        completeStep,
        isStepVisible,
        isStepForceCompleted,
      }}
    >
      {children}
    </SequenceContext.Provider>
  );
}

export function useSequenceContext() {
  const context = useContext(SequenceContext);
  if (!context) {
    throw new Error('useSequenceContext must be used within a SequenceProvider');
  }
  return context;
}

export function useSequenceStep(stepIndex: number) {
  const context = useContext(SequenceContext);

  const completeStepFromContext = context?.completeStep;
  const handleComplete = useCallback(() => {
    completeStepFromContext?.(stepIndex);
  }, [completeStepFromContext, stepIndex]);

  if (!context) {
    // Graceful fallback if used outside provider
    return {
      isVisible: true,
      isActive: false,
      isCompleted: true,
      isForceCompleted: false,
      completeStep: () => {},
    };
  }

  const { activeStep, isCompleted, isStepVisible, isStepForceCompleted } = context;

  const isVisible = isStepVisible(stepIndex);
  const isActive = activeStep === stepIndex;
  const isForceCompleted = isStepForceCompleted(stepIndex);

  return {
    isVisible,
    isActive,
    isCompleted,
    isForceCompleted,
    completeStep: handleComplete,
  };
}
