# Requirements: GoGo Arabic v12.0 — Learning Systems

**Defined:** 2026-03-22
**Core Value:** Players naturally learn Arabic through guided exploration and interaction in an engaging RPG world

## v12.0 Requirements

### Bug Fixes & Migration

- [ ] **FIX-01**: Grammar achievement middleware mapping wired — completing a grammar lesson fires achievement checks
- [ ] **FIX-02**: Grammar lesson IDs migrated from numeric indices to string slugs with backward-compatible migration

### Skill Trees

- [ ] **SKILL-01**: Gameplay events (quest completion, grammar lesson, quiz, vocabulary review, calligraphy, poetry battle) award XP to the appropriate skill tree
- [ ] **SKILL-02**: Existing players' skill trees auto-initialize with nodes unlocked matching their current FSRS mastery, quest progress, and grammar completion
- [ ] **SKILL-03**: Skill tree node rewards gate content — unlocking a node can reveal new spells, companion options, zone access, or NPC dialogue
- [ ] **SKILL-04**: Skill tree UI shows XP progress per tree with unlockable node visualization

### Grammar Expansion

- [ ] **GRAM-01**: Grammar system expanded from 47 to 50 lessons covering A1 through B2 CEFR levels
- [ ] **GRAM-02**: Each grammar lesson has 12 exercise types with Arabic examples, not just fill-in-blank
- [ ] **GRAM-03**: Grammar lessons are gated by skill tree progression — B1 lessons require Grammar tree level 3, B2 requires level 5
- [ ] **GRAM-04**: Completing a grammar lesson awards Grammar skill tree XP and unlocks the next lesson

### Quiz Expansion

- [ ] **QUIZ-01**: Quiz system expanded from 12 to 18 types including GrammarFill, ClozePassage, WordOrder, DialectIdentify, RootExpand, CulturalContext
- [ ] **QUIZ-02**: Adaptive difficulty engine selects quiz difficulty based on FSRS retrievability — targets 70-85% success rate
- [ ] **QUIZ-03**: Quiz format (not just word selection) adapts to player weakness — more grammar quizzes for grammar-weak players

### CEFR Assessment

- [ ] **CEFR-01**: Diagnostic placement test (15-20 CAT questions) assigns starting CEFR level on first play — defaults one level lower than raw score
- [ ] **CEFR-02**: Placement test result pre-unlocks appropriate skill tree nodes and grammar lessons
- [x] **CEFR-03**: CEFR progress report shows level advancement over time with radar chart visualization (recharts)
- [ ] **CEFR-04**: Player can retake placement test from settings with warning that it resets CEFR tracking

### Achievements

- [x] **ACH-01**: Achievement system expanded from 44 to 250+ achievements across 15 categories
- [x] **ACH-02**: Achievements use 4-tier system (Bronze/Silver/Gold/Legendary) with increasing difficulty thresholds
- [x] **ACH-03**: Shareable social card ("I learned X Arabic words in Gogo Arabic") via SVG card + Web Share API / clipboard fallback (SVG-only, no external image dependencies)
- [x] **ACH-04**: Achievement progress visible in a dedicated Achievements panel with category filtering and tier display

## v12.0 Traceability (SHIPPED 2026-03-23)

| Requirement | Phase | Status |
|-------------|-------|--------|
| FIX-01 | Phase 56 | Complete |
| FIX-02 | Phase 56 | Complete |
| SKILL-01 | Phase 57 | Complete |
| SKILL-02 | Phase 57 | Complete |
| SKILL-03 | Phase 57 | Complete |
| SKILL-04 | Phase 57 | Complete |
| GRAM-02 | Phase 58 | Complete |
| GRAM-04 | Phase 58 | Complete |
| QUIZ-02 | Phase 59 | Complete |
| QUIZ-03 | Phase 59 | Complete |
| QUIZ-01 | Phase 60 | Complete |
| CEFR-01 | Phase 61 | Complete |
| CEFR-02 | Phase 61 | Complete |
| CEFR-04 | Phase 61 | Complete |
| GRAM-01 | Phase 62 | Complete |
| GRAM-03 | Phase 62 | Complete |
| ACH-01 | Phase 63 | Complete |
| ACH-02 | Phase 63 | Complete |
| ACH-04 | Phase 63 | Complete |
| CEFR-03 | Phase 64 | Complete |
| ACH-03 | Phase 64 | Complete |

---

## v13.0 Requirements — Systems Polish & Immersion

### Performance
- [ ] **PERF-01**: GameLayout chunk split from 1.2MB to under 500KB via dynamic imports for overlay components
- [ ] **PERF-02**: vocabulary-data chunk split from 1.7MB via zone-based vocabulary loading or binary format
- [ ] **PERF-03**: npc-data chunk reduced from 577KB via lazy NPC dialogue loading per zone
- [ ] **PERF-04**: CSS Modules migration for remaining inline-styled components (consistent styling approach)

### Systems Wiring
- [ ] **WIRE-01**: Quiz completion events feed into daily goals middleware — completing a quiz session updates daily goal progress
- [ ] **WIRE-02**: Zone-entry micro-reviews — entering a new zone triggers 2-3 FSRS-due word reviews inline
- [ ] **WIRE-03**: Progressive tashkeel fading — Arabic vowel marks (diacritics) fade based on FSRS mastery per word
- [ ] **WIRE-04**: NPC quest indicators (!/? markers) visible above NPC heads in Phaser world view

### Quiz Completion
- [ ] **QUIZ-04**: DialectIdentify quiz type — player identifies which Arabic dialect a phrase belongs to (B2, cefrMin:'B2')
- [ ] **QUIZ-05**: RootExpand quiz type — given a trilateral root, player selects all derived words (B2, cefrMin:'B2')
- [ ] **QUIZ-06**: CulturalContext quiz type — player matches Arabic expressions to cultural contexts (B2, cefrMin:'B2')

### Immersion
- [ ] **IMM-01**: In-dialogue comprehension checks — NPCs quiz player mid-conversation ("What did I just say?")
- [ ] **IMM-02**: Welcome back experience — returning players see last session summary + FSRS due count + suggested activity
- [ ] **IMM-03**: Environmental Arabic labels — floating Arabic text above world objects (tree = شجرة) teaches vocabulary passively
- [ ] **IMM-04**: Anonymous quiz statistics — "72% of players get this right" shown on quiz questions (localStorage-based accumulator)

### Testing
- [ ] **TEST-01**: Integration tests for battle system (~2.6K LOC untested)
- [ ] **TEST-02**: Integration tests for grammar overlay flow (lesson → exercises → quiz → completion)
- [ ] **TEST-03**: Integration tests for quest system (accept → objectives → complete → reward)

## v14.0 Requirements — Narrative, Social & Audio

### Narrative & Social
- [ ] **NAR-01**: Divergent experience engine — faction alignment determines content routing (zone narratives, NPC behavior, quest availability differ by primary faction)
- [ ] **NAR-02**: Event scheduler & UI — real-time activation of 12 existing faction events (daily/weekly), HUD banner, event overlay with vocab boost display
- [ ] **NAR-03**: Gift UI overlay — inventory-based gift selection, NPC reaction display (loved/liked/disliked), relationship milestone rewards at friendship tiers
- [ ] **NAR-04**: Lore codex — 300+ discoverable entries across 10 categories (history, culture, language, geography, religion, science, art, trade, warfare, mythology), discovery tracking, codex overlay UI

### Audio Quiz Types
- [ ] **AUD-01**: Listening comprehension quiz — Web Speech API TTS reads Arabic word/sentence, player selects correct English meaning from 4 choices
- [ ] **AUD-02**: Dictation quiz — TTS reads Arabic word, player types the Arabic text (with tashkeel tolerance)

## v15.0 Requirements — Core Learning Loop

### Daily Engagement
- [ ] **DAILY-01**: Daily challenge system — rotating daily puzzles (Word of the Day, Grammar Challenge, Speed Quiz, Cultural Trivia) with streak tracking, unique rewards, and daily reset
- [ ] **DAILY-02**: Challenge streak rewards — escalating bonuses at 3/7/14/30 day streaks (XP multipliers, exclusive items, titles)

### Reading Comprehension
- [ ] **READ-01**: 60+ graded reading passages across CEFR A1-B2 with inline vocabulary tooltips and Arabic text
- [ ] **READ-02**: Comprehension questions after each passage (3-5 questions, multiple choice + true/false), FSRS integration for encountered words

### Writing Practice
- [ ] **WRITE-01**: Canvas-based Arabic letter tracing with stroke order guides and validation
- [ ] **WRITE-02**: Progressive difficulty (isolated letters → connected forms → words → short phrases), scoring based on accuracy

### Conversation Practice
- [ ] **CONV-01**: Structured conversation scenarios with Arabic word-bank sentence construction
- [ ] **CONV-02**: Zone-appropriate dialogue topics, grammar scoring, and vocabulary-in-context practice

### Mini-Games
- [ ] **MINI-01**: Arabic Word Search — grid-based word finding with Arabic text
- [ ] **MINI-02**: Crossword Puzzle — Arabic clues and answers in a crossword grid
- [ ] **MINI-03**: Number Challenge — Arabic numeral recognition and arithmetic
- [ ] **MINI-04**: Memory Match — card-flipping pairs with Arabic audio + text

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real-time multiplayer | High complexity, single-player focus |
| ML-based adaptive algorithms | FSRS retrievability is sufficient signal |
| Dialect switching | Confuses learners, exponential content |
| Procedural grammar generation | Educational content needs curation |
| D3.js skill tree graphs | CSS flexbox layout sufficient for linear-branching trees |

## v13.0 Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| PERF-01 | Phase 65 | Complete |
| PERF-02 | Phase 65 | Complete |
| PERF-03 | Phase 65 | Complete |
| PERF-04 | Phase 66 | Complete |
| WIRE-01 | Phase 67 | Complete |
| WIRE-02 | Phase 67 | Complete |
| WIRE-03 | Phase 67 | Complete |
| WIRE-04 | Phase 67 | Complete |
| QUIZ-04 | Phase 68 | Complete |
| QUIZ-05 | Phase 68 | Complete |
| QUIZ-06 | Phase 68 | Complete |
| IMM-01 | Phase 69 | Complete |
| IMM-02 | Phase 69 | Complete |
| IMM-03 | Phase 70 | Complete |
| IMM-04 | Phase 70 | Complete |
| TEST-01 | Phase 71 | Complete |
| TEST-02 | Phase 71 | Complete |
| TEST-03 | Phase 71 | Complete |

**Coverage:**
- v13.0 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0

## v14.0 Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| NAR-01 | Phase 76 | Complete |
| NAR-02 | Phase 77 | Complete |
| NAR-03 | Phase 78 | Complete |
| NAR-04 | Phase 79 | Complete |
| AUD-01 | Phase 80 | Complete |
| AUD-02 | Phase 80 | Complete |

**Coverage:**
- v14.0 requirements: 6 total
- Mapped to phases: 6
- Unmapped: 0

## v15.0 Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DAILY-01 | Phase 81 | Complete |
| DAILY-02 | Phase 81 | Complete |
| READ-01 | Phase 82 | Complete |
| READ-02 | Phase 82 | Complete |
| WRITE-01 | Phase 83 | Complete |
| WRITE-02 | Phase 83 | Complete |
| CONV-01 | Phase 84 | Complete |
| CONV-02 | Phase 84 | Complete |
| MINI-01 | Phase 85 | Complete |
| MINI-02 | Phase 85 | Complete |
| MINI-03 | Phase 85 | Complete |
| MINI-04 | Phase 85 | Complete |

**Coverage:**
- v15.0 requirements: 12 total
- Mapped to phases: 12
- Unmapped: 0

## v16.0 Requirements — Visual/World Layer Rebuild

### Visual Layer

- [ ] **WORLD-01**: All 8 core zones render without missing/broken tiles — every Kenmi key in zones.js exists in KENMI_CATALOG and every ground sprite resolves to a valid frame index
- [ ] **WORLD-02**: Each of 8 core zones renders to a deterministic snapshot matching a committed fixture (Kenmi art style consistent across zones)
- [ ] **WORLD-03**: Every NPC sprite key referenced by NPC_KEY_MAP is from the `/assets/sprites/npcs/faceless/` whitelist (Islamic art constraint — no faces)
- [ ] **WORLD-04**: No new file added in Phase 97 (`src/game/systems/world/`, new `src/data` entries, `src/test/fixtures/world-snapshots/`) contains the token "map" or "UI" — use "world" terminology exclusively
- [ ] **WORLD-05**: No new overlay wired into `src/components/GameLayout.jsx` during Phase 97
- [ ] **WORLD-06**: All 2535 existing tests continue to pass after every Phase 97 commit
- [ ] **WORLD-07**: 8 zone snapshot fixture files exist at `src/test/fixtures/world-snapshots/{zoneId}.json` and parse as valid JSON
- [ ] **WORLD-08**: `WORLD-AUDIT.md` exists at the phase directory with all required sections (Zone Kenmi Key Inventory, Missing References, Face-Bearing NPCs, Frame Table Audit, Biome Gaps, BootScene Duplicates, Terminology Hits, Recommendations, 1M-Context Strategy Verification, Verified vs. Assumed)
- [~] **WORLD-09**: `mountain_village` snapshot has non-zero decoCount AND non-zero animalCount (snow biome parity with desert zones). **PARTIAL (2026-05-29):** decoration half satisfied — decorations now live in `objects[]` (test asserts `objects.length > 0`). **KNOWN GAP:** ambient ANIMAL spawning was never built (Lucas PR-1 added biome props but no animals — see `.planning/code-review/lucas-pr-1-review.md` §3). Animal assertion is `it.skip`'d in `WorldSnapshot.test.js` pending an ambient-animals feature.
- [~] **WORLD-10**: `farmland` and `coastal_port` snapshots have non-zero animalCount (grass biome ambient life). **KNOWN GAP (2026-05-29):** ambient animal spawning unbuilt; assertions `it.skip`'d with documentation. Needs a dedicated ambient-life phase.
- [ ] **WORLD-11**: No Phaser texture key is loaded twice under different classifications (BootScene duplicate-load elimination — DESERT_TILESETS vs KENMI_CATALOG collision resolved)
- [ ] **WORLD-12**: Interior scenes (`scholar_house_interior`, `merchant_house_interior`, `oasis_guild_interior`) render to valid snapshots

## v16.0 Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| WORLD-01 | Phase 97 (Plans 01, 04, 06) | Planning |
| WORLD-02 | Phase 97 (Plans 01, 06, 07) | Planning |
| WORLD-03 | Phase 97 (Plan 03) | Planning |
| WORLD-04 | Phase 97 (Plans 01, 08) | Planning |
| WORLD-05 | Phase 97 (Plan 08) | Planning |
| WORLD-06 | Phase 97 (all plans) | Planning |
| WORLD-07 | Phase 97 (Plans 01, 07) | Planning |
| WORLD-08 | Phase 97 (Plans 01, 08) | Planning |
| WORLD-09 | Phase 97 (Plans 05, 07) | Planning |
| WORLD-10 | Phase 97 (Plans 05, 07) | Planning |
| WORLD-11 | Phase 97 (Plan 02) | Planning |
| WORLD-12 | Phase 97 (Plans 01, 07) | Planning |

**Coverage:**
- v16.0 requirements: 12 total
- Mapped to phases: 12
- Unmapped: 0

## v17.5 Requirements — Platform Foundation

### Observability & Test Coverage (Phase 102)

- [x] **OBS-01**: PostHog product analytics SDK wired into the React shell with `autocapture: false` and identified per anonymous session ID (Plan 102-02, commits d7afa55 + b89d8b5)
- [x] **OBS-02**: Canonical learning-loop events emitted with stable names (`quest.started`, `quest.completed`, `fsrs.reviewed`, `zone.entered`, `lesson.completed`, `teaching.started`, `teaching.completed`, `dashboard.viewed`); event properties are enum/ID only, never free text (Plan 102-03, commits af8ac06 + 36e4aca)
- [x] **OBS-03**: PostHog session replay enabled with all user-typed input fields masked (no Arabic learner-text in replays); explicit `captureCanvas:false` + `ph-no-capture` on free-text DOM nodes (Plan 102-04, commits 461a40a + 9177582 + 0dfdbc8)
- [x] **OBS-04**: Uncaught errors and unhandled promise rejections captured into PostHog with stack trace and breadcrumbs (Plan 102-05, commits adeef37 + 64acfe0)
- [x] **OBS-05**: In-game perf overlay (FPS, frame time, draw calls, heap MB) togglable via `?perf=1` URL flag or debug key combo; ≤1ms/frame overhead when active, zero cost when off (Plan 102-06, commits ec18f07 + 994afd7; dist/assets/PerfOverlay-*.js 738 bytes lazy chunk verified)
- [x] **OBS-06**: Low-end-device flag detected (avg FPS <45 over 10s warm-up OR `navigator.deviceMemory < 4`) and persisted to existing IndexedDB store from Phase 27.1 via migration v13 (Plan 102-07, commits cbc7433 + 02e23a5)
- [x] **OBS-07**: Telemetry opt-out toggle in settings; default is **opt-OUT for ALL users** (no age-gate exists in codebase per RESEARCH gap — defaulted conservatively) (Plan 102-02, commit bc6505c)
- [x] **OBS-08**: Playwright smoke suite covers boot → title → new game → walk one zone → talk to one NPC → take one FSRS review → save+reload-restores-state, green in CI in under 3 minutes with `video: 'retain-on-failure'` (Plan 102-08, commits ffd0756 + 7c1155f + 979b3c0; CI workflow `.github/workflows/playwright.yml`)
- [x] **OBS-09**: Existing vitest suite count remains green with zero regressions after Phase 102 lands — verified 5757 passing ≥ 5623 baseline (Plan 102-09 regression report)

### Mobile & Cloud Sync (Phase 103)

- [ ] **MOB-01**: Virtual joystick rendered on touch devices (`pointer: coarse`) on the left half of screen; mirrors keyboard movement input
- [ ] **MOB-02**: Tap-to-interact on world objects/NPCs casts a small radius from tap location, picks nearest interactable, fires the same path as keyboard "E"
- [ ] **MOB-03**: Phaser canvas scales responsively with `pixelArt: true` and integer scaling; tile art remains crisp at all viewport sizes
- [ ] **MOB-04**: CSS `safe-area-inset-{top,bottom,left,right}` respected on notched phones; no UI elements clipped by display cutouts
- [ ] **MOB-05**: Touch controls do NOT render on desktop (`pointer: fine` media query); keyboard/mouse path is unchanged
- [ ] **MOB-06**: PWA manifest present, installable on iOS Safari and Android Chrome with a Gogo Arabic icon and splash screen
- [ ] **MOB-07**: Service worker caches app shell + recent zone assets for offline play; offline boot returns to the last visited zone
- [ ] **SYNC-01**: Email magic-link auth backed by existing `server/`; no third-party auth provider; rate-limited
- [ ] **SYNC-02**: IndexedDB → cloud push runs on save with append-only mutation queue that drains when online; survives offline play
- [ ] **SYNC-03**: Cloud → IndexedDB pull runs on boot; replaces local slot only if cloud `lastSyncedAt` is newer than local
- [ ] **SYNC-04**: Conflict UI shown when both sides have changes since last sync; user picks "keep local" or "keep cloud" per slot; no auto-merge
- [ ] **SYNC-05**: Cloud sync is opt-in; anonymous local-only play remains fully functional and is the default for new installs
- [ ] **SYNC-06**: Save schema migration is backward-compatible with Phase 27.1 IndexedDB — existing saves load without data loss; new `lastSyncedAt` field added without breaking old reads

### Dev Infrastructure (Phase 104)

- [ ] **PIPE-01**: Sprite atlas packing is deterministic — same source inputs produce byte-identical atlases across CI runs
- [ ] **PIPE-02**: Kenmi sprites and tilesets packed into multi-page atlases (JSON-Hash format) ingested natively by Phaser without consumer code changes
- [ ] **PIPE-03**: Audio assets re-encoded to OGG (primary) + MP3 (fallback) where size reduction exceeds 30%; original perceptual fidelity preserved (OGG q≥5 or equivalent)
- [ ] **PIPE-04**: `content/zone-manifest.json` generated declaring which atlases and audio each zone needs
- [ ] **PIPE-05**: Per-zone lazy loading: only global core loads in BootScene; ZoneLoader loads zone bundle on entry and releases on exit; adjacent zones pre-fetched on proximity with no visible asset pop-in
- [ ] **PIPE-06**: CI bundle-size gate warns on >+5% delta from base branch and fails on >+15%
- [ ] **HMR-01**: Vite HMR boundary on `content/**/*.json` (dialogue trees, zone JSON, vocab packs); only fires in `import.meta.env.DEV`
- [ ] **HMR-02**: On HMR event, new JSON re-validated via existing Zod schemas (reusing `scripts/validate-vocab.mjs` patterns) before applying to game state
- [ ] **HMR-03**: HMR code path is stripped from production bundle at build time; production loads remain unchanged
- [ ] **HMR-04**: When HMR JSON fails Zod validation, error surfaces in the dev overlay with file path + Zod issue; game state is NOT mutated and the game does NOT crash

## v17.5 Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| OBS-01 | Phase 102 (Plan 02) | Complete |
| OBS-02 | Phase 102 (Plan 03) | Complete |
| OBS-03 | Phase 102 (Plan 04) | Complete |
| OBS-04 | Phase 102 (Plan 05) | Complete |
| OBS-05 | Phase 102 (Plan 06) | Complete |
| OBS-06 | Phase 102 (Plan 07) | Complete |
| OBS-07 | Phase 102 (Plan 02) | Complete |
| OBS-08 | Phase 102 (Plan 08) | Complete |
| OBS-09 | Phase 102 (Plan 09) | Complete |
| MOB-01 to MOB-07 | Phase 103 (plans TBD) | Stubbed |
| SYNC-01 to SYNC-06 | Phase 103 (plans TBD) | Stubbed |
| PIPE-01 to PIPE-06 | Phase 104 (plans TBD) | Stubbed |
| HMR-01 to HMR-04 | Phase 104 (plans TBD) | Stubbed |

**Coverage:**
- v17.5 requirements: 32 total (OBS×9 + MOB×7 + SYNC×6 + PIPE×6 + HMR×4)
- Mapped to phases: 32
- Complete: 9 (all OBS-* delivered by Phase 102 on 2026-05-27)
- Stubbed: 23 (Phases 103 and 104 not yet executed)
- Unmapped: 0

---
*Requirements defined: 2026-03-22*
*Last updated: 2026-04-18 — v16.0 Visual Rebuild requirements added (WORLD-01 through WORLD-12) for Phase 97. v15.0 shipped.*
*2026-05-26 — v17.5 Platform Foundation requirements added: OBS-01..OBS-09 (Phase 102), MOB-01..MOB-07 + SYNC-01..SYNC-06 (Phase 103), PIPE-01..PIPE-06 + HMR-01..HMR-04 (Phase 104). 32 new requirements registered.*
*2026-05-27 — Phase 102 shipped: OBS-01..OBS-09 all marked Complete; v17.5 partial milestone (1 of 3 phases).*
