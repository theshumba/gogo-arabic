import { useState, useCallback, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { closeDialogue, openQuiz, showNotification } from '../../store/slices/uiSlice.js';
import { updateDialogueState, teachWord as npcTeachWord } from '../../store/slices/npcSlice.js';
import { addFsrsCard, updateFsrsCard } from '../../store/slices/vocabularySlice.js';
import { addXP, incrementWordsLearned } from '../../store/slices/playerSlice.js';
import { updateQuestProgress, completeQuest, checkPrerequisites } from '../../store/slices/questSlice.js';
import { createNewCard } from '../../services/fsrs.js';
import { EventBus } from '../../game/EventBus.js';
import { XP_REWARDS } from '../../utils/xpCalculator.js';
import vocabulary from '../../data/vocabulary.json';
import npcsData from '../../data/npcs.json';
import questsData from '../../data/quests.json';
import { COLORS, FONTS, pixelPanel, pixelBtnGold } from '../../styles/theme.js';

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

/* ---------- styles ---------- */

const styles = {
  overlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    zIndex: 200,
    pointerEvents: 'none',
    fontFamily: FONTS.pixel,
    imageRendering: 'pixelated',
  },
  backdrop: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.55)',
    pointerEvents: 'auto',
  },
  dialogueBox: {
    position: 'relative',
    background: COLORS.dark,
    borderTop: `4px solid ${COLORS.xpGold}`,
    padding: '16px 20px',
    color: COLORS.white,
    minHeight: '180px',
    pointerEvents: 'auto',
    display: 'flex',
    gap: '16px',
    fontFamily: FONTS.pixel,
    boxShadow: `
      inset 0 -4px 0 0 rgba(0,0,0,0.3),
      inset 0 4px 0 0 rgba(255,255,255,0.05)
    `,
  },
  portraitWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flexShrink: 0,
  },
  portrait: {
    ...pixelPanel,
    width: '96px',
    height: '96px',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: COLORS.gray,
    border: `4px solid ${COLORS.dark}`,
    boxShadow: `
      inset -3px -3px 0px 0px rgba(0,0,0,0.4),
      inset 3px 3px 0px 0px rgba(255,255,255,0.1)
    `,
    overflow: 'hidden',
  },
  portraitImg: {
    width: '96px',
    height: '96px',
    imageRendering: 'pixelated',
    objectFit: 'cover',
  },
  portraitName: {
    fontFamily: FONTS.pixel,
    fontSize: '8px',
    textAlign: 'center',
    marginTop: '6px',
    color: COLORS.xpGold,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    maxWidth: '96px',
    lineHeight: 1.4,
  },
  portraitNameArabic: {
    fontFamily: FONTS.arabic,
    fontSize: '14px',
    textAlign: 'center',
    marginTop: '2px',
    color: COLORS.xpGold,
    direction: 'rtl',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  speakerName: {
    fontFamily: FONTS.pixel,
    fontSize: '10px',
    color: COLORS.xpGold,
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  arabicLine: {
    fontSize: '26px',
    fontFamily: FONTS.arabic,
    direction: 'rtl',
    textAlign: 'right',
    lineHeight: 1.7,
    marginBottom: '6px',
    color: COLORS.xpGold,
  },
  englishLine: {
    fontFamily: FONTS.pixel,
    fontSize: '11px',
    color: COLORS.white,
    marginBottom: '4px',
    lineHeight: 1.8,
  },
  translitLine: {
    fontFamily: FONTS.pixel,
    fontSize: '9px',
    color: COLORS.lightGray,
    fontStyle: 'italic',
    lineHeight: 1.6,
  },

  /* ---------- teach word badge + card ---------- */
  teachContainer: {
    marginTop: '10px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
  },
  teachBadge: {
    display: 'inline-block',
    background: COLORS.xpGold,
    border: `4px solid ${COLORS.dark}`,
    padding: '4px 10px',
    fontFamily: FONTS.pixel,
    fontSize: '8px',
    color: COLORS.dark,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    flexShrink: 0,
    boxShadow: `
      inset -2px -2px 0px 0px rgba(0,0,0,0.2),
      inset 2px 2px 0px 0px rgba(255,255,255,0.3)
    `,
  },
  wordCard: {
    background: COLORS.gray,
    border: `3px solid ${COLORS.xpGold}`,
    padding: '8px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  wordCardArabic: {
    fontFamily: FONTS.arabic,
    fontSize: '22px',
    direction: 'rtl',
    textAlign: 'right',
    color: COLORS.xpGold,
    lineHeight: 1.5,
  },
  wordCardEnglish: {
    fontFamily: FONTS.pixel,
    fontSize: '10px',
    color: COLORS.white,
  },
  wordCardTranslit: {
    fontFamily: FONTS.pixel,
    fontSize: '8px',
    color: COLORS.lightGray,
    fontStyle: 'italic',
  },

  /* ---------- choices ---------- */
  choices: {
    display: 'flex',
    gap: '10px',
    marginTop: '12px',
    flexWrap: 'wrap',
  },
  choiceBtn: {
    ...pixelPanel,
    padding: '10px 16px',
    background: COLORS.beige,
    border: `4px solid ${COLORS.dark}`,
    color: COLORS.dark,
    cursor: 'pointer',
    fontFamily: FONTS.pixel,
    fontSize: '10px',
    flex: 1,
    textAlign: 'center',
    minWidth: '100px',
    boxShadow: `
      inset -3px -3px 0px 0px rgba(0,0,0,0.15),
      inset 3px 3px 0px 0px rgba(255,255,255,0.4),
      0 4px 0 0 ${COLORS.brown}
    `,
    transition: 'transform 0.05s',
  },
  continueHint: {
    position: 'absolute',
    bottom: '8px',
    right: '16px',
    fontFamily: FONTS.pixel,
    fontSize: '8px',
    color: COLORS.lightGray,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
};

/* ---------- component ---------- */

export default function DialogueOverlay() {
  const dispatch = useDispatch();
  const overlayData = useSelector((s) => s.ui.dialogueConfig);
  const cards = useSelector((s) => s.vocabulary.fsrsCards);
  const dialogueState = useSelector((s) => s.npc.dialogueState);
  const settings = useSelector((s) => s.settings);
  const quests = useSelector((s) => s.quests.quests);

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
          const shuffled = learnedIds.sort(() => Math.random() - 0.5).slice(0, 10);
          quizWords = shuffled
            .map((id) => resolveVocabWord(id))
            .filter(Boolean);
          if (quizWords.length === 0) {
            quizWords = vocabulary.slice(0, 5);
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
      const shuffled = learnedIds.sort(() => Math.random() - 0.5).slice(0, 10);
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

  /* ---- portrait rendering ---- */
  const portraitSrc = `/assets/portraits/${npc.portrait}.png`;

  const renderPortrait = () => (
    <div style={styles.portraitWrap}>
      <div style={styles.portrait}>
        <img
          src={portraitSrc}
          alt={npc.name}
          style={styles.portraitImg}
          draggable={false}
        />
      </div>
      <div style={styles.portraitName}>{npc.name}</div>
      <div style={styles.portraitNameArabic}>{npc.nameArabic}</div>
    </div>
  );

  /* ---- teach word card rendering ---- */
  const renderTeachWordCard = (wordId) => {
    const word = resolveVocabWord(wordId);
    if (!word) return null;
    const alreadyKnown = !!cards[wordId];

    return (
      <div style={styles.teachContainer}>
        <span style={styles.teachBadge}>
          {alreadyKnown ? 'Review' : 'New Word!'}
        </span>
        <div style={styles.wordCard}>
          <div style={styles.wordCardArabic}>{word.arabic}</div>
          <div style={styles.wordCardEnglish}>{word.english}</div>
          <div style={styles.wordCardTranslit}>{word.transliteration}</div>
        </div>
      </div>
    );
  };

  /* ---- choice line rendering ---- */
  if (line.choices) {
    return (
      <div style={styles.overlay}>
        <div style={styles.backdrop} />
        <div style={styles.dialogueBox}>
          {renderPortrait()}
          <div style={styles.content}>
            <div style={styles.speakerName}>You</div>
            <div style={styles.choices}>
              {line.choices.map((c, i) => (
                <button
                  key={i}
                  style={styles.choiceBtn}
                  onClick={() => handleChoice(c)}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'translateY(2px)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div>{c.english}</div>
                  {c.arabic && (
                    <div
                      style={{
                        fontSize: '18px',
                        fontFamily: FONTS.arabic,
                        direction: 'rtl',
                        marginTop: '6px',
                        color: COLORS.brown,
                      }}
                    >
                      {c.arabic}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---- normal dialogue line rendering ---- */
  const isPlayerSpeaking = line.speaker === 'player';
  const speakerName = isPlayerSpeaking ? 'You' : npc.name;

  return (
    <div style={styles.overlay}>
      <div style={styles.backdrop} onClick={advance} />
      <div style={styles.dialogueBox} onClick={advance}>
        {renderPortrait()}
        <div style={styles.content}>
          <div style={styles.speakerName}>{speakerName}</div>
          {line.arabic && <div style={styles.arabicLine}>{line.arabic}</div>}
          {line.english && <div style={styles.englishLine}>{line.english}</div>}
          {settings?.showTransliteration && line.transliteration && (
            <div style={styles.translitLine}>{line.transliteration}</div>
          )}
          {line.teachWord && renderTeachWordCard(line.teachWord)}
        </div>
        <div style={styles.continueHint}>Click to continue</div>
      </div>
    </div>
  );
}
