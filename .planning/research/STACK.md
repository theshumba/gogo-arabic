# Technology Stack — v12.0 Learning Systems

**Project:** GoGo Arabic v12.0 (skill trees, grammar expansion, quiz expansion, adaptive difficulty, CEFR placement, 250+ achievements)
**Researched:** 2026-03-22
**Confidence:** HIGH — package.json inspected, node_modules verified, existing slice architecture confirmed

---

## Executive Summary

The v12.0 feature set requires **one new npm package** and **zero structural changes** to the core stack. The existing infrastructure (Redux Toolkit, ts-fsrs, Framer Motion, Phaser 3) handles every new feature directly.

The new package is `recharts` (already used in FrameCoach Command Centre, React 19 compatible as of v3.8.0) for CEFR progress charts and skill distribution radar charts in the assessment dashboard.

The "shareable social card" feature is the only decision requiring care: use `html-to-image` (a dev-only utility, no persistent dep) rather than `html2canvas` (stale, CORS issues). However, the Web Share API covers the actual sharing — no external share library needed.

**All other v12.0 systems — skill tree expansion, grammar lesson expansion, quiz type expansion, adaptive difficulty engine, placement test — are pure JavaScript logic using existing Redux Toolkit, ts-fsrs, and React patterns already proven at scale in this 196K+ LOC codebase.**

---

## Confirmed Installed Stack (DO NOT RE-RESEARCH)

From `package.json` inspection, 2026-03-22:

| Package | Version | Role |
|---------|---------|------|
| `react` | `^19.2.4` | UI framework |
| `phaser` | `^3.90.0` | Game engine |
| `@reduxjs/toolkit` | `^2.11.2` | State management (31 slices) |
| `react-redux` | `^9.2.0` | React-Redux bindings |
| `redux-persist` | `^6.0.0` | IndexedDB persistence |
| `ts-fsrs` | `^5.2.3` | Spaced repetition algorithm |
| `inkjs` | `^2.4.0` | Ink dialogue runtime (installed, v11.0) |
| `framer-motion` | `^11.15.0` | Overlay animations |
| `howler` | `^2.2.4` | Audio system |
| `zod` | `^4.3.6` | Schema validation |
| `react-router-dom` | `^7.13.0` | Routing |
| `rollup-plugin-visualizer` | `^7.0.1` | Bundle analysis (dev) |

---

## New Dependencies for v12.0

### Required: One New Package

| Package | Version | Purpose | Why |
|---------|---------|---------|-----|
| `recharts` | `^3.8.0` | CEFR progress charts, skill distribution radar, assessment dashboard | v3.8.0 explicitly supports React 19 (peerDependencies include `^19.0.0`). Radar chart covers the 6-skill-tree distribution view. Line/area charts cover CEFR progression over time. Used in FrameCoach Command Centre on same React 19 version — no compatibility surprises. |

```bash
npm install recharts@^3.8.0
```

**Bundle impact:** recharts ~180KB unminified. Assign to a dedicated chunk — it is only used in assessment dashboard and player profile overlays, so lazy-load it:

```javascript
// vite.config.js manualChunks addition
if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) {
  return 'charts-vendor';
}
```

Load with `React.lazy()` on the components that render charts. Initial load is unaffected.

---

### Conditional: Social Card Export

| Package | Version | Purpose | Install Condition |
|---------|---------|---------|-----------------|
| `html-to-image` | `^1.11.13` | Convert React `<div>` to PNG for "I learned X words" share card | Only install if social card feature is confirmed in scope |

```bash
npm install html-to-image@^1.11.13
```

**Why html-to-image over html2canvas:**
- `html2canvas` is unmaintained (last release 2021, known CORS/RTL text issues)
- `html-to-image` is actively maintained fork of dom-to-image, handles RTL Arabic text correctly through SVG foreignObject rendering
- Zero peer dependencies, ESM-compatible, ~40KB

**Sharing pattern — use Web Share API, not a sharing library:**
```javascript
// No react-share needed — Web Share API is sufficient
const shareCard = async (cardRef) => {
  const blob = await htmlToImage.toBlob(cardRef.current);
  const file = new File([blob], 'arabic-progress.png', { type: 'image/png' });
  if (navigator.share) {
    await navigator.share({ files: [file], title: 'My Arabic Progress' });
  } else {
    // Fallback: download the image
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'arabic-progress.png'; a.click();
  }
};
```

Web Share API coverage: Chrome 61+, Safari 15+, Firefox 121+ — covers all modern browsers the game targets.

**Bundle impact:** 40KB, lazy-load inside ShareCard component. Add to vite.config.js:
```javascript
if (id.includes('node_modules/html-to-image')) {
  return 'share-vendor';
}
```

---

## System-by-System Stack Decisions

### 1. Skill Tree Expansion (6 trees, ~64 nodes currently → 30 nodes per tree)

**Decision: Extend `skillTreeSlice.js` + `skillTrees.js` data file — no new library**

`skillTreeSlice.js` already exists with `unlockNode`, `addSkillXP`, node prerequisite validation. `skillTrees.js` defines all 6 trees. The expansion is a data change (add nodes) and UI change (render more tiers in `SkillTreeView.jsx`).

`SkillTreeView.jsx` and `SkillTreeMenu.jsx` already exist. The tree layout is CSS grid/flexbox — no graph visualization library needed. Nodes are rectangular cards in a vertical flow, not a force-directed graph.

**Integration points:**
- `skillTreeSlice.unlockNode()` — unchanged API
- `skillTrees.js` — extend each tree from current ~10-12 nodes to 30 nodes (data-only change)
- `SkillTreeView.jsx` — add tier grouping visually (already CEFR-labeled per node)
- Skill XP sources: vocabulary reviews (existing), grammar lesson completion (existing `grammarSlice`), quiz performance (existing), achievement unlocks (existing `achievementSlice`)

**No new library.** Existing RTK patterns proven at 31 slices.

---

### 2. Grammar Expansion (7 → 50 lessons, 12 exercise types)

**Decision: Extend `grammar.js` data file + add exercise type handlers — no new library**

`grammarSlice.js` already tracks `completedLessons`, `lessonScores`, `currentLessonId`. The existing slice handles N lessons — it's data-agnostic. `grammar.js` currently has 1,679 lines defining 7 lessons. Expanding to 50 lessons means adding ~6,500 more lines of lesson data.

`GrammarLesson.jsx` and `GrammarModule.jsx` already exist with a `stages/` directory containing individual exercise types. New exercise types (conjugation table, error correction, transformation, cloze passage, grammar puzzle, dialogue grammar) are new React components added to `src/components/Grammar/stages/`.

**Grammar checking for productive exercises:** Custom `GrammarChecker.js` utility using rule-based matching (not ML). Arabic grammar rules are finite and well-defined for A1-B2 — a lookup table of patterns covering verb conjugation tables, noun declension, and agreement rules is sufficient. No NLP library needed.

Pattern for fill-in-blank with correct answer validation:
```javascript
// GrammarChecker.js — pure function, no dependencies
export function checkGrammarAnswer(studentAnswer, correctAnswer, grammarRule) {
  const normalized = normalizeArabic(studentAnswer.trim());
  if (normalized === correctAnswer) return { correct: true, score: 1.0 };
  // Fuzzy: tashkeel-stripped match
  const stripped = stripTashkeel(normalized);
  if (stripped === stripTashkeel(correctAnswer)) return { correct: true, score: 0.85 };
  return { correct: false, score: 0, hint: grammarRule.hint };
}
```

**Integration points:**
- `grammarSlice.completeLesson()` — unchanged
- `grammar.js` — add 43 lesson objects (same schema as existing 7)
- New grammar exercise components in `src/components/Grammar/stages/`
- `achievementSlice` — trigger grammar milestones on lesson completion

---

### 3. Quiz Expansion (6 → 18 types, adaptive engine)

**Decision: Extend `QuizOverlay.jsx` switch + add quiz type components — no new library**

`QuizOverlay.jsx` already dispatches by `quiz.quizType` string. Adding quiz types means: new React component per type + new `quizType` constant. The existing `wordSelection.js` utility already does difficulty-weighted selection.

The **adaptive quiz engine** (`AdaptiveQuizManager`) is pure JavaScript — no library. It selects quiz type based on:
1. FSRS card state (from `vocabularySlice.fsrsCards`) — new cards get recognition quizzes, mature cards get production quizzes
2. Skill tree levels (from `skillTreeSlice.skillXP`) — high listening XP → more `listen` quizzes
3. Recent performance (last 5 results) — rolling window in `quizSlice` or local component state
4. Session context (battle session → fast types only)

```javascript
// AdaptiveQuizManager.js — pure function, no dependencies
export function selectQuizType(word, playerProfile, recentResults) {
  const fsrsState = playerProfile.fsrsCards[word.id];
  const stability = fsrsState?.card?.stability ?? 0;

  if (stability < 1) return 'ar-to-en';          // new: recognition only
  if (stability < 5) return pickReceptive(playerProfile);  // developing
  return pickProductive(playerProfile);            // mature: production quiz
}
```

**Fuzzy Arabic typing** (quiz type 13 — free-form Arabic input): Use existing `js-arabic-reshaper` (already installed) for normalization + `stripTashkeel()` utility (already in codebase). No Levenshtein library needed — simple normalized string comparison with a 1-character tolerance.

**Sentence drag-and-drop** (quiz type 14 — sentence building): The existing `SentenceBuilder.jsx` component already implements drag-and-drop word ordering. Extend it, don't rebuild.

**Integration points:**
- New quiz type components in `src/components/Quiz/`
- `AdaptiveQuizManager.js` utility in `src/utils/`
- `QuizOverlay.jsx` — add new quizType cases to switch
- `vocabularySlice.fsrsCards` — read for FSRS state
- `skillTreeSlice.skillXP` — read for specialization

---

### 4. Adaptive Difficulty Engine

**Decision: `playerProfileSlice.js` (new Redux slice) + `DifficultyManager.js` utility — no new library**

The adaptive difficulty engine builds a player model from existing Redux state. It reads — never writes to — `vocabularySlice`, `grammarSlice`, `skillTreeSlice`, `achievementSlice`. The difficulty model is a derived view, not new state.

**New slice:** `playerProfileSlice` tracks:
```javascript
{
  cefrEstimate: 'A1',          // derived from vocab + grammar mastery
  difficultyPreset: 'normal',  // 'story' | 'normal' | 'scholar' | 'master'
  weakAreas: [],               // quiz types with <60% accuracy (rolling 20)
  strongAreas: [],             // quiz types with >85% accuracy
  sessionStats: {              // cleared each session
    quizzesAnswered: 0,
    correctAnswers: 0,
    quizTypeAccuracy: {}
  }
}
```

`DifficultyManager.js` is a pure function utility — no library. It uses existing `wordSelection.js` weighted selection patterns.

**CEFR estimation** from vocabulary: count words with `cefrLevel` tag per FSRS stability threshold. The vocabulary data (5,029 words) already has `cefrLevel` tags (verified in `vocabularySlice.js` CEFR_ORDER usage). This is a selector — not a new data structure.

---

### 5. CEFR Placement Test

**Decision: Dedicated `PlacementTestOverlay.jsx` component + `placementTestData.js` — no new library**

A placement test is a specialized quiz session: ~20-30 calibrated questions spanning A1-B2, using Item Response Theory (IRT) binary search to estimate level. No external IRT library — the math is 30 lines:

```javascript
// placementEngine.js — pure JS, no dependencies
// Binary search: start at A2, go harder on correct, easier on wrong
export function updateCefrEstimate(currentEstimate, isCorrect, questionLevel) {
  const LEVELS = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1'];
  const idx = LEVELS.indexOf(currentEstimate);
  if (isCorrect && questionLevel >= currentEstimate) return LEVELS[Math.min(idx + 1, 5)];
  if (!isCorrect && questionLevel <= currentEstimate) return LEVELS[Math.max(idx - 1, 0)];
  return currentEstimate;
}
```

Placement test results write into `playerProfileSlice.cefrEstimate` and skip vocabulary that's already been introduced (read from `vocabularySlice.fsrsCards`).

**Integration:** `PlacementTestOverlay` is shown once at first launch (new player) or triggered from settings. Skips if player already has >50 FSRS cards (returning player). Uses existing `QuizOverlay` quiz type components — not a new quiz renderer.

---

### 6. Achievement Expansion (44 → 250+)

**Decision: Extend `achievements.js` data file + `achievementSlice.js` event coverage — no new library**

`achievementSlice.js` already exists with `unlockAchievement`, toast queue, and stats tracking. `achievements.js` (2,633 lines) already defines 20 categories including `GRAMMAR`, `COMBAT`, `CRAFTING`, `SOCIAL`, `CULTURE`, `MILESTONE`. Expansion is a data addition — write 200+ new achievement objects in the same schema.

**New trigger coverage needed in middleware/slices:**
- Skill tree node unlocks → achievement check
- Grammar lesson completion → achievement check
- Placement test CEFR result → achievement check
- Quiz type accuracy milestones → achievement check

These are `createAction` dispatches in existing middleware patterns — same pattern as `battleRewardsMiddleware` from v6.0.

**Bundle impact:** `achievements.js` is already in the `skill-data` chunk (confirmed in `vite.config.js` line 84-89). Adding 200 entries doubles it from 2,633 to ~5,000 lines — still lazy-loaded, no initial bundle impact.

---

### 7. CEFR Progress Reports + Assessment Dashboard

**Decision: `recharts` for radar chart + line chart — the one new dependency**

The assessment dashboard needs:
1. **Skill distribution radar chart** — 6 axes (reading, writing, listening, speaking, grammar, culture) showing current XP per tree. `<RadarChart>` from recharts.
2. **CEFR progression line chart** — vocabulary mastered over time by CEFR level. `<LineChart>` from recharts.
3. **Quiz accuracy heatmap** — per quiz type accuracy. Pure CSS grid (not recharts).

Recharts is the right choice because:
- Already used in this project's ecosystem (FrameCoach Command Centre uses it on React 19)
- v3.8.0 explicitly declares `peerDependencies: { react: "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0" }` — confirmed React 19 compatible
- `<RadarChart>` is purpose-built for skill distribution visualization
- Zero config needed — declarative JSX, works identically to how the codebase uses Framer Motion

```javascript
// Example skill radar — fits existing CSS Modules pattern
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';

const skillData = ['Reading', 'Writing', 'Listening', 'Speaking', 'Grammar', 'Culture']
  .map(name => ({ name, value: skillXP[name.toLowerCase()] }));

<ResponsiveContainer width="100%" height={300}>
  <RadarChart data={skillData}>
    <PolarGrid />
    <PolarAngleAxis dataKey="name" />
    <Radar dataKey="value" stroke="#e2b659" fill="#e2b659" fillOpacity={0.4} />
  </RadarChart>
</ResponsiveContainer>
```

---

## Full Package Change Summary

### Install (New — 1 required, 1 conditional)

```bash
# Required
npm install recharts@^3.8.0

# Conditional (only if social share card is in scope)
npm install html-to-image@^1.11.13
```

### No Changes Needed

Every other v12.0 system uses existing installed packages:
- `@reduxjs/toolkit@^2.11.2` — new slices (playerProfileSlice) follow established pattern
- `ts-fsrs@^5.2.3` — FSRS cards already drive quiz selection, no API changes
- `framer-motion@^11.15.0` — overlay animations for placement test, achievement toasts
- `react@^19.2.4` — React.lazy() for assessment dashboard and placement overlay
- `zod@^4.3.6` — validate placement test data schema at build time
- `inkjs@^2.4.0` — grammar NPC dialogue for lesson delivery (already integrated v11.0)

---

## vite.config.js Additions

Two additions to `manualChunks` (add after line 94 in current config):

```javascript
// Charts library (recharts + d3 internals) — lazy-loaded assessment dashboard
if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) {
  return 'charts-vendor';
}

// Share card utility — only loaded when player opens share modal
if (id.includes('node_modules/html-to-image')) {
  return 'share-vendor';
}
```

Also add a new grammar data chunk for the expanded 50-lesson file:
```javascript
// Existing grammar-data chunk already in config — no change needed.
// grammar.js expanding from 1,679 to ~8,000 lines stays in 'grammar-data' chunk.
```

---

## What NOT to Add

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **react-flow / xyflow** | 200KB+ graph visualization for skill trees — overkill when nodes are a linear tier list, not a free-form graph | CSS grid layout in `SkillTreeView.jsx` (already renders trees correctly) |
| **react-beautiful-dnd / dnd-kit** | Drag-and-drop library for sentence builder | `SentenceBuilder.jsx` already implements drag-and-drop; extend it |
| **compromise / natural** (NLP) | Grammar checking library — Arabic NLP is unreliable for learner input at A1-B2 | Custom `GrammarChecker.js` with lookup tables for finite grammar rules |
| **@tensorflow/tfjs** | ML-based adaptive difficulty | Pure JS difficulty weighting from FSRS stability scores is sufficient and explainable |
| **chart.js / victory** | Alternative chart libraries | recharts is React-native, React 19 confirmed, already in project ecosystem |
| **html2canvas** | Screenshot library for share cards | Unmaintained since 2021; use `html-to-image` or the Web Share API directly |
| **i18next** | Internationalization for CEFR reports | UI is English + Arabic inline — no i18n layer needed; existing Arabic string patterns in data files are sufficient |
| **react-confetti / canvas-confetti** | Celebration effects for achievements | Existing `ParticleSystem.js` (Phaser) and `levelUpCelebration` pattern already handle this |
| **XState** | State machine for placement test flow | Placement test is 20-30 linear questions — a `currentQuestionIndex` counter in component state is sufficient |
| **Recharts v2.x** | Older recharts with React 19 compatibility issues | Use v3.8.0 only — it explicitly adds React 19 to peerDependencies |

---

## Version Compatibility

| Package | Version | React 19 | Notes |
|---------|---------|----------|-------|
| `recharts` | 3.8.0 | Confirmed | peerDependencies explicitly include `^19.0.0` |
| `html-to-image` | 1.11.13 | No known issues | Uses SVG foreignObject — RTL Arabic text renders correctly |
| `ts-fsrs` | 5.3.1 available (5.2.3 installed) | N/A (pure TS) | Consider upgrading; patch versions only |

---

## Integration Points by Phase

### Skill Tree Phase
- **Reads:** `skillTreeSlice.skillXP`, `skillTreeSlice.unlockedNodes`
- **Writes:** `skillTreeSlice.unlockNode()`, `skillTreeSlice.addSkillXP()`
- **Triggers:** `achievementSlice.unlockAchievement()` on node unlock
- **New files:** Extended `skillTrees.js` data, updated `SkillTreeView.jsx`

### Grammar Expansion Phase
- **Reads:** `grammarSlice.completedLessons`, `vocabularySlice.fsrsCards`
- **Writes:** `grammarSlice.completeLesson()`, `skillTreeSlice.addSkillXP({ treeId: 'grammar' })`
- **New files:** `GrammarChecker.js` utility, new exercise components in `Grammar/stages/`

### Quiz Expansion Phase
- **Reads:** `vocabularySlice.fsrsCards`, `skillTreeSlice.skillXP`
- **Writes:** `vocabularySlice.updateFsrsCard()`, `achievementSlice.recordPerfectQuiz()`
- **New files:** `AdaptiveQuizManager.js` utility, new quiz type components, `playerProfileSlice.js`

### Adaptive Difficulty Phase
- **Reads:** all slices (selector-only, no writes from this system to others)
- **Writes:** `playerProfileSlice` only
- **New files:** `playerProfileSlice.js`, `DifficultyManager.js` utility

### Placement Test Phase
- **Reads:** `vocabularySlice.fsrsCards` (skip known words)
- **Writes:** `playerProfileSlice.cefrEstimate`, triggers onboarding skip logic
- **New files:** `PlacementTestOverlay.jsx`, `placementEngine.js`, `placementTestData.js`

### Achievement Expansion Phase
- **Reads:** all slices (via middleware `selectAll`)
- **Writes:** `achievementSlice.unlockAchievement()`
- **New files:** Extended `achievements.js`, achievement trigger handlers in existing middleware

### Assessment Dashboard + CEFR Reports Phase
- **Uses:** `recharts` (new dependency)
- **Reads:** `playerProfileSlice`, `vocabularySlice`, `grammarSlice`, `skillTreeSlice`
- **New files:** `AssessmentDashboard.jsx`, `CEFRProgressReport.jsx`, `SkillRadarChart.jsx`

### Social Share Card Phase
- **Uses:** `html-to-image` (conditional new dependency)
- **Reads:** `vocabularySlice.selectLearnedWordCount`, `playerProfileSlice.cefrEstimate`
- **New files:** `ShareCard.jsx`, `ShareCardModal.jsx`

---

## Sources

- `package.json` — All installed versions inspected 2026-03-22 (HIGH confidence)
- `node_modules/` — recharts NOT yet installed; html-to-image NOT installed (HIGH confidence)
- `src/store/slices/` — 31 slice files inspected; achievementSlice, skillTreeSlice, grammarSlice, vocabularySlice architecture verified (HIGH confidence)
- `src/components/Quiz/QuizOverlay.jsx` — 11 quiz types confirmed, adaptive selection hook at line 441 (HIGH confidence)
- `src/data/grammar.js` — 1,679 lines, 7 lessons confirmed (HIGH confidence)
- `src/data/achievements.js` — 2,633 lines, 20 categories confirmed (HIGH confidence)
- `src/data/skillTrees.js` — 6 trees, ~10-12 nodes each, existing CEFR labels confirmed (HIGH confidence)
- `vite.config.js` — manualChunks strategy inspected; `skill-data`, `grammar-data` chunks already route the right files (HIGH confidence)
- `npm info recharts` — v3.8.0 latest, peerDependencies `react: "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0"` confirmed via npm registry (HIGH confidence)
- `npm info html-to-image` — v1.11.13 latest confirmed via npm registry (MEDIUM confidence — React 19 compatibility verified through community reports, not official docs)
- WebSearch: recharts React 19 issue #4558 resolved in v3.x releases (MEDIUM confidence)
- WebSearch: html-to-image vs html2canvas comparison, RTL text handling (MEDIUM confidence)

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Installed stack | HIGH | package.json + node_modules verified |
| recharts v3.8.0 React 19 compat | HIGH | peerDependencies verified via npm registry |
| No new dep for skill trees | HIGH | skillTreeSlice + SkillTreeView already exist |
| No new dep for grammar expansion | HIGH | grammarSlice + GrammarLesson already exist |
| No new dep for quiz expansion | HIGH | QuizOverlay switch pattern already scales |
| No new dep for adaptive difficulty | HIGH | wordSelection.js + FSRS data already sufficient |
| No new dep for placement test | HIGH | 30-line IRT binary search, no library needed |
| No new dep for achievement expansion | HIGH | achievementSlice + 20 categories already exist |
| html-to-image RTL handling | MEDIUM | Community-verified, not official docs |
| ts-fsrs 5.2.3 → 5.3.1 upgrade | LOW | Minor version bump, change log not reviewed |

---

*Stack research for: v12.0 Learning Systems (skill trees, grammar expansion, quiz expansion, adaptive difficulty, CEFR placement, 250+ achievements, social share cards)*
*Researched: 2026-03-22*
*Confidence: HIGH — all new features confirmed buildable on existing architecture; one confirmed new dependency (recharts); one conditional new dependency (html-to-image)*
