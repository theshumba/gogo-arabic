# Phase 58: Grammar A1-A2 + Lesson Wiring — Research

**Researched:** 2026-03-22
**Domain:** grammar.js data, ExerciseStage renderer, grammarSlice, learningProgressMiddleware, GrammarModule auto-unlock wiring
**Confidence:** HIGH — all findings sourced directly from the project codebase

---

## Summary

Phase 58 targets two success criteria: (1) every A1-A2 grammar lesson presents at least 12 distinct exercises spanning 4 or more exercise formats, and (2) completing any grammar lesson immediately awards 40 XP to the Grammar skill tree and auto-unlocks the next lesson in sequence. Research reveals the full scope of each task.

**The central content gap:** The first 7 lessons in `grammar.js` (orders 1-7, no `cefrLevel` tag) are fully fleshed out — 5 exercises and 4 quiz questions each, using 3 exercise types: `fill-blank`, `translate`, and `match`. The 12 CEFR-tagged A1/A2 lessons (orders 13-25, `cefrLevel: 'A1'` or `'A2'`) are stubs — 1 to 3 exercises each, 0 quiz questions, and exercises typed with double-quoted strings while the 7 well-built lessons use single-quoted strings (cosmetic inconsistency, no functional impact). 20 new A1-A2 lessons need to be authored with 12+ exercises each covering the 4 required formats.

**The XP wiring gap:** `learningProgressMiddleware` already routes `grammar/completeLesson` → `grammar` tree +40 XP (Phase 57, confirmed live). The dispatch happens at the Redux layer so it is invisible to `GrammarLesson.jsx`. What is missing is auto-unlock of the next lesson in sequence: `grammarSlice` records `completedLessons` but never derives "next lesson" and never exposes any `unlockedLessons` concept. `GrammarModule.jsx` shows all lessons with no gating at all. The lesson-sequence auto-unlock must be added to both `grammarSlice` (reducer + selector) and `GrammarModule.jsx` (rendering gate).

**The new exercise types:** The current ExerciseStage renderer handles only `fill-blank`, `translate`, and `match`. The 8 new exercise types required by GRAM-02 (conjugation-drill, sentence-transformation, word-order, error-identification, and at least 4 more) do not exist in the renderer or data schema. Both data schema and renderer must be extended together.

**GrammarChecker.js:** The plan names a new `GrammarChecker.js` file for build-time validation of `vocabulary_prerequisites`. This is a new utility not present anywhere in the codebase — likely a data-integrity script that verifies new lesson schemas at test time.

**Primary recommendation:** Build Plan 58-01 as pure data work (new lessons + new exercise type schema entries in `grammar.js` + a GrammarChecker vitest) and Plan 58-02 as reducer + UI work (grammarSlice `unlockLesson` reducer + `selectNextLesson` selector + GrammarModule lesson-gating with a "Locked" badge).

---

## Current State Audit

### grammar.js Lesson Inventory

**Total lessons:** 47 (confirmed by `grep -c "id:" grammar.js`)

**First 7 lessons (orders 1-7, no `cefrLevel` tag):**

| Lesson ID | Order | Exercises | Quiz Qs | Types |
|-----------|-------|-----------|---------|-------|
| al-definite | 1 | 5 | 4 | fill-blank, translate, match |
| noun-adjective-agreement | 2 | 5 | 4 | translate, fill-blank, match |
| personal-pronouns | 3 | 5 | 4 | translate, fill-blank, match |
| possessive-suffixes | 4 | 5 | 4 | translate, fill-blank, match |
| basic-verb-conjugation | 5 | 5 | 4 | fill-blank, translate, match |
| question-words | 6 | 5 | 4 | translate, fill-blank, match |
| prepositions | 7 | 5 | 4 | translate, fill-blank, match |

**Orders 8-12: Missing** — no lessons exist with orders 8, 9, 10, 11, 12. The `order` values jump from 7 to 13.

**CEFR-tagged A1 lessons (orders 13-17):**

| Lesson ID | Order | CEFR | Exercises | Quiz Qs |
|-----------|-------|------|-----------|---------|
| numbers-1-10 | 13 | A1 | 3 | 0 |
| basic-adjectives | 14 | A1 | 2 | 0 |
| demonstratives | 15 | A1 | 1 | 0 |
| possessive-pronouns | 16 | A1 | 1 | 0 |
| basic-negation | 17 | A1 | 1 | 0 |

**CEFR-tagged A2 lessons (orders 18-25):**

| Lesson ID | Order | CEFR | Exercises | Quiz Qs |
|-----------|-------|------|-----------|---------|
| present-tense | 18 | A2 | 1 | 0 |
| future-tense | 19 | A2 | 1 | 0 |
| dual-form | 20 | A2 | 1 | 0 |
| sound-plural | 21 | A2 | 1 | 0 |
| broken-plural | 22 | A2 | 1 | 0 |
| comparative | 23 | A2 | 1 | 0 |
| active-participle | 24 | A2 | 1 | 0 |

**B1-B2 lessons (orders 25-47):** All stubs — 1 exercise each, 0 quiz questions, placeholder exercises `{type: "translate", prompt: "practice", answer: "ممارسة", ...}`.

**Key finding:** The requirement is to add 20 new A1-A2 lessons, but the existing 12 CEFR-tagged A1/A2 lessons also fail the "12 exercises, 4 formats" requirement. Both new-authored lessons AND the existing 12 stubs need full exercise suites.

### Exercise Types Existing in Renderer

`ExerciseStage.jsx` handles exactly 3 types:

| Type | Renderer Support | Data Shape |
|------|-----------------|------------|
| `fill-blank` | Full | `{ type, prompt, answer, options[] }` |
| `translate` | Full | `{ type, prompt, answer, options[] }` |
| `match` | Full | `{ type, prompt, pairs[][] }` |

Unrecognized types render silently (no fallback UI, no error — the JSX conditionals simply skip them). This means new exercise types MUST have both a data schema AND a renderer case added simultaneously.

### Lesson Gating — Current State

`GrammarModule.jsx` uses `selectLessonsByCategory` which returns all lessons with `isCompleted` flag but no `isLocked` or `isAvailable` flag. The `LessonCard` component shows a "Completed" or "New" badge — no locked state. Any player can click any lesson regardless of completion order.

`grammarSlice.js` has no `unlockLesson` reducer, no `unlockedLessons` array, and no `selectNextLesson` selector. The `completedLessons` array is the only sequencing signal.

### learningProgressMiddleware — Current State

Fully wired for Phase 58 purposes at the XP level:

```javascript
// Already in learningProgressMiddleware.js
case 'grammar/completeLesson':
  store.dispatch(addSkillXP({ treeId: 'grammar', amount: 40 }));
  break;
```

This fires whenever `dispatch(completeLesson({...}))` is called in `GrammarLesson.jsx` at line 166. **The XP dispatch is already working.** Phase 58 Plan 02's middleware work is specifically about auto-unlock, not XP (XP is already done).

### GrammarModule and Lesson Sequencing

The plan calls for "auto-unlocks the next lesson in sequence." The sequence is defined by `lesson.order` in `grammar.js`. The current logic to derive "next lesson" is:

```javascript
// Derived from grammarSlice selectLessonsByCategory
// Lessons are sorted by order within each category
lessonsByCategory[category].sort((a, b) => a.order - b.order);
```

For auto-unlock to work: when `completeLesson({ lessonId })` fires, the middleware (or a grammarSlice reducer) needs to find the lesson with `order = completedLesson.order + 1` and mark it as unlocked.

**Two implementation approaches:**
1. Add `unlockedLessons: []` to grammarSlice state + `unlockNextLesson` action dispatched from `learningProgressMiddleware` after `completeLesson`
2. Derive "unlocked" in a selector from `completedLessons` — if lesson N is completed, lessons with order ≤ N+1 are unlocked

Option 2 (selector derivation) is simpler and avoids state duplication, but requires knowing the global ordering across all categories. Option 1 is explicit and easier to test. The project pattern (explicit state over derived state in slices that have behavioral requirements) favors Option 1.

---

## Standard Stack

### Core (no new packages required)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @reduxjs/toolkit | existing | grammarSlice reducer/selectors | All slice work follows existing pattern |
| react-redux | existing | useSelector in GrammarModule, GrammarLesson | Project-wide pattern |
| vitest | existing | GrammarChecker tests + grammar data validation | Project-wide test runner |

**No new npm installs for Phase 58.**

### Exercise Type Data Schema (to be introduced)

All new exercise types follow the same discriminated union pattern as the existing 3:

```javascript
// Existing pattern (source: grammar.js, exercises array)
{ type: 'fill-blank',  prompt: string, answer: string, options: string[] }
{ type: 'translate',   prompt: string, answer: string, options: string[] }
{ type: 'match',       prompt: string, pairs: [string, string][]        }

// New types to introduce (Phase 58)
{ type: 'conjugation-drill',        prompt: string, answer: string, options: string[], paradigm: 'present'|'past'|'future' }
{ type: 'sentence-transformation',  prompt: string, answer: string, hint: string       }
{ type: 'word-order',               prompt: string, words: string[], answer: string   }
{ type: 'error-identification',     sentence: string, error: string, correction: string, options: string[] }
// Additional 8 types to reach 12 total — see Architecture Patterns
```

---

## Architecture Patterns

### Pattern 1: Lesson Exercise Schema (grammar.js)

Each lesson MUST have `exercises` (at least 12 items) and `quiz` (at least 4 items). The success criterion says "at least 4 different exercise formats" — meaning at least 4 distinct `type` values per lesson.

**Fully-built lesson structure (source: grammar.js lesson `al-definite`):**

```javascript
{
  id: 'al-definite',
  title: 'The Definite Article: ال',
  titleArabic: 'أداة التعريف',
  category: 'basics',
  difficulty: 1,
  order: 1,
  cefrLevel: 'A1',          // ← MUST add to all A1/A2 lessons
  explanation: `...`,
  examples: [{ arabic, english, transliteration, breakdown }],
  rules: [{ rule, example }],
  exercises: [              // ← must have 12+ items, 4+ distinct types
    { type: 'fill-blank',  prompt: '...', answer: '...', options: ['...'] },
    { type: 'translate',   prompt: '...', answer: '...', options: ['...'] },
    { type: 'match',       prompt: '...', pairs: [['...', '...']] },
    // ... 9+ more with new types
  ],
  quiz: [                   // ← must have 4+ items
    { question: '...', options: ['...'], correct: 0, explanation: '...' },
    // ... 3+ more
  ],
}
```

### Pattern 2: New Exercise Types for ExerciseStage.jsx

**The 12 exercise type taxonomy (satisfying GRAM-02):**

| # | Type | Renderer Pattern | Existing? |
|---|------|-----------------|-----------|
| 1 | `fill-blank` | Multiple choice from options | YES |
| 2 | `translate` | Select Arabic/English translation | YES |
| 3 | `match` | Match pairs, click-click interaction | YES |
| 4 | `conjugation-drill` | Select correct verb form for given pronoun | NEW |
| 5 | `sentence-transformation` | Transform sentence (e.g. masculine→feminine) | NEW |
| 6 | `word-order` | Arrange scrambled words in correct order | NEW |
| 7 | `error-identification` | Identify the error in a sentence | NEW |
| 8 | `multiple-select` | Select all correct answers (checkboxes) | NEW |
| 9 | `true-false` | True/False statement judgment | NEW |
| 10 | `cloze` | Fill multiple blanks in a passage | NEW |
| 11 | `classify` | Classify words into categories (sun/moon, m/f) | NEW |
| 12 | `build-sentence` | Select words from bank to build a sentence | NEW |

**Renderer addition pattern (ExerciseStage.jsx):**

```jsx
{exercise.type === 'conjugation-drill' && (
  <>
    <div style={{ ...textStyle }}>
      Conjugate: {exercise.verb} (root: {exercise.root}) for {exercise.pronoun}
    </div>
    {exercise.options.map((opt, idx) => (
      <button key={idx} onClick={() => onAnswerSelect(opt)} style={choiceStyle}
        disabled={showFeedback}>
        {idx + 1}. {formatArabic(opt)}
      </button>
    ))}
  </>
)}

{exercise.type === 'word-order' && (
  // Drag-free version: player clicks words in order to build answer
  // Or simpler: show scrambled, player selects position 1, 2, 3...
)}
```

**Complexity guidance:** Word-order can be implemented as a simple multiple-choice selection of the correct sentence from 4 options (no drag-and-drop) to avoid new interaction complexity. This keeps all exercises keyboard-navigable (existing keyboard shortcut pattern at lines 54-64 of GrammarLesson.jsx).

### Pattern 3: grammarSlice — unlockedLessons State

```javascript
// Add to grammarSlice initialState
const initialState = {
  completedLessons: [],
  unlockedLessons: ['al-definite'],  // ← first lesson always unlocked
  lessonScores: {},
  currentLessonId: null,
};

// Add reducer
unlockNextLesson(state, action) {
  // payload: { completedLessonId }
  const completedLesson = grammarLessons.find(l => l.id === action.payload.completedLessonId);
  if (!completedLesson) return;

  const nextLesson = grammarLessons
    .filter(l => l.order > completedLesson.order)
    .sort((a, b) => a.order - b.order)[0];

  if (nextLesson && !state.unlockedLessons.includes(nextLesson.id)) {
    state.unlockedLessons.push(nextLesson.id);
  }
},
```

**Selector:**
```javascript
export const selectUnlockedLessons = (state) => state.grammar.unlockedLessons;

export const selectIsLessonUnlocked = (lessonId) => (state) =>
  state.grammar.unlockedLessons.includes(lessonId);
```

### Pattern 4: learningProgressMiddleware — Auto-Unlock Dispatch

```javascript
case 'grammar/completeLesson':
  store.dispatch(addSkillXP({ treeId: 'grammar', amount: 40 }));
  store.dispatch(unlockNextLesson({ completedLessonId: action.payload.lessonId }));
  break;
```

Both dispatches happen after `next(action)` (grammar state already updated). The `unlockNextLesson` action imports from grammarSlice. No re-entrancy risk — `unlockNextLesson` does not trigger any monitored action types.

### Pattern 5: GrammarModule — Lesson Gating UI

`LessonCard` needs a locked visual state. The existing `isCompleted` flag pattern extends naturally:

```jsx
// selectLessonsByCategory already annotates isCompleted — extend with isUnlocked
const card = {
  ...lesson,
  isCompleted: completedLessons.includes(lesson.id),
  isUnlocked: unlockedLessons.includes(lesson.id),
};

// LessonCard render
<div onClick={isUnlocked ? onClick : undefined}
     style={{ ...cardStyle, opacity: isUnlocked ? 1 : 0.5, cursor: isUnlocked ? 'pointer' : 'not-allowed' }}>
  <div style={statusBadgeStyle}>
    {isCompleted ? 'Completed' : isUnlocked ? 'New' : 'Locked'}
  </div>
  ...
</div>
```

### Pattern 6: GrammarChecker.js (Build-Time Validation)

The plan names `GrammarChecker.js` as a new file. Based on the pattern of `src/data/__tests__/skillTreeRewards.test.js` (which validates data integrity via vitest), this is a vitest test file, not a runtime utility:

**Location:** `src/data/__tests__/grammarChecker.test.js`

```javascript
// grammarChecker.test.js pattern (modeled on skillTreeRewards.test.js)
import { grammarLessons } from '../grammar.js';

describe('grammar.js data integrity', () => {
  const a1a2Lessons = grammarLessons.filter(l => l.cefrLevel === 'A1' || l.cefrLevel === 'A2');

  it('each A1-A2 lesson has at least 12 exercises', () => {
    for (const lesson of a1a2Lessons) {
      expect(lesson.exercises.length).toBeGreaterThanOrEqual(12);
    }
  });

  it('each A1-A2 lesson has at least 4 distinct exercise types', () => {
    for (const lesson of a1a2Lessons) {
      const types = new Set(lesson.exercises.map(e => e.type));
      expect(types.size).toBeGreaterThanOrEqual(4);
    }
  });

  it('conjugation-drill exercises include required fields', () => {
    const drills = grammarLessons.flatMap(l => l.exercises).filter(e => e.type === 'conjugation-drill');
    for (const drill of drills) {
      expect(drill.answer).toBeDefined();
      expect(drill.options).toHaveLength(4);
    }
  });

  it('word-order exercises include required fields', () => {
    const orders = grammarLessons.flatMap(l => l.exercises).filter(e => e.type === 'word-order');
    for (const ex of orders) {
      expect(ex.answer).toBeDefined();
    }
  });
});
```

**vocabulary_prerequisites:** If individual lessons declare `vocabularyPrerequisites: ['word_id', ...]`, a validator can check those IDs exist in the vocabulary corpus. However, since the current grammar lessons have no `vocabularyPrerequisites` field anywhere in the codebase, this is likely a planned addition. The plan should treat it as an optional enhancement or document it as a new field without strict validation (no vocabulary corpus lookup needed at build time).

### Pattern 7: Migration — unlockedLessons Backward Compat

Adding `unlockedLessons` to grammarSlice state REQUIRES a redux-persist migration. The CURRENT_VERSION is 11 (set in Phase 56). This phase must bump to 12 and add a migration that initialises `grammar.unlockedLessons` from `grammar.completedLessons` for existing players:

```javascript
// In the migrations object (wherever migrations are defined)
12: (state) => {
  const grammar = state?.grammar;
  if (!grammar) return state;
  if (!Array.isArray(grammar.unlockedLessons)) {
    // Existing players: unlock all completed lessons + the one after the highest-order completed
    const completed = grammar.completedLessons ?? [];
    grammar.unlockedLessons = ['al-definite', ...completed];
  }
  return state;
},
```

**Migration location:** Find where `createMigrate` is called and where the `migrations` object is defined.

### Anti-Patterns to Avoid

- **Adding new exercise types without renderer cases:** ExerciseStage.jsx silently skips unrecognized types — the exercise simply renders nothing. Always add both data and renderer together.
- **Deriving lesson unlock from `completedLessons` alone in a selector:** This would miss new-player state (first lesson must be unlocked even before any completion). Use explicit `unlockedLessons` state with `'al-definite'` as the initial value.
- **Forgetting the migration:** Adding `unlockedLessons` without a redux-persist migration means existing players get an undefined `unlockedLessons` after upgrade, locking all lessons for them.
- **Word-order as drag-and-drop:** Introduces new interaction complexity, breaks keyboard navigation. Implement as multiple-choice (4 correct-sentence options) instead.
- **Double-quote vs single-quote exercise type strings:** Existing code uses both. The renderer comparison `exercise.type === 'fill-blank'` works with both quote styles at runtime (JS string equality), but consistency is preferred. New lessons should use single-quoted strings to match the 7 fully-built lessons.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| Lesson sequence ordering | Custom linked-list or graph traversal | Sort `grammarLessons` by `lesson.order`, take first lesson with `order > completed.order` |
| Exercise shuffle | Custom RNG | `import { shuffle } from '../../utils/shuffle.js'` (already exists at `src/utils/shuffle.js`) |
| Unique type counting | Manual Set construction | `new Set(lesson.exercises.map(e => e.type)).size` |
| Migration testing | Real store instantiation | Use `createMigrate({ 12: migrations[12] })` with `currentVersion: 12` per STATE.md decision |

---

## Common Pitfalls

### Pitfall 1: quiz[] being empty breaks CompleteStage score calculation

**What goes wrong:** `CompleteStage.jsx` computes `totalQuestions = lesson.exercises.length + lesson.quiz.length`. If `quiz: []`, the percentage calculation is `(exerciseScore + 0) / (12 + 0) * 100`. This is mathematically fine, but the `quizScore === 0` triggers the non-perfect path even if exercises were all correct.

**Why it happens:** The A1/A2 stub lessons all have `quiz: []`. The `handleNext` in `GrammarLesson.jsx` transitions to stage `'quiz'` after exercises regardless, then immediately hits `currentQuizIndex < lesson.quiz.length - 1` which is `-1`, skipping to the complete dispatch.

**How to avoid:** Either add 4 quiz questions to every A1/A2 lesson (recommended — matches the pattern of the 7 fully-built lessons) or add a guard in GrammarLesson.jsx to skip the quiz stage when `lesson.quiz.length === 0`.

**Warning signs:** A lesson completing after exercises with 0 quiz questions — CompleteStage shows 0 quiz items.

### Pitfall 2: Order gaps break auto-unlock

**What goes wrong:** The `order` values jump from 7 to 13 (orders 8-12 missing). If auto-unlock finds `nextLesson` by `order > completedLesson.order`, completing lesson order=7 (prepositions) would unlock numbers-1-10 (order=13) correctly, but the gap means there is no continuity between the old and new lessons.

**Why it happens:** The first 7 lessons were written without the `cefrLevel` field and without the ordered continuity the new system requires.

**How to avoid:** The new 20 A1-A2 lessons should fill orders 8-12 (gap fill) and 25+ (new). Alternatively, add `cefrLevel` to the first 7 lessons and include them in the auto-unlock chain from order 1.

**Recommendation:** Backfill `cefrLevel: 'A1'` on the first 7 lessons and close the gap by assigning orders 8-12 to the 5 new A1 lessons, making the chain continuous from order 1.

### Pitfall 3: learningProgressMiddleware imports — circular dependency risk

**What goes wrong:** If `learningProgressMiddleware.js` imports `unlockNextLesson` from `grammarSlice.js`, and `grammarSlice.js` imports `grammarLessons` from `grammar.js`, there could be a circular dependency if any of those files eventually import from the store.

**Why it happens:** `grammarSlice.js` already imports `grammarLessons` directly (line 2). `learningProgressMiddleware.js` already imports from `slices/skillTreeSlice.js`. Adding an import from `grammarSlice.js` is safe — it follows the existing import direction (middleware → slice, not slice → middleware).

**How to avoid:** Import only the action creator `{ unlockNextLesson }` from grammarSlice in the middleware. Do not import the reducer or the slice default export.

### Pitfall 4: ExerciseStage keyboard shortcut breakage

**What goes wrong:** The existing keyboard shortcut handler (GrammarLesson.jsx lines 48-64) uses `item.type !== 'match'` as the guard to allow number key selection. New exercise types that use the same `options[]` pattern work automatically, but `word-order` (if implemented as a drag interface) would not have `options[]` and the guard would fail.

**How to avoid:** Word-order exercises use a 4-option multiple-choice format (same shape as `translate`) — keyboard shortcuts work without modification.

---

## Code Examples

### Fully-built lesson pattern (verified, source: grammar.js lines 6-131)

```javascript
{
  id: 'al-definite',
  title: 'The Definite Article: ال',
  titleArabic: 'أداة التعريف',
  category: 'basics',
  difficulty: 1,
  order: 1,
  cefrLevel: 'A1',
  explanation: `...`,
  examples: [
    { arabic: 'الكتاب', english: 'the book', transliteration: 'al-kitaab', breakdown: 'ال + كتاب' },
  ],
  rules: [
    { rule: 'Sun letters assimilate the ل sound', example: 'الشمس → ash-shams' },
  ],
  exercises: [
    { type: 'fill-blank', prompt: '___ كتاب (the book)', answer: 'ال', options: ['ال', 'إل', 'أل', 'لا'] },
    { type: 'translate', prompt: 'the house', answer: 'البيت', options: ['بيت', 'البيت', 'بيتي', 'بيتك'] },
    { type: 'match', prompt: 'Match the Arabic with English', pairs: [['الولد', 'the boy'], ['البنت', 'the girl']] },
    // ... 9+ more with new types
  ],
  quiz: [
    { question: 'Which word uses a sun letter?', options: ['القمر', 'الشمس', 'الكتاب', 'البيت'], correct: 1, explanation: '...' },
    // ... 3+ more
  ],
}
```

### learningProgressMiddleware addition (source: learningProgressMiddleware.js)

```javascript
// CURRENT (Phase 57 — already wired):
case 'grammar/completeLesson':
  store.dispatch(addSkillXP({ treeId: 'grammar', amount: 40 }));
  break;

// PHASE 58 addition:
case 'grammar/completeLesson':
  store.dispatch(addSkillXP({ treeId: 'grammar', amount: 40 }));
  store.dispatch(unlockNextLesson({ completedLessonId: action.payload.lessonId }));
  break;
```

### selectLessonsByCategory extension (source: grammarSlice.js)

```javascript
// Current signature:
export const selectLessonsByCategory = createSelector(
  [selectCompletedLessons, selectLessonScores],
  (completedLessons, lessonScores) => { ... }
);

// Phase 58 — add unlockedLessons as third input:
export const selectLessonsByCategory = createSelector(
  [selectCompletedLessons, selectLessonScores, selectUnlockedLessons],
  (completedLessons, lessonScores, unlockedLessons) => {
    // annotate each lesson with isCompleted AND isUnlocked
    lessonsByCategory[category].push({
      ...lesson,
      isCompleted: completedLessons.includes(lesson.id),
      isUnlocked: unlockedLessons.includes(lesson.id),
      score: lessonScores[lesson.id] || null,
    });
  }
);
```

---

## Validation Architecture

This section defines the complete verification contract for Phase 58's success criteria. All checks must be automatable via vitest.

### Success Criterion 1: 12 Exercises, 4 Formats Per Lesson

**Test file:** `src/data/__tests__/grammarChecker.test.js` (new, Wave 0)

| Check | Automated Command | What Passes |
|-------|-------------------|-------------|
| SC1-A: All A1-A2 lessons have ≥12 exercises | `npx vitest run src/data/__tests__/grammarChecker.test.js` | Every lesson with `cefrLevel === 'A1' \|\| 'A2'` has `exercises.length >= 12` |
| SC1-B: All A1-A2 lessons have ≥4 distinct types | same | `new Set(lesson.exercises.map(e => e.type)).size >= 4` for each lesson |
| SC1-C: conjugation-drill exercises are valid | same | Every `type === 'conjugation-drill'` has `answer` string and `options` array of length 4 |
| SC1-D: word-order exercises are valid | same | Every `type === 'word-order'` has `answer` string and `options` array |
| SC1-E: error-identification exercises are valid | same | Every `type === 'error-identification'` has `sentence`, `error`, `correction`, and `options` array |
| SC1-F: sentence-transformation exercises are valid | same | Every `type === 'sentence-transformation'` has `prompt` and `answer` |

**Exact test assertions:**

```javascript
// All A1/A2 lessons have ≥12 exercises
const a1a2 = grammarLessons.filter(l => ['A1','A2'].includes(l.cefrLevel));
for (const lesson of a1a2) {
  expect(lesson.exercises.length, `${lesson.id} exercises`).toBeGreaterThanOrEqual(12);
}

// All A1/A2 lessons have ≥4 distinct types
for (const lesson of a1a2) {
  const types = new Set(lesson.exercises.map(e => e.type));
  expect(types.size, `${lesson.id} types`).toBeGreaterThanOrEqual(4);
}

// Total grammar lessons ≥ 20 new ones (A1-A2 population)
expect(a1a2.length).toBeGreaterThanOrEqual(20);
```

### Success Criterion 2: XP Award + Auto-Unlock

**Test file:** `src/store/middleware/__tests__/learningProgressMiddleware.test.js` (extend existing, Wave 1)

| Check | Automated Command | What Passes |
|-------|-------------------|-------------|
| SC2-A: XP already works (no regression) | `npx vitest run src/store/middleware/__tests__/learningProgressMiddleware.test.js` | `grammar/completeLesson` awards 40 XP (existing test passes) |
| SC2-B: unlockNextLesson dispatched after completion | same (new test) | After `completeLesson({ lessonId: 'al-definite' })`, `state.grammar.unlockedLessons` includes `noun-adjective-agreement` |
| SC2-C: completing last A2 lesson does not error | same | `completeLesson` on the highest-order A2 lesson works without `unlockedLessons` throwing |
| SC2-D: unlockedLessons initialises with 'al-definite' | `npx vitest run src/store/__tests__/grammarSlice.test.js` | `grammarReducer(undefined, { type: 'unknown' }).unlockedLessons` equals `['al-definite']` |
| SC2-E: unlockNextLesson adds next lesson | same | `grammarReducer(state, unlockNextLesson({ completedLessonId: 'al-definite' })).unlockedLessons` includes `noun-adjective-agreement` |
| SC2-F: duplicate unlock is idempotent | same | Dispatching `unlockNextLesson` twice does not duplicate the entry in `unlockedLessons` |

**Integration test (new in learningProgressMiddleware.test.js):**

```javascript
it('grammar/completeLesson dispatches unlockNextLesson to grammarSlice', () => {
  store.dispatch(completeLesson({ lessonId: 'al-definite', exerciseScore: 100, quizScore: 100 }));
  // al-definite is order 1 — next lesson by order is noun-adjective-agreement (order 2)
  expect(store.getState().grammar.unlockedLessons).toContain('noun-adjective-agreement');
});
```

**GrammarSlice unit tests (extend grammarSlice.test.js):**

```javascript
it('initial state includes al-definite in unlockedLessons', () => {
  const state = grammarReducer(undefined, { type: 'unknown' });
  expect(state.unlockedLessons).toEqual(['al-definite']);
});

it('unlockNextLesson adds the next-order lesson', () => {
  const state = grammarReducer(
    { ...initialState, completedLessons: ['al-definite'] },
    unlockNextLesson({ completedLessonId: 'al-definite' })
  );
  expect(state.unlockedLessons).toContain('noun-adjective-agreement');
});
```

### Quick Run Commands Per Plan

| Plan | Wave | Test File | Command |
|------|------|-----------|---------|
| 58-01 (data) | Wave 0 (write tests first) | `src/data/__tests__/grammarChecker.test.js` | `npx vitest run src/data/__tests__/grammarChecker.test.js` |
| 58-01 (data) | Wave 1 (after grammar.js edit) | same | same — now passes |
| 58-02 (wiring) | Wave 0 | `src/store/__tests__/grammarSlice.test.js` (extend) | `npx vitest run src/store/__tests__/grammarSlice.test.js` |
| 58-02 (wiring) | Wave 1 | `src/store/middleware/__tests__/learningProgressMiddleware.test.js` (extend) | `npx vitest run src/store/middleware/__tests__/learningProgressMiddleware.test.js` |
| both | Full suite | all | `npx vitest run` |

**Estimated runtime:** ~20 seconds for full suite. Per-plan runs ~3-5 seconds.

### Sampling Rate (Nyquist Compliance)

- After every grammar.js batch of lessons added: run grammarChecker tests
- After grammarSlice change: run grammarSlice.test.js
- After middleware change: run learningProgressMiddleware.test.js
- Before submit: `npx vitest run` (full suite green)
- No 3 consecutive tasks without automated verify

### Manual-Only Verifications

| Behavior | Why Manual | Test Instructions |
|----------|------------|-------------------|
| SkillTreeView Grammar tree XP increments after lesson completion | Browser rendering required | 1. `npm run dev` 2. Open Grammar section 3. Complete a lesson 4. Open Skill Tree → Grammar tab 5. Confirm XP bar advanced by 40 |
| GrammarModule shows "Locked" badge on unstarted lessons | React DOM visual | 1. Open Grammar section 2. Confirm first lesson is "New", second is "Locked" before first is completed |
| Completing lesson 1 shows lesson 2 as "New" (unlocked) | State change visual | 1. Complete al-definite 2. Return to Grammar module 3. Confirm noun-adjective-agreement shows "New" |

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|-----------------|--------|
| Grammar lessons: all open (no gating) | Grammar lessons: sequentially gated via `unlockedLessons` | Players follow a curriculum path |
| 3 exercise types (fill-blank, translate, match) | 12 exercise types | Satisfies GRAM-02 requirement |
| A1-A2 stubs: 1-3 exercises, 0 quiz questions | Full A1-A2 lessons: 12 exercises, 4 quiz questions | Real educational depth |
| XP fires but no lesson unlock | XP fires + next lesson auto-unlocks | Satisfies GRAM-04 requirement |

---

## Open Questions

1. **Order gap (7 → 13):** Should lessons be added to fill orders 8-12, or should the first 7 lessons be renumbered? Renumbering risks breaking saved `completedLessons` state if orders are used as IDs anywhere. The `completedLessons` array stores string `id` values, not orders — renumbering `order` fields is safe. **Recommendation:** Fill orders 8-12 with new A1 lessons. Do not renumber.

2. **`cefrLevel` on first 7 lessons:** They have no `cefrLevel` tag. The grammarChecker tests filter by `cefrLevel === 'A1' || 'A2'`. If first 7 lessons are not tagged, the checker won't validate them. **Recommendation:** Add `cefrLevel: 'A1'` to the first 7 lessons (all are genuinely A1 content). This makes them pass through the grammarChecker and ensures they get full exercise suites too (though they already have 5 exercises — they would still need 7 more to reach 12).

3. **20 new lessons vs 12 existing stubs:** The plan says "20 new A1-A2 grammar lessons." The 12 cefrLevel-tagged stubs are not "new" but they need the same exercise upgrade. Clarify whether "20 new" means 20 additional lessons beyond existing 47, or whether it means bringing 20 total A1-A2 lessons to full standard (including upgrading the 12 stubs). If the latter, only 8 new lessons need to be authored. **Recommendation:** The plan should upgrade all 12 existing A1-A2 stubs to full standard AND author 8 new lessons (for 20 total fully-standard A1-A2 lessons). This is less work than 20 entirely new lessons and addresses the real quality gap.

4. **Migration version:** `CURRENT_VERSION` is 11. This phase adds `unlockedLessons` to grammarSlice, requiring migration 12. Need to confirm where migrations are defined before Plan 58-02 authors the migration. **Recommendation:** Research migration file location in Plan 58-02 research task (it was done in Phase 56 — check Phase 56 plan for location).

---

## Sources

### Primary (HIGH confidence)
- `src/data/grammar.js` — All lesson IDs, orders, exercise counts, exercise types
- `src/components/Grammar/GrammarLesson.jsx` — completeLesson dispatch, stage flow, keyboard shortcuts
- `src/components/Grammar/stages/ExerciseStage.jsx` — All 3 exercise type renderers
- `src/components/Grammar/GrammarModule.jsx` — Lesson grid, selectLessonsByCategory usage
- `src/store/slices/grammarSlice.js` — State shape, selectors, reducers
- `src/store/middleware/learningProgressMiddleware.js` — Current XP routing (grammar +40 already wired)
- `src/store/slices/skillTreeSlice.js` — addSkillXP, selectSkillXP
- `src/components/Skills/SkillTreeView.jsx` — XP progress bar, grammar tree display
- `src/data/__tests__/skillTreeRewards.test.js` — GrammarChecker test file pattern
- `src/store/middleware/__tests__/learningProgressMiddleware.test.js` — Existing test to extend

### Secondary (MEDIUM confidence)
- `.planning/STATE.md` — Confirms grammar.js has 47 lessons, CURRENT_VERSION = 11, learningProgressMiddleware XP routing active
- `.planning/REQUIREMENTS.md` — GRAM-02 (12 exercise types), GRAM-04 (XP + auto-unlock)

---

## Metadata

**Confidence breakdown:**
- Grammar data gap: HIGH — directly counted from grammar.js
- Exercise type renderer: HIGH — directly read ExerciseStage.jsx
- XP routing: HIGH — learningProgressMiddleware.js confirms existing wiring
- Auto-unlock design: HIGH — grammarSlice.js shows no existing unlockedLessons state
- Migration requirement: HIGH — CURRENT_VERSION = 11, adding new slice state requires migration 12

**Research date:** 2026-03-22
**Valid until:** 2026-04-22 (stable codebase — no fast-moving dependencies)
