import { useState, useCallback, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { closeDialogue, openQuiz, showNotification } from '../../store/slices/uiSlice.js';
import { updateDialogueState, teachWord as npcTeachWord } from '../../store/slices/npcSlice.js';
import { addFsrsCard, updateFsrsCard } from '../../store/slices/vocabularySlice.js';
import { addXP, incrementWordsLearned } from '../../store/slices/playerSlice.js';
import { updateQuestProgress, completeQuest, checkPrerequisites } from '../../store/slices/questSlice.js';
import { createNewCard } from '../../services/fsrs.js';
import { EventBus } from '../../utils/eventBus.js';
import { XP_REWARDS } from '../../utils/xpCalculator.js';
import { shuffle } from '../../utils/shuffle.js';
import { selectWordsByDifficulty } from '../../utils/wordSelection.js';
import vocabulary from '../../data/vocabularyAll.js';
import npcsData from '../../data/npcs.json';
import questsData from '../../data/quests.json';
import { FONTS } from '../../styles/theme.js';
import styles from './DialogueOverlay.module.css';

/* ---------- helpers ---------- */

/**
 * Selects the correct dialogue tree for this NPC based on the player's
 * visit history and which words have already been taught.
 *
 * Priority:
 * 1. First visit (no dialogueState entry)      -> trigger "first_meeting"
 * 2. Return visit with untaught return trees    -> next "return_visit" tree
 * 3. Fallback                                   -> trigger "default"
 */
function pickDialogueTree(npc, dialogueState) {
  const state = dialogueState?.[npc.id];
  const trees = npc.dialogueTrees;

  // 1. First visit -- no prior state at all
  if (!state) {
    const introTree = trees.find((t) => t.trigger === 'first_meeting');
    if (introTree) return introTree;
  }

  // 2. Return visit -- find the next return_visit tree whose teachWords
  //    have NOT all been taught yet.
  const taughtSet = new Set(state?.wordsTaught ?? []);
  const returnTrees = trees.filter((t) => t.trigger === 'return_visit');

  for (const rt of returnTrees) {
    // Collect every teachWord id referenced in this tree's lines
    const treeWords = rt.lines
      .filter((l) => l.teachWord)
      .map((l) => l.teachWord);

    // If any word in this tree has NOT been taught, use this tree
    const hasUntaught = treeWords.some((w) => !taughtSet.has(w));
    if (hasUntaught) return rt;
  }

  // 3. Default fallback
  const defaultTree = trees.find((t) => t.trigger === 'default');
  if (defaultTree) return defaultTree;

  // Absolute fallback -- first tree
  return trees[0];
}

function resolveVocabWord(wordId) {
  return vocabulary.find((w) => w.id === wordId) ?? null;
}

/* ---------- styles removed - now using CSS Module ---------- */

/* ---------- component ---------- */

export default function DialogueOverlay() {
  const dispatch = useDispatch();
  const overlayData = useSelector((s) => s.ui.dialogueConfig);
  const cards = useSelector((s) => s.vocabulary.fsrsCards);
  const dialogueState = useSelector((s) => s.npc.dialogueState);
  const settings = useSelector((s) => s.settings);
  const quests = useSelector((s) => s.quests.quests);
  const playerLevel = useSelector((s) => s.player.level);
  const wordsLearned = useSelector((s) => s.player.wordsLearned);

  const npcId = overlayData?.npcId;
  const npc = npcsData.find((n) => n.id === npcId);

  // Pick the correct dialogue tree based on visit history
  const initialTree = useMemo(
    () => (npc ? pickDialogueTree(npc, dialogueState) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [npcId], // only recalculate when a new dialogue opens, not on every state change
  );

  const [currentTree, setCurrentTree] = useState(initialTree);
  const [lineIndex, setLineIndex] = useState(0);

  // Reset tree + line when a new NPC dialogue opens
  useEffect(() => {
    if (npc) {
      const tree = pickDialogueTree(npc, dialogueState);
      setCurrentTree(tree);
      setLineIndex(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [npcId]);

  /* ---- close handler ---- */
  const close = useCallback(() => {
    if (npc) {
      dispatch(updateDialogueState({ npcId: npc.id, lastLine: lineIndex }));
    }
    dispatch(closeDialogue());
    EventBus.emit('unfreeze-player');
  }, [dispatch, npc, lineIndex]);

  /* ---- early returns ---- */
  if (!npc || !currentTree) {
    // If we somehow got here without valid data, bail out
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

  /* ---- teach a vocabulary word (FSRS card + XP + quest tracking) ---- */
  const handleTeachWord = (wordId) => {
    const isNew = !cards[wordId];
    const word = resolveVocabWord(wordId);

    if (isNew && word) {
      EventBus.emit('sfx-wordlearned');
      dispatch(addFsrsCard({ wordId, card: createNewCard() }));
      dispatch(incrementWordsLearned());
      dispatch(addXP(XP_REWARDS.NEW_WORD));

      // Track quest progress for word category
      const categoryToEvent = {
        greetings: 'word_learned_greetings',
        trade: 'word_learned_trade',
        numbers: 'word_learned_numbers',
        food: 'word_learned_food',
        family: 'word_learned_family',
        nature: 'word_learned_nature',
        animals: 'word_learned_animals',
        body: 'word_learned_body',
        verbs_basic: 'word_learned_verbs_basic',
        adjectives: 'word_learned_adjectives',
        clothing: 'word_learned_clothing',
        colors: 'word_learned_colors',
        directions: 'word_learned_directions',
        time: 'word_learned_time',
        phrases: 'word_learned_phrases',
      };
      const event = categoryToEvent[word.category];
      if (event) {
        for (const qd of questsData) {
          if (qd.trackEvent === event && quests[qd.id]?.status === 'active') {
            dispatch(updateQuestProgress({ questId: qd.id, amount: 1 }));
            const current = (quests[qd.id]?.progress || 0) + 1;
            if (current >= qd.target) {
              dispatch(completeQuest(qd.id));
              dispatch(showNotification({ message: `Quest complete: ${qd.title}`, type: 'quest' }));
              dispatch(checkPrerequisites(questsData));
            }
          }
        }
      }
      // Always track "word_learned_any"
      for (const qd of questsData) {
        if (qd.trackEvent === 'word_learned_any' && quests[qd.id]?.status === 'active') {
          dispatch(updateQuestProgress({ questId: qd.id, amount: 1 }));
          const current = (quests[qd.id]?.progress || 0) + 1;
          if (current >= qd.target) {
            dispatch(completeQuest(qd.id));
            dispatch(showNotification({ message: `Quest complete: ${qd.title}`, type: 'quest' }));
            dispatch(checkPrerequisites(questsData));
          }
        }
      }
    }
    // Track in NPC slice regardless (idempotent)
    dispatch(npcTeachWord({ npcId: npc.id, wordId }));
  };

  /* ---- advance to next line ---- */
  const advance = () => {
    // Teach the word on the current line if present
    if (line.teachWord) {
      handleTeachWord(line.teachWord);
    }

    const nextIdx = lineIndex + 1;
    if (nextIdx < currentTree.lines.length) {
      const nextLine = currentTree.lines[nextIdx];

      // If the next line is a quiz action, open the quiz overlay
      if (nextLine.action === 'quiz') {
        let quizWords;

        if (nextLine.words === 'random_learned_10') {
          const learnedIds = Object.keys(cards);
          const shuffled = shuffle(learnedIds).slice(0, 10);
          quizWords = shuffled
            .map((id) => resolveVocabWord(id))
            .filter(Boolean);
          if (quizWords.length === 0) {
            // Use adaptive word selection for new players
            quizWords = selectWordsByDifficulty(vocabulary, 5, playerLevel, wordsLearned);
          }
        } else {
          quizWords = nextLine.words
            .map((id) => resolveVocabWord(id))
            .filter(Boolean);
        }

        const quizType =
          nextLine.quizType === 'random'
            ? ['ar-to-en', 'en-to-ar', 'en-to-type-ar'][
                Math.floor(Math.random() * 3)
              ]
            : nextLine.quizType;

        dispatch(openQuiz({ words: quizWords, quizType }));
        return;
      }

      setLineIndex(nextIdx);
    } else {
      close();
    }
  };

  /* ---- handle player choice buttons ---- */
  const handleChoice = (choice) => {
    EventBus.emit('sfx-click');
    if (choice.action === 'open_shop') {
      // Re-use the same dialogue config slot for shop
      dispatch(closeDialogue());
      EventBus.emit('open-shop', { npcId: npc.id });
    } else if (choice.action === 'open_alphabet') {
      close();
      EventBus.emit('open-alphabet');
    } else if (choice.action === 'daily_quiz') {
      const learnedIds = Object.keys(cards);
      const shuffled = shuffle(learnedIds).slice(0, 10);
      const quizWords = shuffled
        .map((id) => resolveVocabWord(id))
        .filter(Boolean);
      if (quizWords.length > 0) {
        dispatch(openQuiz({ words: quizWords, quizType: 'random' }));
      } else {
        close();
      }
    } else if (choice.next) {
      // Jump to a different tree by id
      const nextTree = npc.dialogueTrees.find((t) => t.id === choice.next);
      if (nextTree) {
        setCurrentTree(nextTree);
        setLineIndex(0);
      } else {
        close();
      }
    } else {
      // choice.next === null means close dialogue
      close();
    }
  };

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

  /* ---- portrait rendering ---- */
  const portraitSrc = `/assets/portraits/${npc.portrait}.png`;

  const renderPortrait = () => (
    <div className={styles.portraitWrap}>
      <div className={styles.portrait}>
        <img
          src={portraitSrc}
          alt={npc.name}
          className={styles.portraitImg}
          draggable={false}
        />
      </div>
      <div className={styles.portraitName}>{npc.name}</div>
      <div className={styles.portraitNameArabic}>{npc.nameArabic}</div>
    </div>
  );

  /* ---- teach word card rendering ---- */
  const renderTeachWordCard = (wordId) => {
    const word = resolveVocabWord(wordId);
    if (!word) return null;
    const alreadyKnown = !!cards[wordId];

    return (
      <div className={styles.teachContainer}>
        <span className={styles.teachBadge}>
          {alreadyKnown ? 'Review' : 'New Word!'}
        </span>
        <div className={styles.wordCard}>
          <div className={styles.wordCardArabic}>{word.arabic}</div>
          <div className={styles.wordCardEnglish}>{word.english}</div>
          <div className={styles.wordCardTranslit}>{word.transliteration}</div>
        </div>
      </div>
    );
  };

  /* ---- choice line rendering ---- */
  if (line.choices) {
    return (
      <div className={styles.overlay} role="dialog" aria-label="Dialogue choices">
        <div className={styles.backdrop} aria-hidden="true" />
        <div className={styles.dialogueBox}>
          {renderPortrait()}
          <div className={styles.content}>
            <div className={styles.speakerName} role="heading" aria-level="2">You</div>
            <div className={styles.choices} role="group" aria-label="Available dialogue choices">
              {line.choices.map((c, i) => (
                <button
                  key={i}
                  className={styles.choiceBtn}
                  onClick={() => handleChoice(c)}
                  aria-label={`Choice ${i + 1}: ${c.english}${c.arabic ? ` - ${c.arabic}` : ''}`}
                >
                  <div>
                    <span className={styles.choiceNumber} aria-hidden="true">{i + 1}</span>
                    {c.english}
                  </div>
                  {c.arabic && (
                    <div className={styles.choiceArabic} lang="ar">
                      {c.arabic}
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className={styles.choiceHint} aria-live="polite">Press 1-{line.choices.length} to select</div>
          </div>
        </div>
      </div>
    );
  }

  /* ---- normal dialogue line rendering ---- */
  const isPlayerSpeaking = line.speaker === 'player';
  const speakerName = isPlayerSpeaking ? 'You' : npc.name;

  return (
    <div className={styles.overlay} role="dialog" aria-label={`Dialogue with ${npc.name}`}>
      <div
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
      />
      <div
        className={styles.dialogueBox}
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
      >
        {renderPortrait()}
        <div className={styles.content}>
          <div className={styles.speakerName} role="heading" aria-level="2">{speakerName}</div>
          {line.arabic && <div className={styles.arabicLine} lang="ar">{line.arabic}</div>}
          {line.english && <div className={styles.englishLine}>{line.english}</div>}
          {settings?.showTransliteration && line.transliteration && (
            <div className={styles.translitLine} aria-label={`Transliteration: ${line.transliteration}`}>{line.transliteration}</div>
          )}
          {line.teachWord && renderTeachWordCard(line.teachWord)}
        </div>
        <div className={styles.continueHint} role="status" aria-live="polite">Space / Enter / Click to continue</div>
      </div>
    </div>
  );
}
