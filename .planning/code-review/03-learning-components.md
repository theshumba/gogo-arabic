# Code Review: Learning Components
Reviewed: 2026-05-05
Files in scope: 82

Scope: `src/components/{Alphabet,Grammar,Grammar/stages,Phonetics,Reading,Writing,Quiz,Idioms,Roots,Conversation,Poetry,CEFR,Placement,LearningPath,Keyboard}` and their `__tests__` subdirs. World/scenes/sprites/data-zones/maps deliberately out of scope (Lucas rebuild).

## Summary
- **Grammar quiz scoring is silently broken.** `lesson.quiz` items use `correct: <index>` but `GrammarLesson.handleAnswerSelect` compares the option string against `item.correct` (a number) and `item.answer` (undefined for quiz items). Every quiz answer is graded as wrong; XP and `quizScore` numerator are always 0 even on perfect runs. `multiple-select` is broken in the opposite direction — submission ALWAYS sends `correctAnswers.join(',')`, so multi-select is auto-scored correct regardless of what the user picked.
- **Cloze / classify exercises lose intermediate progress and grade only the final submit.** A 4-blank cloze where the user gets blanks 1–3 right and blank 4 wrong is recorded as a single "wrong" answer; if blank 4 is correct, all preceding misses on the same blank are also discarded. There is no per-blank scoring even though the data ships with multiple blanks.
- **Learning components install global `window` keydown listeners with no input-target filter.** `ReadingExercise.jsx` and `GrammarLesson.jsx` listen for `1-4`, `T`, `Enter`, `Escape` on `window`. Pressing any of these while focus is in another input/textarea elsewhere in the app (search box, chat, etc.) will silently submit answers / change views.
- **Render-phase side effects in three components.** `MicroReviewOverlay`, `ConversationPracticeOverlay`'s `ActiveView`, and `AlphabetModule` call parent setters / `onClose` / `setSelectedGroup` from inside the render path instead of an effect. This will produce React 19 warnings and can cause infinite re-render loops if the parent doesn't unmount synchronously.
- **Arabic answer-grading uses an under-spec'd normalize.** Sentence-build / WordOrder / Cloze grading strips harakat (U+064B–U+065F + U+0670) but does NOT strip Arabic punctuation (`،`, `؟`, `.`), tatweel (U+0640), normalize alef variants (`أ إ آ → ا`), or alef maqsura (`ى → ي`). Stored example sentences contain punctuation that the player cannot input via tile drag, so any sentence-build with terminal punctuation will be marked wrong.

## Findings

### CRITICAL Grammar quiz answers always graded wrong, multi-select always graded correct
**File:** `src/components/Grammar/GrammarLesson.jsx:69`
**Category:** bug
**Issue:** `const isCorrect = answer === item.answer || answer === item.correct;`
For `lesson.quiz[]` items, the data shape is `{ question, options, correct: <number index>, explanation }` (sampled at `src/data/grammar.js:51-54`). There is no `item.answer` property and `item.correct` is a numeric index. `answer` is the option string (e.g. `"الشمس"`). Both branches of the OR are false, so `isCorrect` is always false. `quizScore` never increments, `LESSON_COMPLETE` (50 XP) is awarded instead of `PERFECT_LESSON` (100 XP), and the per-lesson percentage stored via `recordQuizProgress` is always 0. The `feedbackMessage` template at line 77 (`item.options[item.correct]`) does work because `item.correct` IS a valid index there, so the user sees "Correct answer is X" on every quiz question even when they picked X.
For exercises of `type: 'multiple-select'`, the submit button at `ExerciseStage.jsx:275-279` always sends `exercise.correctAnswers.slice().sort().join(',')` — i.e. the correct answer joined — to `onAnswerSelect`, regardless of what the user actually toggled. Combined with `item.answer === 'ت,ش,ر'` in the data, this means multi-select is always auto-correct.
**Why it matters:** The whole grammar curriculum's quiz half is non-functional. Players see correct/wrong colours via `QuizStage.jsx:39` (which uses `idx === quizItem.correct` in display logic, separately from the grade!), so the UI looks fine, but the underlying score state is wrong, FSRS cards never schedule a "Good" review for grammar, and progression unlocks tied to score thresholds may never trigger.
**Suggested fix:** In `GrammarLesson.handleAnswerSelect`, branch on item shape:
```js
const isCorrect =
  item.correctAnswers ? answer === item.correctAnswers.slice().sort().join(',')
  : typeof item.correct === 'number' ? answer === item.options[item.correct]
  : answer === item.answer;
```
For multi-select, store `multiSelected` in `GrammarLesson` (lift from `ExerciseStage`) and submit the user's actual selection sorted-joined, not `correctAnswers`.

### CRITICAL Cloze and classify exercises grade only the last pick, lose partial-credit
**File:** `src/components/Grammar/stages/ExerciseStage.jsx:337-345` (cloze), `ExerciseStage.jsx:384-392` (classify)
**Category:** bug
**Issue:** When the user picks a wrong option on any blank that is NOT the last one, the code falls through to `onAnswerSelect(option); setClozeIndex(0)`, which records the single wrong answer as the answer for the WHOLE exercise and rewinds. When the user picks correctly on a non-last blank, it advances `clozeIndex` but never calls `onAnswerSelect` — so the parent never sees the correct answer for that blank. The result: only the user's pick on the LAST blank is graded. A wrong answer on blank 2 of 4 ends the exercise after blank 2, and a correct answer on blank 2 silently passes through.
Same control flow for `classify`. Even for the last blank, the grade in `GrammarLesson.handleAnswerSelect` compares `answer === item.answer`, but cloze items have no top-level `answer` field — they have `blanks[].answer`. So `item.answer` is undefined and cloze grading defaults to wrong (same root cause as the grammar quiz bug above).
**Why it matters:** Cloze exercises that ship with 2-3 blanks (e.g. `grammar.js:48`, `grammar.js:364`) cannot ever return a correct grade. Users will see all blanks sequentially work, then "Wrong! The answer is: undefined" at the end.
**Suggested fix:** Track per-blank correctness in local state, sum at the end, and grade against `exercise.blanks.length`:
```js
const [blankResults, setBlankResults] = useState([]);
// onClick:
const correct = option === exercise.blanks[clozeIndex].answer;
const next = [...blankResults, correct];
if (clozeIndex < exercise.blanks.length - 1) {
  setBlankResults(next);
  setClozeIndex(clozeIndex + 1);
} else {
  const allCorrect = next.every(Boolean);
  onAnswerSelect(allCorrect ? exercise.blanks.map(b => b.answer).join('|') : 'WRONG');
  setClozeIndex(0); setBlankResults([]);
}
```
Then in `GrammarLesson`, define `item.answer` for cloze/classify on data import or branch on type for grading.

### CRITICAL ConversationPracticeOverlay calls onComplete during render
**File:** `src/components/Conversation/ConversationPracticeOverlay.jsx:291-294`
**Category:** bug
**Issue:**
```jsx
if (isLastExchange && !feedback) {
  onComplete(sessionScore);
  return null;
}
```
This runs on every render when `currentIndex >= scenario.exchanges.length`. `onComplete` (passed from the parent `ConversationPracticeOverlay`) calls `setView('complete')` and `setFinalScore(score)` on the parent. Setting state on a parent during a child's render is illegal in React 19 and produces "Cannot update a component while rendering a different component". If the parent's `view` does not change synchronously (e.g. due to a race or a guard), this will infinite-loop.
**Why it matters:** Crashes or hangs on the last exchange of every conversation.
**Suggested fix:** Move into a `useEffect`:
```js
useEffect(() => {
  if (isLastExchange && !feedback) onComplete(sessionScore);
}, [isLastExchange, feedback, sessionScore, onComplete]);
return null; // (in render)
```

### CRITICAL MicroReviewOverlay calls onClose during render and skips first-encounter cards
**File:** `src/components/Quiz/MicroReviewOverlay.jsx:90-93` (render-time onClose), `src/components/Quiz/MicroReviewOverlay.jsx:64-69` (skip new-card FSRS update)
**Category:** bug, fsrs
**Issue 1:** `if (!currentWord || words.length === 0) { onClose(); return null; }` runs in the render body. Same React 19 violation as ConversationPracticeOverlay above. Will warn or loop if parent's `view` change doesn't unmount synchronously.
**Issue 2:** FSRS update is gated on `if (card)`. For a brand-new word (no FSRS card yet) the overlay still records the answer for `incrementReviews()` and XP, but never creates an FSRS card, so the next review-due query won't include the word. First-time encounters shown via this overlay are silently dropped from the spaced-repetition queue.
**Why it matters:** Reviews shown to the user that "look the same" silently differ in whether they enter the SRS — users will think they've practiced a word, but the system never schedules it.
**Suggested fix:**
```js
useEffect(() => {
  if (!currentWord || words.length === 0) onClose();
}, [currentWord, words.length, onClose]);
if (!currentWord || words.length === 0) return null;

// In handleAnswer:
const card = fsrsCards[currentWord.id]?.card ?? createNewCard();
const result = reviewCard(card, rating);
dispatch(updateFsrsCard({ wordId: currentWord.id, card: result.card, log: result.log }));
```

### CRITICAL AlphabetModule sets state during render
**File:** `src/components/Alphabet/AlphabetModule.jsx:113-116`
**Category:** bug
**Issue:**
```jsx
const currentLetter = groupLettersList[currentLetterIdx];
if (!currentLetter) {
  setSelectedGroup(null);
  return null;
}
```
Same render-phase setState pattern. Triggers React warning and may loop if the back-to-list transition doesn't clear `currentLetterIdx`.
**Why it matters:** Crash loop when `currentLetterIdx` overshoots the group length.
**Suggested fix:** Use `useEffect`:
```js
useEffect(() => {
  if (selectedGroup !== null && !groupLettersList[currentLetterIdx]) setSelectedGroup(null);
}, [selectedGroup, groupLettersList, currentLetterIdx]);
if (!currentLetter) return null;
```

### HIGH Recognition + writing quizzes in AlphabetModule progress on wrong answers
**File:** `src/components/Alphabet/AlphabetModule.jsx:241-256` (recognition), `src/components/Alphabet/AlphabetModule.jsx:279-293` (writing)
**Category:** bug
**Issue:** In the recognition step, `onClick={() => { if (!quizAnswer) setQuizAnswer(l.id); }}` and then `{quizAnswer && (<button … onClick={goNextStep}>Next</button>)}` — clicking ANY answer (correct or wrong) sets `quizAnswer` and shows the Next button. Same for the writing step: pressing Submit always sets `writingResult` and shows the Next button. The `completedIds` set is then updated by `goNextStep` regardless of whether the player got the letter right. The "Group X complete" indicator is wholly decorrelated from accuracy.
**Why it matters:** Players can complete the alphabet curriculum by clicking the wrong letter every time. XP per letter is awarded for engagement, not learning.
**Suggested fix:** Gate `goNextStep` on `quizAnswer === currentLetter.id` for recognition (with a "try again" path on wrong) and on `writingResult === true` for writing. Or surface a retry button when wrong.

### HIGH Global window keydown listeners hijack typing in inputs
**File:** `src/components/Reading/ReadingExercise.jsx:39-69`, `src/components/Grammar/GrammarLesson.jsx:33-53`
**Category:** bug, a11y
**Issue:** Both register `window.addEventListener('keydown', …)` and respond to bare `1-4`, `T`, `Enter`, `Escape` without checking `e.target.tagName !== 'INPUT'`/`'TEXTAREA'`. If a quiz / chat / search input is mounted concurrently (e.g. an in-game NPC dialogue with text input), typing "1" or "T" submits a quiz answer instead of inserting the character.
**Why it matters:** Severe accessibility/UX bug. Also, ReadingExercise's `T` toggle conflicts with Latin-keyboard transliteration entry.
**Suggested fix:**
```js
const handleKeyPress = (e) => {
  if (e.target?.matches?.('input, textarea, [contenteditable]')) return;
  // ... rest of logic
};
```

### HIGH Sentence-build / WordOrder grading mishandles punctuation, alef variants, and tatweel
**File:** `src/components/Quiz/QuizOverlay.jsx:90, 102-103, 110-114, 130`
**Category:** rtl-arabic, bug
**Issue:** The `normalize` function strips harakat only:
```js
const normalize = (s) => s.replace(/[ً-ٰٟ]/g, '').trim();
```
Stored example sentences (e.g. `coreVocabulary.js`: `'السَّلَامُ عَلَيْكُمْ يَا أَصْدِقَاء.'`) contain ASCII period, Arabic comma `،` (U+060C), question mark `؟` (U+061F), tatweel `ـ` (U+0640), and alef variants (`أ إ آ`). The tile bank generated for `sentence-build`/`WordOrder` contains words split on whitespace, so the user can never reconstruct punctuation. Comparison between user-joined tiles `"السلام عليكم يا أصدقاء"` and normalized expected `"السلام عليكم يا أصدقاء."` fails on the trailing dot. Also alef variant mismatches in tile bank vs. `word.arabic` are graded as wrong even though they're orthographically equivalent.
**Why it matters:** Whole sentence-build / WordOrder pool is unreliable. Players who reproduce the sentence correctly are marked wrong because of punctuation.
**Suggested fix:** Co-locate one canonical normalizer (already exists in `Dictation.jsx` as `normalizeArabic`) and reuse:
```js
const normalize = (s) =>
  s.replace(/[ً-ٰٟـ]/g, '')   // tashkeel + tatweel
   .replace(/[إأآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')   // canonical letters
   .replace(/[.،؟?!,;:]/g, '')                                       // punctuation
   .replace(/\s+/g, ' ').trim();
```
Move it to `src/utils/arabicUtils.js` and import from QuizOverlay, ClozePassage, FillInBlank, Dictation.

### HIGH FillInBlank and ClozePassage diacritic-strip regex differs from QuizOverlay's
**File:** `src/components/Quiz/FillInBlank.jsx:20`, `src/components/Quiz/ClozePassage.jsx:21`
**Category:** rtl-arabic, bug
**Issue:** Both files duplicate the same regex inline:
```js
/[ً-ٰٟۖ-ۜ۟-۪ۤۧۨ-ۭ]/g
```
This is broader than `QuizOverlay.jsx`'s `/[ً-ٰٟ]/g` and broader than `Dictation.jsx`'s `stripTashkeel`. Three different "strip diacritics" implementations across the same feature — inconsistent grading. Tashkeel like wasla (U+0671) is missed by all three but appears in vocabulary data.
**Why it matters:** A player who types/picks a Quranic-marked variant of a word (small high seen, U+06D8) gets graded inconsistently depending on which quiz type is rendering.
**Suggested fix:** Single source of truth in `arabicUtils.js`. Export `normalizeArabic` and use everywhere. Add wasla and quranic markers to a single canonical range.

### HIGH PoetryBattleOverlay's setTimeout fires after unmount
**File:** `src/components/Poetry/PoetryBattleOverlay.jsx:172-174`
**Category:** bug
**Issue:**
```js
setTimeout(() => { dispatch(advanceBlank()); }, 600);
```
No ref, no cleanup. If the player closes the overlay or the battle state transitions to `scoring` during the 600 ms delay, `advanceBlank` is dispatched against either a battle that has already moved on (advancing past `blanks.length`) or a non-existent battle, producing a noop or an out-of-bounds `currentBlankIndex`. The `setChoices` effect at line 104 then runs against `currentBlank = undefined` and dispatches empty choices.
**Why it matters:** Race condition with rapid-clicking and overlay close. Visible as "phantom" choices appearing on the next battle.
**Suggested fix:**
```js
const advanceTimerRef = useRef(null);
// in handleChoiceClick:
clearTimeout(advanceTimerRef.current);
advanceTimerRef.current = setTimeout(() => dispatch(advanceBlank()), 600);
// add cleanup:
useEffect(() => () => clearTimeout(advanceTimerRef.current), []);
```

### HIGH PronunciationChallenge score branches override each other
**File:** `src/components/Phonetics/PronunciationChallenge.jsx:151-167`
**Category:** bug
**Issue:** Five sequential `if` statements with no `else`:
```js
let attemptScore = 100;
if (replaysUsed > MAX_FREE_REPLAYS) attemptScore = 50;
else if (!correct) attemptScore = 0;
if (correct && replaysUsed > 1) attemptScore = 75;
if (!correct) attemptScore = 0;
// then
score: correct ? attemptScore || 100 : 0
```
The fall-through means: a wrong answer with `replaysUsed > MAX_FREE_REPLAYS` enters the first branch (`attemptScore = 50`), is then wiped to 0 by the last `if (!correct)`, but `attemptScore || 100` would have promoted 50 to 100 if correct were true — order matters. The `attemptScore || 100` rescue at the dispatch site is a code smell: if any of the branches set `attemptScore = 0` (replay-used + correct? no — but conceptually) the 0 gets coerced to 100. Confusing scoring.
Also `replaysUsed` is incremented in `playWord`'s `finally` block (line 137) — including the FIRST autoplay on mount. So a user who clicks the correct letter on the first try sees `replaysUsed === 1` (not 0) — the threshold logic is shifted by one off the variable name's intent.
**Why it matters:** Hard to reason about; effectively guarantees inconsistent scoring across rounds.
**Suggested fix:** Single `switch`/explicit truth table:
```js
let attemptScore;
if (!correct) attemptScore = 0;
else if (replaysUsed <= 1) attemptScore = 100;
else if (replaysUsed <= MAX_FREE_REPLAYS) attemptScore = 75;
else attemptScore = 50;
dispatch(recordPracticeAttempt({ id: round.correctLetterId, score: attemptScore, type: 'consonant' }));
```
Rename `replaysUsed` to `playsUsed` (it counts the first play too).

### HIGH ArabicKeyboard cannot type alef variants required by EnglishToTypeArabic
**File:** `src/components/Keyboard/ArabicKeyboard.jsx:4-8`, used by `src/components/Quiz/EnglishToTypeArabic.jsx:115-120` and `src/components/Alphabet/AlphabetModule.jsx:280-288`
**Category:** rtl-arabic, a11y, bug
**Issue:** The keyboard rows expose only `ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي ة ء` — 30 letters. Missing: hamza variants `أ إ آ ؤ ئ`, alef-maqsura `ى`, lam-alef ligature `لا`, all harakat (fatha, kasra, damma, sukun, shadda, tanwin), and space (default `showSpace=false`). The Alphabet writing quiz at `AlphabetModule.jsx:284` compares `writingInput.trim() === currentLetter.letter` — for letters whose forms include hamza-on-alef, they cannot be typed. EnglishToTypeArabic compares against `word.arabic` after normalize — but only QuizOverlay's normalize strips alef variants; EnglishToTypeArabic's `normalize` (line 90) strips harakat only.
**Why it matters:** Words like `أكل`, `أنا`, `إلى` cannot be entered correctly. Player types `اكل` and gets graded wrong even though the keyboard can't produce `أ`. Also no visual hint to the user that they're missing characters.
**Suggested fix:** Add a top row with hamza variants and a harakat strip, plus `Space` button when `showSpace=true`. At minimum add `أ إ آ ى` to the existing rows. Add `aria-label={letter-name}` for screen reader support.

### HIGH MatchPairs grading depends on stale `errors` ref in setTimeout
**File:** `src/components/Quiz/MatchPairs.jsx:23`
**Category:** bug
**Issue:**
```js
if (newMatched.size === words.length) { setTimeout(() => onComplete(errors === 0), 500); }
```
`errors` is captured at the time the setTimeout is scheduled. If `setErrors` dispatched earlier in this same call (line 25 — `setErrors(e => e + 1)` for wrong matches) hasn't been flushed yet, the captured value is stale. Practically: a perfect run never increments `errors` so it's 0; if the last action is a wrong-then-right combo, the captured `errors` reads the value from the moment the schedule was set, not the post-state. Subtle race.
Also `useCallback` deps include `errors` (line 29) so the callback re-creates each error increment — but the in-flight setTimeout still uses the old captured value.
**Why it matters:** "Perfect" reward (line 23 — `errors === 0`) may be incorrectly granted or denied on edge cases.
**Suggested fix:** Use a ref:
```js
const errorsRef = useRef(0);
// on wrong:
errorsRef.current += 1; setErrors(errorsRef.current);
// in onComplete:
setTimeout(() => onComplete(errorsRef.current === 0), 500);
```

### MEDIUM IdiomQuiz cleanup ref runs but ADVANCE_DELAY race remains
**File:** `src/components/Idioms/IdiomQuiz.jsx:110-130`
**Category:** bug
**Issue:** `timerRef.current = setTimeout(...)` is set but only the latest one is cleaned up by the effect at line 67-71. If the user clicks two answers in rapid succession (the disabled gate `isAnswered` blocks this in practice — line 75 `if (isAnswered) return`), the first timer would be lost without clearing — but this is currently safe due to the gate. However, when the effect at line 60-64 resets `isAnswered = false` on `currentQuestionIdx` change, the prior timer ALSO gets nulled out from the `current` slot but the function still pending — fine in this case because `setShowResult` and `setCurrentQuestionIdx` operate on safe states.
**Why it matters:** Latent — if `ADVANCE_DELAY` is ever raised or `isAnswered` gate is removed, double-fire is possible.
**Suggested fix:** Always `clearTimeout(timerRef.current)` before setting a new one, in `handleAnswer`.

### MEDIUM RootExplorer expanded-words Set keys collide on duplicate Arabic strings
**File:** `src/components/Roots/RootExplorer.jsx:130-140, 296, 301`
**Category:** bug
**Issue:** `expandedWords` is a `Set` keyed by `arabicText` (the raw Arabic string). Two different vocabulary entries can share an Arabic spelling but different `id`s (a homograph: `كتب` as a verb form and `كتب` as the plural noun). Toggling expansion on one expands both. Same problem when one of the entries is a string from `quranicDetails.words` and one is a vocab object — they share the Arabic but should be independently expandable.
**Why it matters:** Confusing UX in roots view.
**Suggested fix:** Key on `wordItem.id ?? arabicText` (vocab) or `index-arabicText` (Quranic).

### MEDIUM ReadingExercise vs ReadingPassageOverlay schema drift
**File:** `src/components/Reading/ReadingExercise.jsx:26-27`, `src/components/Reading/ReadingPassageOverlay.jsx:208`, both consume `src/data/readingPassages.js`
**Category:** bug, dead-code
**Issue:** `ReadingPassageOverlay` is the FSRS-aware, vocab-tooltipped, Redux-integrated component (Phase 82). `ReadingExercise.jsx` is the older non-FSRS standalone with its own state machine, no Redux integration, no vocabulary tooltip, and uses `getPassagesByDifficulty`. Both are exported from `src/components/Reading/`; only `ReadingExercise` is re-exported from `index.js`. They consume the same data file but `ReadingExercise` references `passage.questions[i].correct` (numeric) while passages have `correctIndex` per `ReadingPassageOverlay`. Quick check at line 91: `ans === passage.questions[idx].correct` — if `correct` is undefined and items use `correctIndex`, the score is always 0. Either ReadingExercise is dead code or it's silently broken in the same way as the grammar quiz.
**Why it matters:** Dual implementations of the same feature; one is reachable via `index.js` and likely broken.
**Suggested fix:** Confirm which is reachable from the router, delete the other. If `ReadingExercise` is shipped, change line 91/148/162 to use `correctIndex`.

### MEDIUM VocabTooltip dispatches a raw action type string, bypassing the slice
**File:** `src/components/Reading/VocabTooltip.jsx:46-58`
**Category:** bug
**Issue:**
```js
try {
  dispatch({
    type: 'vocabulary/addFsrsCard',
    payload: { wordId, arabic, english, transliteration },
  });
} catch { /* silently fail */ }
```
The slice DOES export `addFsrsCard` (verified at `vocabularySlice.js:25, 84`), and Redux Toolkit's generated action type IS `'vocabulary/addFsrsCard'`, so this path WORKS today. But:
1. The reducer signature accepts `{ wordId, card, source }` (sampled from the slice handler), NOT `{ wordId, arabic, english, transliteration }`. The arabic/english/transliteration payload fields are dropped by the reducer; the new card has `card: undefined`.
2. The `try/catch` around `dispatch` cannot catch reducer failures (Redux dispatch never throws for unknown action types).
**Why it matters:** "Add to review" looks like it works (button gets disabled because `alreadyAdded` updates), but the FSRS card is empty/null, so the next FSRS query for due cards may treat it as new-and-due forever or skip it entirely.
**Suggested fix:** Import the action creator and pass the right shape:
```js
import { addFsrsCard } from '../../store/slices/vocabularySlice.js';
dispatch(addFsrsCard({ wordId: vocab.wordId, card: null, source: 'reading' }));
```

### MEDIUM WritingPracticeOverlay TTS leaks utterances
**File:** `src/components/Writing/WritingPracticeOverlay.jsx:157-166`
**Category:** bug
**Issue:**
```js
const utterance = new SpeechSynthesisUtterance(display.arabic);
utterance.lang = 'ar';
utterance.rate = 0.8;
window.speechSynthesis.speak(utterance);
```
No `cancel()` call before `speak()`. Multiple rapid `Pronounce` clicks queue utterances; navigating away leaves them speaking. No `lang` voice availability check (Safari without an Arabic voice will silently produce English-pronounced Arabic graphemes). No cleanup on unmount.
**Why it matters:** Audio bleed; jarring UX.
**Suggested fix:**
```js
window.speechSynthesis.cancel();
window.speechSynthesis.speak(utterance);
// in component:
useEffect(() => () => window.speechSynthesis.cancel(), []);
```

### MEDIUM Dictation auto-play timer logic doesn't account for fallback path
**File:** `src/components/Quiz/Dictation.jsx:74-88`
**Category:** bug
**Issue:**
```js
useEffect(() => {
  const available = isArabicTtsAvailable();
  setTtsAvailable(available);
  if (available) {
    const timer = setTimeout(playAudio, 300);
    return () => { clearTimeout(timer); stopSpeech(); };
  }
}, [word.id]);
```
When TTS is NOT available on mount, no cleanup is registered. If `setTtsAvailable(true)` is later flipped to `false` from `playAudio`'s `catch`, the cleanup that ran when `word.id` changed never called `stopSpeech` (because `available` was truthy at the time). This is a small leak, but `isSpeaking` state may also get stuck `true` if `speakArabic` rejects without setting `false` — but the `finally` block at line 70 handles it.
A bigger issue: the TTS-failed path sets `ttsAvailable = false` but the round still requires the player to type the word — and the fallback shows `word.transliteration || word.arabic` which gives away the answer for transliteration mode but is correct for dictation since the goal is to produce Arabic.
**Why it matters:** Edge case: device with TTS-flag-true but speaks-rejects falls into a weird state where the user sees the Arabic word displayed AND a hint button.
**Suggested fix:** Always register a cleanup; flip `ttsAvailable` synchronously on the first failure rather than per-call.

### MEDIUM ReadingPassageOverlay escapes regex but not vocab.arabic value used elsewhere
**File:** `src/components/Reading/ReadingPassageOverlay.jsx:42-65`
**Category:** rtl-arabic, bug
**Issue:** `renderArabicWithHighlights` builds `new RegExp(`(${escaped.join('|')})`, 'g')` and then does `parts.split(regex)`. The split result interleaves matches with non-matches, but the lookup `sorted.find((v) => v.arabic === part)` relies on EXACT string match — including surrounding whitespace, punctuation, and any harakat present in the passage but not in `vocab.arabic`. If the passage stores `"الكِتَاب"` (with diacritics) and the vocab `arabic` is `"الكتاب"` (without), the regex won't match the diacritic'd form and the highlight is silently lost.
**Why it matters:** Vocabulary highlights inconsistently apply based on whether passage diacritics match the vocab dictionary form.
**Suggested fix:** Strip diacritics from BOTH the passage and the vocab key before matching, and render the original character with click handlers anchored on positions, not equality.

### MEDIUM IdiomExplorer creates a new related-idioms shuffled list on every render
**File:** `src/components/Idioms/IdiomExplorer.jsx:119-128`
**Category:** react-perf, bug
**Issue:** `getRelatedIdioms` is a `useCallback` with empty deps but uses `Math.random()` inside `.sort(() => Math.random() - 0.5)`. Each render of an expanded card re-shuffles the related list. The user sees the related idioms re-arrange every keystroke into the search box.
**Why it matters:** Distracting UI flicker, breaks visual stability.
**Suggested fix:** Compute related idioms once per `idiom.id` via `useMemo`, or use a deterministic hash-based shuffle.

### MEDIUM CefrProgressReport mid-file `import PropTypes`
**File:** `src/components/CEFR/CefrProgressReport.jsx:247`
**Category:** complexity, dead-code
**Issue:** ES modules require imports at the top of the file. Vite/Rollup hoist them, but a mid-file `import PropTypes from 'prop-types'` confuses linters and code readers. Also the project mixes `prop-types` and zod-style validation — there is no consistent pattern. Most components have no prop validation at all.
**Why it matters:** Inconsistent style; PropTypes here isn't enforced because the file consumes prop validation only for one component.
**Suggested fix:** Move import to top. Decide on a single prop-validation strategy across learning components.

### MEDIUM PoetryBattleOverlay shows correct word for both right and wrong answers
**File:** `src/components/Poetry/PoetryBattleOverlay.jsx:373-381`
**Category:** bug, complexity
**Issue:**
```jsx
return (
  <span key={i} className={seg.answered.isCorrect ? styles.blankCorrect : styles.blankWrong}>
    {seg.correctWord}
  </span>
);
```
For both correct and wrong answers, the rendered text is `seg.correctWord`. The player who picked the wrong word sees the CORRECT word in red, with no indication of what they actually picked. The pedagogically useful "you said X, the answer was Y" affordance is missing, and the visual cue is misleading (red on correct content reads as "this word is wrong" rather than "you got this slot wrong").
**Why it matters:** Player feedback is misleading; learners cannot self-correct.
**Suggested fix:** Track `playerWord` per answer (already in `answer.wordId` — look up the chosen word's arabic via the choices). Render `playerWord` in the slot; show `correctWord` separately on hover or below.

### MEDIUM PictureWord transliteration hint reveals the answer
**File:** `src/components/Quiz/PictureWord.jsx:40-42`
**Category:** bug
**Issue:** The "Picture word" quiz shows category icon + English description + Arabic transliteration of the target word. Choices are 4 Arabic words. With transliteration shown, the player just picks the option whose visible Arabic matches the transliteration phonetically — defeats the point of the quiz.
**Why it matters:** Quiz becomes a free question.
**Suggested fix:** Either hide the transliteration during the question (show only after answering) or remove this quiz type. Or use it only in initial-encounter scenarios.

### MEDIUM MicroReviewOverlay uses Math.random() for distractor pool
**File:** `src/components/Quiz/MicroReviewOverlay.jsx:46`
**Category:** bug
**Issue:**
```js
while (distractors.length < 3) {
  const fallback = vocabulary[Math.floor(Math.random() * vocabulary.length)];
  if (fallback.english !== correct && !distractors.includes(fallback.english)) {
    distractors.push(fallback.english);
  }
}
```
Unbounded loop. If vocabulary is small (test environments) or `correct` matches many entries, this could spin. Also `vocabulary` is a top-level import and is the same list every render — for a given target word, the distractor set is non-deterministic across renders, but the effect re-runs only on `currentIndex` change, so this is OK in practice. The ESLint suppression at line 52 (`exhaustive-deps`) hides that `currentWord` is also a dep.
**Why it matters:** Non-deterministic distractors mean unit test repro is hard.
**Suggested fix:** Add an iteration cap and a deterministic fallback:
```js
let attempts = 0;
while (distractors.length < 3 && attempts++ < 50) { /* ... */ }
while (distractors.length < 3) distractors.push('—');
```

### MEDIUM PlacementTestOverlay early-return after feedback timer keeps timer ref dangling
**File:** `src/components/Placement/PlacementTestOverlay.jsx:120-141`
**Category:** bug
**Issue:** `feedbackTimerRef.current = setTimeout(...)` schedules state updates 800 ms later. The cleanup at line 62-66 clears it on unmount, BUT if `setPhase('result')` is called in `computeResult`, the component re-renders into the result phase while the prior timer is still in flight — line 124-138 fires inside the resolved scope (`answers.length` etc are stable via useState refs) and then calls `advanceToNextItem`, which calls `selectNextItem` and `setCurrentItem`. In the result phase that's a wasted state update; in the testing→result transition during the timer, you get a dangling write to `currentItem` after `phase === 'result'`.
**Why it matters:** Subtle bug; flakiness if early-exit happens immediately after a feedback delay.
**Suggested fix:** In `feedbackTimerRef`, before each branch, check `phase` is still `'testing'`. Or use `useRef` for `phase` to short-circuit after the result is computed.

### MEDIUM HandwritingPractice trend logic compares 5-point delta on raw accuracy
**File:** `src/components/Alphabet/HandwritingPractice.jsx:29-36`
**Category:** bug, complexity
**Issue:** `getTrend` reads only `recentAttempts[last]` and `[prev]`. The thresholds `+5`/`-5` apply to a 0-100 accuracy scale but ratings are quantized to `[0, 25, 50, 75, 100]`. A delta of 25 between consecutive attempts is the smallest possible non-zero signal; the 5-point threshold is meaningless. Trend will always report `improving` or `declining` on any rating change.
**Why it matters:** The "→ stable" state is unreachable in practice; users see flickering arrows.
**Suggested fix:** Compare the average of the last 3 vs. the previous 3, or use the spec's quantization (delta ≥ 25 → improving/declining).

### LOW Grammar quiz `feedbackMessage.includes('Correct')` is brittle
**File:** `src/components/Grammar/stages/ExerciseStage.jsx:17, 231`, `src/components/Grammar/stages/QuizStage.jsx:11`
**Category:** complexity
**Issue:** Determining correctness from the substring `'Correct'` in `feedbackMessage` is fragile — any future i18n or edit to the message text breaks the visual feedback.
**Suggested fix:** Lift `isCorrect` boolean from `GrammarLesson` to children rather than re-deriving from a string.

### LOW Multiple useFormatArabic destructures discard `renderArabic`
**File:** `src/components/Quiz/EnglishToArabic.jsx:6`, `src/components/Quiz/Dictation.jsx:52`, others
**Category:** dead-code
**Issue:** `const { renderArabic } = formatArabic;` extracts a function never used in the JSX of the same file (uses `formatArabic(...)` elsewhere). Cleanup.

### LOW grammarStyles.js is dead code
**File:** `src/components/Grammar/grammarStyles.js`
**Category:** dead-code
**Issue:** No imports in the codebase. Stages all use `GrammarStages.module.css`.
**Suggested fix:** Delete.

### LOW LearningPath hardcodes vocabulary count `1220`
**File:** `src/components/LearningPath/LearningPath.jsx:41`
**Category:** complexity
**Issue:** Magic number drifts as vocabulary grows.
**Suggested fix:** `import vocabulary from '../../data/vocabularyAll.js'; const TOTAL = vocabulary.length;`

### LOW DailyIdiom uses selector factories in render
**File:** `src/components/Idioms/DailyIdiom.jsx:42-43`
**Category:** react-perf
**Issue:** `useSelector(selectIdiomIsLearned(effectiveId))` calls a selector factory on every render, producing a new selector function. useSelector then runs it; the result is a primitive boolean, so no re-render is forced from the new function identity, but it's slightly wasteful and confuses memoization.
**Suggested fix:** Make the selector parameterless and select the whole map, or use `createSelector` factories with `useSelector(useMemo(() => createSelector(...), [id]))`.

## Patterns / Systemic Concerns

1. **Three independent Arabic-text normalizers exist** (`QuizOverlay.jsx`'s `normalize`, `Dictation.jsx`'s `normalizeArabic`, the duplicated regex in `FillInBlank`/`ClozePassage`). They strip different unicode ranges, so the same player input is graded differently across quiz types. `arabicUtils.js`'s `stripDiacritics` strips a broader range still (incl. U+06D6-06ED). Pick one canonical normalizer and apply everywhere.

2. **Render-phase side effects are recurrent.** Three components (MicroReview, ConversationActiveView, AlphabetModule) call parent setters during render. This will cascade into React 19 Strict Mode warnings and intermittent hangs. A linting rule (`react-hooks/exhaustive-deps` + custom `no-set-state-in-render`) would catch these.

3. **Global `window` keydown listeners proliferate** across overlays without target-tag filtering or "in-active-overlay" guarding. Any overlay or input added later to the app will collide. Provide a single `useOverlayKeyboard(handlers, { ignoreInputs: true })` hook and migrate all components to it.

4. **Answer-grading lives in the parent overlays/lessons** (`QuizOverlay.handleAnswer`, `GrammarLesson.handleAnswerSelect`) instead of in the data definitions. The grader is a giant if-else chain that drifts as new types are added (RootExpand and DialectIdentify are special-cased; cloze/classify in grammar were never added). Each quiz type should expose `grade(userAnswer, item) -> { correct, normalized }` and the overlay should be a pure dispatcher.

5. **Test coverage gap on grading paths.** `__tests__` exist for ARIA labels, render shape, and slice reducers, but NOT for: (a) GrammarLesson scoring against quiz items, (b) cloze/classify partial-credit, (c) sentence-build punctuation/alef tolerance, (d) MicroReviewOverlay first-encounter FSRS card creation, (e) PronunciationChallenge score branches. These are the BUSINESS LOGIC of a learning app — they need property-based or table-driven tests.

6. **FSRS update guards are inconsistent.** Some components require an existing card before updating (MicroReview), others create one on-the-fly (useQuiz hook). First-encounter FSRS card creation should be centralised in `services/fsrs.js` and called by every grading path uniformly.

7. **Arabic keyboard does not match the grading vocabulary.** The keyboard offers 30 base letters with no harakat, no hamza variants, no lam-alef ligature, no space. Grading layers strip harakat (in some places) and normalize alef variants (in other places), making the keyboard "good enough" for a subset of words by accident. Either expand the keyboard or constrain `EnglishToTypeArabic` to words composed only of bare keyboard glyphs.

8. **`pixelBtnGold`/`pixelBtnDark` inline-style spread + dynamic CSS modules.** Multiple files (RootExplorer, ReadingExercise, PlacementTestOverlay) compose buttons by spreading inline-style objects + module classes — this defeats CSS Modules' specificity and causes inconsistent rendering when both target the same property. Pick one styling layer.

## Out of scope but flagged

- `ReadingExercise.jsx` is wired through `Reading/index.js`'s default export. If the router actually renders this older pre-FSRS component, FSRS scheduling for words encountered in reading is silently disabled. Confirm which is in production via the router (out of my scope).
- `useQuiz.js` (in `src/hooks/`) is the central grading engine called from QuizOverlay. Its FSRS rating logic at line 462 maps `correct → Rating.Good`, `incorrect → Rating.Again` with no "Hard" or "Easy" path. Spaced-repetition will collapse to a binary scheduler. Worth reviewing in the hooks pass.
- `services/fsrs.js`'s `getRetrievability(card)` returns 1.0 for `reps === 0` instead of consulting `scheduler.get_retrievability` — fine for new cards but means you cannot distinguish "never seen" from "seen but no stability data" for analytics.
- `selectIdiomIsLearned` and `selectIdiomIsFavorite` are factory selectors that return a new function each call — same micro-pattern flagged across the codebase. Worth an architectural pass on selector factories.
