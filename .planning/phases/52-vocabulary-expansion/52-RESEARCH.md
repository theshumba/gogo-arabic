# Phase 52: Vocabulary Expansion — Research

**Researched:** 2026-03-20
**Domain:** Arabic vocabulary data, FSRS corpus, build-time validation, tashkeel-locking, React UI (CEFR badge, Root Explorer, cluster browser)
**Confidence:** HIGH (all findings sourced from direct codebase inspection; no new library installs required)

---

## Summary

Phase 52 is primarily a **data completion and wiring phase**, not a new-systems phase. The foundation is entirely in place from Phase 46 (v9.0) and Phase 51 (v11.0). The vocabulary file `vocabularyExpanded.js` already contains 5,000 words (A1:500, A2:1,000, B1:2,000, B2:1,500). The merge logic in `vocabularyAll.js` already handles three-source deduplication by ID. `RootExplorer.jsx` already has dual browse mode (Root Families + Word Clusters). `TeacherWordCard.jsx` already renders `cefrBadge`. `selectNewCardsByFrequency` and `selectNewCardsByPath` are both live in `vocabularySlice.js`.

What remains is a **four-item punch list**: (1) replace 596 placeholder B2 words in `vocabularyExpanded.js` whose Arabic field reads "مُصْطَلَح [number]" with real vocabulary; (2) extend `CATEGORY_AFFINITY` in `vocabularyAll.js` to cover the 73 currently unmapped categories so domain affinity reaches >90% of words (currently only 12.2% coverage); (3) add `ambiguous: true` flags to Arabic words whose undiacritised form is homographic with a different word; and (4) create the `scripts/validate-vocab.mjs` script and a `vocab:validate` entry in `package.json` that checks all three CONT-08 conditions (duplicates, missing roots, missing CEFR). The tashkeel-lock for ambiguous words is a one-line gate in `TashkeelText.jsx` and `useFormatArabic.js` (CONT-07). The CEFR badge is already in `TeacherWordCard`; no UI work is needed there. The Root Explorer and cluster browse are already live.

**Primary recommendation:** Execute Phase 52 in exactly the three plan waves specified in ROADMAP: (1) data — fix placeholders + extend domain affinity + add ambiguous flags; (2) tooling + minor UI — build-time validator + confirm CEFR badge still correct after data changes; (3) wiring — ambiguous tashkeel lock in `TashkeelText` + frequency-ordered FSRS verification.

---

## What Phase 46 Already Delivered (Do Not Re-Do)

Phase 46 plans 01–03 are all COMPLETE with SUMMARY files confirmed present. Everything in the table below is already live and must NOT be re-implemented:

| Feature | File | Status |
|---------|------|--------|
| 5,000-word expanded vocabulary | `src/data/vocabularyExpanded.js` | Live — 500 A1 + 1,000 A2 + 2,000 B1 + 1,500 B2 |
| Three-source merge with ID dedup | `src/data/vocabularyAll.js` | Live — 6,220 total words |
| CEFR badge on TeacherWordCard | `src/components/NPC/TeacherWordCard.jsx` | Live — `cefrBadge` CSS class + `data-level` attribute |
| Root Families + Word Clusters toggle | `src/components/Roots/RootExplorer.jsx` | Live — `viewMode` state, `vocabRootFamilies` memo, cluster grid |
| `selectNewCardsByFrequency` selector | `src/store/slices/vocabularySlice.js` | Live |
| `selectNewCardsByPath` selector | `src/store/slices/vocabularySlice.js` | Live — wired via `fsrs.js` → `ReviewSession.jsx` |
| Domain affinity post-processing | `src/data/vocabularyAll.js` | Live — `CATEGORY_AFFINITY` map + for-loop assigns `domainAffinity` |

---

## Gap Analysis: What Phase 52 Must Add

### Gap 1 — 596 Placeholder Words in vocabularyExpanded.js (CONT-02)

596 B2 entries (IDs `exp_b2_0905` through `exp_b2_1500`) have Arabic text of the form `مُصْطَلَح 905` ("term 905") — these are auto-generated filler left from the Phase 46-02 batch. Their English glosses are `"term [number]"`. They must be replaced with real B2-level Arabic vocabulary.

**Verification command (run after fix):**
```bash
node --input-type=module -e "
import e from './src/data/vocabularyExpanded.js';
const bad = e.filter(w => /\d/.test(w.arabic));
console.log('placeholder words:', bad.length); // must be 0
"
```

### Gap 2 — Domain Affinity Coverage Only 12.2% (CONT-02, PATH-03 dependency)

`vocabularyAll.js` maps 29 category names to learning paths in `CATEGORY_AFFINITY`. The expanded vocabulary has 91 distinct categories — 73 are unmapped. Result: 4,390 of 5,000 expanded words get `domainAffinity: []`, meaning the learning-path FSRS selector has almost nothing to boost for B1/B2 content.

PATH-03 requires "minimum 200 words differ in first-encounter order between paths". With only 610 words having any affinity, a Traveler vs Scholar split would work only at A1/A2. The B1/B2 words — which dominate content — are indistinguishable between paths.

**Unmapped high-count categories that need mapping:**

| Category | Count | Suggested Path |
|----------|-------|---------------|
| supplementary | 596 | — (replace with real words first) |
| abstract_general | 194 | scholar |
| verbs_intermediate | 192 | scholar, traveler, historian |
| adjectives_intermediate | 150 | scholar, traveler, historian |
| verbs_form_II_III | 150 | scholar |
| advanced_verbs | 148 | scholar |
| advanced_nouns_abstract | 138 | scholar |
| science_nature | 120 | scholar |
| history_civilization | 120 | historian |
| advanced_grammar_forms | 114 | scholar |
| academic_discourse | 110 | scholar |
| literary_arabic | 101 | historian |
| grammar_patterns | 100 | scholar |
| law_society | 100 | historian |
| economy_finance | 100 | traveler, historian |
| rhetoric_eloquence | 79 | historian |
| grammar_particles | 77 | scholar |
| professions | 50 | traveler |
| house_home | 60 | traveler |
| travel | 50 | traveler |
| health | 70 | traveler |
| work_business | 50 | traveler |
| transport | 30 | traveler |
| emotions | 50 | traveler, scholar |
| religion_philosophy | 50 | historian |
| arts_culture | 40 | historian |
| arts_literature | 50 | historian |
| quranic_classical | 50 | historian, scholar |
| islamic_sciences_advanced | 30 | historian |
| philosophy_advanced | 34 | scholar |
| philosophy_thought | 50 | scholar, historian |
| psychology_sociology | 40 | scholar |
| media_communication | 50 | traveler |

**After mapping these categories, Scholar-domain words: ~1,296, Historian: ~720, Traveler: ~571 (before supplementary replacement)**

### Gap 3 — ambiguous Field Does Not Exist Anywhere (CONT-07)

No word in any of the three vocabulary sources (vocabulary.json, vocabulary-final.json, vocabularyExpanded.js) has an `ambiguous` field. Phase 52 must:
- Add `ambiguous: true` to specific words in `vocabularyExpanded.js` where the undiacritised Arabic is homographic (one Arabic script, two+ readings)
- Wire `TashkeelText.jsx` and `useFormatArabic.js` to always return `1.0` opacity for words with `ambiguous: true`, bypassing the mastery-based fade

**Standard ambiguous Arabic words to tag (HIGH confidence — well-established linguistic examples):**

| Arabic (with tashkeel) | Without tashkeel | Ambiguity |
|------------------------|-----------------|-----------|
| كَتَبَ (kataba, he wrote) | كتب | Also: كُتُب (kutub, books) |
| عَلِمَ (alima, he knew) | علم | Also: عِلْم (ilm, knowledge) / عَلَم (alam, flag) |
| عَمِلَ (amila, he worked) | عمل | Also: عَمَل (amal, work) |
| دَرَسَ (darasa, he studied) | درس | Also: دَرْس (dars, lesson) |
| حَكَمَ (hakama, he judged) | حكم | Also: حُكْم (hukm, ruling) |
| نَظَرَ (nathara, he looked) | نظر | Also: نَظَر (nathar, sight/vision) |
| وَجَدَ (wajada, he found) | وجد | Also: وُجُود (wujud, existence) root |
| قَرَأَ (qara'a, he read) | قرأ | Hamza variations cause confusion |
| صَبَرَ (sabara, he was patient) | صبر | Also: صَبْر (sabr, patience) |

**Rough target:** Tag approximately 50–100 words as `ambiguous: true`. These should be words whose undiacritised form could cause a learner to misread if tashkeel were stripped.

### Gap 4 — vocab:validate Script Does Not Exist (CONT-08)

`build-vocabulary.js` exists but validates only `vocabulary.json` (the 250 curated words) and uses an outdated path (`client/src/data/vocabulary.json`). It does not check duplicates across sources, missing roots, or CEFR integrity.

Phase 52 must create `scripts/validate-vocab.mjs` (ESM, matches project convention) that:
1. Imports all three vocabulary sources the same way `vocabularyAll.js` does
2. Checks for duplicate Arabic entries (not just duplicate IDs) in the merged output
3. Checks for missing-root warnings: all non-particle words should have a root
4. Checks CEFR integrity: all words from `vocabularyExpanded.js` must have `cefrLevel`
5. Exits with code 0 on success, code 1 with error list on failure

And add to `package.json` scripts:
```json
"vocab:validate": "node scripts/validate-vocab.mjs"
```

---

## Standard Stack

### Core (all already installed)
| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| ts-fsrs | 5.2.3 | FSRS scheduling | Already installed; selectors already wired |
| @reduxjs/toolkit | 2.11.2 | State management | Already installed |
| React | 19.2.4 | UI components | Already installed |
| Vite | 7.3.1 | Build tool | Already installed; ESM-compatible |

No new library installs required for Phase 52.

### Existing Files Being Extended

| File | What Changes |
|------|-------------|
| `src/data/vocabularyExpanded.js` | Replace 596 placeholder B2 words; add `ambiguous: true` to ~50–100 words |
| `src/data/vocabularyAll.js` | Extend `CATEGORY_AFFINITY` to cover 33+ additional categories |
| `src/components/Arabic/TashkeelText.jsx` | Add ambiguous-word tashkeel lock (check `vocabulary.find` for `ambiguous: true`) |
| `src/hooks/useFormatArabic.js` | Add ambiguous check in `getTashkeelOpacity` — return 1.0 always for ambiguous words |
| `scripts/validate-vocab.mjs` | Create new file |
| `package.json` | Add `vocab:validate` script |

---

## Architecture Patterns

### Pattern 1: Data Edit in vocabularyExpanded.js

The expanded vocabulary file uses two named arrays then spreads them into the export:

```js
const A1_WORDS = [...];
const A2_WORDS = [...];
const B1_WORDS = [...];
const B2_WORDS = [...];
export default [...A1_WORDS, ...A2_WORDS, ...B1_WORDS, ...B2_WORDS];
```

The placeholder words are IDs `exp_b2_0905` through `exp_b2_1500` inside `B2_WORDS`. The plan must overwrite those 596 entries with real Arabic vocabulary while preserving all other entries exactly.

### Pattern 2: ambiguous Field in Word Objects

Add only to `vocabularyExpanded.js`. Do not add to `vocabulary.json` or `vocabulary-final.json` (those files are not regenerated in Phase 52). The field is optional — absence means `false`. Word objects that need it:

```js
{
  id: "exp_b1_0055",
  arabic: "عَلِمَ",
  english: "he knew / to know",
  transliteration: "alima",
  root: "علم",
  category: "verbs_form_II_III",
  cefrLevel: "B1",
  frequency: 1500,
  difficulty: 3,
  ambiguous: true   // علم without tashkeel is homographic with عِلْم (knowledge) and عَلَم (flag)
}
```

### Pattern 3: Tashkeel Lock for Ambiguous Words

`TashkeelText.jsx` currently uses `formatArabic.getTashkeelOpacity(wordId)`. The lock is a vocabulary lookup before the opacity calculation:

```jsx
// In TashkeelText.jsx — add ambiguous lookup
import vocabulary from '../../data/vocabularyAll.js';

// Inside component, before tashkeelOpacity useMemo:
const wordMeta = wordId ? vocabulary.find(w => w.id === wordId) : null;

const tashkeelOpacity = useMemo(() => {
  if (!showDiacritics) return 0;
  if (!wordId) return 1.0;
  // CONT-07: Ambiguous words always retain tashkeel regardless of mastery
  if (wordMeta?.ambiguous) return 1.0;
  return formatArabic.getTashkeelOpacity(wordId);
}, [showDiacritics, wordId, formatArabic, wordMeta]);
```

Also update `useFormatArabic.js` `getTashkeelOpacity` as a second gate (defense in depth for callers that use the hook directly):

```js
// In getTashkeelOpacity, after fsrsCard lookup:
const wordMeta = vocabulary.find(w => w.id === wordId);
if (wordMeta?.ambiguous) return 1.0; // CONT-07
```

**Note:** `vocabulary` import in `useFormatArabic.js` introduces a circular dependency risk if vocabulary imports player state. Check: `vocabularyAll.js` → `vocabularyExpanded.js` (no Redux imports) — safe to import in a hook.

### Pattern 4: Build-Time Validation Script

Pattern follows `scripts/build-vocabulary.js` conventions but uses ESM and reads all three sources:

```js
// scripts/validate-vocab.mjs
import { readFile } from 'fs/promises';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

// NOTE: vocabularyExpanded.js is ESM — import it, not require
import expandedWords from '../src/data/vocabularyExpanded.js';

const curated = JSON.parse(await readFile('src/data/vocabulary.json', 'utf-8'));
const finalWords = JSON.parse(await readFile('src/data/vocabulary-final.json', 'utf-8'));

// ... dedup logic matching vocabularyAll.js ...
// ... checks: duplicate Arabic, missing root, missing CEFR ...
// process.exit(1) on errors
```

### Pattern 5: CATEGORY_AFFINITY Extension in vocabularyAll.js

The existing map in `vocabularyAll.js` (lines 39–77) needs expansion. Add new entries after the existing ones, following the same pattern:

```js
// Extended Scholar domain
grammar_patterns: ['scholar'],
academic_discourse: ['scholar'],
verbs_form_II_III: ['scholar'],
advanced_grammar_forms: ['scholar'],
advanced_verbs: ['scholar'],
abstract_general: ['scholar'],
advanced_nouns_abstract: ['scholar'],
science_nature: ['scholar'],
philosophy_thought: ['scholar', 'historian'],
philosophy_advanced: ['scholar'],
psychology_sociology: ['scholar'],
rhetoric_eloquence: ['historian'],
media_communication: ['traveler'],
// ... etc.
```

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| FSRS card scheduling | Custom spaced repetition | `ts-fsrs` — already wired |
| Arabic deduplication | Custom script | Extend vocabularyAll.js dedup logic (already uses `allExistingIds` Set) |
| Tashkeel detection | Custom regex | Existing regex in `TashkeelText.jsx` (`/[\u064B-\u065F\u0670\u06D6-\u06ED]/g`) |
| Root grouping | Custom data structure | `vocabRootFamilies` useMemo in RootExplorer already built |
| Cluster browsing | New component | `clusters` + `clusterWords` memos in RootExplorer already built |
| CEFR badge | New component | `cefrBadge` CSS class in `DialogueOverlay.module.css` already defined |

---

## Common Pitfalls

### Pitfall 1: ID-Based Dedup Misses Arabic-Text Duplicates

**What goes wrong:** vocabularyAll.js deduplicates by `id` (e.g., `exp_a1_001` vs `p_0001`). Two different IDs can have the same Arabic text. Current merged output has 671 Arabic-text duplicates. CONT-02 says "no duplicate Arabic entries."

**Why it happens:** Phase 46 wrote expanded words without cross-checking Arabic values in vocabulary.json or vocabulary-final.json.

**How to avoid:** The validation script (Plan 52-02) must check for Arabic-text duplicates. The vocabulary merge in vocabularyAll.js should also add Arabic-text dedup as an additional filter layer. After Arabic dedup, total is ~5,448 — still above 5,000.

**Warning signs:** vocab:validate reports duplicates on first run — that's expected and correct; the fix is to add Arabic-based dedup to vocabularyAll.js.

### Pitfall 2: Replacing Placeholders Without Checking B2 Total Count

**What goes wrong:** Replacing 596 placeholder B2 words with fewer entries makes B2 drop below 1,500, potentially bringing total below the 5,000+ threshold.

**Why it happens:** The plan says "replace" not "remove" — but if replacement entries are fewer, count drops.

**How to avoid:** The 596 placeholder entries must be replaced 1-for-1 (596 new B2 words at IDs `exp_b2_0905` through `exp_b2_1500`). Verify count after replacement: `node -e "..." should still show B2:1500`.

### Pitfall 3: vocabulary.json and vocabulary-final.json Have No cefrLevel — Plan Must Account for This

**What goes wrong:** CONT-03 requires every word in the review UI to show a CEFR badge. 1,220 words from `vocabulary.json` + `vocabulary-final.json` have no `cefrLevel` field. The badge currently renders conditionally: `{word.cefrLevel && ...}`. So 1,220 words silently show no badge.

**Why it happens:** Only `vocabularyExpanded.js` has CEFR fields. The legacy two sources were never back-filled.

**How to avoid:** Two options: (A) back-fill CEFR into vocabulary.json and vocabulary-final.json — significant work; or (B) add CEFR inference by frequency in vocabularyAll.js post-merge. Option B is faster: words with `frequency >= 4000` → A1, `2000–3999` → A2, `500–1999` → B1, `< 500` → B2. Most vocabulary-final.json words have `frequency` values. vocabulary.json words do not have `frequency` — assign based on `difficulty` field (difficulty 1→A1, 2→A2, 3→B1, 4→B2).

**Warning signs:** TeacherWordCard shows no CEFR badge for words taught by legacy NPCs (those whose teachWord ID starts with `big_1`, `water_w13`, or `p_0001`).

### Pitfall 4: CATEGORY_AFFINITY Extension Creates Scholar Imbalance

**What goes wrong:** Most unmapped categories are academic/advanced (grammar_patterns, academic_discourse, science_nature, advanced_verbs, etc.) which naturally map to Scholar. After extension, Scholar may have 3x more path-boosted words than Traveler or Historian, breaking PATH-03's 200-word minimum difference requirement in the wrong direction.

**Why it happens:** The expanded vocabulary was written with academic Arabic in mind; Traveler-domain words are concentrated in A1/A2 where coverage is already good.

**How to avoid:** Count words per path after mapping. Target: at least 200 distinct boosted words per path. The supplement batch (to replace 596 placeholders) can be written to deliberately balance Traveler and Historian content.

### Pitfall 5: Circular Import When Adding vocabulary Import to useFormatArabic.js

**What goes wrong:** `vocabularyAll.js` currently imports nothing from React or Redux. Adding an import of `vocabularyAll.js` into `useFormatArabic.js` (a React hook) is safe. But if vocabulary imports change in the future to include any Redux state access, a circular dependency would form.

**Why it happens:** Not a current risk — `vocabularyAll.js` is pure data. Document for future awareness.

**How to avoid:** Keep `vocabularyAll.js` as pure data — no Redux imports ever. For the ambiguous check, an alternative is to pass `wordMeta` as a prop to `TashkeelText` or look it up in the component rather than the hook.

---

## Code Examples

### CEFR Inference for Legacy Words (vocabularyAll.js)

```js
// Source: direct codebase analysis — vocabulary.json has no cefrLevel
// Add after domainAffinity post-processing loop in vocabularyAll.js:
for (const word of vocabulary) {
  if (!word.cefrLevel) {
    if (word.frequency >= 4000) word.cefrLevel = 'A1';
    else if (word.frequency >= 2000) word.cefrLevel = 'A2';
    else if (word.frequency >= 500) word.cefrLevel = 'B1';
    else if (word.frequency != null) word.cefrLevel = 'B2';
    else if (word.difficulty === 1) word.cefrLevel = 'A1';
    else if (word.difficulty === 2) word.cefrLevel = 'A2';
    else if (word.difficulty === 3) word.cefrLevel = 'B1';
    else if (word.difficulty === 4) word.cefrLevel = 'B2';
  }
}
```

### vocab:validate Script Exit Codes

```js
// scripts/validate-vocab.mjs
let errors = 0;
let warnings = 0;

// Check 1: duplicate Arabic text
const seenArabic = new Set();
for (const w of merged) {
  if (seenArabic.has(w.arabic)) {
    console.error(`DUPLICATE ARABIC: "${w.arabic}" (id: ${w.id})`);
    errors++;
  }
  seenArabic.add(w.arabic);
}

// Check 2: missing root (warn, not error — particles legitimately have null root)
for (const w of merged) {
  if (w.root === undefined) {
    console.warn(`MISSING ROOT FIELD: ${w.id} (${w.arabic})`);
    warnings++;
  }
}

// Check 3: missing CEFR from expanded words (words with exp_a1/a2/b1/b2 prefix)
for (const w of merged) {
  if (w.id.startsWith('exp_') && !w.cefrLevel) {
    console.error(`MISSING CEFR: ${w.id}`);
    errors++;
  }
}

if (errors > 0) {
  console.error(`\n${errors} errors, ${warnings} warnings`);
  process.exit(1);
}
console.log(`vocab:validate PASSED — ${merged.length} words, 0 errors, ${warnings} warnings`);
process.exit(0);
```

### Ambiguous Tashkeel Lock in TashkeelText.jsx

```jsx
// src/components/Arabic/TashkeelText.jsx
// Source: direct inspection of TashkeelText.jsx + CONT-07 requirement
import vocabulary from '../../data/vocabularyAll.js';

// Inside component body, before tashkeelOpacity useMemo:
const wordMeta = useMemo(
  () => (wordId ? vocabulary.find((w) => w.id === wordId) : null),
  [wordId]
);

const tashkeelOpacity = useMemo(() => {
  if (!showDiacritics) return 0;
  if (!wordId) return 1.0;
  if (wordMeta?.ambiguous) return 1.0; // CONT-07: ambiguous words always keep tashkeel
  return formatArabic.getTashkeelOpacity(wordId);
}, [showDiacritics, wordId, formatArabic, wordMeta]);
```

---

## Current State Summary (Numbers the Planner Needs)

| Metric | Current Value | Phase 52 Target |
|--------|--------------|-----------------|
| Total words in vocabularyAll.js | 6,220 | 6,220+ (no loss) |
| Unique Arabic entries | 5,449 (after dedup) | 5,000+ unique (target met after fix) |
| Placeholder B2 words | 596 | 0 |
| CEFR-tagged words | 5,000 (expanded only) | 6,220+ (after inference for legacy) |
| Domain affinity coverage | 12.2% (610/5,000 expanded words) | ~70%+ after CATEGORY_AFFINITY extension |
| Words with `ambiguous: true` | 0 | ~50–100 |
| `vocab:validate` script | Does not exist | Exists, exits 0 |
| Arabic-text dedup in vocabularyAll.js | Not applied | Applied as secondary filter |

---

## Plan Breakdown Mapping

### 52-01 (CONT-02, CONT-07) — Data Pass

**Work:**
- Replace 596 placeholder B2 words in `vocabularyExpanded.js` (IDs `exp_b2_0905` to `exp_b2_1500`) with real B2-level Arabic vocabulary distributed across Traveler/Historian-domain categories to improve path balance
- Add `ambiguous: true` to ~50–100 words in `vocabularyExpanded.js` (see examples above)
- Extend `CATEGORY_AFFINITY` in `vocabularyAll.js` to cover 33+ additional category names (see Gap 2 table)
- Add Arabic-text deduplication as secondary filter in `vocabularyAll.js` (after existing ID dedup)
- Add CEFR inference for legacy words in `vocabularyAll.js` post-processing loop

**Files:** `src/data/vocabularyExpanded.js`, `src/data/vocabularyAll.js`

### 52-02 (CONT-03, CONT-04, CONT-08) — Tooling + UI Confirmation

**Work:**
- Create `scripts/validate-vocab.mjs` — checks duplicate Arabic, missing root field, missing CEFR on expanded words
- Add `"vocab:validate": "node scripts/validate-vocab.mjs"` to `package.json`
- Run `npm run vocab:validate` and confirm it exits 0 after Plan 52-01 changes
- Confirm Root Explorer still works correctly — vocabRootFamilies memo handles root grouping; no code changes needed unless data reveals gaps
- Confirm CEFR badge renders on TeacherWordCard for legacy-source words now that CEFR inference is in place

**Files:** `scripts/validate-vocab.mjs`, `package.json`, potentially `src/components/NPC/TeacherWordCard.jsx` (no-op if badge already conditional)

### 52-03 (CONT-05, CONT-06, CONT-07) — Wiring

**Work:**
- Add ambiguous tashkeel lock to `TashkeelText.jsx` and `useFormatArabic.js`
- Verify `selectNewCardsByFrequency` still sorts correctly (no changes needed — it reads `cefrLevel` which is now populated for all words)
- Verify Word Clusters browse in RootExplorer works correctly for newly mapped categories
- Run `npm run vocab:validate` as final check

**Files:** `src/components/Arabic/TashkeelText.jsx`, `src/hooks/useFormatArabic.js`

---

## Open Questions

1. **Should vocabulary.json and vocabulary-final.json get permanent cefrLevel fields, or is runtime inference in vocabularyAll.js sufficient?**
   - What we know: Runtime inference is simpler and reversible; modifying JSON files is permanent and risks breaking other tooling
   - Recommendation: Use runtime inference in vocabularyAll.js for Phase 52; mark the JSON back-fill as a v12.0 cleanup item

2. **How many ambiguous words to tag?**
   - What we know: ~50–100 is achievable without exhaustive linguistic research; fewer than 50 may be too few to demonstrate the feature meaningfully
   - Recommendation: Target ~75 words, concentrated in B1/B2 verbs and verbal nouns where homography is most common

3. **Does CONT-04 (Root Explorer) require any code changes, or is data quality the only gap?**
   - What we know: RootExplorer.jsx fully implements root family grouping via `vocabRootFamilies` memo. The 596 placeholder words have `root: null` so they contribute nothing to root families. After replacement with real B2 words, root family grouping will naturally improve.
   - Recommendation: No RootExplorer code changes needed for Phase 52. The feature was completed in Phase 46-03.

---

## Sources

### Primary (HIGH confidence)
- `src/data/vocabularyExpanded.js` — direct inspection; word counts, placeholder detection, ambiguous/domainAffinity field absence confirmed
- `src/data/vocabularyAll.js` — direct inspection; CATEGORY_AFFINITY mapping, merge logic, dedup logic confirmed
- `src/components/NPC/TeacherWordCard.jsx` — direct inspection; cefrBadge already present
- `src/components/Roots/RootExplorer.jsx` — direct inspection; dual mode, vocabRootFamilies, cluster browse all present
- `src/hooks/useFormatArabic.js` — direct inspection; getTashkeelOpacity mastery-based logic confirmed
- `src/components/Arabic/TashkeelText.jsx` — direct inspection; tashkeel regex, opacity application confirmed
- `src/store/slices/vocabularySlice.js` — direct inspection; selectNewCardsByFrequency, selectNewCardsByPath both present
- `src/services/fsrs.js` — direct inspection; getNewCardsForSession uses selectNewCardsByPath
- `scripts/build-vocabulary.js` — direct inspection; legacy validator pattern confirmed
- `package.json` — direct inspection; vocab:validate script absent confirmed

### Secondary (MEDIUM confidence)
- Arabic linguistic knowledge for ambiguous word examples — well-established homographs (كتب/علم patterns) are standard Arabic pedagogy references

---

## Metadata

**Confidence breakdown:**
- Data gaps (placeholder count, domain affinity coverage): HIGH — directly measured via Node.js inspection
- What Phase 46 delivered: HIGH — SUMMARY files confirmed present, code inspected directly
- Ambiguous word list: MEDIUM — standard Arabic linguistics; ~50–100 is the pedagogically sensible range
- CEFR inference logic: MEDIUM — frequency-to-CEFR mapping is reasonable but not validated against formal CEFR standards

**Research date:** 2026-03-20
**Valid until:** 2026-04-20 (data and code stable; no external dependencies)
