# Phase 60: Quiz Expansion (Core 3 Types) - Research

**Researched:** 2026-03-22
**Domain:** React quiz components + Arabic verb paradigm data + FSRS vocabulary integration
**Confidence:** HIGH

---

## Summary

Phase 60 adds three playable quiz renderers — GrammarFill, WordOrder, and ClozePassage — to a codebase where the registry, gating, and adaptive routing are already fully complete from Phase 59. The only work is: write three React components that follow the exact structural contract of existing quiz components (FillInBlank, SentenceBuilder, ConjugationPick), wire them into QuizOverlay.jsx's router switch, wire answer-grading logic into useQuiz.js's `answer()`, and build-choices logic into `buildChoices()`, then lower the `minLevel` values in QUIZ_TYPE_REGISTRY from 999 to their real values.

GrammarFill is a conjugation fill-in-blank that shows an Arabic verb root + a grammar paradigm context + 4 Arabic conjugated-form choices. It differs from the existing `conjugation` type by displaying the full paradigm display panel (e.g., "present tense, أنا") and sourcing questions from a curated VERB_PARADIGMS data set embedded in the component rather than relying solely on vocabulary words' Arabic field.

WordOrder extends SentenceBuilder's tile-click architecture but changes the instruction and source sentence: WordOrder uses `word.exampleSentence.arabic` split on spaces as the tile pool (exactly what SentenceBuilder already does), but the difference is the CEFR gate (B1+) and the label. In the codebase SentenceBuilder already implements the token-tile pattern correctly, so WordOrder is a thin component that reuses the same render logic with a different instruction string and a B1 CEFR check.

ClozePassage is the most novel component. It shows a short Arabic paragraph (3-5 sentences) with one blank, and 4 answer choices sourced from FSRS-due vocabulary. The paragraph content must be self-contained data embedded in the component — the vocabulary model has `exampleSentence.arabic` per word (all 250 curated words have it), but a "passage" needs multi-sentence context. The simplest viable approach: compose a 2-3 sentence paragraph from 2-3 consecutive example sentences from the same vocabulary entry, using the word itself as the blank. This avoids needing a separate passage data file.

**Primary recommendation:** Follow the exact props/callback contract of FillInBlank and SentenceBuilder. Do not invent new answer-submission mechanisms. Wire all three into useQuiz.js answer() via the same `normalize(userAnswer) === normalize(word.arabic)` pattern already used for fill-blank and conjugation.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19 | Component rendering | Project standard |
| framer-motion | (existing) | Animations | Used in QuizOverlay wrapper, not in child components |
| useFormatArabic | hook | Diacritic stripping | All quiz components use this |
| COLORS / FONTS | theme.js | Pixel-art styling | All quiz components import from here |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| useState | React | Tile placement state | WordOrder needs placed/usedIndices like SentenceBuilder |
| useEffect | React | Reset on new word | All stateful quiz components reset on `word?.id` change |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Embedded VERB_PARADIGMS data | Grammar lesson data from grammar.js | grammar.js conjugation-drill exercises already have verb/root/pronoun/paradigm/answer/options — reuse this directly rather than duplicating |
| Multi-sentence passage file | Compose from exampleSentence fields | Simpler, avoids new data infrastructure |

**Installation:** No new npm installs required.

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/Quiz/
│   ├── GrammarFill.jsx          (NEW — 60-01)
│   ├── WordOrder.jsx            (NEW — 60-02)
│   ├── ClozePassage.jsx         (NEW — 60-03)
│   ├── QuizOverlay.jsx          (MODIFIED — add 3 import/render blocks)
│   ├── SentenceBuilder.jsx      (READ ONLY — reference for WordOrder)
│   ├── FillInBlank.jsx          (READ ONLY — reference for GrammarFill/ClozePassage)
│   └── ConjugationPick.jsx      (READ ONLY — reference for GrammarFill prompt box)
├── data/
│   └── quizTypes.js             (MODIFIED — lower minLevel on 3 active types)
└── hooks/
    └── useQuiz.js               (MODIFIED — buildChoices + answer grading for 3 new types)
```

### Pattern 1: Quiz Component Contract

All quiz child components share this exact interface — this is the contract every new component must follow:

```jsx
// Source: src/components/Quiz/FillInBlank.jsx, ConjugationPick.jsx, SentenceBuilder.jsx
export default function MyQuizType({ word, options, onAnswer, feedback }) {
  const formatArabic = useFormatArabic();
  // ...
  // onAnswer(stringValue) — called once when player submits their answer
  // feedback: null until answer submitted, then { correct: bool, correctAnswer: string, selected: string }
  // options: array provided by useQuiz.buildChoices() for this type
  // word: current vocabulary word from quiz session
}
```

### Pattern 2: Correct Answer Object Shape

The `choices` / `options` array built by `buildChoices()` in useQuiz.js uses objects:

```js
// Source: src/hooks/useQuiz.js buildChoices()
// For multiple-choice types:
{ label: word.arabic, value: word.arabic, correct: true }
// For tile types (SentenceBuilder/WordOrder):
{ label: t, value: t, correct: i === 0, tile: true }
```

For GrammarFill and ClozePassage, use `{ label, value, correct }` objects identical to FillInBlank.

### Pattern 3: useQuiz.js Extension Points

There are two functions that need additions for each new quiz type:

**buildChoices(word, type, tier)** — must handle the new type key and return options array:

```js
// Source: src/hooks/useQuiz.js lines 81-170
if (type === 'GrammarFill') {
  // Return 4 conjugated-form choices with correct:true on one
}
if (type === 'WordOrder') {
  // Identical to 'sentence-build': split exampleSentence into tile array
  const sentence = word.exampleSentence?.arabic || word.arabic;
  const tiles = sentence.split(/\s+/).map(t => t.trim()).filter(Boolean);
  return tiles.map((t, i) => ({ label: t, value: t, correct: i === 0, tile: true }));
}
if (type === 'ClozePassage') {
  // 4 Arabic word choices identical to fill-blank
}
```

**answer() — grading block** — must handle the new type keys, placed inside the large if/else chain at lines 239-276:

```js
// Source: src/hooks/useQuiz.js answer() callback, lines 239-276
} else if (quizState.quizType === 'GrammarFill') {
  correct = normalize(userAnswer) === normalize(word.arabic);
} else if (quizState.quizType === 'WordOrder') {
  const expectedSentence = (word.exampleSentence?.arabic || word.arabic)
    .split(/\s+/).map(t => t.trim()).filter(Boolean).join(' ');
  correct = normalize(userAnswer) === normalize(expectedSentence);
} else if (quizState.quizType === 'ClozePassage') {
  correct = normalize(userAnswer) === normalize(word.arabic);
}
```

### Pattern 4: GrammarFill Verb Paradigm Data

GrammarFill needs curated verb + conjugated forms. The grammar.js `conjugation-drill` exercises are the exact source. Rather than importing from grammar.js (coupling quiz to grammar data), embed a lean VERB_PARADIGMS array directly in GrammarFill.jsx:

```js
// Sourced from grammar.js conjugation-drill exercises
const VERB_PARADIGMS = [
  { verb: 'كَتَبَ', root: 'ك-ت-ب', meaning: 'to write', paradigm: 'present',
    forms: [
      { pronoun: { en: 'I (أنا)', ar: 'أنا' },   form: 'أكتب',  correct: true },
      { pronoun: { en: 'He (هو)', ar: 'هو' },    form: 'يكتب',  correct: false },
      { pronoun: { en: 'She (هي)', ar: 'هي' },   form: 'تكتب',  correct: false },
      { pronoun: { en: 'We (نحن)', ar: 'نحن' },  form: 'نكتب',  correct: false },
    ]
  },
  // ... more verbs
];
```

GrammarFill.jsx picks a random entry from VERB_PARADIGMS on each render (reset on `word?.id` change via useEffect). The `word` prop is still the vocabulary word, but the conjugation question is independently sourced from VERB_PARADIGMS. The `onAnswer(form)` value is compared against the paradigm's correct form, NOT against `word.arabic`. This means the grading in useQuiz.js answer() needs to handle 'GrammarFill' differently — it cannot compare to `word.arabic`. The paradigm correct form must be carried through via the options array:

```js
// buildChoices for GrammarFill — embed correctForm in choices
const paradigm = pickRandomParadigm(); // deterministic per word.id
return shuffle([
  { label: paradigm.correctForm, value: paradigm.correctForm, correct: true, paradigmContext: paradigm.context },
  ...paradigm.distractors.map(f => ({ label: f, value: f, correct: false }))
]);
```

Then in answer(), the grading is still `correct = normalize(userAnswer) === normalize(word.arabic)` ONLY IF the correct form has been set as word.arabic in the choices. The cleaner approach: since GrammarFill options have `correct: true` on one, the answer() function can check `options.find(o => o.correct)?.value`. But `answer()` doesn't have access to the current choices array — it reads from `quizState.currentWord` only.

**Resolved approach**: Store the correct conjugated form as a synthetic field on the word object passed to GrammarFill. buildChoices returns the correct form as the first item before shuffle. The grading in answer() compares to `quizState.choices.find(c => c.correct)?.value`. This requires adding `quizState.choices` to the answer() grading chain — it's already available as `quizState.choices` in the hook closure.

Actually, the simplest approach: treat GrammarFill exactly like conjugation — `normalize(userAnswer) === normalize(word.arabic)` — and have buildChoices for GrammarFill generate paradigm choices where the correct form IS the word.arabic. This works because vocabulary verbs already have their correct form as `word.arabic` (e.g., أَكَلَ). But that's the dictionary form, not the conjugated form.

**Final resolution**: For GrammarFill, buildChoices generates Arabic conjugated forms from a static paradigm lookup keyed by word.root or word.arabic, and the correct answer is stored in `choices[i].correct === true`. In answer(), use `quizState.choices.find(c => c.correct)?.value` for the correctAnswer field, and compare `normalize(userAnswer) === normalize(correctChoiceValue)`. This is a small addition to the answer() grading block and correctAnswer assignment.

### Pattern 5: ClozePassage Paragraph Composition

The 250 curated vocabulary words all have `exampleSentence.arabic` (confirmed: 250/250). ClozePassage should display 2 consecutive sentences as a paragraph, with the second sentence containing the blank. Compose from the word's exampleSentence:

```js
// In buildChoices for 'ClozePassage':
// paragraph = (previous word's exampleSentence + current word's exampleSentence with blank)
// choices = same as fill-blank: 4 Arabic word choices
```

For simplicity in Plan 60-03: ClozePassage uses only `word.exampleSentence.arabic` (single sentence with blank), plus a supporting sentence from a vocabulary neighbor. If `word.exampleSentence` is absent, fall back to single sentence identical to FillInBlank.

### Pattern 6: QuizOverlay Switch Integration

Following the exact same block pattern at lines 308-404 of QuizOverlay.jsx:

```jsx
// Source: src/components/Quiz/QuizOverlay.jsx lines 308-404
{quiz.quizType === 'GrammarFill' && (
  <GrammarFill
    word={quiz.currentWord}
    options={quiz.choices}
    feedback={combinedFeedback}
    onAnswer={handleAnswer}
  />
)}
{quiz.quizType === 'WordOrder' && (
  <WordOrder
    word={quiz.currentWord}
    options={quiz.choices}
    feedback={combinedFeedback}
    onAnswer={handleAnswer}
  />
)}
{quiz.quizType === 'ClozePassage' && (
  <ClozePassage
    word={quiz.currentWord}
    options={quiz.choices}
    feedback={combinedFeedback}
    onAnswer={handleAnswer}
  />
)}
```

Also add three import lines at the top of QuizOverlay.jsx.

### Pattern 7: QuizOverlay handleAnswer SFX Block

QuizOverlay.jsx has a correctness-determination block inside handleAnswer (lines 83-104) that runs per quiz type to decide which SFX to play. This block must be extended for the three new types:

```js
// Source: src/components/Quiz/QuizOverlay.jsx handleAnswer lines 83-104
} else if (quiz.quizType === 'GrammarFill') {
  // Correct answer is on the choice with correct:true
  isCorrect = quiz.choices.find(c => c.correct)?.value === userAnswer;
} else if (quiz.quizType === 'WordOrder') {
  const expected = (word.exampleSentence?.arabic || word.arabic)
    .split(/\s+/).filter(Boolean).join(' ');
  isCorrect = normalize(userAnswer) === normalize(expected);
} else if (quiz.quizType === 'ClozePassage') {
  isCorrect = userAnswer === word.arabic; // same as fill-blank
}
```

### Anti-Patterns to Avoid

- **Introducing new answer callbacks:** All three components call `onAnswer(stringValue)` — do not add multi-step callbacks or new props beyond the standard 4.
- **Skipping the minLevel lowering step:** If quizTypes.js still has minLevel:999, the new types will never appear even after renderers ship. This must be part of Plan 60-03 (the final plan updates all 3 active types to real values).
- **Ignoring the handleAnswer SFX block in QuizOverlay:** If the SFX block falls through to the default `normalize(userAnswer) === normalize(word.arabic)`, GrammarFill will always play 'wrong' because the conjugated form !== the dictionary word form.
- **Reading grammar.js in quiz components:** Quiz components are display-only; data coupling to grammar.js creates a circular dependency concern. Embed paradigm data directly in GrammarFill.jsx.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| RTL tile placement | Custom RTL drag engine | `direction: 'rtl'` on flexWrap div | SentenceBuilder already solves this — copy the exact dropZone pattern |
| Arabic text normalization | Custom diacritic stripper | Existing `normalize` closure in useQuiz.js | Already handles Unicode combining marks range \u064B-\u065F\u0670 |
| CEFR gating in component | Conditional render in component | QUIZ_TYPE_REGISTRY minLevel + cefrMin | selectQuizTypeForPlayer already gates — the component is never mounted if gating fails |
| Shuffle for distractor ordering | Custom shuffle | `shuffle()` from `../utils/shuffle.js` | Already imported in useQuiz.js |
| Verb paradigm lookup | Fetch from external API | Static embedded VERB_PARADIGMS array | No backend, works offline, deterministic for tests |

**Key insight:** Every structural pattern needed for these three components already exists in the codebase. This phase is assembly, not invention.

---

## Common Pitfalls

### Pitfall 1: GrammarFill Grading Against word.arabic
**What goes wrong:** `answer()` defaults to `normalize(userAnswer) === normalize(word.arabic)`. For GrammarFill, `word.arabic` is the dictionary form (e.g., أَكَلَ) but the correct answer is a conjugated form (أَكَلَ → يَأْكُلُ). Grading against `word.arabic` makes all conjugated-form answers incorrect.
**Why it happens:** The default grading pattern in useQuiz.js answer() is designed for vocabulary quiz types.
**How to avoid:** In the GrammarFill path of answer(), read the correct answer from `quizState.choices.find(c => c.correct)?.value` instead of `word.arabic`.
**Warning signs:** 100% wrong rate on GrammarFill in tests even when correct option is selected.

### Pitfall 2: WordOrder Duplicates SentenceBuilder Functionality
**What goes wrong:** Building WordOrder as a completely separate component with its own tile state implementation causes code duplication and inconsistency.
**Why it happens:** Developer doesn't realize SentenceBuilder already implements the complete tile click pattern.
**How to avoid:** WordOrder.jsx can be a near-copy of SentenceBuilder.jsx with one change: instruction text reads "Arrange the words to form the Arabic sentence" vs SentenceBuilder's "Arrange the tiles to form the Arabic sentence." buildChoices for WordOrder in useQuiz.js is identical to sentence-build.
**Warning signs:** WordOrder.jsx is more than ~220 lines.

### Pitfall 3: ClozePassage Has No Passage Fallback
**What goes wrong:** Some vocabulary words in vocabularyExpanded.js (exp_a1_*, exp_a2_*) do NOT have `exampleSentence.arabic` — only the 250 curated words in vocabulary.json are guaranteed to have it.
**Why it happens:** The ClozePassage question source assumes exampleSentence exists.
**How to avoid:** In buildChoices for ClozePassage, check `word.exampleSentence?.arabic`. If absent, build a simple `[word.arabic] ___` frame as the passage, or fall back to displaying just the English meaning as context (identical to FillInBlank fallback).
**Warning signs:** ClozePassage renders an empty passage box for A2+ CEFR players using expanded vocabulary words.

### Pitfall 4: QUIZ_TYPE_REGISTRY minLevel Stays at 999
**What goes wrong:** The new renderers ship but types never appear in rotation because selectQuizTypeForPlayer filters out minLevel:999 types.
**Why it happens:** Developer updates components and QuizOverlay but forgets to update quizTypes.js.
**How to avoid:** Make quizTypes.js the final change in Plan 60-03 (after renderers are confirmed). Lower: GrammarFill minLevel: 4 (cefrMin: 'A2'), WordOrder minLevel: 5 (cefrMin: 'B1'), ClozePassage minLevel: 4 (cefrMin: 'A2'). Keep DialectIdentify/RootExpand/CulturalContext at minLevel:999.
**Warning signs:** Existing quizTypes.test.js test "Phase 60 types have minLevel: 999" still passes — it must FAIL for the 3 active types and PASS for the 3 deferred types after this phase.

### Pitfall 5: SFX Block Falls Through to Default in handleAnswer
**What goes wrong:** QuizOverlay.jsx's handleAnswer function has a correctness-calculation block (lines 83-104) used for SFX only. If new types are not added here, GrammarFill always plays 'wrong' SFX regardless of actual correctness.
**Why it happens:** It is easy to miss this second location where quiz type routing happens in QuizOverlay.
**How to avoid:** There are exactly two places in QuizOverlay that branch on `quiz.quizType`: (1) the render switch and (2) the SFX block in handleAnswer. Both must be updated.
**Warning signs:** Correct answers play the 'wrong' SFX sound.

---

## Code Examples

### GrammarFill Props Usage
```jsx
// Source: pattern from src/components/Quiz/ConjugationPick.jsx
export default function GrammarFill({ word, options, onAnswer, feedback }) {
  const formatArabic = useFormatArabic();
  // options[i]: { label: conjugatedForm, value: conjugatedForm, correct: bool, paradigmContext: { verb, pronoun, paradigm } }
  // Show: verb root + meaning + pronoun target + 4 form choices
  // onAnswer(form) — the selected conjugated form string
}
```

### WordOrder Props Usage
```jsx
// Source: exact clone of src/components/Quiz/SentenceBuilder.jsx
export default function WordOrder({ word, options, onAnswer, feedback }) {
  // options: tile array from buildChoices — same as sentence-build
  // onAnswer(placed.map(p => p.tile).join(' ')) — joined sentence string
  // Instruction: "Arrange the words in the correct Arabic word order:"
}
```

### ClozePassage Props Usage
```jsx
// Source: pattern from src/components/Quiz/FillInBlank.jsx
export default function ClozePassage({ word, options, onAnswer, feedback }) {
  const formatArabic = useFormatArabic();
  // options[i]: { label: word.arabic, value: word.arabic, correct: bool }
  // Display: passage paragraph (2-3 sentences from exampleSentence) with blank
  // onAnswer(c.value) — the selected Arabic word string
}
```

### Answer Grading Extension in useQuiz.js
```js
// Source: src/hooks/useQuiz.js answer() callback
// Add inside the if/else chain at lines 239-276:
} else if (quizState.quizType === 'GrammarFill') {
  // Correct form is on the option with correct:true in quizState.choices
  const correctForm = quizState.choices.find(c => c.correct)?.value || '';
  correct = normalize(userAnswer) === normalize(correctForm);
} else if (quizState.quizType === 'WordOrder') {
  const expectedSentence = (word.exampleSentence?.arabic || word.arabic)
    .split(/\s+/).map(t => t.trim()).filter(Boolean).join(' ');
  correct = normalize(userAnswer) === normalize(expectedSentence);
} else if (quizState.quizType === 'ClozePassage') {
  correct = normalize(userAnswer) === normalize(word.arabic);
}
```

### correctAnswer Assignment Extension in useQuiz.js
```js
// Source: src/hooks/useQuiz.js lines 309-321 (correctAnswer assignment for feedback)
// Add cases:
} else if (quizState.quizType === 'GrammarFill') {
  correctAnswer = quizState.choices.find(c => c.correct)?.value || word.arabic;
} else if (quizState.quizType === 'WordOrder') {
  correctAnswer = word.exampleSentence?.arabic || word.arabic;
} else if (quizState.quizType === 'ClozePassage') {
  correctAnswer = word.arabic;
}
```

### QUIZ_TYPE_REGISTRY minLevel Update
```js
// Source: src/data/quizTypes.js — change after renderers ship (Plan 60-03)
// FROM:
'GrammarFill':     { label: 'Grammar Fill',  cluster: 'grammar', minLevel: 999, cefrMin: 'A1' },
'ClozePassage':    { label: 'Cloze Passage', cluster: 'grammar', minLevel: 999, cefrMin: 'A2' },
'WordOrder':       { label: 'Word Order',    cluster: 'grammar', minLevel: 999, cefrMin: 'A1' },
// TO:
'GrammarFill':     { label: 'Grammar Fill',  cluster: 'grammar', minLevel: 4,   cefrMin: 'A2' },
'ClozePassage':    { label: 'Cloze Passage', cluster: 'grammar', minLevel: 4,   cefrMin: 'A2' },
'WordOrder':       { label: 'Word Order',    cluster: 'grammar', minLevel: 5,   cefrMin: 'B1' },
// Keep deferred types untouched:
'DialectIdentify': { label: 'Dialect Identify', cluster: 'listening', minLevel: 999, cefrMin: 'B1' },
'RootExpand':      { label: 'Root Expand',      cluster: 'roots',    minLevel: 999, cefrMin: 'A2' },
'CulturalContext': { label: 'Cultural Context', cluster: 'reading',  minLevel: 999, cefrMin: 'B1' },
```

Note: The REQUIREMENTS.md success criteria specify cefrMin 'B2' for the deferred types DialectIdentify/RootExpand/CulturalContext, but the current QUIZ_TYPE_REGISTRY has them at 'B1'. The STATE.md context explicitly says "deferred types stay at minLevel:999, cefrMin:'B2'". Trust STATE.md — update cefrMin to 'B2' on the three deferred types during Plan 60-03 to match the success criteria.

---

## Validation Architecture

Test patterns for each success criterion:

### Success Criterion 1: A2+ player can access GrammarFill
**Test location:** `src/data/__tests__/quizTypes.test.js` (extend existing file)

```js
// Pattern: follow existing "excludes types above CEFR level" test
it('GrammarFill appears in rotation for A2 player at level 4+', () => {
  // After minLevel lowered to 4 and cefrMin set to 'A2':
  const results = Array.from({ length: 300 }, () =>
    selectQuizTypeForPlayer({}, 4, 'A2')
  );
  expect(results).toContain('GrammarFill');
});

it('GrammarFill does not appear for A1 player', () => {
  const results = Array.from({ length: 200 }, () =>
    selectQuizTypeForPlayer({}, 10, 'A1')
  );
  expect(results).not.toContain('GrammarFill');
});
```

**Component test location:** `src/components/Quiz/__tests__/GrammarFill.test.jsx` (new file)
```js
// Pattern: follow QuizOverlay.test.jsx mock structure
it('renders verb root, pronoun, and 4 choice buttons', () => {
  // Render GrammarFill with mock options[4] containing correct:true on one
  // Assert: 4 choice buttons present, verb root visible
});

it('calls onAnswer with selected form string', () => {
  // Click a choice button, assert onAnswer called with that form string
});

it('shows correct/wrong highlight on feedback', () => {
  // Render with feedback.correct=true, assert green highlight on correct option
});
```

### Success Criterion 2: B1+ player can complete WordOrder drag-and-drop
**Test location:** `src/data/__tests__/quizTypes.test.js`

```js
it('WordOrder appears in rotation for B1 player at level 5+', () => {
  const results = Array.from({ length: 300 }, () =>
    selectQuizTypeForPlayer({}, 5, 'B1')
  );
  expect(results).toContain('WordOrder');
});

it('WordOrder does not appear for A2 player', () => {
  const results = Array.from({ length: 300 }, () =>
    selectQuizTypeForPlayer({}, 10, 'A2')
  );
  expect(results).not.toContain('WordOrder');
});
```

**Component test:** `src/components/Quiz/__tests__/WordOrder.test.jsx`
```js
it('renders tile bank from options array', () => {
  // Render with 4 tile options, assert 4 tile buttons in bank
});

it('clicking tile moves it to drop zone', () => {
  // Click first tile, assert it appears in drop zone
});

it('submit calls onAnswer with joined sentence string', () => {
  // Place all tiles, click Submit, assert onAnswer('word1 word2 word3')
});

it('placed tile click returns it to bank', () => {
  // Place tile, click it in drop zone, assert it returns to bank
});
```

**useQuiz grading test:** `src/hooks/__tests__/useQuiz.adaptive.test.js` (extend) or new file
```js
// Test WordOrder grading in answer()
// Use renderHook pattern from existing tests
```

### Success Criterion 3: A2+ player can complete ClozePassage
**Test location:** `src/data/__tests__/quizTypes.test.js`

```js
it('ClozePassage appears in rotation for A2 player at level 4+', () => {
  const results = Array.from({ length: 300 }, () =>
    selectQuizTypeForPlayer({}, 4, 'A2')
  );
  expect(results).toContain('ClozePassage');
});
```

**Component test:** `src/components/Quiz/__tests__/ClozePassage.test.jsx`
```js
it('renders passage text with blank placeholder', () => {
  // Render with word.exampleSentence.arabic present
  // Assert: passage container visible, blank character visible
});

it('renders 4 Arabic word choices', () => {
  // Assert 4 buttons with Arabic text
});

it('falls back gracefully when exampleSentence is absent', () => {
  // Render with word that has no exampleSentence
  // Assert: renders without crash, shows blank placeholder
});
```

### Success Criterion 4: All 18 QUIZ_TYPE_REGISTRY entries exist with correct deferred stubs
**Test location:** `src/data/__tests__/quizTypes.test.js` — update existing tests

```js
// REPLACE existing "Phase 60 types have minLevel: 999 (not yet active)" test with:
it('active Phase 60 types (GrammarFill, WordOrder, ClozePassage) have real minLevel values', () => {
  expect(QUIZ_TYPE_REGISTRY['GrammarFill'].minLevel).toBeLessThan(999);
  expect(QUIZ_TYPE_REGISTRY['WordOrder'].minLevel).toBeLessThan(999);
  expect(QUIZ_TYPE_REGISTRY['ClozePassage'].minLevel).toBeLessThan(999);
});

it('deferred types (DialectIdentify, RootExpand, CulturalContext) remain at minLevel:999 and cefrMin:B2', () => {
  const deferred = ['DialectIdentify', 'RootExpand', 'CulturalContext'];
  deferred.forEach(t => {
    expect(QUIZ_TYPE_REGISTRY[t].minLevel).toBe(999);
    expect(QUIZ_TYPE_REGISTRY[t].cefrMin).toBe('B2');
  });
});

it('still exports exactly 18 quiz types', () => {
  expect(Object.keys(QUIZ_TYPE_REGISTRY)).toHaveLength(18);
});
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| CLUSTER_MAP in useQuiz.js | QUIZ_TYPE_REGISTRY[type]?.cluster | Phase 59-02 | quizTypes.js is now single source of truth for cluster |
| Static quiz type selection | selectQuizTypeForPlayer with CEFR + level gating + grammar bias | Phase 59-02 | New types are automatically adaptive from day one |
| Phase 60 types at minLevel:999 | Real minLevel values + cefrMin | Phase 60-03 (this phase) | Types enter the rotation |

**Deprecated/outdated:**
- The quizTypes.test.js assertion "Phase 60 types have minLevel: 999 (not yet active)" must be replaced with the SC4 tests above.

---

## Open Questions

1. **GrammarFill: cefrMin 'A1' vs 'A2'**
   - What we know: QUIZ_TYPE_REGISTRY currently has cefrMin: 'A1' for GrammarFill (59-02 stub). Success criterion says "A2 CEFR level or above."
   - What's unclear: Should minLevel be adjusted so that A1 players cannot access it even if their level is high enough?
   - Recommendation: Set cefrMin: 'A2' on GrammarFill to match the success criterion. The current stub has 'A1' — this needs to change in Plan 60-03.

2. **WordOrder: Success criterion says B1+ but registry has cefrMin: 'A1'**
   - What we know: QUIZ_TYPE_REGISTRY stub has cefrMin: 'A1' but success criterion says "B1+".
   - Recommendation: Set cefrMin: 'B1' on WordOrder in Plan 60-03.

3. **Deferred types: cefrMin 'B1' vs 'B2'**
   - What we know: QUIZ_TYPE_REGISTRY stubs have cefrMin: 'B1' for DialectIdentify/CulturalContext but STATE.md says cefrMin: 'B2' for all three deferred types.
   - Recommendation: Update all three deferred types to cefrMin: 'B2' in Plan 60-03.

---

## Sources

### Primary (HIGH confidence)
- Direct inspection of `src/hooks/useQuiz.js` — complete hook implementation, buildChoices, answer(), grading patterns
- Direct inspection of `src/data/quizTypes.js` — QUIZ_TYPE_REGISTRY current state (18 entries, 3 at minLevel:999)
- Direct inspection of `src/components/Quiz/SentenceBuilder.jsx` — tile-click architecture for WordOrder
- Direct inspection of `src/components/Quiz/FillInBlank.jsx` — choice-button architecture for GrammarFill/ClozePassage
- Direct inspection of `src/components/Quiz/ConjugationPick.jsx` — prompt box pattern for GrammarFill
- Direct inspection of `src/components/Quiz/QuizOverlay.jsx` — routing switch + handleAnswer SFX block structure
- Direct inspection of `src/data/grammar.js` — conjugation-drill exercises as verb paradigm data source
- Direct inspection of `src/data/vocabularyAll.js` and `vocabulary.json` — confirmed 250 curated words have exampleSentence.arabic

### Secondary (MEDIUM confidence)
- Direct inspection of `src/data/__tests__/quizTypes.test.js` — exact test patterns for extending
- Direct inspection of `src/components/Quiz/__tests__/QuizOverlay.test.jsx` — mock patterns for new component tests
- Direct inspection of `src/hooks/__tests__/useQuiz.adaptive.test.js` — pure function test patterns

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all confirmed by direct code inspection
- Architecture patterns: HIGH — all 7 patterns derived from live code, not assumptions
- Pitfalls: HIGH — all 5 pitfalls identified from concrete code paths that would cause them
- Validation architecture: HIGH — test patterns mirror existing passing test files

**Research date:** 2026-03-22
**Valid until:** 2026-04-22 (stable codebase, low churn risk in quiz subsystem)
