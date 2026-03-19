# GOGO ARABIC — Complete Project Handoff

> **STALE (2026-03-19):** This document was written around v6.1. The project is now on
> v10.0 with ~110K LOC, 29 Redux slices, and 9 middleware. For current state, see
> `GOGO_ARABIC_OVERVIEW.md` and `.planning/STATE.md`.

> Copy-paste this entire document into your new AI coding tool. It contains everything needed to continue development.

---

## WHAT THIS PROJECT IS

An Arabic language learning RPG built with React 19, Phaser 3, Redux Toolkit, and Express 5 + MongoDB. Players explore a pixel-art world with 8 zones, 42+ NPCs, 63 quests, 15 enterable buildings, and 142 interactive objects while learning 1,220 Arabic vocabulary words and 28 letters through FSRS spaced repetition, 6 quiz types, sentence building, grammar lessons, and word duel battles.

**Core value:** Players naturally learn Arabic through guided exploration and interaction in an engaging RPG world — never wondering "what should I do next?" or "how do I practice?"

**Target vision:** ~800K+ LOC, 120-160 hours of gameplay, Pokemon meets Duolingo set in the historical Arabic world.

**Story premise:** A young scholar discovers an ancient manuscript that enables travel between historical Arabic cities across time. Baghdad in 800 CE, Cordoba in 950 CE, Timbuktu in 1500 CE. The manuscript's pages are scattered across the world — to read them and travel further, you must learn Arabic.

---

## HARD CONSTRAINTS (NEVER VIOLATE)

- **NO music** — ambient sounds + SFX + Arabic voice lines only
- **NO eyes/faces** — Islamic art tradition, faceless pixel characters
- **NO god/deity characters** — no divine beings, no worship mechanics
- **Arabic-first** — every mechanic teaches Arabic, no grinding without learning
- **Culturally respectful** — accurate history, no stereotypes
- **No romance options** — cultural sensitivity (Islamic context)
- **No loot boxes / gacha** — predatory, undermines educational trust
- **No pay-to-win** — inappropriate for education

---

## TECH STACK

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend Framework | React | 19.2.4 |
| Game Engine | Phaser 3 | 3.90.0 |
| State Management | Redux Toolkit | 2.11.2 |
| Persistence | redux-persist + IndexedDB + localStorage | 6.0.0 |
| Spaced Repetition | ts-fsrs | 5.2.3 |
| Animation | Framer Motion | 11.15.0 |
| Audio | Howler.js | 2.2.4 |
| Routing | React Router DOM | 7.13.0 |
| Validation | Zod | 4.3.6 |
| Build Tool | Vite | 7.3.1 |
| Testing | Vitest + Testing Library + Playwright | 3.0.0 |
| Linting | ESLint 9 flat config + Prettier 3 | 9.39.2 |
| Backend | Express 5 + MongoDB | — |

### Key Commands

```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Production build (validates NPC dialogue data via Vite plugin)
npm run test         # Vitest watch mode
npm run test:run     # Vitest single run (1,121 tests, all passing)
npm run lint         # ESLint
npm run format       # Prettier
```

---

## CURRENT STATUS

### Shipped Milestones

| Version | Description | Phases | Plans | Date |
|---------|-------------|--------|-------|------|
| v2.0 | Player Experience Overhaul | 1-9 | 14 | 2026-02-08 |
| v3.0 | Infrastructure & Polish | 10-11 | 11 | 2026-02-09 |
| v4.0 | Game Soul & Polish | 14-18 | 8 | 2026-02-10 |
| v5.0 | The Real Game | 19-26 | 18 | 2026-02-11 |
| v6.0 | Combat & RPG | 27.1, 28-30 | 16 | 2026-02-13 |

**Current milestone:** v6.1 Crafting & Advanced Combat
- Phase 31: Crafting & Professions — **COMPLETE** (8/8 plans)
- Phase 32: Status Effects & Advanced Combat — **10/11 plans COMPLETE**

**Cumulative stats:**
- 302 commits
- 1,121 tests passing (62 test files)
- Main bundle: 862KB (223KB gzipped)
- ~133K LOC

---

## IMMEDIATE NEXT TASK: Plan 32-11

**This is the ONE remaining plan before v6.1 milestone is complete.**

### Plan 32-11: BattleOverlay UI Wiring + BattleMenu/BattleResult + arenaSlice Store Registration

**Files to modify:**
1. `src/components/Battle/BattleOverlay.jsx`
2. `src/components/Battle/BattleMenu.jsx`
3. `src/components/Battle/BattleResult.jsx`
4. `src/store/store.js`

**Task 1: Update BattleOverlay with all Phase 32 components**

Import and render these new components in BattleOverlay.jsx:
- `StatusEffectBar` — for player effects (bottom-left) and enemy effects (top-left)
- `ComboMeter` — positioned left side
- `GrammarComboInput` — visible during GRAMMAR_COMBO phase
- `BattleItemMenu` — visible during ITEM_USE phase
- `TargetSelector` — visible during TARGET_SELECT phase
- `ArenaHUD` — visible when arena is active
- `PostBattleReview` — shown when user clicks "Review" on BattleResult
- `BossRushInterlude` — visible during BOSS_RUSH_INTERLUDE phase

Add EventBus listeners (useEffect cleanup pattern):
- `BATTLE_GRAMMAR_COMBO` → show GrammarComboInput with combo data
- `BATTLE_FLEE_CHALLENGE` → set fleeChallengeData, render `BattleArabicInput` with `mode="flee"`, word from event data, `timeLimit=10000`. On result, emit flee result back via EventBus.
- `BATTLE_TARGET_SELECT` → show TargetSelector
- `BATTLE_ITEM_MENU_OPEN` → show BattleItemMenu
- `BATTLE_POST_REVIEW` → set postReviewData from event (arabicUsedThisBattle array)
- `ARENA_WAVE_START` → show ArenaHUD
- `ARENA_COMPLETE` → show arena result overlay

Add state variables: `showGrammarCombo`, `grammarComboData`, `showItemMenu`, `showTargetSelector`, `targetSelectorData`, `showPostReview`, `postReviewData`, `showArenaHUD`, `showBossInterlude`, `interludeData`, `fleeChallengeData`

Flee challenge rendering:
```jsx
{fleeChallengeData && (
  <BattleArabicInput
    mode="flee"
    word={fleeChallengeData.word}
    timeLimit={10000}
    onResult={(result) => {
      EventBus.emit(EVENTS.BATTLE_FLEE_RESULT, result);
      setFleeChallengeData(null);
    }}
  />
)}
```

**Task 2: Update BattleMenu, BattleResult, register arenaSlice**

BattleMenu.jsx:
- Add combo action: `{ id: 'combo', label: 'Combo', arabic: 'تركيبة', key: '6' }`
- Only visible when grammar combos available (check grammarComboState)

BattleResult.jsx:
- Add "Review Arabic" button after Continue: `<button onClick={() => onReview?.()}>مراجعة العربية — Review Arabic</button>`
- Style as secondary (gold outline, not filled)
- Add `onReview` prop

store.js:
- Import `arenaReducer` from `'./slices/arenaSlice.js'` — **ALREADY IMPORTED** (line 23)
- Add `arena: arenaReducer` to `rootReducer` combineReducers — **NOT YET DONE**
- Add `'arena'` to root persistConfig whitelist array (lightweight, localStorage is fine)
- Verify `statusEffectVocabMiddleware` is registered — **ALREADY DONE** (line 30, 149)

**Verification:**
- `npm run build` succeeds
- `npm run test:run` — all 1,121+ tests pass
- BattleOverlay renders all Phase 32 components
- arenaSlice registered in store

---

## AFTER 32-11: WHAT TO DO NEXT

### 1. Complete v6.1 Milestone
After 32-11, verify Phase 32 against its 16 success criteria (see below), then archive v6.1.

### 2. Start v7.0 — World & Content (Phases 33-38)
The full plan lives in `.planning/MASTER-PLAN.md` and `.planning/research/EXPANSION-WORLD-CONTENT.md`.

| Phase | Description | ~LOC |
|-------|-------------|------|
| 33 | 24 zones (Baghdad, Cordoba, Timbuktu, Damascus, Cairo, Fez, Samarkand, Granada + fantasy) | 28K |
| 34 | Weather + time system (8 weather types, day/night, seasons) | 22K |
| 35 | 100+ building interiors (residential, commercial, educational) | 25K |
| 36 | Dynamic world state engine (500+ variables, consequences) | 24K |
| 37 | 200+ secrets + 15 Arabic puzzle types + exploration rewards | 24K |
| 38 | Transport system (mounts, caravans, boats, fast travel) | 24K |

### 3. Full Roadmap (v7.0-v11.0)

| Version | Phases | ~LOC | Focus |
|---------|--------|------|-------|
| v7.0 World & Content | 33-38 | 147K | 24 zones, weather, 100+ buildings, world state, secrets, transport |
| v8.0 Learning & Progression | 39-44 | 164K | 5000+ vocabulary, 6 skill trees, 50 grammar lessons, 18 quiz types, 250+ achievements |
| v9.0 Narrative & Social | 45-51 | 143K | 8-act main story, 250+ quests, 350+ NPCs, 6 factions, gifts, housing, codex |
| v10.0 Infrastructure | 52-57 | 108K | Backend v2, state overhaul, performance, 2000+ tests, content pipeline, save system |
| v11.0 AAA Polish | 58-63 | 88K | World polish, onboarding, accessibility, game feel, UI polish, endgame |

Detailed research docs for each version are in `.planning/research/`:
- `EXPANSION-COMBAT-RPG.md` (v6.0)
- `EXPANSION-WORLD-CONTENT.md` (v7.0)
- `EXPANSION-LEARNING-PROGRESSION.md` (v8.0)
- `EXPANSION-NARRATIVE-SOCIAL.md` (v9.0)
- `EXPANSION-INFRASTRUCTURE.md` (v10.0)
- `EXPANSION-PEDAGOGY-SLA.md` (47 pedagogical requirements)
- `EXPANSION-CURRICULUM-ARABIC.md` (41 Arabic curriculum requirements)
- `AAA-QUALITY-GAPS.md` (60 polish gaps for v11.0)
- `BATTLE-SYSTEM-ARCHITECTURE.md` (deep battle system design)
- `ASSET-PIPELINE.md` (sprite atlas, audio, Islamic art pipeline)
- `UI-UX-DESIGN-SYSTEM.md` (design tokens, components, accessibility)
- `BACKEND-ARCHITECTURE-V2.md` (API v2, MongoDB, Redis, save system)
- `TECHNICAL-DEBT-AUDIT.md` (known tech debt and scaling concerns)

---

## KNOWN TECH DEBT

- **Bundle 862KB** (exceeds 500KB target) — needs lazy loading / code splitting
- **BootScene loads ALL assets upfront** (77 calls) — needs zone-based lazy loading
- **No tests for Phase 27 battle code** (~2.6K LOC)
- **ShopOverlay + CompanionUI not wired to GameLayout** (~25 lines to fix)
- **573 missing companion dialogue lines** (content gap)
- **12 missing companion sprite PNGs** (art assets)
- **Backend hardening deferred** since v3.0 (Phases 12-13)
- **arenaSlice not registered in store** (Plan 32-11 fixes this)

---

## PROJECT STRUCTURE

```
gogo-arabic/
├── .planning/                    # All planning docs
│   ├── PROJECT.md               # Project definition
│   ├── ROADMAP.md               # Phase tracking
│   ├── STATE.md                 # Current state (resume point)
│   ├── REQUIREMENTS.md          # v6.1 requirements
│   ├── MASTER-PLAN.md           # Full v6-v11 master plan
│   ├── MILESTONES.md            # Milestone archive
│   ├── milestones/              # Archived milestone roadmaps
│   ├── phases/                  # Phase plans and summaries
│   │   ├── 32-advanced-combat/  # Current phase
│   │   │   ├── 32-11-PLAN.md   # ← NEXT PLAN TO EXECUTE
│   │   │   └── 32-01 to 32-10  # Completed plans + summaries
│   │   └── ...                  # All prior phases
│   └── research/                # 20 research documents
├── src/
│   ├── main.jsx                 # Entry point
│   ├── routes.jsx               # React Router v7
│   ├── components/              # 31 component directories
│   │   ├── Battle/              # 26 files — combat UI
│   │   ├── Crafting/            # 13 files — crafting system
│   │   ├── Companions/          # 5 files — companion UI
│   │   ├── NPC/                 # 11 files — dialogue system
│   │   ├── HUD/                 # 14 files — game HUD
│   │   ├── Quiz/                # 8 files — quiz types
│   │   ├── World/               # 6 files — world interaction
│   │   ├── Shop/                # 4 files — shop/haggling
│   │   ├── Inventory/           # 3 files — equipment UI
│   │   ├── Magic/               # 3 files — spell system UI
│   │   └── ... (20 more)
│   ├── data/                    # 43 data files
│   │   ├── npcs.json            # 42+ NPCs with dialogue trees
│   │   ├── npcsEnriched.js      # Barrel module (always import from here)
│   │   ├── npcStoryArcs.js      # Story arc overlays
│   │   ├── vocabulary-final.json # 1,220 words
│   │   ├── quests.json          # 63 quests
│   │   ├── statusEffects.js     # 24 status effects
│   │   ├── grammarCombos.js     # Grammar combo definitions
│   │   ├── arenaChallenges.js   # Arena/boss rush/puzzle configs
│   │   ├── rootMagic.js         # 50 spells
│   │   ├── equipment.js         # 64 items
│   │   ├── companions.js        # 12 companions
│   │   ├── professions.js       # 6 crafting professions
│   │   ├── recipes.js           # 100 recipes
│   │   ├── resources.js         # Gathering resources
│   │   └── zones.js             # 8 zones
│   ├── game/                    # Phaser game layer
│   │   ├── config.js
│   │   ├── PhaserGame.jsx       # React-Phaser bridge
│   │   ├── scenes/
│   │   │   ├── BootScene.js     # Asset loading
│   │   │   ├── WorldScene.js    # Main overworld
│   │   │   ├── BattleScene.js   # Turn-based battles
│   │   │   └── InteriorScene.js # Building interiors
│   │   ├── sprites/
│   │   │   ├── Player.js
│   │   │   ├── NPC.js
│   │   │   └── Companion.js
│   │   └── systems/             # Game systems
│   │       ├── battle/          # 14 battle system files
│   │       │   ├── BattleStateMachine.js    # FSM (core)
│   │       │   ├── ArenaController.js       # Wave survival
│   │       │   ├── BossRushController.js    # Boss rush mode
│   │       │   ├── PuzzleBattleManager.js   # Arabic puzzles
│   │       │   ├── GrammarComboDetector.js  # Combo detection
│   │       │   ├── CompoundEffectResolver.js # Compound effects
│   │       │   ├── MultiTargetManager.js    # Multi-enemy
│   │       │   └── ... (7 more)
│   │       ├── companions/      # 4 companion system files
│   │       ├── equipment/       # 2 equipment system files
│   │       ├── magic/           # 2 magic system files
│   │       ├── DialogueEngine.js
│   │       ├── GatheringSpotManager.js
│   │       ├── InteractableManager.js
│   │       ├── NPCManager.js
│   │       ├── MapLoader.js
│   │       ├── PlayerController.js
│   │       ├── SceneStackManager.js
│   │       └── ... (4 more)
│   ├── hooks/                   # 19 custom hooks
│   ├── store/                   # Redux store
│   │   ├── store.js             # 19 slices, 7 middleware, hybrid persist
│   │   ├── slices/              # 19 Redux slices
│   │   │   ├── battleSlice.js   # Battle state (IndexedDB)
│   │   │   ├── arenaSlice.js    # Arena state (NOT yet in store)
│   │   │   ├── craftingSlice.js # Crafting state (IndexedDB)
│   │   │   ├── companionSlice.js # Companions (IndexedDB)
│   │   │   ├── magicSlice.js    # Magic (IndexedDB)
│   │   │   ├── inventorySlice.js # Inventory (IndexedDB)
│   │   │   ├── vocabularySlice.js # Vocabulary (IndexedDB)
│   │   │   ├── playerSlice.js   # Player (localStorage)
│   │   │   ├── narrativeSlice.js # Story state (localStorage)
│   │   │   └── ... (10 more)
│   │   └── middleware/          # 7 middleware
│   │       ├── achievementMiddleware.js
│   │       ├── battleRewardsMiddleware.js
│   │       ├── craftingVocabMiddleware.js
│   │       ├── dailyGoalsMiddleware.js
│   │       ├── rootFsrsSyncMiddleware.js
│   │       ├── statusEffectVocabMiddleware.js
│   │       └── storageQuotaMiddleware.js
│   ├── services/                # API, audio, FSRS, storage
│   ├── styles/                  # Theme + CSS variables
│   ├── utils/                   # 20 utility files
│   └── test/                    # Test setup + factories
├── server/                      # Express 5 backend
├── public/                      # Static assets (sprites, audio)
├── e2e/                         # Playwright E2E tests
├── scripts/                     # Build scripts
├── vite.config.js               # Vite + dialogue validation plugin + chunk splitting
├── vitest.config.js             # Vitest + jsdom + coverage thresholds
├── eslint.config.js             # ESLint 9 flat config
└── package.json
```

---

## ARCHITECTURE PATTERNS

### Hybrid Storage (IndexedDB + localStorage)
- **Heavy data → IndexedDB**: vocabulary, battle, magic, inventory, companions, crafting (via nested `persistReducer`)
- **Light data → localStorage**: player, quests, alphabet, settings, npc, achievements, dailyGoals, grammar, narrative, economy
- **Transient (not persisted)**: ui, sync
- Migration system in `src/services/storage/migrations.js` (currently version 5)

### Redux Store (19 slices, 7 middleware)
All slices use Redux Toolkit `createSlice`. Heavy slices wrapped with `persistReducer` using IndexedDB adapter. Selectors use `createSelector` for memoized transformations.

### EventBus Pattern
`src/utils/eventBus.js` — 74+ namespaced event constants in `src/utils/eventBusTypes.js`. Used for cross-system communication (Phaser ↔ React, battle events, dialogue events, etc.).

### Phaser-React Bridge
`PhaserGame.jsx` bridges Phaser 3 and React. Phaser scenes run game logic; React renders overlays (battle UI, dialogue, inventory, shop, etc.) via `DOMOverlay` system.

### Component Patterns
- CSS Modules for all new components (`.module.css`)
- `useOverlayClose` hook for ESC/click-outside on all overlays
- `useFocusTrap` for WCAG AA compliance
- `useReducedMotion` checks for all VFX
- Split state/dispatch context pattern (when using Context API)

### Dialogue System
- `DialogueEngine.js` (Phaser system) evaluates conditions and executes effects
- NPC data in `npcs.json`, validated at build time via Vite plugin (`dialogueSchema.js` Zod)
- Story arcs overlay via `npcStoryArcs.js` → `npcsEnriched.js` barrel module
- All consumers import from `npcsEnriched.js`, never directly from `npcs.json`

### Battle System
- `BattleStateMachine.js` — FSM with states: PLAYER_TURN, GRAMMAR_COMBO, ITEM_USE, TARGET_SELECT, COMPANION_TURN, ENEMY_TURN, FLEE_CHALLENGE, etc.
- Arabic input = attack power (correct answer = full damage)
- Root magic spells from Arabic trilateral roots
- Grammar combos: noun+adjective, verb chains, full sentences
- Multi-target (up to 4 enemies) with front/back row
- 24 status effects with Arabic names
- Arena (wave survival), Boss Rush, Puzzle Battles

### Crafting System
- 6 professions: Calligrapher/خطاط, Cook/طباخ, Blacksmith/حداد, Herbalist/عطار, Weaver/نساج, Builder/بناء
- 100 recipes, vocabulary-gated ingredients
- 6 unique mini-games (CalligraphyTracing, CookingRecipeOrder, SmithingRhythm, PlantIdentification, PatternMatching, DirectionalPlacement)
- Gathering spots in world zones with respawn timers

---

## PHASE 32 SUCCESS CRITERIA (for verification after 32-11)

1. Battle system supports 20+ status effects with Arabic names ✅ (24 effects)
2. Applying a status effect requires knowing the Arabic vocabulary word ✅
3. Status effect vocabulary auto-added to FSRS review queue ✅
4. Status effect combinations create compound effects ✅
5. Player can execute noun+adjective combos for bonus damage ✅
6. Player can chain verb conjugations for escalating damage ✅
7. Player can construct complete Arabic sentences for ultimate attacks ✅
8. Combo meter displays with Arabic numerals ✅
9. Battle supports multi-target encounters (up to 4 enemies) ✅
10. Player can use crafted battle items during combat ✅ (component created, needs wiring in 32-11)
11. Player can retreat by correctly answering Arabic question ✅
12. Post-battle review shows Arabic used with accuracy stats ✅ (needs wiring in 32-11)
13. Wave-based survival arena ✅
14. Boss rush mode with story interludes ✅
15. Puzzle battles require specific Arabic knowledge ✅
16. Arena leaderboard tracking performance ✅ (needs store registration in 32-11)

---

## V6.1 REQUIREMENTS (32 total)

### Crafting (Phase 31 — COMPLETE)
CRAFT-01 through CRAFT-07, RSRC-01 through RSRC-03, CINT-01 through CINT-04

### Status Effects (Phase 32)
- STAT-01: 20+ status effects with Arabic names
- STAT-02: Applying effect requires knowing Arabic word
- STAT-03: Auto-add to FSRS review queue
- STAT-04: Compound effects from combinations

### Grammar Combos (Phase 32)
- COMBO-01: Noun+adjective combos (إضافة)
- COMBO-02: Verb conjugation chains
- COMBO-03: Complete Arabic sentences for ultimate attacks
- COMBO-04: Combo meter with Arabic numerals
- COMBO-05: Enemies break combos via tense switches

### Advanced Battle (Phase 32)
- ADVB-01: Multi-target (up to 4 enemies)
- ADVB-02: Front/back row positioning
- ADVB-03: Battle items usable during combat
- ADVB-04: Post-battle review with accuracy stats
- ADVB-05: Arabic-based retreat mechanic

### Arena (Phase 32)
- ARENA-01: Wave-based survival arena
- ARENA-02: Boss rush mode
- ARENA-03: Puzzle battles (not brute-forceable)
- ARENA-04: Leaderboard with performance tracking

---

## KEY DECISIONS LOG

### Architecture Decisions
- CSS Modules for all new components (not inline styles)
- IndexedDB for heavy slices via nested `persistReducer` (not split stores)
- EventBus for Phaser↔React communication (not direct Redux dispatch from Phaser)
- Behavior trees for companion AI (not state machines)
- CEFR-based dialogue scaling (A1-C2 Arabic/English ratios)
- Vocabulary data imported directly (not in Redux store)
- `audioManager` singleton pattern for audio control
- `useOverlayClose` hook for all overlay management

### Battle System Decisions
- BattleStateMachine FSM with per-state handlers
- `enemies[]` array for multi-target (first 2 front row, rest back row)
- Back row sprites 1.6x scale (vs 2x front) for depth
- Flee uses Arabic challenge (accuracy >= 0.8), favors familiar words
- Grammar combo detection validates against completed lessons
- Fixed puzzle damage = enemyHP / puzzlesRequired (prevents stat brute-forcing)
- `arabicReview` (renamed from arabicUsedThisBattle) stored in battleHistory
- `MultiTargetManager` uses data-push pattern (no Redux reads) for testability
- ArenaHUD reads EventBus events (not Redux) since arenaSlice not yet in store

### Crafting Decisions
- Dependency injection for RECIPES/RESOURCES in crafting logic (enables TDD)
- Level 0 profession: 50 XP, levels 1-10: 100×level
- 4-tier gathering quality vs 5-tier crafting quality
- Flat-object pattern for professions/recipes/resources (O(1) lookup)
- craftingSlice in IndexedDB via nested persistReducer
- All mini-games use CSS Grid (not Canvas) — accessible, performant
- Vocabulary-gating: show '???' for locked ingredients, emit REVIEW_SESSION_OPEN

### Dialogue Decisions
- `personality` field must be object `{tone, mood}` not string
- `vocabulary` condition needs `{wordId, mastered?}` not `{min: number}`
- `storyFlag` condition needs `{key, value}` not just `{flag: "name"}`
- NPC data validated at build time via Vite plugin
- Interior NPCs use "-interior" suffix (e.g., scholar-yusuf-interior)

### Phase 32 Specific Decisions
- 24 effects total (not 22) — original file had 16 + 8 new
- Level gating tiers: 10/16/24
- Compound wordId prefix 'compound_' vs status prefix 'status_'
- 6 bosses in rush sequence (story order)
- CEFR level gating: A1=level 1, A2=level 3, B1=level 7
- arenaSlice in localStorage (not IndexedDB) — lightweight
- Exact-match-first for verb forms with normalized fallback
- bossHP = sum of all enemies[] HP for backward compatibility
- 3-char truncation for status effect icon Arabic labels

---

## TEST CONFIGURATION

```js
// vitest.config.js
{
  environment: 'jsdom',
  globals: true,
  setupFiles: ['./src/test/setup.js'],
  css: { modules: { classNameStrategy: 'non-scoped' } },
  include: ['src/**/*.{test,spec}.{js,jsx}'],
  coverage: {
    thresholds: { statements: 25, branches: 70, functions: 50, lines: 25 }
  }
}
```

62 test files, 1,121 tests, all passing. Uses `fake-indexeddb` for IndexedDB mocking.

---

## BUILD CONFIGURATION

```js
// vite.config.js highlights
- React plugin with automatic JSX runtime
- Custom `validateDialoguePlugin()` validates npcs.json against Zod schema on build
- Manual chunks: phaser, react-vendor, redux-vendor, router-vendor, vocabulary-data, npc-data, fsrs-vendor
- Dev server port 3000, proxy /api to localhost:5000
```

---

## RESOURCES & ASSETS

### Art
- Monster Quest sprites (16x16, CC-BY 4.0) — faces removed
- Pipoya RPG Tileset (32x32 world tiles)
- Pipoya Character Sprites 32x32 (64+ characters)
- CraftPix clothing icons (32x32)

### Audio (NO MUSIC)
- Freesound.org for ambient sounds (bazaar, desert wind, nature, UI SFX)
- Lingua Libre / Shtooka for Arabic word recordings

### Arabic Language Data
- OpenArabic (2000+ words)
- ts-fsrs for spaced repetition
- Custom vocabulary-final.json (1,220 words)

---

## GIT INFORMATION

- 302 commits on main branch
- Latest commit: `feat(32-10): persist arabicUsedThisBattle as arabicReview in battleHistory`
- Tagged: v6.0
- No CLAUDE.md in the project (all config was in external memory)

---

## SUMMARY: WHAT TO DO RIGHT NOW

1. **Read** `.planning/phases/32-advanced-combat/32-11-PLAN.md` — the full execution plan
2. **Read** the 4 files it modifies: `BattleOverlay.jsx`, `BattleMenu.jsx`, `BattleResult.jsx`, `store.js`
3. **Execute** the 2 tasks in the plan
4. **Verify** with `npm run build` and `npm run test:run`
5. **Commit** with message format: `feat(32-11): wire Phase 32 UI into BattleOverlay + register arenaSlice`
6. After that, verify Phase 32 success criteria, archive v6.1 milestone, and start v7.0 planning

All detailed plans, research docs, and summaries are in `.planning/`. The project is well-documented and self-contained.
