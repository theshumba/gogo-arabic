import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import {
  setOnboardingStep,
  setOnboardingTargetNpc,
  completeOnboarding,
} from '../../store/slices/playerSlice.js';
import { EventBus } from '../../utils/eventBus.js';
import { onboardingSteps } from './onboardingSteps.js';
import styles from './ContextualOnboarding.module.css';

export default function ContextualOnboarding() {
  // ALL HOOKS FIRST (before any conditional returns)
  const dispatch = useDispatch();
  const onboardingComplete = useSelector((state) => state.player.onboardingComplete ?? true);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetPosition, setTargetPosition] = useState(null);
  const [hasMovedOnce, setHasMovedOnce] = useState(false);
  const tooltipRef = useRef(null);

  const currentStep = onboardingSteps[stepIndex];
  const isLastStep = stepIndex === onboardingSteps.length - 1;
  const isFirstStep = stepIndex === 0;

  // Calculate tooltip position based on target element
  const updateTargetPosition = useCallback(() => {
    if (!currentStep) return;

    if (currentStep.placement === 'center') {
      setTargetPosition(null);
      return;
    }

    const targetElement = document.querySelector(currentStep.target);
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      setTargetPosition({
        top: rect.bottom + 16,
        left: rect.left + rect.width / 2,
        width: rect.width,
        height: rect.height,
        elementTop: rect.top,
        elementLeft: rect.left,
      });
    }
  }, [currentStep]);

  // Handle next step
  const handleNext = useCallback(() => {
    const nextIndex = stepIndex + 1;

    if (nextIndex >= onboardingSteps.length) {
      dispatch(completeOnboarding());
      dispatch(setOnboardingTargetNpc(null));
      return;
    }

    // If moving to last step, highlight the configured NPC
    const nextStep = onboardingSteps[nextIndex];
    if (nextStep.highlightNpc) {
      dispatch(setOnboardingTargetNpc(nextStep.highlightNpc));
    }

    setStepIndex(nextIndex);
    dispatch(setOnboardingStep(nextIndex));
  }, [stepIndex, dispatch]);

  // Handle back step
  const handleBack = useCallback(() => {
    if (stepIndex > 0) {
      const prevIndex = stepIndex - 1;
      setStepIndex(prevIndex);
      dispatch(setOnboardingStep(prevIndex));

      // Remove NPC highlight if going back from a step with highlight
      if (currentStep.highlightNpc) {
        dispatch(setOnboardingTargetNpc(null));
      }
    }
  }, [stepIndex, dispatch, currentStep]);

  // Handle skip
  const handleSkip = useCallback(() => {
    dispatch(completeOnboarding());
    dispatch(setOnboardingTargetNpc(null));
  }, [dispatch]);

  // Listen for player movement to trigger step 1
  useEffect(() => {
    if (stepIndex === 0 && !hasMovedOnce) {
      let timeoutId;
      const handlePlayerMove = () => {
        setHasMovedOnce(true);
        timeoutId = setTimeout(() => {
          setStepIndex(1);
          dispatch(setOnboardingStep(1));
        }, 500);
      };

      EventBus.on('player-position-update', handlePlayerMove);

      return () => {
        EventBus.off('player-position-update', handlePlayerMove);
        if (timeoutId) clearTimeout(timeoutId);
      };
    }
  }, [stepIndex, hasMovedOnce, dispatch]);

  // Update target position when step changes or window resizes
  useEffect(() => {
    updateTargetPosition();

    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateTargetPosition, 150);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, [updateTargetPosition]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSkip]);

  // Auto-focus Next button when step changes
  useEffect(() => {
    if (tooltipRef.current) {
      const nextBtn = tooltipRef.current.querySelector(`.${styles.btnNext}`);
      if (nextBtn) nextBtn.focus();
    }
  }, [stepIndex]);

  // Conditional return AFTER all hooks
  if (onboardingComplete) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={styles.overlay}
        role="dialog"
        aria-modal="true"
        aria-label={`Tutorial step ${stepIndex + 1} of ${onboardingSteps.length}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Backdrop */}
        <div className={styles.backdrop} />

        {/* Spotlight for target element */}
        {targetPosition && (
          <div
            className={styles.spotlight}
            style={{
              top: targetPosition.elementTop,
              left: targetPosition.elementLeft,
              width: targetPosition.width,
              height: targetPosition.height,
            }}
          />
        )}

        {/* Tooltip */}
        <AnimatePresence mode="wait">
          <motion.div
            ref={tooltipRef}
            key={stepIndex}
            className={
              currentStep.placement === 'center'
                ? `${styles.tooltip} ${styles.tooltipCenter}`
                : `${styles.tooltip} ${styles.tooltipBottom}`
            }
            style={
              targetPosition && currentStep.placement === 'bottom'
                ? {
                    top: targetPosition.top,
                    left: targetPosition.left,
                    transform: 'translateX(-50%)',
                  }
                : {}
            }
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            {/* Arrow for bottom placement */}
            {currentStep.placement === 'bottom' && <div className={styles.arrow} />}

            {/* Content */}
            <div className={styles.content}>{currentStep.content}</div>

            {/* Step progress */}
            <div className={styles.stepProgress}>
              Step {stepIndex + 1} of {onboardingSteps.length}
            </div>

            {/* Buttons */}
            <div className={styles.buttonRow}>
              <button
                onClick={handleSkip}
                className={styles.btnSkip}
                aria-label="Skip tutorial"
              >
                Skip Tutorial
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                {!isFirstStep && (
                  <button
                    onClick={handleBack}
                    className={styles.btnBack}
                    aria-label="Previous step"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className={styles.btnNext}
                  aria-label={isLastStep ? 'Complete tutorial' : 'Next step'}
                >
                  {isLastStep ? 'Got it!' : 'Next'}
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
