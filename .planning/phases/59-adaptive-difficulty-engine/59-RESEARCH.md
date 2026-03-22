# Phase 59: Adaptive Difficulty Engine — Research

**Researched:** 2026-03-22
**Domain:** Quiz session state, FSRS retrievability, distractor selection, format-selection routing, QUIZ_TYPE_REGISTRY
**Confidence:** HIGH — all findings sourced directly from project codebase and live ts-fsrs library inspection

---

## Summary

Phase 59 adds three interlocking behaviors to the quiz system: (1) a rolling session accuracy tracker that detects when a player is below 70% or above 85% success; (2) per-content-cluster format routing that biases grammar-weak players toward grammar quiz types; and (3) harder distractors (more plausible Arabic words) when the player is on a streak. All of this must be in place before Phase 60 ships new quiz types so those types inherit adaptive behavior immediately.

The current `useQuiz.js` hook has a flat `sessionScore/sessionTotal` counter but no per-cluster tracking, no format-selection logic, and no distractor-difficulty tiers. The QUIZ_TYPE_REGISTRY mentioned in the phase plans does not exist yet — it must be created as `src/data/quizTypes.js`. The `pickDistractors` function in `useQuiz.js` always pulls from same-category and random-other vocabulary regardless of player performance level.

The FSRS retrievability signal is available via `scheduler.get_retrievability(card, now, false)` which returns a float 0–1. This is the primary difficulty signal for card eligibility. FSRS-due cards (those with `card.due <= now`) must always pass through regardless of difficulty tier — the adaptive engine controls format selection and distractor difficulty only.

**Primary recommendation:** Plan 59-01 extends `useQuiz.js` with session accuracy tracking, per-content-cluster difficulty state, and an FSRS-due override flag. Plan 59-02 creates `src/data/quizTypes.js` (the QUIZ_TYPE_REGISTRY with 18 types) and a `selectQuizTypeForPlayer` function that reads the cluster accuracy state to route grammar-weak players to grammar format types.

---

## Standard Stack

### Core (no new npm installs required)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| ts-fsrs | 5.2.3 | FSRS retrievability signal via `scheduler.get_retrievability()` | Already the project SRS engine |
| @reduxjs/toolkit | 2.11.2 | Reading fsrsCards, grammar state, cefrProgress in selectors | Project-wide Redux pattern |
| react-redux | 9.2.0 | `useSelector` in useQuiz for fsrsCards + grammar stats | Project-wide hook pattern |
| vitest | 3.x | Unit tests for adaptive logic (pure functions are easily testable) | Project test runner |

**No new npm installs for Phase 59.**

### Key Existing Files to Modify

| File | Role | What Changes |
|------|------|-------------|
| `src/hooks/useQuiz.js` | Main quiz hook | Add accuracy tracker, cluster tracking, FSRS-due override, distractor scaling |
| `src/data/quizTypes.js` | NEW — quiz type registry | 18 quiz types with minLevel/cefrMin/cluster metadata |
| `src/services/fsrs.js` | FSRS utilities | Optionally expose `getRetrievability(card)` helper |

---

## Architecture Patterns

### Recommended Structure for Phase 59

```
src/
├── data/
│   └── quizTypes.js         # NEW — QUIZ_TYPE_REGISTRY (18 types, cefrMin, minLevel, cluster)
├── hooks/
│   └── useQuiz.js           # MODIFY — add sessionTracker, clusterAccuracy, fsrsDueOverride
└── services/
    └── fsrs.js              # OPTIONALLY — expose getRetrievability helper
```

### Pattern 1: FSRS Retrievability as Difficulty Signal

`scheduler.get_retrievability(card, now, false)` returns a float 0–1 (where 1 = perfectly retained, 0 = forgotten). Cards with low retrievability are harder for the player.

**Key behavior confirmed from ts-fsrs source:**
- `scheduler.get_retrievability(card, date, false)` → number 0–1 (e.g. 0.9 = 90%)
- `scheduler.get_retrievability(card, date, true)` → string "90.00%" (for display)
- New cards (state=0, stability=0) are always considered due via `getDueCards` in fsrs.js
- FSRS-due cards: those whose `card.due <= new Date()` — always eligible, cannot be filtered

**FSRS-due override contract (QUIZ-02 requirement):**

```javascript
// In useQuiz.js — when building question pool
function isFsrsDue(card) {
  if (!card || !card.due) return true; // new card = always due
  return new Date(card.due) <= new Date();
}

// A card is eligible if:
//   (a) it is FSRS-due (always pass), OR
//   (b) its retrievability falls in the session's target difficulty tier
// The adaptive engine never filters a due card — it only controls FORMAT
```

**Retrievability-to-difficulty tier mapping:**

| Retrievability | Tier | Meaning |
|----------------|------|---------|
| 0.85–1.0 | EASY | Player is strong on this card |
| 0.70–0.84 | TARGET | Sweet spot — 70-85% success zone |
| 0.50–0.69 | HARD | Struggling |
| below 0.50 | CRITICAL | Very weak — high priority for review |

### Pattern 2: Rolling Session Accuracy Tracker

The 70-85% target window is measured as a rolling window over the current session. The simplest correct implementation uses the existing `sessionScore/sessionTotal` state already in `useQuiz.js`:

```javascript
// Existing state (already in useQuiz.js):
// sessionScore: number (correct count)
// sessionTotal: number (questions answered)

// Derived accuracy — computed in answer() callback:
function getSessionAccuracy(sessionScore, sessionTotal) {
  if (sessionTotal < 3) return 0.77; // neutral (within target) until meaningful sample
  return sessionScore / sessionTotal;
}

// Adaptive trigger thresholds:
const ACCURACY_TOO_LOW  = 0.70; // player struggling — shift to easier format
const ACCURACY_TOO_HIGH = 0.85; // player breezing — shift to harder format
```

**State additions to `quizState` in `useQuiz.js`:**

```javascript
const [quizState, setQuizState] = useState({
  active: false,
  quizType: null,
  sessionWords: [],
  currentWord: null,
  choices: [],
  sessionScore: 0,
  sessionTotal: 0,
  // NEW additions:
  clusterAccuracy: {},    // { [clusterId]: { correct, total } } per content cluster
  fsrsDueOverride: false, // true when current word is FSRS-due (locked to eligible)
  distractorTier: 'normal', // 'easy' | 'normal' | 'hard'
});
```

### Pattern 3: Per-Content-Cluster Difficulty Tracking

A "content cluster" is a grouping of quiz types by learning domain. The adaptive engine tracks accuracy per cluster so it can detect grammar-specific weakness independently of overall session performance.

**Cluster definitions (for QUIZ_TYPE_REGISTRY):**

| Cluster ID | Quiz Types | Weakness Signal |
|------------|-----------|-----------------|
| `vocabulary` | ar-to-en, en-to-ar, picture-word, match | Low vocab accuracy |
| `grammar` | fill-blank, conjugation, GrammarFill, ClozePassage, WordOrder, RootExpand | Low grammar accuracy |
| `reading` | sentence-build, transliterate, CulturalContext | Low reading accuracy |
| `roots` | root-identify, RootExpand | Low root accuracy |
| `listening` | listen, DialectIdentify | Low listening accuracy |

Cluster accuracy is tracked by noting which cluster the current question belongs to when `answer()` is called:

```javascript
// In answer() callback — after determining correct:
const cluster = QUIZ_TYPE_REGISTRY[quizState.quizType]?.cluster ?? 'vocabulary';
setQuizState(prev => ({
  ...prev,
  clusterAccuracy: {
    ...prev.clusterAccuracy,
    [cluster]: {
      correct: (prev.clusterAccuracy[cluster]?.correct ?? 0) + (correct ? 1 : 0),
      total: (prev.clusterAccuracy[cluster]?.total ?? 0) + 1,
    }
  }
}));
```

### Pattern 4: QUIZ_TYPE_REGISTRY in quizTypes.js

This is the central registry that Phase 60 will extend when adding new quiz types.

```javascript
// src/data/quizTypes.js (NEW FILE)
export const QUIZ_TYPE_REGISTRY = {
  // ── Existing 12 types ──
  'ar-to-en':        { label: 'Arabic > English',    cluster: 'vocabulary', minLevel: 1,  cefrMin: null },
  'en-to-ar':        { label: 'English > Arabic',    cluster: 'vocabulary', minLevel: 1,  cefrMin: null },
  'en-to-type-ar':   { label: 'Type Arabic',         cluster: 'vocabulary', minLevel: 3,  cefrMin: 'A1' },
  'listen':          { label: 'Listen & Choose',     cluster: 'listening',  minLevel: 1,  cefrMin: null },
  'match':           { label: 'Match Pairs',         cluster: 'vocabulary', minLevel: 1,  cefrMin: null },
  'sentence-build':  { label: 'Build a Sentence',    cluster: 'reading',    minLevel: 5,  cefrMin: 'A1' },
  'root-identify':   { label: 'Find the Root',       cluster: 'roots',      minLevel: 5,  cefrMin: 'A1' },
  'fill-blank':      { label: 'Fill in the Blank',   cluster: 'grammar',    minLevel: 2,  cefrMin: null },
  'category-sort':   { label: 'Sort Categories',     cluster: 'vocabulary', minLevel: 4,  cefrMin: 'A1' },
  'transliterate':   { label: 'Transliterate',       cluster: 'reading',    minLevel: 3,  cefrMin: 'A1' },
  'conjugation':     { label: 'Conjugation',         cluster: 'grammar',    minLevel: 4,  cefrMin: 'A1' },
  'picture-word':    { label: 'Picture Word',        cluster: 'vocabulary', minLevel: 1,  cefrMin: null },
  // ── 6 new types added by Phase 60 (stubs with correct metadata) ──
  'GrammarFill':     { label: 'Grammar Fill',        cluster: 'grammar',    minLevel: 3,  cefrMin: 'A1' },
  'ClozePassage':    { label: 'Cloze Passage',       cluster: 'grammar',    minLevel: 6,  cefrMin: 'A2' },
  'WordOrder':       { label: 'Word Order',          cluster: 'grammar',    minLevel: 4,  cefrMin: 'A1' },
  'DialectIdentify': { label: 'Dialect Identify',    cluster: 'listening',  minLevel: 8,  cefrMin: 'B1' },
  'RootExpand':      { label: 'Root Expand',         cluster: 'roots',      minLevel: 6,  cefrMin: 'A2' },
  'CulturalContext': { label: 'Cultural Context',    cluster: 'reading',    minLevel: 7,  cefrMin: 'B1' },
};

/**
 * Select a quiz type appropriate for this player's state.
 * Routes grammar-weak players to grammar cluster types.
 * Gates types by minLevel and cefrMin.
 *
 * @param {Object} clusterAccuracy  - { [clusterId]: { correct, total } }
 * @param {number} playerLevel      - current player level
 * @param {string|null} cefrLevel   - current CEFR level ('A1'|'A2'|'B1'|'B2'|null)
 * @returns {string} quiz type key
 */
export function selectQuizTypeForPlayer(clusterAccuracy, playerLevel, cefrLevel) {
  // ... (see Code Examples section)
}
```

**cefrMin gate logic:** A type is eligible if:
- `type.cefrMin === null` (no CEFR gate), OR
- `cefrLevel` is null (no placement yet — treat as eligible), OR
- CEFR_ORDER[cefrLevel] >= CEFR_ORDER[type.cefrMin]

```javascript
const CEFR_ORDER = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4 };

function isCefrEligible(typeEntry, cefrLevel) {
  if (!typeEntry.cefrMin) return true;
  if (!cefrLevel) return true; // no placement = no gate
  return (CEFR_ORDER[cefrLevel] ?? 0) >= (CEFR_ORDER[typeEntry.cefrMin] ?? 1);
}
```

### Pattern 5: Distractor Scaling for QUIZ-03

When the player is above 85% accuracy (high accuracy = `distractorTier: 'hard'`), `pickDistractors` should return more plausible Arabic words — words that share category, difficulty tier, or root letters with the correct word. This makes wrong answers harder to distinguish.

**Current `pickDistractors` (useQuiz.js line 14-23):**

```javascript
function pickDistractors(correctWord, count = 3) {
  const sameCat = vocabulary.filter(
    (w) => w.category === correctWord.category && w.id !== correctWord.id
  );
  const others = vocabulary.filter(
    (w) => w.category !== correctWord.category && w.id !== correctWord.id
  );
  const pool = [...shuffle(sameCat).slice(0, 2), ...shuffle(others)];
  return shuffle(pool).slice(0, count);
}
```

**Scaled distractor function:**

```javascript
function pickDistractors(correctWord, count = 3, tier = 'normal') {
  const sameCat = vocabulary.filter(
    (w) => w.category === correctWord.category && w.id !== correctWord.id
  );
  const others = vocabulary.filter(
    (w) => w.category !== correctWord.category && w.id !== correctWord.id
  );

  if (tier === 'hard') {
    // Hard: all distractors from same category, same difficulty level — maximally plausible
    const sameDifficulty = sameCat.filter(w => w.difficulty === correctWord.difficulty);
    const pool = sameDifficulty.length >= count
      ? sameDifficulty
      : [...sameDifficulty, ...sameCat];
    return shuffle(pool).slice(0, count);
  }

  if (tier === 'easy') {
    // Easy: mostly cross-category words — clearly wrong answers
    const pool = [...shuffle(others).slice(0, 3), ...shuffle(sameCat)];
    return shuffle(pool).slice(0, count);
  }

  // Normal: existing behavior (2 same-cat + rest from others)
  const pool = [...shuffle(sameCat).slice(0, 2), ...shuffle(others)];
  return shuffle(pool).slice(0, count);
}
```

**Tier transition rules:**

| Condition | Action |
|-----------|--------|
| `sessionAccuracy < 0.70` AND `sessionTotal >= 3` | `distractorTier: 'easy'`, route to easier format |
| `0.70 <= sessionAccuracy <= 0.85` | `distractorTier: 'normal'` |
| `sessionAccuracy > 0.85` AND `sessionTotal >= 3` | `distractorTier: 'hard'` |

### Pattern 6: Format-Selection Routing

The `selectQuizTypeForPlayer` function is called in `useQuiz.start()` when no explicit `quizType` is passed, and in `loadQuestion()` to potentially switch type mid-session based on accumulated accuracy.

**Grammar weakness detection:** A player is "grammar-weak" if `clusterAccuracy.grammar` has at least 3 questions answered AND accuracy < 0.70.

```javascript
function isGrammarWeak(clusterAccuracy) {
  const gc = clusterAccuracy.grammar;
  if (!gc || gc.total < 3) return false;
  return gc.correct / gc.total < 0.70;
}
```

**Format routing algorithm:**

```javascript
export function selectQuizTypeForPlayer(clusterAccuracy, playerLevel, cefrLevel) {
  const CEFR_ORDER = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4 };

  // Filter eligible types
  const eligible = Object.entries(QUIZ_TYPE_REGISTRY).filter(([, entry]) => {
    const levelOk = playerLevel >= entry.minLevel;
    const cefrOk = !entry.cefrMin || !cefrLevel ||
      (CEFR_ORDER[cefrLevel] ?? 0) >= (CEFR_ORDER[entry.cefrMin] ?? 1);
    return levelOk && cefrOk;
  });

  // Grammar weakness routing — increase grammar type probability
  const gc = clusterAccuracy?.grammar;
  const grammarWeak = gc && gc.total >= 3 && gc.correct / gc.total < 0.70;

  if (grammarWeak) {
    const grammarTypes = eligible.filter(([, e]) => e.cluster === 'grammar');
    if (grammarTypes.length > 0) {
      // 70% chance of grammar type, 30% chance of any eligible type
      if (Math.random() < 0.70) {
        return grammarTypes[Math.floor(Math.random() * grammarTypes.length)][0];
      }
    }
  }

  // Default: uniform random from eligible types
  if (eligible.length === 0) return 'ar-to-en'; // ultimate fallback
  return eligible[Math.floor(Math.random() * eligible.length)][0];
}
```

### Anti-Patterns to Avoid

- **Filtering FSRS-due cards based on difficulty tier:** The adaptive engine controls format only. If a card is FSRS-due, it must appear in the session regardless of what difficulty tier is active.
- **Switching quiz type mid-question:** The format is selected at the start of each question via `loadQuestion()`. Never change `quizType` after `choices` are already built.
- **Storing cluster accuracy in Redux:** This is session-ephemeral data. It resets when the quiz closes. Keep it in `useQuiz.js` local state, not Redux — matches the pattern of `sessionScore/sessionTotal`.
- **Calling `scheduler.get_retrievability(card, date)` without the `false` third argument:** Returns a string like "90.00%" instead of the float 0.9. Always pass `false` for numeric comparison.
- **Requiring CEFR level for format gating:** `cefrProgress.currentLevel` defaults to `null` (player hasn't taken placement). If null, treat all cefrMin gates as passed — no gate applies until a level is assigned.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| FSRS retrievability | Custom forgetting curve calculation | `scheduler.get_retrievability(card, now, false)` | ts-fsrs exposes this — returns 0-1 float directly |
| FSRS due check | Custom date comparison logic | Existing `getDueCards()` in `fsrs.js` (returns array of due wordIds) | Already handles new card edge case (null due = always due) |
| Shuffle | Custom RNG | `import { shuffle } from '../utils/shuffle.js'` | Already used by `pickDistractors` |
| CEFR ordering | Ad-hoc string comparison | `const CEFR_ORDER = { A1:1, A2:2, B1:3, B2:4 }` pattern | Already used in `vocabularySlice.js` `selectNewCardsByFrequency` |
| Quiz type eligibility | If/else chains | `QUIZ_TYPE_REGISTRY` with `minLevel` + `cefrMin` gate | Registry pattern is extensible for Phase 60's 6 new types |

---

## Common Pitfalls

### Pitfall 1: Grammar cluster has < 3 samples — false positive weakness detection

**What goes wrong:** After the first grammar question, if the player answers incorrectly, the cluster accuracy is 0/1 = 0%. The routing algorithm immediately biases heavily toward grammar — which may not reflect a real weakness.

**Why it happens:** No minimum sample guard in the weakness detection logic.

**How to avoid:** Only trigger format routing when `clusterAccuracy[cluster].total >= 3`. Use a `MIN_CLUSTER_SAMPLE = 3` constant. This is already reflected in the `isGrammarWeak` function above.

**Warning signs:** A single wrong grammar answer immediately floods the session with grammar types.

### Pitfall 2: `scheduler.get_retrievability` called on a new card (reps=0, stability=0)

**What goes wrong:** New cards have `state: 0` and `stability: 0`. Calling `get_retrievability` on a card with `stability: 0` may produce NaN or unexpected values.

**Why it happens:** The FSRS formula involves division by stability.

**How to avoid:** In the difficulty-tier classification, check `if (!card || card.reps === 0)` and treat new cards as CRITICAL tier (always eligible). This matches the existing behavior in `getDueCards` where cards without a `due` field are always returned.

### Pitfall 3: The `distractorTier` state doesn't update before choices are built

**What goes wrong:** The tier is computed from `sessionScore/sessionTotal`, but `setQuizState` is async (React state update). If `loadQuestion` reads `quizState.distractorTier` before the state has updated, it sees the stale value.

**Why it happens:** React batches state updates.

**How to avoid:** Compute `distractorTier` as a derived value from `sessionScore/sessionTotal` at call time — pass it as a parameter to `pickDistractors` rather than reading from state. The tier is always computed fresh when building choices.

```javascript
// In loadQuestion():
const accuracy = sessionTotal < 3 ? 0.77 : sessionScore / sessionTotal;
const tier = accuracy < 0.70 ? 'easy' : accuracy > 0.85 ? 'hard' : 'normal';
const choices = buildChoices(word, type, tier); // pass tier explicitly
```

### Pitfall 4: `selectQuizTypeForPlayer` in quizTypes.js imports from Redux (circular dependency)

**What goes wrong:** If `quizTypes.js` imports selectors from Redux slices, and those slices are imported in the store, a circular module dependency may arise.

**Why it happens:** Data files importing from store/ creates circular chains.

**How to avoid:** `quizTypes.js` must be a pure data/utility file. It accepts `clusterAccuracy`, `playerLevel`, and `cefrLevel` as plain parameters — no Redux imports. The caller (`useQuiz.js`) passes the values from `useSelector`.

### Pitfall 5: 18-type registry stubs for Phase 60 types activate before their renderers exist

**What goes wrong:** `selectQuizTypeForPlayer` could return `'GrammarFill'` or `'ClozePassage'` — types that Phase 60 hasn't implemented yet. QuizOverlay has no renderer for them, so the quiz renders nothing.

**Why it happens:** The registry is created in Phase 59 to establish metadata; renderers come in Phase 60.

**How to avoid:** In Phase 59, register the 6 new types but gate them with a high `minLevel` (e.g. 999) so they never fire in practice until Phase 60 lowers the gates. Alternative: add an `active: false` flag to the registry entry that `selectQuizTypeForPlayer` respects.

**Recommended approach:** Use `minLevel: 999` as a sentinel — no player will reach level 999. Phase 60's plan lowers these to real values when renderers are added.

---

## Code Examples

### FSRS Retrievability Helper (verified, ts-fsrs 5.2.3)

```javascript
// src/services/fsrs.js — add this helper
import { fsrs, generatorParameters } from 'ts-fsrs';
const params = generatorParameters();
const scheduler = fsrs(params);

/**
 * Get FSRS retrievability for a card as a 0-1 float.
 * Returns 1.0 for new cards (reps=0).
 * @param {Object} card - FSRS card object from vocabulary state
 * @param {Date} [now] - reference date (defaults to current time)
 * @returns {number} 0-1 float (1 = perfectly retained)
 */
export function getRetrievability(card, now = new Date()) {
  if (!card || card.reps === 0 || !card.stability) return 1.0;
  return scheduler.get_retrievability(card, now, false); // false = return number not string
}
```

### QUIZ_TYPE_REGISTRY creation (quizTypes.js)

```javascript
// src/data/quizTypes.js (NEW FILE — created in 59-02)
const CEFR_ORDER = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4 };

export const QUIZ_TYPE_REGISTRY = {
  'ar-to-en':        { label: 'Arabic > English',   cluster: 'vocabulary', minLevel: 1,   cefrMin: null },
  'en-to-ar':        { label: 'English > Arabic',   cluster: 'vocabulary', minLevel: 1,   cefrMin: null },
  'en-to-type-ar':   { label: 'Type Arabic',        cluster: 'vocabulary', minLevel: 3,   cefrMin: 'A1' },
  'listen':          { label: 'Listen & Choose',    cluster: 'listening',  minLevel: 1,   cefrMin: null },
  'match':           { label: 'Match Pairs',        cluster: 'vocabulary', minLevel: 1,   cefrMin: null },
  'sentence-build':  { label: 'Build a Sentence',   cluster: 'reading',    minLevel: 5,   cefrMin: 'A1' },
  'root-identify':   { label: 'Find the Root',      cluster: 'roots',      minLevel: 5,   cefrMin: 'A1' },
  'fill-blank':      { label: 'Fill in the Blank',  cluster: 'grammar',    minLevel: 2,   cefrMin: null },
  'category-sort':   { label: 'Sort Categories',    cluster: 'vocabulary', minLevel: 4,   cefrMin: 'A1' },
  'transliterate':   { label: 'Transliterate',      cluster: 'reading',    minLevel: 3,   cefrMin: 'A1' },
  'conjugation':     { label: 'Conjugation',        cluster: 'grammar',    minLevel: 4,   cefrMin: 'A1' },
  'picture-word':    { label: 'Picture Word',       cluster: 'vocabulary', minLevel: 1,   cefrMin: null },
  // Phase 60 types — gated at minLevel: 999 until renderers ship
  'GrammarFill':     { label: 'Grammar Fill',       cluster: 'grammar',    minLevel: 999, cefrMin: 'A1' },
  'ClozePassage':    { label: 'Cloze Passage',      cluster: 'grammar',    minLevel: 999, cefrMin: 'A2' },
  'WordOrder':       { label: 'Word Order',         cluster: 'grammar',    minLevel: 999, cefrMin: 'A1' },
  'DialectIdentify': { label: 'Dialect Identify',   cluster: 'listening',  minLevel: 999, cefrMin: 'B1' },
  'RootExpand':      { label: 'Root Expand',        cluster: 'roots',      minLevel: 999, cefrMin: 'A2' },
  'CulturalContext': { label: 'Cultural Context',   cluster: 'reading',    minLevel: 999, cefrMin: 'B1' },
};

export function selectQuizTypeForPlayer(clusterAccuracy, playerLevel, cefrLevel) {
  const eligible = Object.entries(QUIZ_TYPE_REGISTRY).filter(([, entry]) => {
    if (playerLevel < entry.minLevel) return false;
    if (!entry.cefrMin) return true;
    if (!cefrLevel) return true;
    return (CEFR_ORDER[cefrLevel] ?? 0) >= (CEFR_ORDER[entry.cefrMin] ?? 1);
  });

  // Grammar-weak routing: 70% chance of grammar type when weakness detected
  const gc = clusterAccuracy?.grammar;
  const grammarWeak = gc && gc.total >= 3 && gc.correct / gc.total < 0.70;
  if (grammarWeak) {
    const grammarTypes = eligible.filter(([, e]) => e.cluster === 'grammar');
    if (grammarTypes.length > 0 && Math.random() < 0.70) {
      return grammarTypes[Math.floor(Math.random() * grammarTypes.length)][0];
    }
  }

  if (eligible.length === 0) return 'ar-to-en';
  return eligible[Math.floor(Math.random() * eligible.length)][0];
}
```

### Session Accuracy Tracker in useQuiz.js

```javascript
// useQuiz.js — state additions (59-01)
const [quizState, setQuizState] = useState({
  active: false,
  quizType: null,
  sessionWords: [],
  currentWord: null,
  choices: [],
  sessionScore: 0,
  sessionTotal: 0,
  clusterAccuracy: {},    // { [clusterId]: { correct, total } }
  fsrsDueOverride: false, // true when this word is FSRS-due
  distractorTier: 'normal',
});

// In answer() — after determining correct:
const cluster = QUIZ_TYPE_REGISTRY[quizState.quizType]?.cluster ?? 'vocabulary';
const newCluster = {
  ...quizState.clusterAccuracy,
  [cluster]: {
    correct: (quizState.clusterAccuracy[cluster]?.correct ?? 0) + (correct ? 1 : 0),
    total: (quizState.clusterAccuracy[cluster]?.total ?? 0) + 1,
  },
};
// Compute new distractorTier for NEXT question
const newTotal = quizState.sessionTotal + 1;
const newScore = quizState.sessionScore + (correct ? 1 : 0);
const newAccuracy = newTotal < 3 ? 0.77 : newScore / newTotal;
const newTier = newAccuracy < 0.70 ? 'easy' : newAccuracy > 0.85 ? 'hard' : 'normal';

setQuizState(prev => ({
  ...prev,
  sessionScore: newScore,
  sessionTotal: newTotal,
  clusterAccuracy: newCluster,
  distractorTier: newTier,
}));
```

### FSRS-Due Override Flag

```javascript
// In loadQuestion() — mark whether current word is FSRS-due
function loadQuestion(words, idx, type, fsrsCards) {
  if (idx >= words.length) return;
  const word = words[idx];
  const card = fsrsCards[word.id]?.card;
  const isDue = !card || !card.due || new Date(card.due) <= new Date();
  const tier = /* derive from current sessionScore/sessionTotal */;
  const choices = buildChoices(word, type, tier);
  setQuizState(prev => ({
    ...prev,
    currentWord: word,
    choices,
    fsrsDueOverride: isDue,
  }));
  setFeedback(null);
}
```

---

## Validation Architecture

This section defines the complete verification contract for Phase 59's success criteria. All checks are automatable via vitest.

### Success Criterion 1: Grammar-weak routing visible within a session

**SC1:** A player with grammar cluster accuracy below 70% receives more grammar format questions in subsequent rounds — observable within a single extended quiz session.

**Test file:** `src/data/__tests__/quizTypes.test.js` (new)

| Check | Test | What Passes |
|-------|------|-------------|
| SC1-A: `selectQuizTypeForPlayer` returns grammar type when grammar-weak | Unit test | With `clusterAccuracy = { grammar: { correct: 1, total: 5 } }` (20% = weak), random seed controlled, grammar type is returned 70%+ of calls |
| SC1-B: Grammar-weak routing requires minimum 3 sample | Unit test | With `{ grammar: { correct: 0, total: 2 } }`, routing does NOT bias toward grammar |
| SC1-C: Eligible types filtered by `minLevel` | Unit test | playerLevel=1 excludes types with minLevel > 1 |
| SC1-D: Eligible types filtered by `cefrMin` | Unit test | cefrLevel='A1' excludes types with `cefrMin: 'B1'` or `cefrMin: 'B2'` |
| SC1-E: cefrLevel=null passes all cefrMin gates | Unit test | When cefrLevel is null, types with cefrMin='A1' are still eligible |
| SC1-F: QUIZ_TYPE_REGISTRY exports 18 types | Unit test | `Object.keys(QUIZ_TYPE_REGISTRY).length === 18` |

**Exact test assertions:**

```javascript
// src/data/__tests__/quizTypes.test.js
import { QUIZ_TYPE_REGISTRY, selectQuizTypeForPlayer } from '../quizTypes.js';

describe('QUIZ_TYPE_REGISTRY', () => {
  it('exports exactly 18 quiz types', () => {
    expect(Object.keys(QUIZ_TYPE_REGISTRY)).toHaveLength(18);
  });

  it('all existing 12 types are present', () => {
    const existing = ['ar-to-en','en-to-ar','en-to-type-ar','listen','match',
      'sentence-build','root-identify','fill-blank','category-sort',
      'transliterate','conjugation','picture-word'];
    existing.forEach(t => expect(QUIZ_TYPE_REGISTRY).toHaveProperty(t));
  });

  it('Phase 60 types have minLevel: 999 (not yet active)', () => {
    const phase60 = ['GrammarFill','ClozePassage','WordOrder','DialectIdentify','RootExpand','CulturalContext'];
    phase60.forEach(t => expect(QUIZ_TYPE_REGISTRY[t].minLevel).toBe(999));
  });
});

describe('selectQuizTypeForPlayer — grammar-weak routing', () => {
  it('biases toward grammar types when grammar weak', () => {
    const weakAccuracy = { grammar: { correct: 1, total: 5 } }; // 20%
    const results = Array.from({ length: 100 }, () =>
      selectQuizTypeForPlayer(weakAccuracy, 10, 'A1')
    );
    const grammarResults = results.filter(t =>
      QUIZ_TYPE_REGISTRY[t]?.cluster === 'grammar'
    );
    // Should be grammar > 50% of the time (target 70%)
    expect(grammarResults.length).toBeGreaterThan(50);
  });

  it('does NOT bias toward grammar when fewer than 3 grammar questions answered', () => {
    const tooFewSamples = { grammar: { correct: 0, total: 2 } };
    const results = Array.from({ length: 50 }, () =>
      selectQuizTypeForPlayer(tooFewSamples, 10, 'A1')
    );
    const grammarResults = results.filter(t =>
      QUIZ_TYPE_REGISTRY[t]?.cluster === 'grammar'
    );
    // Without the bias trigger, grammar rate should not dominate (< 50%)
    expect(grammarResults.length).toBeLessThan(35);
  });

  it('excludes types above player level', () => {
    const result = selectQuizTypeForPlayer({}, 1, null);
    expect(QUIZ_TYPE_REGISTRY[result].minLevel).toBeLessThanOrEqual(1);
  });

  it('excludes types above CEFR level', () => {
    const result = selectQuizTypeForPlayer({}, 10, 'A1');
    const entry = QUIZ_TYPE_REGISTRY[result];
    const CEFR_ORDER = { A1: 1, A2: 2, B1: 3, B2: 4 };
    if (entry.cefrMin) {
      expect(CEFR_ORDER['A1']).toBeGreaterThanOrEqual(CEFR_ORDER[entry.cefrMin]);
    }
  });

  it('falls back to ar-to-en when no types eligible', () => {
    // playerLevel 0 filters everything except ar-to-en (minLevel: 1) — actually minLevel 1 > 0
    // Use a very restrictive CEFR that no type satisfies... but all null-cefrMin types are eligible
    // So fallback: pass playerLevel = 0 to filter all minLevel >= 1
    const result = selectQuizTypeForPlayer({}, 0, null);
    expect(result).toBe('ar-to-en');
  });
});
```

### Success Criterion 2: FSRS-due cards always eligible

**SC2:** FSRS-due cards are always eligible regardless of difficulty tier — adaptive engine controls question format only, never filters scheduled cards.

**Test file:** `src/hooks/__tests__/useQuiz.adaptive.test.js` (new)

| Check | Test | What Passes |
|-------|------|-------------|
| SC2-A: isFsrsDue returns true for null card | Unit test | `isFsrsDue(null) === true` |
| SC2-B: isFsrsDue returns true for card with null due | Unit test | `isFsrsDue({ due: null }) === true` |
| SC2-C: isFsrsDue returns true for overdue card | Unit test | `isFsrsDue({ due: pastDate }) === true` |
| SC2-D: isFsrsDue returns false for future card | Unit test | `isFsrsDue({ due: futureDate }) === false` |
| SC2-E: `fsrsDueOverride` flag in state is true for due words | Integration | After `start()` with a due word, `quizState.fsrsDueOverride === true` |
| SC2-F: Format switches even when word is FSRS-due | Unit test | selectQuizTypeForPlayer still returns grammar type for grammar-weak player even when word has a due card |

**Exact test assertions (pure function tests — no React needed):**

```javascript
// Test isFsrsDue as an exported pure function from useQuiz.js or fsrs.js
import { isFsrsDue } from '../hooks/useQuiz.js'; // exported for testing

describe('isFsrsDue', () => {
  it('returns true for null card', () => expect(isFsrsDue(null)).toBe(true));
  it('returns true for card with null due', () => expect(isFsrsDue({ due: null })).toBe(true));
  it('returns true for past-due card', () => {
    expect(isFsrsDue({ due: new Date(Date.now() - 86400000).toISOString() })).toBe(true);
  });
  it('returns false for future-due card', () => {
    expect(isFsrsDue({ due: new Date(Date.now() + 86400000).toISOString() })).toBe(false);
  });
});
```

### Success Criterion 3: Distractor difficulty scales with accuracy

**SC3:** A player consistently above 85% sees distractor difficulty increase — wrong answers become more plausible Arabic words.

**Test file:** `src/hooks/__tests__/useQuiz.adaptive.test.js` (continued)

| Check | Test | What Passes |
|-------|------|-------------|
| SC3-A: `distractorTier` is 'easy' when accuracy < 70% | Unit test | `getDisstractorTier(score=1, total=5) === 'easy'` |
| SC3-B: `distractorTier` is 'normal' in 70-85% band | Unit test | `getDistractorTier(score=4, total=5) === 'normal'` |
| SC3-C: `distractorTier` is 'hard' when accuracy > 85% | Unit test | `getDistractorTier(score=9, total=10) === 'hard'` |
| SC3-D: `distractorTier` is 'normal' with < 3 answers | Unit test | `getDistractorTier(score=0, total=2) === 'normal'` |
| SC3-E: Hard tier returns same-category same-difficulty distractors | Unit test | `pickDistractors(word, 3, 'hard')` returns words with same `category` and `difficulty` |
| SC3-F: Easy tier returns cross-category distractors | Unit test | `pickDistractors(word, 3, 'easy')` returns at least 2 words with different `category` from correct |

**Exact test assertions:**

```javascript
// Export getDistractorTier and pickDistractors for unit testing
import { getDistractorTier, pickDistractors } from '../hooks/useQuiz.js';
import vocabulary from '../data/vocabularyAll.js';

describe('getDistractorTier', () => {
  it('returns normal for < 3 total', () => expect(getDistractorTier(0, 2)).toBe('normal'));
  it('returns easy for accuracy < 0.70', () => expect(getDistractorTier(1, 5)).toBe('easy'));
  it('returns normal for accuracy 0.70-0.85', () => expect(getDistractorTier(4, 5)).toBe('normal'));
  it('returns hard for accuracy > 0.85', () => expect(getDistractorTier(9, 10)).toBe('hard'));
});

describe('pickDistractors', () => {
  const correctWord = vocabulary.find(w => w.category === 'greetings' && w.difficulty === 1);

  it('hard tier returns same-category distractors', () => {
    const distractors = pickDistractors(correctWord, 3, 'hard');
    expect(distractors).toHaveLength(3);
    const allSameCat = distractors.every(d => d.category === correctWord.category);
    expect(allSameCat).toBe(true);
  });

  it('easy tier returns mostly cross-category distractors', () => {
    const distractors = pickDistractors(correctWord, 3, 'easy');
    expect(distractors).toHaveLength(3);
    const crossCat = distractors.filter(d => d.category !== correctWord.category);
    expect(crossCat.length).toBeGreaterThanOrEqual(2);
  });

  it('normal tier returns mixed distractors (existing behavior)', () => {
    const distractors = pickDistractors(correctWord, 3, 'normal');
    expect(distractors).toHaveLength(3);
  });
});
```

### Quick Run Commands Per Plan

| Plan | Wave | Test File | Command |
|------|------|-----------|---------|
| 59-01 (accuracy tracker + FSRS override) | Wave 0 | `src/hooks/__tests__/useQuiz.adaptive.test.js` | `npx vitest run src/hooks/__tests__/useQuiz.adaptive.test.js` |
| 59-01 | Wave 1 (after useQuiz.js changes) | same | same — now passes |
| 59-02 (QUIZ_TYPE_REGISTRY + routing) | Wave 0 | `src/data/__tests__/quizTypes.test.js` | `npx vitest run src/data/__tests__/quizTypes.test.js` |
| 59-02 | Wave 1 (after quizTypes.js created) | same | same — now passes |
| both | Full suite | all | `npx vitest run` |

**Estimated runtime:** ~3-5 seconds per plan file, ~25 seconds full suite.

### Sampling Rate (Nyquist Compliance)

- After every change to useQuiz.js: run `npx vitest run src/hooks/__tests__/`
- After creating quizTypes.js: run `npx vitest run src/data/__tests__/quizTypes.test.js`
- Before submit: `npx vitest run` (full suite green)
- No 3 consecutive tasks without automated verify

### Functions to Export for Testability

These pure helper functions must be exported from their modules to enable unit testing without React:

| Function | Module | Export Reason |
|----------|--------|---------------|
| `isFsrsDue(card)` | `useQuiz.js` | Testable without React — pure date comparison |
| `getDistractorTier(score, total)` | `useQuiz.js` | Testable without React — pure arithmetic |
| `pickDistractors(word, count, tier)` | `useQuiz.js` | Testable with vocabulary data — no React/Redux |
| `selectQuizTypeForPlayer(clusterAccuracy, level, cefr)` | `quizTypes.js` | Pure data function |
| `QUIZ_TYPE_REGISTRY` | `quizTypes.js` | Registry for inspection in tests |

### Manual-Only Verifications

| Behavior | Why Manual | Test Instructions |
|----------|------------|-------------------|
| Grammar-weak routing visible in extended session | Requires playing 10+ questions with intentional grammar failures | 1. `npm run dev` 2. Open quiz 3. Answer grammar questions wrong 4. Count grammar-cluster types appearing in next 5 questions — should be >3 |
| Distractor plausibility visibly increases after streak | Requires subjective Arabic knowledge | 1. Answer 10+ questions correctly 2. Observe wrong-answer choices become same-category words |
| FSRS-due cards appear even at easy tier | Requires seeding an overdue card | 1. Set a card's due date to past 2. Trigger easy tier by answering wrong 3. Confirm overdue card still appears in session |

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|-----------------|--------------|--------|
| Random quiz type selection | Format routing by cluster accuracy | Phase 59 | Grammar-weak players get grammar-targeted practice |
| Fixed distractors (2 same-cat + rest random) | Tier-scaled distractors | Phase 59 | Correct-streaking players face genuinely harder choices |
| No FSRS-due override | FSRS-due cards always pass through | Phase 59 | SRS schedule is never disrupted by adaptive difficulty tier |
| QUIZ_TYPES inline constant in useQuiz.js | QUIZ_TYPE_REGISTRY in quizTypes.js | Phase 59 | Phase 60 adds 6 new types to registry without touching useQuiz.js |

**Deprecated/outdated after Phase 59:**
- The `QUIZ_TYPES` array constant in `useQuiz.js` (lines 25-35): replaced by `QUIZ_TYPE_REGISTRY` in `quizTypes.js`. The inline array can be removed; `QuizOverlay.jsx` references `QUIZ_TYPE_LABELS` (a separate object) which stays.

---

## Open Questions

1. **Format switching mid-session: per-question or per-session?**
   - What we know: The phase description says "subsequent rounds" — implying per-question re-evaluation.
   - What's unclear: Should the format switch happen mid-session (after each answer) or only at session start?
   - Recommendation: Re-evaluate format on each call to `loadQuestion()` — this gives the most responsive adaptation within an extended session (SC1 requires this to be observable within a single session).

2. **Where does `isFsrsDue` live — in useQuiz.js or fsrs.js?**
   - What we know: `getDueCards` already exists in `fsrs.js` and does the same check per-word.
   - What's unclear: Plan 59-01 describes adding it to useQuiz.js; it could also be exported from fsrs.js.
   - Recommendation: Add `isFsrsDue(card)` as an exported helper from `fsrs.js` (where the FSRS session logic lives) and import it in `useQuiz.js`. Keeps FSRS logic in one file.

3. **Cluster accuracy reset on session close?**
   - What we know: `sessionScore/sessionTotal` reset to 0 when `close()` is called. `clusterAccuracy` should follow the same pattern.
   - What's unclear: Whether there's any value in persisting cluster accuracy across sessions.
   - Recommendation: Reset `clusterAccuracy: {}` in `close()`. Cross-session persistence is out of scope (REQUIREMENTS.md explicitly excludes "ML-based adaptive algorithms" — cross-session is premature).

---

## Sources

### Primary (HIGH confidence)
- `src/hooks/useQuiz.js` — Current quiz state shape, QUIZ_TYPES array, pickDistractors function
- `src/services/fsrs.js` — getDueCards, createNewCard, reviewCard, Rating exports
- `src/store/slices/vocabularySlice.js` — FSRS card state shape, fsrsCards structure
- `src/store/slices/cefrProgressSlice.js` — currentLevel null default, CEFR level type
- `src/store/slices/grammarSlice.js` — grammar state, lessonScores, completedLessons
- `src/components/Quiz/QuizOverlay.jsx` — QUIZ_TYPE_LABELS, component routing per type
- `src/utils/wordSelection.js` — Existing difficulty-based word selection (pattern reference)
- `src/data/vocabularyAll.js` — category and difficulty fields confirmed on vocabulary items
- Live `ts-fsrs` 5.2.3 inspection — `scheduler.get_retrievability(card, date, false)` returns float 0-1; `get_retrievability(card, date, true)` returns string

### Secondary (MEDIUM confidence)
- `.planning/STATE.md` — Confirms CURRENT_VERSION=12, cefrProgressSlice exists with currentLevel: null default
- `.planning/REQUIREMENTS.md` — QUIZ-02 (FSRS retrievability targets 70-85%), QUIZ-03 (format adapts to weakness)
- Phase 58 RESEARCH.md + SUMMARY.md — Confirms current test patterns, middleware patterns, migration version

### Tertiary (LOW confidence)
- None — all findings sourced directly from live project code

---

## Metadata

**Confidence breakdown:**
- FSRS retrievability API: HIGH — verified by running ts-fsrs 5.2.3 directly
- Current useQuiz.js state shape: HIGH — read full file
- QUIZ_TYPE_REGISTRY design: HIGH — designed to match existing QUIZ_TYPES array + QuizOverlay renderer list
- Distractor scaling: HIGH — pickDistractors function read in full, vocabulary structure confirmed
- Grammar cluster weakness routing: HIGH — pattern derived from selectNewCardsByPath precedent in vocabularySlice

**Research date:** 2026-03-22
**Valid until:** 2026-04-22 (stable codebase — no fast-moving dependencies)
