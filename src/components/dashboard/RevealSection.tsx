'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';
import { useSequenceStep } from './SequenceContext';

interface RevealSectionProps {
  children: ReactNode;
  stepIndex?: number;
  className?: string;
  onComplete?: () => void;
}

export default function RevealSection({
  children,
  stepIndex,
  className = '',
  onComplete,
}: RevealSectionProps) {
  const stepNumber = stepIndex ?? 0;
  const {
    isVisible: stepIsVisible,
    isCompleted,
    completeStep,
    isForceCompleted,
  } = useSequenceStep(stepNumber);
  const [isRendered, setIsRendered] = useState(
    () => stepIsVisible || isCompleted || isForceCompleted
  );
  const [isVisible, setIsVisible] = useState(() => isCompleted || isForceCompleted);
  const hasTriggeredCompleteRef = useRef(false);

  useEffect(() => {
    if (!stepIsVisible && !isCompleted && !isForceCompleted) return;

    const t1 = setTimeout(() => {
      setIsRendered(true);
      if (isCompleted || isForceCompleted) {
        setIsVisible(true);
      }
    }, 0);

    let raf2: number;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setIsVisible(true);
      });
    });

    return () => {
      clearTimeout(t1);
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [stepIsVisible, isCompleted, isForceCompleted]);

  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    // Only listen to transition events directly on the container div
    if (e.target !== e.currentTarget) return;
    if (e.propertyName !== 'opacity' && e.propertyName !== 'transform') return;

    if (!hasTriggeredCompleteRef.current) {
      hasTriggeredCompleteRef.current = true;
      if (stepIndex) {
        completeStep();
      }
      onComplete?.();
    }
  };

  // Ensure force-completed or pre-completed sections signal completion
  useEffect(() => {
    if ((isCompleted || isForceCompleted) && !hasTriggeredCompleteRef.current) {
      hasTriggeredCompleteRef.current = true;
      if (stepIndex) {
        completeStep();
      }
      onComplete?.();
    }
  }, [isCompleted, isForceCompleted, stepIndex, completeStep, onComplete]);

  if (!isRendered) {
    return null;
  }

  return (
    <div
      onTransitionEnd={handleTransitionEnd}
      className={`transition-all duration-300 ease-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-1.5 opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  );
}
