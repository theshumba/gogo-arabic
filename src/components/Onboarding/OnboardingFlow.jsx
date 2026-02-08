import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addXP, incrementWordsLearned } from '../../store/slices/playerSlice.js';
import { addFsrsCard } from '../../store/slices/vocabularySlice.js';
import { createNewCard } from '../../services/fsrs.js';
import { XP_REWARDS } from '../../utils/xpCalculator.js';
import { useAudio } from '../../hooks/useAudio.js';
import styles from './OnboardingFlow.module.css';

/**
 * Onboarding Flow Component
 *
 * Six-step guided introduction for new players:
 * 1. Welcome with Arabic greeting
 * 2. Game world explanation
 * 3. Interactive first word learning
 * 4. HUD element explanation
 * 5. First quest assignment
 * 6. Movement controls
 *
 * Usage: Mount conditionally when player.onboardingComplete === false
 */
export default function OnboardingFlow({ onComplete, onSkip }) {
  const [step, setStep] = useState(0);
  const [wordRevealed, setWordRevealed] = useState(false);
  const dispatch = useDispatch();
  const { playSFX } = useAudio();

  const totalSteps = 6;

  const handleNext = () => {
    playSFX('click');
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    playSFX('click');
    onSkip();
  };

  const handleLearnWord = () => {
    playSFX('wordlearned');
    setWordRevealed(true);

    // Teach the word "مرحبا" (marhaba / hello)
    const wordId = 'marhaba';
    dispatch(addFsrsCard({ wordId, card: createNewCard() }));
    dispatch(incrementWordsLearned());
    dispatch(addXP(XP_REWARDS.NEW_WORD));
  };

  const handleComplete = () => {
    playSFX('quest');
    onComplete();
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className={styles.stepContent}>
            <h1 className={styles.arabicTitle}>!أَهْلاً وَسَهْلاً</h1>
            <p className={styles.transliteration}>ahlan wa sahlan!</p>
            <h2 className={styles.subtitle}>Welcome to GoGo Arabic!</h2>
            <p className={styles.description}>
              You are about to embark on an adventure to learn the Arabic language.
              Your journey begins in the Oasis Village, where scholars, merchants,
              and fellow students await to guide you.
            </p>
          </div>
        );

      case 1:
        return (
          <div className={styles.stepContent}>
            <h2 className={styles.subtitle}>An Arabic-Speaking World</h2>
            <p className={styles.description}>
              This is an RPG world where everyone speaks Arabic. As you explore
              8 different zones, you will meet NPCs who will teach you new words,
              give you quests, and help you master the language.
            </p>
            <div className={styles.featureGrid}>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>🗺</span>
                <span>8 Zones to Explore</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>👥</span>
                <span>140 NPCs to Meet</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>📝</span>
                <span>1000+ Words to Learn</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>⚔</span>
                <span>50+ Quests to Complete</span>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className={styles.stepContent}>
            <h2 className={styles.subtitle}>Learn Your First Word</h2>
            <p className={styles.description}>
              Let's start with a simple greeting. Click the button below to learn it!
            </p>
            <div className={styles.wordCard}>
              {!wordRevealed ? (
                <button onClick={handleLearnWord} className={styles.revealButton}>
                  Reveal Word
                </button>
              ) : (
                <div className={styles.wordRevealed}>
                  <div className={styles.arabicWord}>مَرْحَبا</div>
                  <div className={styles.transliteration}>marhaba</div>
                  <div className={styles.englishWord}>hello</div>
                  <div className={styles.wordNote}>
                    You just learned your first word! You gained XP and the word
                    has been added to your vocabulary for review.
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className={styles.stepContent}>
            <h2 className={styles.subtitle}>Understanding the HUD</h2>
            <p className={styles.description}>
              The heads-up display at the top of your screen shows important information:
            </p>
            <div className={styles.hudExplainer}>
              <div className={styles.hudItem}>
                <span className={styles.hudLabel}>Level & XP</span>
                <p>Your progress. Gain XP by learning words and completing quests.</p>
              </div>
              <div className={styles.hudItem}>
                <span className={styles.hudLabel}>Dirhams</span>
                <p>Currency for buying items at the shop. Find treasure chests!</p>
              </div>
              <div className={styles.hudItem}>
                <span className={styles.hudLabel}>Words Learned</span>
                <p>Total vocabulary count. Try to learn them all!</p>
              </div>
              <div className={styles.hudItem}>
                <span className={styles.hudLabel}>Streak</span>
                <p>Days in a row you have played. Build a streak for bonus rewards!</p>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className={styles.stepContent}>
            <h2 className={styles.subtitle}>Your First Quest</h2>
            <p className={styles.description}>
              Scholar Yusuf, the village elder, has a quest for you. Walk over to him
              (marked with a green icon) and press the Spacebar to interact.
            </p>
            <div className={styles.questBox}>
              <div className={styles.questTitle}>Village Explorer</div>
              <div className={styles.questDescription}>
                Meet 3 different people in the Oasis Village
              </div>
              <div className={styles.questReward}>
                Reward: 100 XP + 50 Dirhams
              </div>
            </div>
            <p className={styles.description}>
              Quests guide your learning journey and provide valuable rewards.
              Check your quest log anytime by pressing Q!
            </p>
          </div>
        );

      case 5:
        return (
          <div className={styles.stepContent}>
            <h2 className={styles.subtitle}>Movement Controls</h2>
            <p className={styles.description}>
              Use these controls to navigate the world:
            </p>
            <div className={styles.controlsGrid}>
              <div className={styles.controlItem}>
                <kbd className={styles.key}>W</kbd>
                <kbd className={styles.key}>A</kbd>
                <kbd className={styles.key}>S</kbd>
                <kbd className={styles.key}>D</kbd>
                <span>Move</span>
              </div>
              <div className={styles.controlItem}>
                <kbd className={styles.key}>↑</kbd>
                <kbd className={styles.key}>←</kbd>
                <kbd className={styles.key}>↓</kbd>
                <kbd className={styles.key}>→</kbd>
                <span>Also Move</span>
              </div>
              <div className={styles.controlItem}>
                <kbd className={styles.key}>Space</kbd>
                <span>Interact with NPCs</span>
              </div>
              <div className={styles.controlItem}>
                <kbd className={styles.key}>Q</kbd>
                <span>Open Quest Log</span>
              </div>
              <div className={styles.controlItem}>
                <kbd className={styles.key}>M</kbd>
                <span>Open World Map</span>
              </div>
              <div className={styles.controlItem}>
                <kbd className={styles.key}>ESC</kbd>
                <span>Pause Menu</span>
              </div>
            </div>
            <p className={styles.finalNote}>
              You're ready to begin your journey! Go explore the Oasis Village
              and talk to Scholar Yusuf to get started.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        {/* Skip button */}
        <button onClick={handleSkip} className={styles.skipButton}>
          Skip Tutorial
        </button>

        {/* Main content */}
        {renderStep()}

        {/* Navigation */}
        <div className={styles.navigation}>
          {/* Progress dots */}
          <div className={styles.progressDots}>
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`${styles.dot} ${index === step ? styles.dotActive : ''} ${
                  index < step ? styles.dotComplete : ''
                }`}
              />
            ))}
          </div>

          {/* Next button */}
          <button
            onClick={handleNext}
            className={styles.nextButton}
            disabled={step === 2 && !wordRevealed}
          >
            {step === totalSteps - 1 ? 'Start Your Journey!' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
