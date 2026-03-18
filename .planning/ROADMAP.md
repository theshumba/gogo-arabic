# Roadmap: GoGo Arabic

## Milestones

- ✅ **v2.0 Player Experience Overhaul** — Phases 1-9 (shipped 2026-02-08) → [archive](milestones/v2.0-ROADMAP.md)
- ✅ **v3.0 Infrastructure & Polish** — Phases 10-11 complete, 12-13 deferred (2026-02-09) → [archive](milestones/v3.0-ROADMAP.md)
- ✅ **v4.0 Game Soul & Polish** — Phases 14-18 (shipped 2026-02-10) → [archive](milestones/v4.0-ROADMAP.md)
- ✅ **v5.0 The Real Game** — Phases 19-26 (shipped 2026-02-11) → [archive](milestones/v5.0-ROADMAP.md)
- ✅ **v6.0 Combat & RPG** — Phases 27.1, 28-30 (shipped 2026-02-13) → [archive](milestones/v6.0-ROADMAP.md)
- ✅ **v6.1 Crafting & Advanced Combat** — Phases 31-32 (shipped 2026-02-18) → [archive](milestones/v6.1-ROADMAP.md)
- ✅ **v7.0 World & Content** — Phases 33-37 (shipped 2026-03-16) → [archive](milestones/v7.0-ROADMAP.md)
- ✅ **v8.0 Visual Overhaul** — Phases 38-43 (shipped 2026-03-18)
- 🚧 **v9.0 Content Depth** — Phases 44-46 (in progress)

## Phases

**Phase Numbering:**
- Integer phases (1-32): Planned milestone work
- Decimal phases (27.1): Urgent insertions between phases (marked INSERTED)

<details>
<summary>✅ v2.0 Player Experience Overhaul (Phases 1-9) — SHIPPED 2026-02-08</summary>

- [x] Phase 1: Critical Fixes (2/2 plans) — 2026-02-08
- [x] Phase 2: Player Guidance (2/2 plans) — 2026-02-08
- [x] Phase 3: Feature Discoverability (2/2 plans) — 2026-02-08
- [x] Phase 4: Onboarding & HUD (3/3 plans) — 2026-02-08
- [x] Phase 5: Daily Dashboard (1/1 plan) — 2026-02-08
- [x] Phase 6: World Map Upgrade (1/1 plan) — 2026-02-08
- [x] Phase 7: Player Profile & Stats (1/1 plan) — 2026-02-08
- [x] Phase 8: Visual Polish & Sprites (1/1 plan) — 2026-02-08
- [x] Phase 9: Outfit System (1/1 plan) — 2026-02-08

</details>

<details>
<summary>✅ v3.0 Infrastructure & Polish (Phases 10-11) — PARTIAL 2026-02-09</summary>

- [x] Phase 10: Testing Foundation (6/6 plans) — 2026-02-09
- [x] Phase 11: Architecture Cleanup (5/5 plans) — 2026-02-09
- [ ] Phase 12: Backend Hardening — DEFERRED
- [ ] Phase 13: Visual Polish — DEFERRED

</details>

<details>
<summary>✅ v4.0 Game Soul & Polish (Phases 14-18) — SHIPPED 2026-02-10</summary>

- [x] Phase 14: Bug Fixes & Stability (1/1 plan) — 2026-02-10
- [x] Phase 15: Audio System (2/2 plans) — 2026-02-10
- [x] Phase 16: Visual Juice (2/2 plans) — 2026-02-10
- [x] Phase 17: Progression Clarity (2/2 plans) — 2026-02-10
- [x] Phase 18: World Life (1/1 plan) — 2026-02-10

</details>

<details>
<summary>✅ v5.0 The Real Game (Phases 19-26) — SHIPPED 2026-02-11</summary>

- [x] Phase 19: Infrastructure & Architecture (4/4 plans) — 2026-02-11
- [x] Phase 20: Dialogue System (6/6 plans) — 2026-02-11
- [x] Phase 21: Guided Onboarding & Mentor (1/1 plan) — 2026-02-11
- [x] Phase 22: Buildings & Interiors (3/3 plans) — 2026-02-11
- [x] Phase 23: Interactive Objects & World Life (1/1 plan) — 2026-02-11
- [x] Phase 24: Structured Progression & Gates (1/1 plan) — 2026-02-11
- [x] Phase 25: Vocabulary Integration (1/1 plan) — 2026-02-11
- [x] Phase 26: Narrative Branching & Polish (1/1 plan) — 2026-02-11

</details>

<details>
<summary>✅ v6.0 Combat & RPG (Phases 27.1, 28-30) — SHIPPED 2026-02-13</summary>

- [x] Phase 27.1: IndexedDB Migration (2/2 plans) — 2026-02-12
- [x] Phase 28: Root Magic & Elemental Affinity (4/4 plans) — 2026-02-12
- [x] Phase 29: Equipment, Inventory & Economy (5/5 plans) — 2026-02-12
- [x] Phase 30: Companion System (5/5 plans) — 2026-02-13

</details>

<details>
<summary>✅ v6.1 Crafting & Advanced Combat (Phases 31-32) — SHIPPED 2026-02-18</summary>

**Milestone Goal:** Add crafting professions with Arabic recipes and advanced combat mechanics including status effects, grammar-based combos, and arena challenges.

**Target Features:**
- 6 crafting professions with Arabic recipe names and vocabulary integration
- Status effects system tied to Arabic vocabulary mastery
- Grammar pattern combat combos (sentence structures = attack chains)
- Wave-based arena challenges with progressive difficulty
- Crafting-combat integration (crafted items enhance combat abilities)

#### Phase 31: Crafting & Professions
**Goal**: Players master 6 crafting professions with Arabic recipes that enhance combat

**Depends on**: Phase 30 (companions can teach professions, economy established for crafted goods)

**Requirements**: CRAFT-01, CRAFT-02, CRAFT-03, CRAFT-04, CRAFT-05, CRAFT-06, CRAFT-07, RSRC-01, RSRC-02, RSRC-03, CINT-01, CINT-02, CINT-03, CINT-04

**Success Criteria** (what must be TRUE):
  1. Player can learn and level up 6 crafting professions (خطاط/Calligrapher, طباخ/Cook, حداد/Blacksmith, عطار/Herbalist, نساج/Weaver, بناء/Builder) with Arabic skill names
  2. Player can discover recipes through exploration and NPC teaching, viewing them in RecipeBook UI with Arabic ingredient names
  3. Crafting mini-game requires Arabic vocabulary knowledge — ingredient usable only if word is learned
  4. Player can gather zone-specific resources with Arabic names from respawning gathering spots in the world
  5. Crafted equipment integrates with existing equipment system (can be best-in-slot)
  6. Crafted consumables (food from Cook, potions from Herbalist) provide battle buffs when used in combat
  7. Calligraphy profession creates enchantment scrolls that enhance equipment with Arabic inscriptions
  8. Each profession teaches approximately 50 domain-specific Arabic vocabulary words integrated with FSRS system
  9. Profession mastery contributes to zone reputation and unlocks new NPC dialogue branches

**Plans**: 8 plans in 4 waves

Plans:
- [x] 31-01-PLAN.md — craftingSlice + data files (professions/recipes/resources) + IndexedDB persistence + EventBus events
- [x] 31-02-PLAN.md — TDD crafting logic (quality calc, XP gains, vocab gating, resource checks)
- [x] 31-03-PLAN.md — GatheringSpotManager (Phaser system) + gathering spot data
- [x] 31-04-PLAN.md — RecipeBook + ProfessionPanel + IngredientSelector UI
- [x] 31-05-PLAN.md — Mini-games: CalligraphyTracing + CookingRecipeOrder + SmithingRhythm
- [x] 31-06-PLAN.md — Mini-games: PlantIdentification + PatternMatching + DirectionalPlacement
- [x] 31-07-PLAN.md — Combat integration (crafted equipment, consumable buffs, enchantment scrolls)
- [x] 31-08-PLAN.md — GameLayout wiring + GatheringSpotManager in WorldScene + NPC/companion integration

#### Phase 32: Status Effects & Advanced Combat
**Goal**: Players use Arabic vocabulary to apply status effects, chain grammar combos, and conquer arena challenges

**Depends on**: Phase 31 (crafted consumables used in advanced battles, profession buffs affect combat)

**Requirements**: STAT-01, STAT-02, STAT-03, STAT-04, COMBO-01, COMBO-02, COMBO-03, COMBO-04, COMBO-05, ADVB-01, ADVB-02, ADVB-03, ADVB-04, ADVB-05, ARENA-01, ARENA-02, ARENA-03, ARENA-04

**Success Criteria** (what must be TRUE):
  1. Battle system supports 20+ status effects with Arabic names (حيرة/Confusion, قوة/Strength, سرعة/Speed, حماية/Protection, سم/Poison, صمت/Silence, عمى/Blindness, شجاعة/Courage, حكمة/Wisdom, بركة/Blessing, etc.)
  2. Applying a status effect in battle requires knowing the Arabic vocabulary word
  3. Status effect vocabulary is auto-added to FSRS review queue when first encountered in battle
  4. Status effect combinations create compound effects (e.g., سرعة + قوة = devastating attack bonus)
  5. Player can execute noun+adjective combos (إضافة constructions) by describing targets accurately for bonus damage
  6. Player can chain verb conjugations across forms (Form I → Form II → Form IV) for escalating damage multipliers
  7. Player can construct complete Arabic sentences for ultimate attacks with combo meter tracking
  8. Combo meter displays with Arabic numerals and builds with consecutive correct Arabic answers
  9. Battle system supports multi-target encounters (up to 4 enemies) with front/back row positioning
  10. Player can use crafted battle items (potions, scrolls, food) during combat via item menu
  11. Player can retreat from battle by correctly answering an Arabic question (vocabulary or grammar)
  12. Post-battle review screen shows all Arabic vocabulary and grammar used with accuracy statistics
  13. Player can enter wave-based survival arena with increasing Arabic difficulty each wave
  14. Player can attempt boss rush mode (all bosses sequentially) with story interludes between battles
  15. Puzzle battles require specific Arabic knowledge patterns (not brute-forceable with stats alone)
  16. Arena has a leaderboard tracking player performance metrics and win streaks

**Plans**: 11 plans in 7 waves

Plans:
- [x] 32-01-PLAN.md — Status effects expansion (24 effects + compounds) + FSRS middleware + EventBus constants
- [x] 32-02-PLAN.md — Grammar combo data (noun+adj, verb chains, sentences) + arena challenges + arenaSlice
- [x] 32-03-PLAN.md — TDD: GrammarComboDetector + CompoundEffectResolver
- [x] 32-04-PLAN.md — Multi-target battleSlice (enemies array, combo meter) + MultiTargetManager
- [x] 32-05-PLAN.md — StatusEffectBar + ComboMeter UI components
- [x] 32-06-PLAN.md — GrammarComboInput + BattleItemMenu + TargetSelector + BattleArabicInput flee mode
- [x] 32-07-PLAN.md — ArenaController (wave survival) + ArenaHUD
- [x] 32-08-PLAN.md — BossRushController + PuzzleBattleManager + BossRushInterlude
- [x] 32-09-PLAN.md — PostBattleReview + ArenaLeaderboard
- [x] 32-10-PLAN.md — BattleStateMachine FSM integration + arabicUsedThisBattle capture
- [x] 32-11-PLAN.md — BattleOverlay UI wiring + BattleMenu/BattleResult + arenaSlice store registration

</details>

<details>
<summary>✅ v7.0 World & Content (Phases 33-37) — SHIPPED 2026-03-16</summary>

**Milestone Goal:** Transform Gogo Arabic from a functional prototype into a polished, Pokemon/Zelda-quality RPG. NPCs move and follow schedules, events are data-driven, economy feels alive, quests are clearly tracked, and the game is replayable.

**Source:** Research from 9 open-source game repos (see memory: gogo-arabic-game-patterns.md).

#### Phase 33: Living World (NPC Schedules + Movement)
**Goal**: Make the world feel alive — NPCs move, wander, and follow schedules

**Depends on**: Phase 32 (v6.1 complete — stable NPC/world systems)

**Success Criteria** (what must be TRUE):
  1. NPCs have schedule data (time ranges + zone + location + behavior)
  2. ScheduleEvaluator evaluates NPC schedule based on time, zone, and story flags
  3. NPCManager filters spawns by schedule (only spawn NPCs scheduled for current zone/time)
  4. NPCs exhibit movement patterns: wander, patrol, scripted paths
  5. NPCs face player on interact (flip sprite based on relative position)
  6. TimeSystem triggers schedule re-evaluation on time phase change
  7. Night BGM switches on day/night transition per zone

**Key files**: `npcsEnriched.js`, `NPCManager.js`, `NPC.js`, `TimeSystem.js`, `audioConfig.js`

**Plans**: 3 plans in 3 waves

Plans:
- [x] 33-01-PLAN.md — Schedule data + ScheduleEvaluator + NPCManager spawn filter
- [x] 33-02-PLAN.md — NPC movement patterns (wander/patrol) + face player on interact
- [x] 33-03-PLAN.md — TimeSystem schedule re-evaluation + night ambient BGM switching

#### Phase 34: Data-Driven Events (ActionSets + Event Scripts)
**Goal**: Replace hardcoded NPC logic with pure-data behavior definitions

**Depends on**: Phase 33 (schedule system provides time-aware NPC context)

**Key files**: new `ActionSetExecutor.js`, new `EventScriptRunner.js`, `npcsEnriched.js`, `zones.js`, `WorldScene.js`

**Plans**: 3 plans in 3 waves

Plans:
- [x] 34-01-PLAN.md — ActionSetExecutor + action/requirement types + event constants
- [x] 34-02-PLAN.md — NPC actionSets data + visibilityFlag + EventScriptRunner + NPCManager wiring
- [x] 34-03-PLAN.md — Step triggers in zone data + WorldScene detection

#### Phase 35: Economy + Home (Production Chains + Decoration)
**Goal**: Create a living economy and meaningful player housing

**Depends on**: Phase 34 (events can trigger economic actions, NPC businesses use action sets)

**Key files**: `shops.js`, new `EconomyFlow.js`, `zones.js`, new `HomeDecoration.js`, `furniture.js`, `npcSlice.js`

**Plans**: 4 plans in 3 waves

Plans:
- [x] 35-01-PLAN.md — Production chains on shops + EconomyFlow + zone weather/battle-bg
- [x] 35-02-PLAN.md — Friendship system in npcSlice + friendshipMiddleware
- [x] 35-03-PLAN.md — Home decoration grid + furniture utilities + homeSlice
- [x] 35-04-PLAN.md — Utility bonus middleware + store registration

#### Phase 36: Quest Journal + Audio (Bomber's Notebook + Audio Buses)
**Goal**: Clear quest tracking and immersive audio

**Depends on**: Phase 35 (economy/home provide trackable content for journal)

**Key files**: new `QuestJournal.jsx`, `audioConfig.js`, `audio.js`, new `GameplayStats.js`, `zones.js`

**Plans**: 4 plans in 2 waves

Plans:
- [x] 36-01-PLAN.md — QuestJournal UI (Bomber's Notebook) + NPC schedule viewer + GameLayout wiring
- [x] 36-02-PLAN.md — Bus-based audio + ambient sound layers + continueBGM for buildings
- [x] 36-03-PLAN.md — AutoSave system + GameplayStats tracker + statsSlice
- [x] 36-04-PLAN.md — Sub-zone areas + WorldScene detection + store/system registration

#### Phase 37: Polish + Replay (Randomizer + Settings + Difficulty)
**Goal**: Replayability, accessibility, and professional polish

**Depends on**: Phase 36 (journal/stats provide data for difficulty tuning)

**Key files**: new `VocabRandomizer.js`, `settingsSlice.js`, `migrations.js`, new `CalendarEvents.js`, new `ActorRegistry.js`

**Plans**: 4 plans in 2 waves

Plans:
- [x] 37-01-PLAN.md — VocabRandomizer + difficulty settings in settingsSlice
- [x] 37-02-PLAN.md — CalendarEvents + Town Knowledge Rating
- [x] 37-03-PLAN.md — BattleActionQueue + tiered currency (fils/dirham/dinar)
- [x] 37-04-PLAN.md — Unified ActorRegistry + v7.0 save migrations

</details>

<details>
<summary>✅ v8.0 Visual Overhaul (Phases 38-43) — SHIPPED 2026-03-18</summary>

**Milestone Goal:** Replace all placeholder art with the Kenmi Cute Fantasy 16x16 pixel art bundle, move in-game UI from React DOM overlays into Phaser Canvas, and add Arabic BitmapFont rendering — making the game look like a polished Pokemon/Stardew Valley RPG.

**Asset source:** Kenmi Art — Cute Fantasy RPG bundle (13 packs, ~1,200 PNGs, 16x16 base, commercial license). Assets downloaded to `/tmp/kenmi/`.

**Scope constraint:** Visual-only overhaul. No gameplay logic changes, no new zones, no new NPCs.

#### Phase 38: Asset Pipeline & BootScene
**Goal**: All Kenmi assets are cataloged, organized in the project, and BootScene loads them correctly so every subsequent phase can reference them

**Depends on**: Phase 37 (v7.0 stable baseline)

**Requirements**: PIPE-01, PIPE-02

**Success Criteria** (what must be TRUE):
  1. All 10 Kenmi packs copied to `public/assets/kenmi/` with kebab-case naming and catalog file at src/data/kenmiCatalog.js
  2. BootScene loads all KENMI_CATALOG entries without errors (correct 16x16 frame dims for spritesheets)
  3. Phaser texture cache contains 800+ keys starting with "kenmi-" after BootScene finishes

**Plans**: 2 plans in 2 waves

Plans:
- [x] 38-01-PLAN.md — Copy 10 packs to public/assets/kenmi/ + generate src/data/kenmiCatalog.js
- [x] 38-02-PLAN.md — BootScene loader loop from KENMI_CATALOG + human-verify texture cache

#### Phase 39: Terrain Rendering
**Goal**: Every zone renders real pixel art terrain with biome-correct tilesets, auto-tiled transitions, seeded random variants, and animated water edges instead of flat colored squares

**Depends on**: Phase 38 (Kenmi spritesheets loaded in BootScene)

**Requirements**: TILE-01, TILE-02, TILE-03, TILE-04, TILE-05, TILE-06, TILE-07, TILE-08, TILE-09, TILE-10

**Success Criteria** (what must be TRUE):
  1. All zones render 16x16 Kenmi tiles scaled 4x (64px grid) — no flat colored squares remain anywhere in any zone
  2. Terrain edges auto-tile correctly: sand-to-grass, sand-to-water, and sand-to-cliff transitions show proper transition tiles using 4-neighbor edge detection
  3. Sand terrain displays at least 3 visually distinct tile variants distributed using seeded randomness, so no large area looks uniform
  4. Water shorelines display animated foam tiles from the Kenmi animated water set
  5. Each biome zone uses its correct tileset: desert pack for desert zones, base RPG grass/path for forest/farmland, Christmas snow pack for mountain/snow zones, Dungeon pack for fortress interiors, Volcano pack for lava/rock zones, ShroomLands pack for mushroom zones

**Plans**: 3 plans in 2 waves (39-01 complete from prior session)

Plans:
- [x] 39-01-PLAN.md — Kenmi terrain rendering code (auto-tiling, frame maps, foam) — written but disabled
- [x] 39-02-PLAN.md — Enable Kenmi rendering + BIOME_TILESETS config + tilesetTheme on 8 main zones (TILE-01 thru TILE-07)
- [x] 39-03-PLAN.md — Dungeon/volcano/mushroom biome configs + tilesetTheme on 16 placeholder zones + human verify (TILE-08, TILE-09, TILE-10) — COMPLETE 2026-03-18

#### Phase 40: Buildings & Decorations
**Goal**: Every zone's buildings are replaced with zone-appropriate Kenmi structures and filled with clustered decorative props that create visual density and world identity

**Depends on**: Phase 39 (terrain rendered — buildings and props are placed on top of terrain layer)

**Requirements**: BLDG-01, BLDG-02, BLDG-03, BLDG-04, BLDG-05, BLDG-06, BLDG-07, DECO-01, DECO-02, DECO-03, DECO-04, DECO-05, DECO-06, DECO-07

**Success Criteria** (what must be TRUE):
  1. Oasis Village displays Kenmi desert houses (4 designs x 4 color variants), desert temple structures appear in library/palace zones, and zone-specific building sets (dungeon arches, military tents, mushroom houses) are used in their correct zones — no placeholder rectangle buildings remain
  2. Desert zones contain Kenmi props (cacti, rocks, bones, pots, sacks, rugs, campfires, palm trees, acacia trees) with a minimum of 20 decoration objects per zone
  3. Decoration placement uses clustering: props appear in groups of 2-4 near buildings and along paths rather than uniformly scattered across the map
  4. Animated decorations (grass sway, campfire flicker, water foam, flies) play in-game at the correct locations
  5. Landmark locations (temple entrances, quest sites) have obelisks or golden pots as visual anchors, NPC spawn points have sleeping mats or water sacks nearby, and barren/edge areas of desert zones use dead trees and dead bushes

**Plans**: 3 plans in 2 waves

Plans:
- [x] 40-01-PLAN.md — BIOME_BUILDING_SETS + Kenmi building keys in all 24 zone objects arrays (BLDG-01 through BLDG-07) — COMPLETE 2026-03-18
- [x] 40-02-PLAN.md — Fix + enable scatterDecorations with multi-item crop, clustering near buildings (DECO-01, DECO-02, DECO-06, DECO-07) — COMPLETE 2026-03-18
- [x] 40-03-PLAN.md — Animated campfire/flies decorations + landmark obelisks/golden pots + NPC-adjacent props (DECO-03, DECO-04, DECO-05) — COMPLETE 2026-03-18

#### Phase 41: Characters & Ambient Life
**Goal**: The player and all NPCs, enemies, and ambient animals are replaced with Kenmi pixel art sprites with proper 4-direction walk and idle animations

**Depends on**: Phase 40 (world visuals stable — character sprites are the final layer of world population)

**Requirements**: CHAR-01, CHAR-02, CHAR-03, CHAR-04, CHAR-05, CHAR-06, ANIM-01, ANIM-02, ANIM-03, ANIM-04

**Success Criteria** (what must be TRUE):
  1. The player character uses a Kenmi 16x16 sprite with smooth 4-direction walk animations (no faceless silhouette)
  2. Desert NPCs use Kenmi Desert_Person sprites (4 standard variants, Pharaoh, and 3 Trader variants); non-desert NPCs use base RPG pack premade characters (Chef, Farmer, Fisherman, etc.)
  3. Female NPC sprites have hijab head covering variants — pixel-modified from base sprites — on all female characters across all zones
  4. Enemy encounter sprites use Kenmi Desert Warriors (2 weapon types x 2 variants) and Mummy; all NPC sprites have idle and walk animations loaded from spritesheets
  5. Desert zones contain camels (3 variants), vultures (4 variants), and scarabs (4 color variants) as ambient non-interactive sprites with idle/walk animations that add world life without blocking gameplay

**Plans**: 3 plans in 2 waves

Plans:
- [x] 41-01-PLAN.md — Player sprite replacement with Kenmi knight character (CHAR-01)
- [x] 41-02-PLAN.md — NPC sprite verification + hijab overlay for female NPCs (CHAR-02, CHAR-03, CHAR-05, CHAR-06)
- [x] 41-03-PLAN.md — Enemy Kenmi battle sprites + enable ambient desert animals (CHAR-04, ANIM-01, ANIM-02, ANIM-03, ANIM-04) — COMPLETE 2026-03-18

#### Phase 42: Phaser UI & Arabic BitmapFont
**Goal**: In-game UI elements render natively inside Phaser Canvas using Kenmi UI panels and Pixel AE Arabic BitmapFont — dialogue boxes, interaction prompts, and zone labels no longer use React DOM overlays

**Depends on**: Phase 41 (all world art in place — UI is the final visual layer rendered on top)

**Requirements**: UI-01, UI-02, UI-03, UI-04, UI-05, UI-06, UI-07, ARAB-01, ARAB-02, ARAB-03, ARAB-04

**Success Criteria** (what must be TRUE):
  1. The in-game dialogue box renders inside Phaser Canvas as a NineSlice panel with Kenmi UI frame art, typewriter text effect, and a blinking cursor — the React DOM dialogue overlay is no longer used for in-game conversations
  2. NPC interaction prompts ("Press E") render as Phaser sprites with Kenmi icon art, positioned above NPC sprites in world space — not as DOM overlay elements
  3. Kenmi UI pack frames, bars, and icons are used for in-game health/XP/stamina displays and inventory/quest/map buttons
  4. Arabic text inside Phaser (zone names, NPC labels, sign text) renders correctly using Pixel AE BitmapFont with proper letter joining (js-arabic-reshaper) and right-to-left direction
  5. React overlays (HUD bar, main menu, settings, profile, wardrobe) remain as React components — only in-game elements have moved to Phaser Canvas

**Plans**: 3 plans in 2 waves

Plans:
- [x] 42-01-PLAN.md — Phaser DialogueBox wired to WorldScene + PixelAE Arabic font + ArabicText utility (UI-01, UI-03, UI-06) — COMPLETE 2026-03-18
- [x] 42-02-PLAN.md — NPC Arabic name labels in Phaser + Kenmi PanelFactory + DOM label removal (UI-02, UI-04, UI-05, UI-07) — COMPLETE 2026-03-18
- [x] 42-03-PLAN.md — Arabic-aware DialogueBox + zone name toast (ARAB-01, ARAB-02, ARAB-03, ARAB-04) — COMPLETE 2026-03-18

#### Phase 43: Zone References & Cleanup
**Goal**: Zone data files reference Kenmi sprite keys throughout, a Tiled-compatible export structure exists for future collaborators, and all placeholder sprites are removed from the project

**Depends on**: Phase 42 (full visual overhaul complete — cleanup and handoff structure as final step)

**Requirements**: PIPE-03, PIPE-04, PIPE-05

**Success Criteria** (what must be TRUE):
  1. All zone data files (zones.js, building definitions, NPC spawn data) reference Kenmi sprite keys exclusively — no placeholder keys (tile-sand, tile-grass, placeholder-house, etc.) remain in any data file
  2. A Tiled-compatible JSON map export structure exists at `src/assets/maps/` that documents zone layout, NPC spawn points, interactables, and exits in a format a collaborator could open in Tiled Map Editor
  3. All old placeholder sprite assets are removed from `src/assets/` and no console errors about missing textures appear during any zone load

**Plans**: 2 plans in 2 waves

Plans:
- [x] 43-01-PLAN.md — Replace old placeholder keys in gathering spots, interior zones, InteriorGenerator, InteractableManager (PIPE-03)
- [x] 43-02-PLAN.md — Remove old sprite loads from BootScene + Tiled JSON export + test updates (PIPE-04, PIPE-05)

</details>

### v9.0 Content Depth (Phases 44-46) — In Progress

**Milestone Goal:** Fill the game with substance — rich NPC dialogue grounded in real Islamic Golden Age history, a fleshed-out quest storyline spanning all zones, and vocabulary expansion from 1,220 to 5,000+ words with CEFR tagging, root family groupings, and semantic clusters.

**Coverage:** 16 requirements across 3 phases (DIAL-01 to DIAL-05, QUEST-01 to QUEST-05, VOCAB-01 to VOCAB-06)

#### Phase 44: NPC Dialogue Expansion
**Goal**: Players encounter NPCs with rich, distinct personalities and historically grounded Arabic and Islamic cultural content that makes every conversation feel educational and alive

**Depends on**: Phase 43 (v8.0 visual overhaul complete — NPC sprites and dialogue UI finalized)

**Requirements**: DIAL-01, DIAL-02, DIAL-03, DIAL-04, DIAL-05

**Success Criteria** (what must be TRUE):
  1. All 23 main NPCs have a clearly distinct voice — talking to any two NPCs feels different in tone, humor, and cultural knowledge (no two NPCs share the same personality template)
  2. At least 8 NPCs reference specific verifiable historical facts from the Islamic Golden Age, Silk Road, or House of Wisdom when conversed with
  3. The game contains 1,543+ total dialogue lines (500+ new lines added to the ~1,043 existing baseline)
  4. When a player learns a new vocabulary word through NPC dialogue, a cultural note surfaces showing either its Arabic loanword survival in English or its historical context of use
  5. Words taught by NPCs via teachWord fields are added to the player's FSRS review queue and appear in the next scheduled review session

**Plans**: TBD

Plans:
- [ ] 44-01-PLAN.md — TBD

#### Phase 45: Quest Storylines
**Goal**: Players have a compelling narrative arc to pursue — an 8-act main storyline plus per-zone side content that makes every Arabic learning moment feel purposeful and story-motivated

**Depends on**: Phase 44 (NPC dialogue expanded — quest dialogues build on the same NPC personalities and cultural grounding)

**Requirements**: QUEST-01, QUEST-02, QUEST-03, QUEST-04, QUEST-05

**Success Criteria** (what must be TRUE):
  1. Player can follow an 8-act main storyline as a time-traveling scholar collecting manuscript pages, with each act unlocking in a different zone and advancing through a readable story
  2. Every zone has at least 2 side quests where Arabic learning is woven into the narrative action — not presented as a bare vocabulary task
  3. Each companion NPC has a personal quest available that, on completion, raises their relationship score and adds a batch of zone-specific vocabulary to the player's FSRS queue
  4. Players can discover hidden Arabic inscriptions placed in the world that, when found, teach a root family grouping and add associated words to review
  5. Quest dialogue branches differently based on the player's chosen learning path (Scholar/Traveler/Historian), so the same quest feels contextually appropriate for each path

**Plans**: TBD

Plans:
- [ ] 45-01-PLAN.md — TBD

#### Phase 46: Vocabulary Expansion
**Goal**: The FSRS vocabulary system contains 5,000+ words organized so players always encounter the most useful Arabic first, with every word contextualized by CEFR level, root family, and semantic category

**Depends on**: Phase 45 (quest storylines define which vocabulary clusters matter most per zone — vocabulary expansion fills those clusters)

**Requirements**: VOCAB-01, VOCAB-02, VOCAB-03, VOCAB-04, VOCAB-05, VOCAB-06

**Success Criteria** (what must be TRUE):
  1. vocabularyAll.js contains 5,000+ words (expanded from 1,220 baseline), with no duplicate entries
  2. Every word in the vocabulary review UI displays its CEFR level tag (A1, A2, B1, or B2) alongside the Arabic and English
  3. Root Explorer shows complete root family groupings — searching a trilateral root like ك-ت-ب surfaces all derived forms (كتاب، كاتب، مكتوب، مكتبة) together in one view
  4. Words are browseable by semantic cluster (food, family, travel, nature, body, colors, numbers, etc.) in the vocabulary interface, so a player can study a topic end-to-end
  5. Within each CEFR level, high-frequency words appear before rare ones in new FSRS card generation — a player who just started A2 encounters common words first

**Plans**: TBD

Plans:
- [ ] 46-01-PLAN.md — TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 27.1 → 28 → 29 → 30 → 31 → 32 → 33 → ... → 46

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Critical Fixes | v2.0 | 2/2 | Complete | 2026-02-08 |
| 2. Player Guidance | v2.0 | 2/2 | Complete | 2026-02-08 |
| 3. Feature Discoverability | v2.0 | 2/2 | Complete | 2026-02-08 |
| 4. Onboarding & HUD | v2.0 | 3/3 | Complete | 2026-02-08 |
| 5. Daily Dashboard | v2.0 | 1/1 | Complete | 2026-02-08 |
| 6. World Map Upgrade | v2.0 | 1/1 | Complete | 2026-02-08 |
| 7. Player Profile & Stats | v2.0 | 1/1 | Complete | 2026-02-08 |
| 8. Visual Polish & Sprites | v2.0 | 1/1 | Complete | 2026-02-08 |
| 9. Outfit System | v2.0 | 1/1 | Complete | 2026-02-08 |
| 10. Testing Foundation | v3.0 | 6/6 | Complete | 2026-02-09 |
| 11. Architecture Cleanup | v3.0 | 5/5 | Complete | 2026-02-09 |
| 12. Backend Hardening | v3.0 | — | Deferred | — |
| 13. Visual Polish | v3.0 | — | Deferred | — |
| 14. Bug Fixes & Stability | v4.0 | 1/1 | Complete | 2026-02-10 |
| 15. Audio System | v4.0 | 2/2 | Complete | 2026-02-10 |
| 16. Visual Juice | v4.0 | 2/2 | Complete | 2026-02-10 |
| 17. Progression Clarity | v4.0 | 2/2 | Complete | 2026-02-10 |
| 18. World Life | v4.0 | 1/1 | Complete | 2026-02-10 |
| 19. Infrastructure & Architecture | v5.0 | 4/4 | Complete | 2026-02-11 |
| 20. Dialogue System | v5.0 | 6/6 | Complete | 2026-02-11 |
| 21. Guided Onboarding & Mentor | v5.0 | 1/1 | Complete | 2026-02-11 |
| 22. Buildings & Interiors | v5.0 | 3/3 | Complete | 2026-02-11 |
| 23. Interactive Objects & World Life | v5.0 | 1/1 | Complete | 2026-02-11 |
| 24. Structured Progression & Gates | v5.0 | 1/1 | Complete | 2026-02-11 |
| 25. Vocabulary Integration | v5.0 | 1/1 | Complete | 2026-02-11 |
| 26. Narrative Branching & Polish | v5.0 | 1/1 | Complete | 2026-02-11 |
| 27.1. IndexedDB Migration | v6.0 | 2/2 | Complete | 2026-02-12 |
| 28. Root Magic & Elemental Affinity | v6.0 | 4/4 | Complete | 2026-02-12 |
| 29. Equipment, Inventory & Economy | v6.0 | 5/5 | Complete | 2026-02-12 |
| 30. Companion System | v6.0 | 5/5 | Complete | 2026-02-13 |
| 31. Crafting & Professions | v6.1 | 8/8 | Complete | 2026-02-13 |
| 32. Status Effects & Advanced Combat | v6.1 | 11/11 | Complete | 2026-02-18 |
| 33. Living World (NPC Schedules + Movement) | v7.0 | 3/3 | Complete | 2026-03-16 |
| 34. Data-Driven Events (ActionSets + Event Scripts) | v7.0 | 3/3 | Complete | 2026-03-16 |
| 35. Economy + Home (Production Chains + Decoration) | v7.0 | 4/4 | Complete | 2026-03-16 |
| 36. Quest Journal + Audio (Notebook + Buses) | v7.0 | 4/4 | Complete | 2026-03-16 |
| 37. Polish + Replay (Randomizer + Settings) | v7.0 | 4/4 | Complete | 2026-03-16 |
| 38. Asset Pipeline & BootScene | v8.0 | 2/2 | Complete | 2026-03-16 |
| 39. Terrain Rendering | v8.0 | 3/3 | Complete | 2026-03-18 |
| 40. Buildings & Decorations | v8.0 | 3/3 | Complete | 2026-03-18 |
| 41. Characters & Ambient Life | v8.0 | 3/3 | Complete | 2026-03-18 |
| 42. Phaser UI & Arabic BitmapFont | v8.0 | 3/3 | Complete | 2026-03-18 |
| 43. Zone References & Cleanup | v8.0 | 2/2 | Complete | 2026-03-18 |
| 44. NPC Dialogue Expansion | v9.0 | 0/TBD | Not started | — |
| 45. Quest Storylines | v9.0 | 0/TBD | Not started | — |
| 46. Vocabulary Expansion | v9.0 | 0/TBD | Not started | — |

**Cumulative:** 43 phases shipped (v8.0 complete), 127+ plans complete, 8 milestones shipped

---
*Roadmap created: 2026-02-08*
*Last updated: 2026-03-18 — v9.0 roadmap added (Phases 44-46, 16 requirements mapped)*
