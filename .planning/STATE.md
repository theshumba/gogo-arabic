---
gsd_state_version: 1.0
milestone: v9.0
milestone_name: Content Depth
status: unknown
stopped_at: Phase 55 plan 05 complete — PoetryBattleOverlay + 8 NPC poets + GameLayout + poetryRewardsMiddleware
last_updated: "2026-03-21T11:40:50.245Z"
progress:
  total_phases: 3
  completed_phases: 3
  total_plans: 9
  completed_plans: 9
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-19)

**Core value:** Players naturally learn Arabic through guided exploration and interaction in an engaging RPG world — never wondering "what should I do next?" or "how do I practice?"
**Current focus:** Phase 55 — mini-games-content-polish

## Current Position

Phase: 55
Plan: Not started
Progress: 55-01 [DONE] | 55-02 [DONE] | 55-03 [DONE] | 55-04 [DONE] | 55-05 [DONE]
Progress bar: [█████] 100%

### Shipped Milestones

| Version | Phases | Plans | Date |
|---------|--------|-------|------|
| v2.0 Player Experience | 1-9 | 14 | 2026-02-08 |
| v3.0 Infrastructure | 10-11 | 11 | 2026-02-09 |
| v4.0 Game Soul & Polish | 14-18 | 8 | 2026-02-10 |
| v5.0 The Real Game | 19-26 | 18 | 2026-02-11 |
| v6.0 Combat & RPG | 27.1, 28-30 | 16 | 2026-02-13 |
| v6.1 Crafting & Advanced Combat | 31-32 | 19 | 2026-02-18 |
| v7.0 World & Content | 33-37 | 18 | 2026-03-16 |
| v8.0 Visual Overhaul | 38-43 | ~18 | 2026-03-18 |
| v9.0 Content Depth | 44-46 | 9 | 2026-03-18 |

**Cumulative:** 46 phases, 137+ plans, 9 milestones

## Accumulated Context

### Key v11.0 Context

- inkjs@2.4.0 NOW INSTALLED — InkDialogueEngine adapter created in Phase 51-01
- rollup-plugin-visualizer INSTALLED — use `npm run build:analyze` for treemap; see dist/bundle-report.html
- Bundle NOW 402KB (under 500KB target) — Phase 50-01 complete; safe to add Phase 51 systems
- worldStateSlice is the root dependency: inkjs, factions, gossip, and learning path all write to it
- Adapter pattern for inkjs: check .ink.json first, fallback to legacy JSON — never big-bang migrate all NPCs
- Faction gates must cover bonus content only — all main quests completable at faction score 0
- 573 missing companion dialogue lines — FILLED in Phase 51-02 — zero Array.from placeholders remain
- Phases 48-49 from v10.0 (learning path + first quest) are absorbed into Phase 51
- Visual/UI/world/tileset work explicitly out of scope — user builds in LDtk separately
- EXTERNAL declarations required in .ink source — all ink files must declare EXTERNAL for any function called via ~ syntax
- npm run ink:compile regenerates all .ink.json from src/data/ink-source/*.ink using inkjs/compiler/Compiler
- INK_DIALOGUE_START event pattern: emit {engine, npcData} → DialogueOverlay renders ink story without legacy NPC lookup
- INK_DIALOGUE_END event: emitted by DialogueOverlay on ink story completion; useTutorialTrigger listens to advance phase
- Path-choice ink trigger: SFX_WORDLEARNED in met_mentor phase → InkDialogueEngine.loadPathChoice() → INK_DIALOGUE_START

### Decisions

All v2.0-v10.0 decisions logged in PROJECT.md Key Decisions table.

| Decision | Context | Outcome |
|----------|---------|---------|
| inkjs adapter pattern (not big-bang migration) | Research: 23 NPCs, breaking risk | Pilot 5 NPCs, fallback to legacy JSON |
| AceBase deferred to v12.0 | Bundle cost 200-300KB conflicts with 500KB target | IndexedDB hybrid covers persistence needs |
| Phases 48-49 absorbed into Phase 51 | v10.0 not started, absorb cleaner than maintaining two roadmaps | Single phase delivers full learning path + first quest flow |
| WORLD_STATE_KEYS constants file | 500+ flags, naming chaos risk | {zone}_{action}_{target} convention enforced from Phase 50 day one |
| Faction gates bonus-content-only | Soft-lock risk if faction tied to main quest | Main storyline completable at all-0 faction scores |
| GameLayout lazy at route level (50-01) | Overlay-only lazy wrapping only reduced index to 1,068KB; store+scene deps enter via different path | routes.jsx uses lazy() for GameLayout; index=402KB; game code defers to /game navigation |
| Lazy overlay Suspense fallback=null (50-01) | No spinner flash over Phaser canvas when opening battle/inventory first time | Canvas stays visible; overlays load silently |
| worldState moved to IndexedDB | 562 flags → localStorage 5-10MB limit risk | Nested persistReducer, CURRENT_VERSION=8, migration cleans old data |
| worldStateMiddleware last in chain | Ordering consistency | Added after utilityBonusMiddleware, matches project convention |
| Zone asset manifest (50-02) | BootScene loaded ALL zone tilesets upfront; zone-specific Kenmi tilesets moved to ZONE_ASSET_MANIFESTS | loadZoneAssets() called during ZoneTransition fade-out; TextureManager cache skip on revisit |
| KENMI_CATALOG stays in BootScene (50-02) | Decorative sprites used across all zones; not zone-specific | KENMI_CATALOG loop untouched in BootScene; only desert tileset images moved to ZONE_ASSET_MANIFESTS |
| syncStateOut uses WORLD_STATE_KEYS values (51-01) | Iterating raw ink globalVariables risks polluting Redux store with ink-internal variables | syncStateOut() iterates known WORLD_STATE_KEYS set only |
| EXTERNAL declarations required in .ink (51-01) | inkjs Compiler throws on ~ function calls without EXTERNAL declaration | All .ink source files must declare EXTERNAL at top for all bound functions |
| Zone corrections in companion dialogue (51-02) | Placeholders used wrong zones for Maryam/Nadia/Tariq vs plan spec | Applied plan-spec zones at write time; teaching specialty keys also corrected for Samir/Tariq/Maryam |
| Amira gets ancient_ruins as 4th zone (51-02) | Plan called for adding ancient_ruins zone_comments to Amira | Added 5 entries; Amira now has 4 zones (sacred_library, oasis, market, coast, ruins) |
| Ink path-choice triggered by SFX_WORDLEARNED not path_choice tutorialPhase (51-03) | CinematicIntroSequencer already skips tutorialPhase='path_choice'; word-learned is correct insertion point | useTutorialTrigger fires ink dialogue after SFX_WORDLEARNED in met_mentor phase |
| INK_DIALOGUE_START/END event pair decouples overlay from phase management (51-03) | DialogueOverlay should not own phase transitions | Overlay emits INK_DIALOGUE_END; useTutorialTrigger advances to learned_word |
| PathChoice.jsx preserved for PATH-05 (51-03) | Settings path-switch still needs PathChoice overlay | Guarded with !pathAlreadyChosen in GameLayout; never deleted |
| PATH_MENTORS/PATH_FIRST_QUESTS as module-level constants (51-04) | Exported from playerSlice so they are testable and tree-shakeable without Redux | setLearningPath reducer imports and references PATH_MENTORS directly |
| selectNewCardsByPath reads learningPath from state.player (not param) (51-04) | Consistent with Redux selector convention; avoids passing path as extra arg | Input selector: (state) => state.player.learningPath |
| Onboarding 3-word reward uses Object.keys(fsrsCards).length (51-04) | No separate counter state needed; avoids duplication | worldStateMiddleware checks post-reduction fsrsCards count === 3 |
| worldStateMiddleware dual-write covers both completeOnboarding + setTutorialPhase('complete') (51-04) | Both code paths can complete onboarding; both must write IndexedDB flag | Middleware intercepts both action types |
| ActivitiesMenu 'learning-path' opens PathChoice via onOpenPathSwitch (not route) (51-04) | No /learning-path route exists; settings mode is an overlay not a page | PauseMenu threads onOpenPathSwitch → GameLayout showPathSwitch state |
| Runtime CEFR inference in vocabularyAll.js, not JSON back-fill (52-01) | Modifying vocabulary.json/vocabulary-final.json risks breaking legacy tooling | Frequency-band + difficulty-fallback loop added post-merge; reversible |
| Arabic-text dedup uses first-occurrence-wins (52-01) | curated > additional > expanded priority preserved by merge order | seenArabic Set iterates merged array; ~671 cross-source dupes removed |
| CATEGORY_AFFINITY extended to 99 entries (52-01) | Plan called for 60+; all 91 categories from vocabularyExpanded.js now covered | Domain affinity from 12.2% to >70% coverage for PATH-03 selectNewCardsByPath |
| validate-vocab.mjs replicates merge inline, not via vocabularyAll.js import (52-02) | Node 24 requires 'with { type: "json" }' for JSON ESM imports; vocabularyAll.js uses import.meta.env.DEV | readFile for JSON + ESM import for vocabularyExpanded.js; Vite handles this in prod |
| Missing root field in vocab:validate is WARN not ERROR (52-02) | 1,147 legacy/Quranic words have root: undefined — legitimate vocabulary | Erroring would force large JSON back-fill; warn preserves signal without blocking CI |
| wordMeta useMemo in TashkeelText keyed on wordId (52-03) | vocabulary.find on every render would be O(n) per render on 5,000+ words | useMemo([wordId]) memoizes; find only runs when wordId changes |
| vocabulary import in useFormatArabic.js is safe (52-03) | vocabularyAll.js is pure data with no Redux imports | No circular dependency risk; acceptable service-layer data access pattern |
| fsrs.js imports store directly for getNewCardsForSession (51-05) | Service module not a React component; avoids prop-drilling for Redux state access | Acceptable pattern for service layer; getNewCardsForSession(maxCards) usable anywhere |
| isNew flag + null card for new word entries in ReviewSession (51-05) | FSRS requires a card object; new words have no card yet | createNewCard() called before reviewCard(); addFsrsCard dispatched on first answer |
| Fallback to unordered filter in rootFsrsSyncMiddleware (51-05) | Edge case: root with no path-matched words would add zero new cards | Falls back to original .filter().slice(0,3) if pathOrderedNewCards intersection is empty |
| PATH_MENTORS lookup at runtime in each handler, not cached at hook mount (51-06) | Stale closure risk: learningPath is null at mount, set during ink dialogue | store.getState().player.learningPath read inside event handler body |
| Path quest prerequisites = ["tutorial_welcome"] not [] (51-06) | Empty array would activate all 3 path quests at app startup before path chosen | tutorial_welcome gates unlock to post-onboarding; learningPath field on quest def handles display filtering |
| 'met_yusuf' phase name preserved despite mentor being path-variable (51-06) | Changing phase name breaks existing save files | Comment documents misleading name; save compatibility maintained |
| inscription type added to WORLD_OBJECT_SPRITES/WORLD_OBJECT_TYPES (54-03) | inscription objects were not handled in InteractableManager; silently ignored in handleInteractable | Added inscription sprite key; auto-included in WORLD_OBJECT_TYPES via Object.keys |
| useObjectEvents handles async ink routing for inscriptions (54-03) | InteractableManager is synchronous Phaser class; ink loading is async | Same pattern as useTutorialTrigger; loadForNpc in handleObjectInteract async handler |
| Ink multi-branch: separate {cond: -> knot} blocks not inline multi-branch (54-03) | inkjs Compiler rejects {cond: ... - cond2: ... - else: ...} for diverts | Each tier uses its own conditional block; unconditional divert as final fallback |
| FSRS root family words capped at 5 (54-03) | Inscription encounter could add large batches of unknown root words | .slice(0,5) after filter; avoids overwhelming review queue |
| FADE_DIVISOR at module level in useFormatArabic (54-04) | Avoids per-render object allocation; scalar constant for path-to-rate mapping | Module-level const; scholar: 2.0, historian: 1.33, traveler: 1.0 |
| learningPath in getTashkeelOpacity useCallback deps (54-04) | Prevents stale closure when path changes without fsrsCards changing (Pitfall 7) | [fsrsCards, learningPath] deps array |
| FACTION_TIERS as frozen object with threshold + labels (53-01) | Consistent with other constant patterns in codebase | Object.freeze with threshold/label/labelArabic fields |
| faction moved to IndexedDB CURRENT_VERSION=9 (53-01) | Faction scores can grow large; consistent with worldState v8 migration | Nested persistReducer, migration 9 cleans old localStorage faction key |
| factionMiddleware last in chain after worldStateMiddleware (53-01) | Ordering consistency | Appended to concat() chain after worldStateMiddleware |
| QUEST_FACTION_MAP prefix-based faction routing (53-01) | Simple O(prefixes) lookup, no external data dependency | 12 prefixes covering all 6 factions (e.g. scholars_, library_ → SCHOLARS) |
| factionRequired requirement type in ActionSetExecutor (53-02) | Data-driven faction gating for bonus content | context.factionScores?.[factionId] ?? 0 >= minScore; safe at faction 0 |
| shopGenerator faction path fixed to state.faction.alignment (53-02) | Stale state.narrative.factionReputation was the old path pre-factionSlice | reputation threshold 75 (Allied), 15% discount on reputation items |
| factionGatedContent.js bonus-content-only pattern (53-02) | FACT-04: main quests completable at faction 0 | All factionRequired entries in factionGatedContent.js; quests/ and npcStoryArcs.js have zero factionRequired |
| factionVocab.js word IDs are symbolic (53-03) | Non-corpus IDs; fsrsCards[wordId] guard prevents re-adding already-known words | addFsrsCard only dispatched if !fsrsCards[wordId] |
| FACTION_*_FRIENDLY/TRUSTED/ALLIED flags as idempotency guards (53-03) | Prevents double vocab reward if score oscillates around threshold | setFlag fires on first crossing; worldFlags[worldKey] checked before each reward grant |
| FactionPanel sorted by score via selectFactionRanks (53-03) | Highest-standing faction shown first | selectFactionRanks already sorts descending; panel reflects current standings |
| factionDiscount hardcode removed from shopGenerator (54-01) | Old 0.85 multiplier at rep >= 75 duplicated ECON-03 and missed hostile markup | getFactionModifier() handles all three tiers (allied/neutral/hostile); priceModifiers state key preserved |
| pricingAgent.js as pure-function module (54-01) | No Redux imports; testable in isolation | calculateDynamicPrice + getFactionModifier imported by shopGenerator and ShopOverlay |
| supplyLevels seeded idempotently on shop open (54-01) | initSupply skips already-initialized items; purchases preserved across opens | store.dispatch(initSupply) in shopInventory useMemo; safe to call every render |
| gossip NOT persisted (54-02) | Tokens are session-ephemeral (3-day expiry resets on reload); stale tokens should not persist | gossip: gossipReducer outside root persistConfig whitelist |
| state.npc.friendship used for gossip threshold (54-02) | npcSlice has 0-100 scale; narrativeSlice has 0-5 tier; plan requires npc.friendship >= 25 | friendships = state.npc?.friendship ?? {} in gossipMiddleware |
| gossip grammar annotations as [bracketed text] (54-02) | DialogueOverlay renders ink currentInkLine in <p> tag without bracket filtering | [{gossip_grammar}] in ink passes through unchanged; no DialogueOverlay changes needed |
| dynamic JSON import inside async create() (55-02) | calligraphyPaths.json loaded in async create() to keep it out of initial bundle per CALL-01 | Dynamic import() inside async create(); Phaser allows async scene lifecycle methods |
| scene-level pointer events only (55-02) | game.input.on() listeners persist after scene stop; this.input.on() destroyed automatically | Always use this.input.on() in CalligraphyScene (Pitfall 4 prevention) |
| Frechet paths resampled to 64 points (55-02) | Path-density mismatch causes artificially large Frechet distance for fast-drawn strokes | resamplePath(path, 64) on both player and reference before discreteFrechetDistance call |
| poetrySlice activeBattle session-only (55-04) | In-progress battle should reset on reload; stale battle state would be confusing | activeBattle blacklisted from IndexedDB persist; completedBattles + unlockedPoems persisted |
| NPC poet accuracy configurable float not FSRS-based (55-04) | FSRS NPC state would require separate card tracking per poet | Math.random() < npcAccuracy per blank; 0.5 beginner, 0.7 intermediate, 0.85 advanced, 0.95 master |
| poetry WordIds use classical/symbolic IDs (55-04) | Classical Arabic blank words (azm, kiram, etc.) not in modern 5000-word corpus | _classical suffix IDs; getPoetryChoices fallback to corpus for distractors; correct answer always included |
| CURRENT_VERSION bumped to 10 for poetry IndexedDB (55-04) | poetry slice added as nested persistReducer same as factionSlice/worldStateSlice | Nested persistReducer key gogo-arabic-poetry; v10 migration cleans stale localStorage key |
| window.__pendingCalligraphyLaunch for cross-route launch (55-03) | MiniGamesHub at /mini-games cannot emit to GameLayout at /game before navigation completes | Set window property before goTo('/game'); GameLayout checks and deletes on mount |
| calligraphy-game manualChunks keeps scene out of initial bundle (55-03) | CalligraphyScene dynamically imported in GameLayout useEffect; must not appear in index chunk | manualChunks routes CalligraphyScene.js + calligraphyPaths.json to calligraphy-game chunk |
| markLetterPracticed best-score-wins logic (55-03) | Player may retry; only highest star count should persist | if (!existing || stars > existing.stars) gate in reducer |
| Poet NPCs require schema-valid greeting/dialogueTrees (55-05) | dialogueSchema.js Vite plugin validates all npcs.json entries including new poet type | Added greeting.arabic/english + dialogueTrees[] to each poet; actionSets kept as passthrough |
| Pre-reducer state capture in poetryRewardsMiddleware (55-05) | endPoetryBattle reducer nulls activeBattle; middleware must read playerAnswers before next(action) | storeAPI.getState() called before next(action); battle snapshot used for FSRS rewards |
| poetryRewardsMiddleware uses addXP not gainXP (55-05) | playerSlice exports addXP; plan mentioned gainXP but actual action is addXP | storeAPI.dispatch(addXP(50)) — verified against playerSlice.js exports |

### Blockers/Concerns

- v9.0 Phase 46 still in progress (46-02 and 46-03 remain) — v10.0/v11.0 can proceed in parallel but Phase 52 (vocab expansion) must not conflict with Phase 46 output
- Phase 47 (Cinematic Intro) at human-verify checkpoint — needs user to verify 5-beat sequence in-game before v10.0 can be closed out

### Pending Todos

- Post-v8.0: SignPanel + ObjectPanel (React to Phaser NineSlice migration) deferred
- Post-v8.0: kenmi-ui-frames-sheet spritesheet registration in BootScene
- Post-v8.0: Delete inert old placeholder .png files in public/assets/sprites/objects/

## Session Continuity

Last session: 2026-03-21
Stopped at: Phase 55 plan 05 complete — PoetryBattleOverlay + 8 NPC poets + GameLayout + poetryRewardsMiddleware
Resume file: .planning/phases/55-mini-games-content-polish/55-05-SUMMARY.md
Next plan: Phase 56 (next phase after mini-games-content-polish complete)
