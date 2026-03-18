import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  completeOnboarding,
  setOnboardingTargetNpc,
  setTutorialPhase,
} from '../../store/slices/playerSlice.js';
import { EventBus } from '../../utils/eventBus.js';
import { EVENTS } from '../../utils/eventBusTypes.js';
import styles from './TutorialHints.module.css';

/**
 * TutorialHints
 *
 * Pokemon-style visual guidance overlay. Shows clear, impossible-to-miss
 * banners and directional indicators based on the current tutorialPhase.
 *
 * Phases:
 * - awaiting_mentor: "Talk to Guide Amira" with down-arrow + controls hint
 * - met_mentor: "Learn your first Arabic word!"
 * - learned_word: "Find Scholar Yusuf at the Library" with directional arrow
 * - met_yusuf / complete: nothing (component unmounted by parent)
 *
 * Also shows a persistent controls reminder for the first 60 seconds.
 */
export default function TutorialHints() {
  const dispatch = useDispatch();
  const tutorialPhase = useSelector((s) => s.player.tutorialPhase);
  const onboardingComplete = useSelector((s) => s.player.onboardingComplete);

  // Track player position for arrow direction
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [nearMentor, setNearMentor] = useState(false);

  // Controls hint timer — visible for first 60 seconds
  const [showControls, setShowControls] = useState(true);
  const [controlsFading, setControlsFading] = useState(false);

  // NPC world positions (tile * 64)
  const MENTOR_WORLD = { x: 14 * 64, y: 18 * 64 };
  const SCHOLAR_WORLD = { x: 9 * 64, y: 6 * 64 };

  // Position tracking from Phaser
  const handlePositionUpdate = useCallback(({ x, y }) => {
    setPlayerPos({ x, y });
    const distToMentor = Math.sqrt(
      (x - MENTOR_WORLD.x) ** 2 + (y - MENTOR_WORLD.y) ** 2
    );
    setNearMentor(distToMentor < 128);
  }, []);

  useEffect(() => {
    EventBus.on(EVENTS.PLAYER_POSITION_UPDATE, handlePositionUpdate);
    return () => EventBus.off(EVENTS.PLAYER_POSITION_UPDATE, handlePositionUpdate);
  }, [handlePositionUpdate]);

  // 60-second controls hint timer
  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setControlsFading(true);
    }, 58000); // start fade at 58s

    const hideTimer = setTimeout(() => {
      setShowControls(false);
    }, 60000); // remove at 60s

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  // Skip tutorial handler
  const handleSkip = useCallback(() => {
    dispatch(setTutorialPhase('complete'));
    dispatch(completeOnboarding());
    dispatch(setOnboardingTargetNpc(null));
  }, [dispatch]);

  // ESC to skip
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') handleSkip();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleSkip]);

  if (onboardingComplete) return null;

  // Calculate arrow position/rotation toward target NPC
  const getArrowStyle = (targetWorld) => {
    const dx = targetWorld.x - playerPos.x;
    const dy = targetWorld.y - playerPos.y;
    const angle = Math.atan2(dy, dx);
    const radius = 80;
    const cx = window.innerWidth / 2 + Math.cos(angle) * radius;
    const cy = window.innerHeight / 2 + Math.sin(angle) * radius;

    return {
      left: `${cx}px`,
      top: `${cy}px`,
      transform: `rotate(${angle + Math.PI / 2}rad)`,
    };
  };

  // Controls bar (shared across phases)
  const controlsBar = showControls && (
    <div
      className={`${styles.controlsHint} ${controlsFading ? styles.controlsHintFading : ''}`}
    >
      {'↑↓←→ Move  |  SPACE Talk  |  M Map  |  ESC Menu'}
    </div>
  );

  // ── Phase: awaiting_mentor ──
  if (tutorialPhase === 'awaiting_mentor') {
    return (
      <div className={styles.container}>
        <button className={styles.skipBtn} onClick={handleSkip}>
          Skip Tutorial
        </button>

        {nearMentor ? (
          <div className={styles.proximityPrompt}>
            Press SPACE to talk
          </div>
        ) : (
          <>
            <div className={styles.guidanceBanner}>
              <span className={styles.guidanceText}>Talk to Guide Amira</span>
              <span className={styles.guidanceArrow}>▼</span>
            </div>
            <div
              className={styles.arrow}
              style={getArrowStyle(MENTOR_WORLD)}
            />
          </>
        )}

        {controlsBar}
      </div>
    );
  }

  // ── Phase: met_mentor ──
  if (tutorialPhase === 'met_mentor') {
    return (
      <div className={styles.container}>
        <button className={styles.skipBtn} onClick={handleSkip}>
          Skip Tutorial
        </button>

        <div className={styles.guidanceBanner}>
          <span className={styles.guidanceText}>Learn your first Arabic word!</span>
        </div>

        {controlsBar}
      </div>
    );
  }

  // ── Phase: learned_word ──
  if (tutorialPhase === 'learned_word') {
    return (
      <div className={styles.container}>
        <button className={styles.skipBtn} onClick={handleSkip}>
          Skip Tutorial
        </button>

        <div className={styles.guidanceBanner}>
          <span className={styles.guidanceText}>
            <span className={styles.guidanceArrowLeft}>◀</span>
            Find Scholar Yusuf at the Library
          </span>
        </div>

        <div
          className={styles.arrow}
          style={getArrowStyle(SCHOLAR_WORLD)}
        />

        {controlsBar}
      </div>
    );
  }

  // ── Phase: met_yusuf / complete ── nothing
  return null;
}

/**
 * WelcomeSplash
 *
 * Full-screen welcome overlay shown for ~3 seconds when the game first loads
 * with tutorialPhase === 'awaiting_mentor'. Auto-fades and removes itself.
 * Rendered separately from TutorialHints so GameLayout controls its lifecycle.
 */
export function WelcomeSplash({ onDone }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 2000);
    const doneTimer = setTimeout(() => {
      if (onDone) onDone();
    }, 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <div className={`${styles.welcomeOverlay} ${fading ? styles.welcomeOverlayFading : ''}`}>
      <div className={styles.welcomeArabic} lang="ar">
        واحة الحروف
      </div>
      <div className={styles.welcomeTitle}>
        Welcome to Oasis Village
      </div>
      <div className={styles.welcomeSubtitle}>
        Oasis of Letters
      </div>
    </div>
  );
}
