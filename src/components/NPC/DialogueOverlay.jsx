import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { closeDialogue } from '../../store/slices/uiSlice.js';
import { selectNpcRelationship } from '../../store/slices/narrativeSlice.js';
import { EventBus } from '../../utils/eventBus.js';
import { EVENTS } from '../../utils/eventBusTypes.js';
import { useDialogue } from '../../hooks/useDialogue.js';
import { useOverlayClose } from '../../hooks/useOverlayClose.js';
import { getEnhancedDialogueChoices } from '../../utils/culturalDialogueHelper.js';
import { useFocusTrap } from '../../hooks/useFocusTrap.js';
import npcsData from '../../data/npcsEnriched.js';
import DialoguePortrait from './DialoguePortrait.jsx';
import DialogueBox from './DialogueBox.jsx';
import DialogueChoices from './DialogueChoices.jsx';
import TeacherWordCard from './TeacherWordCard.jsx';
import CulturalDialogueMenu from './CulturalDialogueMenu.jsx';
import TopicSelectionMenu from './TopicSelectionMenu.jsx';
import ConversationHistory from './ConversationHistory.jsx';
import RelationshipIndicator from './RelationshipIndicator.jsx';
import styles from './DialogueOverlay.module.css';

/* ---- animation variants ---- */
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const dialogueBoxVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.92 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 10, scale: 0.96 },
};

const moodToEmoji = (mood) => {
  const map = { cheerful: '😊', serious: '🤔', worried: '😟', excited: '🤩', angry: '😠', sad: '😢', neutral: '😐' };
  return map[mood] || '😐';
};

/**
 * DialogueOverlay
 * Main container for NPC dialogue — orchestrates portrait, dialogue box, choices,
 * topic selection, relationship indicator, and word cards.
 *
 * Supports both legacy linear dialogue and hub-and-spoke multi-topic conversations.
 */
export default function DialogueOverlay() {
  const dispatch = useDispatch();
  const overlayData = useSelector((s) => s.ui.dialogueConfig);

  const npcId = overlayData?.npcId;
  const npc = npcsData.find((n) => n.id === npcId);

  const {
    currentTree, lineIndex, close, advance, handleChoice,
    showCulturalMenu, setShowCulturalMenu,
    phase, availableTopics, selectTopic, topicsDiscussed,
    filteredChoices, isHubAndSpoke,
  } = useDialogue(npc);

  const relationshipLevel = useSelector(selectNpcRelationship(npcId || ''));

  const focusTrapRef = useFocusTrap(true, null);

  const [showHistory, setShowHistory] = useState(false);

  // Centralized overlay close with ESC key and unmount safety net
  useOverlayClose(close);

  const line = (npc && currentTree) ? currentTree.lines[lineIndex] : null;

  /* ---- keyboard shortcuts (Space/Enter to advance, number keys for choices) ---- */
  /* NOTE: ESC is handled by useOverlayClose above (capture phase) */
  useEffect(() => {
    if (!line) return;

    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      // If current line has choices, handle number keys for choice selection
      if (line?.choices) {
        const choices = isHubAndSpoke ? filteredChoices : line.choices;
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= choices.length) {
          e.preventDefault();
          handleChoice(choices[num - 1]);
          return;
        }
      }

      switch (e.key) {
        case ' ':
        case 'Enter':
          e.preventDefault();
          if (!line?.choices) {
            advance();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [line, lineIndex, currentTree, isHubAndSpoke, filteredChoices]);

  // Early return if invalid data
  if (!npc || !currentTree) {
    if (npc || overlayData) {
      dispatch(closeDialogue());
      EventBus.emit(EVENTS.PLAYER_UNFREEZE);
    }
    return null;
  }

  if (!line) {
    close();
    return null;
  }

  // Check for reduced motion preference
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const transition = reduceMotion
    ? { duration: 0.15 }
    : { duration: 0.3, ease: [0.22, 1, 0.36, 1] };

  /* ---- conversation history (highest priority overlay) ---- */
  if (showHistory) {
    return (
      <div ref={focusTrapRef} className={styles.overlay} role="dialog" aria-label="Conversation history">
        <motion.div
          className={styles.backdrop}
          onClick={() => setShowHistory(false)}
          role="button"
          tabIndex={0}
          aria-label="Close history"
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              setShowHistory(false);
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
          <ConversationHistory
            npc={npc}
            topicsDiscussed={topicsDiscussed}
            allTopics={availableTopics}
            onBack={() => setShowHistory(false)}
          />
        </motion.div>
      </div>
    );
  }

  /* ---- hub phase: topic selection ---- */
  if (phase === 'hub' && isHubAndSpoke) {
    return (
      <div ref={focusTrapRef} className={styles.overlay} role="dialog" aria-label="Topic selection">
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
          <TopicSelectionMenu
            topics={availableTopics}
            onSelectTopic={selectTopic}
            topicsDiscussed={topicsDiscussed}
            npc={npc}
            portrait={<DialoguePortrait npc={npc} />}
            onClose={close}
            onShowHistory={() => setShowHistory(true)}
            relationshipLevel={relationshipLevel}
          />
        </motion.div>
      </div>
    );
  }

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
      <div ref={focusTrapRef} className={styles.overlay} role="dialog" aria-label="Cultural dialogue menu">
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
    const choicesToRender = isHubAndSpoke ? filteredChoices : line.choices;
    const enhancedChoices = !isHubAndSpoke ? getEnhancedDialogueChoices(npc, line) : null;

    // Add "Back to topics" choice for hub-and-spoke NPCs in topic phase
    const finalChoices = [...(enhancedChoices || choicesToRender)];
    if (isHubAndSpoke && phase === 'topic' && currentTree.returnToHub) {
      finalChoices.push({
        english: '← Back to topics',
        action: 'return_to_hub',
      });
    }

    return (
      <div ref={focusTrapRef} className={styles.overlay} role="dialog" aria-label="Dialogue choices">
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
          {isHubAndSpoke && (
            <div className={styles.dialogueBox} style={{ minHeight: 'auto', paddingBottom: 0, borderTop: 'none' }}>
              <div className={styles.content}>
                <div className={styles.npcHeader}>
                  {npc.personality?.mood && (
                    <span className={styles.npcMood} aria-label={`NPC mood: ${npc.personality.mood}`}>
                      {moodToEmoji(npc.personality.mood)}
                    </span>
                  )}
                  <RelationshipIndicator npcId={npc.id} level={relationshipLevel} />
                </div>
              </div>
            </div>
          )}
          <DialogueChoices
            choices={finalChoices}
            onChoiceSelect={handleChoice}
            portrait={<DialoguePortrait npc={npc} />}
          />
        </motion.div>
      </div>
    );
  }

  /* ---- normal dialogue line rendering ---- */
  return (
    <div ref={focusTrapRef} className={styles.overlay} role="dialog" aria-label={`Dialogue with ${npc.name}`}>
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
          isHubAndSpoke={isHubAndSpoke}
          relationshipLevel={relationshipLevel}
        />
      </motion.div>
    </div>
  );
}
