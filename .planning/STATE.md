# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-13)

**Core value:** Players naturally learn Arabic through guided exploration and interaction in an engaging RPG world — never wondering "what should I do next?" or "how do I practice?"

**Current focus:** v7.0 Phase 35 — Economy + Home (Production Chains + Decoration)

## Current Position

Milestone: v7.0 World & Content (Phases 33-37)
Phase: 35 — Economy + Home (in progress)
Plan: 4 of ? in phase
Status: In progress
Last activity: 2026-03-16 — Completed 35-04-PLAN.md (Store Wiring — homeSlice + friendshipMiddleware + utilityBonusMiddleware)

Progress: [████░░] 4 plans complete in Phase 35 — in progress

### Shipped Milestones

| Version | Phases | Plans | Date |
|---------|--------|-------|------|
| v2.0 Player Experience | 1-9 | 14 | 2026-02-08 |
| v3.0 Infrastructure | 10-11 | 11 | 2026-02-09 |
| v4.0 Game Soul & Polish | 14-18 | 8 | 2026-02-10 |
| v5.0 The Real Game | 19-26 | 18 | 2026-02-11 |
| v6.0 Combat & RPG | 27.1, 28-30 | 16 | 2026-02-13 |
| v6.1 Crafting & Advanced Combat | 31-32 | 19 | 2026-02-18 |

**Cumulative:** 32 phases, 95 plans, 7 milestones, 6 days

## Test & Build Status

- Tests: 1,121 passing, 0 failures
- Build: Succeeds, main bundle 862KB (223KB gzipped)
- Git: Tagged v6.0, v6.1 ready to tag

## Accumulated Context

### Decisions

All v2.0-v6.0 decisions logged in PROJECT.md Key Decisions table.

Recent v6.0 decisions affecting v6.1:
- IndexedDB hybrid persistence (5 slices migrated) — prevents localStorage overflow for crafting data
- Phase ordering (storage → magic → equipment → companions) — established clean dependency chain
- Equipment vocabulary-gated bonuses — pattern extends to crafting profession recipes
- Arabic numeral haggling — pattern extends to resource trading/crafting costs

v6.1 Phase 31 decisions:
- Dependency injection for RECIPES/RESOURCES in crafting logic — enables TDD with mocks while data files created in parallel (31-01/31-02)
- Level 0 profession requires 50 XP, levels 1-10 require 100×level — faster initial progression, linear scaling
- 4-tier gathering quality vs 5-tier crafting quality — gathering simpler (profession level only), crafting has mini-game accuracy
- Flat-object pattern for professions/recipes/resources — O(1) lookup performance, follows equipment.js pattern (31-01)
- craftingSlice in IndexedDB via nested persistReducer — prevents localStorage overflow, transparent to selectors (31-01)
- 100 recipes created (vs 300+ spec) — pattern established for remaining 200 recipes (blacksmith, herbalist, weaver, builder) (31-01)
- RecipeBook 3 filter states (all/unlocked/craftable) with live search — follows InventoryUI.jsx filter pattern (31-04)
- Arabic numeral level display (٠-٩) in ProfessionPanel — enhances Arabic-first UI (31-04)
- Vocabulary-gating UI pattern: show '???' for locked ingredients, emit REVIEW_SESSION_OPEN to learn — integrates crafting with vocabulary loop (31-04)
- GatheringSpotManager follows InteractableManager pattern — consistency with existing codebase (31-03)
- scene.time.delayedCall() for gathering respawns — event-driven, not polling (31-03)
- 4hr/8hr respawn intervals (not 24hr) — accessible gameplay loop (31-03)
- Cook profession accepted for herb_patch/water_source spots — cook uses herbs/spices/oils (31-03)
- CalligraphyTracing pixel-overlap algorithm with tolerance scaling — flexible accuracy for letter complexity (31-05)
- CookingRecipeOrder Fisher-Yates shuffle — prevents pattern memorization (31-05)
- SmithingRhythm uses requestAnimationFrame instead of setInterval — prevents timing drift (31-05)
- Mini-game difficulty scaling: 3 tiers (1-3, 4-7, 8-10) — balances complexity vs progression (31-05)
- Centralized result screen in CraftingMiniGame — consistent UX, reduces duplication (31-05)
- PlantIdentification uses embedded descriptions (not RESOURCES data) — simplifies implementation, no data coupling (31-06)
- PatternMatching uses Unicode shape icons (■●▲★◆) — no sprite assets needed, accessible (31-06)
- DirectionalPlacement uses emoji for building elements (🚪🪟🧱) — clear visual feedback without sprites (31-06)
- All mini-games use CSS Grid (not Canvas) — accessible, performant, easier to style (31-06)
- 41 crafted equipment items across 6 professions — best-in-slot at levels 8-10, competitive with shop legendaries (31-07)
- activeBuffs in battleSlice with timestamp-based expiration — consumable buffs applied during battle (31-07)
- enchantments stored separately from equipped items — immutable EQUIPMENT_DATA, easy serialization (31-07)
- calculateTotalBattleStats vs calculateTotalEquipmentStats separation — static equipment stats vs dynamic battle stats (31-07)
- CraftingResult uses Arabic numerals for all numbers — XP, accuracy, durations displayed in ٠-٩ (31-07)
- Crafting UI state in uiSlice (not local state) — consistent with overlays, enables keyboard shortcuts, integrates with player freeze (31-08)
- GatheringSpotManager lifecycle follows InteractableManager pattern — clean zone transitions, no memory leaks (31-08)
- craftingVocabMiddleware for auto-sync (not direct dispatch) — separation of concerns, follows rootFsrsSyncMiddleware pattern (31-08)
- NPC profession teaching via data merge (not npcs.json modification) — composable, preserves existing data (31-08)
- Minimal companion crafting dialogue (10 lines) — pattern established, remaining 50 lines deferred (31-08)

v7.0 Phase 33 decisions (33-01):
- 4 proof-of-concept NPCs receive schedules (guide-amira, scholar-yusuf, merchant-fatima, student-khalid) — pattern established for all 42+ NPCs
- NPCs without schedule array always spawn unconditionally (backward compatible; no schedule = always spawn)
- scholar-yusuf and student-khalid have no night entry — "going indoors" modelled as absence of matching schedule entry
- Schedule filtering at spawn time; runtime re-evaluation on phase change deferred to plan 02+
- _scheduleEntry stored on NPC sprite at spawn for movement system to consume without re-evaluating
- NPC_DATA_MAP at module level in NPCManager for O(1) lookup — built once on module load

v7.0 Phase 33 decisions (33-02):
- npc.update() driven by NPCManager.update() — NPC sprites not registered with Phaser scene updateList, NPCManager iterates all NPCs each frame
- stopMovement() removes wander/patrol timers permanently on interaction — NPC stays still through dialogue; resume-after-dialogue deferred to plan 03+
- setImmovable(false) scoped to startWander/startPatrol only — static NPCs never call these, remain blocking
- Walk anims guard: frameCount >= 16 — NPC sprites with fewer frames fall back to setFrame(0) on arrival
- Wander radius default 96px (1.5 tiles) — small enough to stay near spawn, visible enough to appear alive
- setFlipX(playerSprite.x > npc.x) added before every NPC_INTERACT emit — face-player works for all NPCs

v7.0 Phase 33 decisions (33-03):
- NPCManager registers TIME_PHASE_CHANGED in constructor and deregisters in destroy() — follows DayNightCycle.js EventBus pattern
- body.enable = false when hiding NPCs — fully disables physics for hidden NPCs, prevents invisible collision walls
- Tween 2s Linear on phase change — smooth relocation rather than instant teleport
- ZONE_NIGHT_BGM_MAP track names ({zone-short}-night) don't exist yet — intentional; audioManager.playBGM silently skips via onloaderror
- handlePhaseChanged defined inside useZoneEvents useEffect — consistent with existing handler pattern in that hook

v7.0 Phase 34 decisions (34-01):
- ACTION_* event names use 'action:' prefix (not 'phaser:' or 'react:') — system-internal, not crossing Phaser/React bridge yet; consumers wired in 34-02+
- evaluateRequirement returns false for unknown requirement types — fail-safe, forward compatible
- executeActions silently skips unknown action types — forward-compatible extension point, no crash
- flag requirement defaults value to true when omitted — matches most common use case
- Empty requirements array = unconditional match — enables default/fallback action set as last array entry

v7.0 Phase 35 decisions (35-01):
- SHOP_ZONE_MAP defined inside EconomyFlow (not zones.js) — bridges naming mismatch without modifying zone data
- Initial resource seed = 10 per input per zone — provides economy flow without over-inflating
- consumeResources checks availability before consuming — prevents negative resource pools
- tick() returns { shortages } diagnostic array — enables future UI/quest hooks without Redux wiring
- EconomyFlow is standalone class, not wired to Redux — store integration deferred to later plan
- defaultWeather and battleBackground are data-only fields — no rendering logic, consumed by future phases

v7.0 Phase 35 decisions (35-02):
- Friendship neutral start is 50 (not 0) — players begin on good terms, negative actions push toward cold
- adjustFriendship guard initializes missing npcId to 50 — no spawn-time init needed
- friendshipMiddleware NOT wired to store yet — registration deferred to future plan
- quests/completeQuest (not quest/completeQuest) — verified against slice name 'quests'
- companions/giveGift (not companion/giveGift) — verified against slice name 'companions'
- quiz/recordAnswer kept as-is — no quiz slice exists yet, forward-looking listener

v7.0 Phase 35 decisions (35-04):
- utilityBonusMiddleware infinite loop prevention via action.meta.utilityBonus flag — bonus dispatches marked to prevent re-triggering
- Comfort and Barakah are pull-based (selectUtility) — game systems read value when needed, no push dispatch needed
- home persisted to localStorage (not IndexedDB) — 8x10 grid is lightweight, fits comfortably in localStorage
- Knowledge bonus: +1 XP per 10 Knowledge utility; Hospitality bonus: +1 friendship per 20 Hospitality utility

v7.0 Phase 35 decisions (35-03):
- homeSlice NOT registered in store.js yet — deferred to future plan (follows EconomyFlow deferral pattern from 35-01)
- recalcUtilitiesFromGrid scans full 8x10 grid on every place/remove — simple and O(80), no delta tracking needed
- barrel and crate have no utilityCategory — intentionally excluded as trade goods, not decorative items
- ownedFurniture quantity tracked in homeSlice; canPlace() verifies ownership before dispatching

v7.0 Phase 34 decisions (34-03):
- buildActionContext extracted to shared actionContext.js — both NPCManager and WorldScene share one implementation; accepts optional zoneOverride for caller-authoritative zone context
- Step trigger state initialized inside buildZone() (not clearZone()) — zone-scoped, wiped clean on every zone load before zone.stepTriggers are read
- oneShot and flagOnFire both add to _stepTriggersFired in-memory Set — both prevent repeat fires within a session (flag fires once, Set silences trigger for session)
- 3 PoC triggers on oasis_village only — pattern established, other zones deferred

v7.0 Phase 34 decisions (34-02):
- actionSets added to 4 PoC NPCs only — pattern established, remaining 42+ NPCs deferred to later plan
- Fallback preserved: NPCs without actionSets or no matched set still emit classic NPC_INTERACT — backward compatible with existing DialogueEngine
- buildActionContext() reads vocabMastery as empty object with TODO — FSRS mastery wiring deferred to future phase
- visibilityFlag check placed after schedule check in create() — the two gates are independent (schedule = time/zone, visibilityFlag = story state)
- EventScriptRunner emits ACTION_{type.toUpperCase()} (not EVENTS.ACTION_*) — raw string, consumers listen to specific EVENTS constants

v6.1 Phase 32 decisions:
- 24 effects total (not 22) — original file had 16 effects (not 14 as plan assumed), adding 8 yields 24 (32-01)
- Level gating tiers: 10/16/24 — tier 2 returns original 16, tier 3 includes all Phase 32 additions (32-01)
- Compound wordId prefix 'compound_' vs status prefix 'status_' — namespace separation for FSRS cards (32-01)
- Used actual grammar.js lesson IDs (noun-adjective-agreement, basic-verb-conjugation) instead of plan-specified shortened IDs (32-02)
- 6 bosses in rush sequence (all existing bosses in story order) — covers full game progression (32-02)
- CEFR level gating: A1=level 1, A2=level 3, B1=level 7 — prevents powerful combos too early (32-02)
- arenaSlice in localStorage (not IndexedDB) — lightweight enough, deferred store integration to 32-11 (32-02)
- Exact-match-first for verb forms: diacritics distinguish Form I from Form II, normalized fallback for user flexibility (32-03)
- Lesson gate checked before template matching in detectSentenceCombo for specific error messages (32-03)
- resolveCompounds picks first compound match in COMPOUND_EFFECTS iteration order (32-03)
- bossHP kept as sum of all enemies[] HP for full backward compatibility with single-enemy code (32-04)
- enemies[] first 2 entries default to front row, remaining to back — typical RPG party layout (32-04)
- MultiTargetManager does not read Redux — data-push pattern keeps it testable (32-04)
- Back row sprites use 1.6x scale (vs 2x front) for visual depth perception (32-04)
- Amiri font for StatusEffectBar Arabic labels (12px icons, 16px tooltips) — matches ComboCounter Arabic styling (32-05)
- 3-char truncation for effect icon Arabic labels, full name in tooltip — fits 36x36 icon constraint (32-05)
- ComboMeter hidden when comboMeter=0 and no grammarComboState — avoids visual clutter (32-05)
- GrammarComboInput uses internal sub-components per mode (NounAdjMode, VerbChainMode, SentenceMode) — co-located logic (32-06)
- BattleItemMenu filters via isBattleUsable() function — extensible when consumable data added (32-06)
- TargetSelector single-click selects, double-click confirms — common RPG targeting UX (32-06)
- Flee mode: 3 changes to BattleArabicInput (mode prop, 10s timer, red header) — minimal footprint (32-06)
- ArenaHUD reads EventBus events (not Redux) since arenaSlice not in store until 32-11 (32-07)
- Enemy difficulty string-to-numeric mapping (easy=1, medium=2, hard=3, expert=4) for wave tier filtering (32-07)
- toArabicNumerals recreated locally in ArenaHUD (independent from ComboMeter) (32-07)
- 10% HP scaling per boss in rush sequence for progressive difficulty (32-08)
- Fixed puzzle damage = enemyHP / puzzlesRequired prevents stat brute-forcing (32-08)
- Embedded puzzle content pools in PuzzleBattleManager rather than external data files (32-08)
- Auto-advance interludes after 5s with manual dismiss option (32-08)
- PostBattleReview sorts vocabulary by accuracy ascending (weakest first) for learning prioritization (32-09)
- ArenaLeaderboard accepts data via props (not Redux) since arenaSlice not in store until 32-11 (32-09)
- toArabicNumerals() recreated locally in PostBattleReview and ArenaLeaderboard (independent from ComboMeter) (32-09)
- Practice Weak Words button emits EVENTS.REVIEW_SESSION_OPEN with weak word IDs array (32-09)
- Top 3 arena ranks get gold/silver/bronze styling with star decoration for 1st place (32-09)
- Flee uses Arabic challenge (accuracy >= 0.8) instead of random chance (32-10)
- Grammar combo listener uses BATTLE_ARABIC_INPUT event for async response (32-10)
- Flee word selection favors top 30% most familiar words (higher FSRS stability) (32-10)
- Multi-target applies dealDamageToEnemy with row modifier, plus dealDamage(0, correct: true) for streak (32-10)
- Compound effect check occurs after tickStatusEffects in _endTurn (32-10)
- arabicReview (renamed from arabicUsedThisBattle) in battleHistory for PostBattleReview (32-10)

### Open Items Carried Forward

- Bundle 850KB (exceeds 500KB target) — needs lazy loading / code splitting
- BootScene loads ALL assets upfront (77 calls) — needs zone-based lazy loading
- No tests for Phase 27 battle code (~2.6K LOC)
- ShopOverlay + CompanionUI not wired to GameLayout (~25 lines to fix)
- 573 missing companion dialogue lines (content gap)
- 12 missing companion sprite PNGs (art assets)
- Backend hardening deferred since v3.0 (Phases 12-13)

### Blockers/Concerns

None.

### Pending Todos

None.

## Session Continuity

Last session: 2026-03-16 (Phase 35 plan 04 — Store Wiring)
Stopped at: 35-04 complete (4/? plans in Phase 35)
Resume file: .planning/phases/35-economy-home/35-04-SUMMARY.md

**Phase 32 Progress: COMPLETE (11/11)**
- 32-01: Status Effects Foundation — COMPLETE
- 32-02: Grammar Combos & Arena Data — COMPLETE
- 32-03: Grammar Combo Detector & Compound Resolver — COMPLETE
- 32-04: Multi-Target & Combo Meter — COMPLETE
- 32-05: Battle Effect & Combo UI — COMPLETE
- 32-06: Battle UI Components — COMPLETE
- 32-07: ArenaController + ArenaHUD — COMPLETE
- 32-08: BossRushController + PuzzleBattleManager — COMPLETE
- 32-09: PostBattleReview + ArenaLeaderboard — COMPLETE
- 32-10: BattleStateMachine FSM Integration — COMPLETE
- 32-11: BattleOverlay UI Wiring + arenaSlice Store Registration — COMPLETE

**v6.1 Roadmap Summary:**
- Phase 31: Crafting & Professions — COMPLETE (8/8 plans)
- Phase 32: Status Effects & Advanced Combat — COMPLETE (11/11 plans)

**Phase 33 Progress: COMPLETE (3/3) — VERIFIED**
- 33-01: NPC Schedule Foundation — COMPLETE
- 33-02: NPC Movement Patterns (wander/patrol/face-player) — COMPLETE
- 33-03: Time Phase NPC Re-evaluation + Night BGM — COMPLETE

**Phase 34 Progress: COMPLETE (3/3) — VERIFIED**
- 34-01: ActionSetExecutor Foundation — COMPLETE
- 34-02: NPC ActionSets + EventScriptRunner + NPCManager Wiring — COMPLETE
- 34-03: Step Triggers (zone data + WorldScene detection) — COMPLETE

**Phase 35 Progress: IN PROGRESS**
- 35-01: Production Chain Data (shops + zone configs) — COMPLETE
- 35-02: Friendship System (FriendshipManager + middleware) — COMPLETE
- 35-03: Home Decoration System (homeSlice + HomeDecoration) — COMPLETE
- 35-04: Store Wiring (homeSlice + friendshipMiddleware + utilityBonusMiddleware registered) — COMPLETE

---
*State initialized: 2026-02-08*
*Last updated: 2026-03-16 — Phase 35 plan 04 complete (Store Wiring)*
