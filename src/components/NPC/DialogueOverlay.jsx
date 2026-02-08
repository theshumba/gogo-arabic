import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { closeDialogue } from '../../store/slices/uiSlice.js';
import { EventBus } from '../../utils/eventBus.js';
import { useDialogue } from '../../hooks/useDialogue.js';
import { getEnhancedDialogueChoices } from '../../utils/culturalDialogueHelper.js';
import npcsData from '../../data/npcs.json';
import DialoguePortrait from './DialoguePortrait.jsx';
import DialogueBox from './DialogueBox.jsx';
import DialogueChoices from './DialogueChoices.jsx';
import TeacherWordCard from './TeacherWordCard.jsx';
import CulturalDialogueMenu from './CulturalDialogueMenu.jsx';
import styles from './DialogueOverlay.module.css';

/* ---- animation variants ---- */
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const dialogueBoxVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 30, scale: 0.98 },
};

/**
 * DialogueOverlay
 * Main container for NPC dialogue — orchestrates portrait, dialogue box, choices, and word cards
 */
export default function DialogueOverlay() {
  const dispatch = useDispatch();
  const overlayData = useSelector((s) => s.ui.dialogueConfig);
  const settings = useSelector((s) => s.settings);

  const npcId = overlayData?.npcId;
  const npc = npcsData.find((n) => n.id === npcId);

  const { currentTree, lineIndex, close, advance, handleChoice, showCulturalMenu, setShowCulturalMenu } = useDialogue(npc);

  // Early return if invalid data
  if (!npc || !currentTree) {
    if (npc || overlayData) {
      dispatch(closeDialogue());
      EventBus.emit('unfreeze-player');
    }
    return null;
  }

  const line = currentTree.lines[lineIndex];
  if (!line) {
    close();
    return null;
  }

  /* ---- keyboard shortcuts ---- */
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't interfere with input fields or other overlays
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      // If current line has choices, handle number keys for choice selection
      if (line?.choices) {
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= line.choices.length) {
          e.preventDefault();
          handleChoice(line.choices[num - 1]);
          return;
        }
      }

      switch (e.key) {
        case ' ':
        case 'Enter':
          e.preventDefault();
          // If there are choices, don't advance automatically
          if (!line?.choices) {
            advance();
          }
          break;

        case 'Escape':
          e.preventDefault();
          close();
          break;

        default:
          break;
      }
    };

    // Only attach listener when dialogue is visible
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup on unmount or when dialogue closes
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [line, lineIndex, currentTree]); // Re-attach when line changes

  // Check for reduced motion preference
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const transition = reduceMotion
    ? { duration: 0.2 }
    : { duration: 0.3, ease: 'easeOut' };

  /* ---- cultural menu rendering ---- */
  if (showCulturalMenu) {
    const handleCulturalSelect = (culturalDialogue) => {
      handleChoice({
        action: 'cultural_dialogue',
        culturalDialogueData: culturalDialogue,
      });
    };

    const handleBackFromCultural = () => {
      setShowCulturalMenu(false);
    };

    return (
      <div className={styles.overlay} role="dialog" aria-label="Cultural dialogue menu">
        <motion.div
          className={styles.backdrop}
          onClick={close}
          role="button"
          tabIndex={0}
          aria-label="Close cultural menu"
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              close();
            }
          }}
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={transition}
        />
        <motion.div
          variants={dialogueBoxVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={transition}
          style={{ width: '100%' }}
        >
          <CulturalDialogueMenu
            npc={npc}
            onCulturalSelect={handleCulturalSelect}
            onBack={handleBackFromCultural}
            portrait={<DialoguePortrait npc={npc} />}
          />
        </motion.div>
      </div>
    );
  }

  /* ---- choice line rendering ---- */
  if (line.choices) {
    // Enhance choices with cultural dialogue option if available
    const enhancedChoices = getEnhancedDialogueChoices(npc, line);

    return (
      <div className={styles.overlay} role="dialog" aria-label="Dialogue choices">
        <motion.div
          className={styles.backdrop}
          onClick={close}
          role="button"
          tabIndex={0}
          aria-label="Close dialogue"
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              close();
            }
          }}
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={transition}
        />
        <motion.div
          variants={dialogueBoxVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={transition}
          style={{ width: '100%' }}
        >
          <DialogueChoices
            choices={enhancedChoices || line.choices}
            onChoiceSelect={handleChoice}
            portrait={<DialoguePortrait npc={npc} />}
          />
        </motion.div>
      </div>
    );
  }

  /* ---- normal dialogue line rendering ---- */
  return (
    <div className={styles.overlay} role="dialog" aria-label={`Dialogue with ${npc.name}`}>
      <motion.div
        className={styles.backdrop}
        onClick={advance}
        role="button"
        tabIndex={0}
        aria-label="Continue dialogue"
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            advance();
          }
        }}
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={transition}
      />
      <motion.div
        variants={dialogueBoxVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={transition}
        style={{ width: '100%' }}
      >
        <DialogueBox
          npc={npc}
          line={line}
          onAdvance={advance}
          portrait={<DialoguePortrait npc={npc} />}
          teachWordCard={line.teachWord ? <TeacherWordCard wordId={line.teachWord} /> : null}
        />
      </motion.div>
    </div>
  );
}
