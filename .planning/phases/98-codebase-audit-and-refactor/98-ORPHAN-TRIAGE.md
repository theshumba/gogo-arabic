# Phase 98 — Orphan-Module Triage & Wire-In Report

**Date:** 2026-05-29
**Source:** 11-agent triage workflow over the 51 truly-dead modules (from 98-AUDIT.md).
**Refinement:** of the original 101 orphan candidates, 50 were referenced elsewhere
(lazy/registry — already reachable, false positives); 51 were truly dead. Those 51 sorted as:

## ✅ WIRED IN this session (commits 6d9ba41, c4b96bc)
| Module | Home |
|---|---|
| `game/systems/LoadingTips.js` | LoadingScreen — EN/AR tip under progress bar |
| `components/Roots/RootFamilyCard.jsx` | TeacherWordCard — root-family enrichment (self-suppresses) |
| `components/Companions/CompanionUI.jsx` | HUD — 🐾 button → roster overlay |
| `components/Companions/CompanionCommentBubble.jsx` | HUD — listener for already-firing events |
| `components/Social/StatsShareCard.jsx` | PlayerProfile — Share button |
| `components/MiniGames/MiniGameHub.jsx` + CrosswordGame, NumberChallengeGame, WordSearchGame, MemoryMatchGame | new `/mini-games/arcade` route, linked from MiniGamesHub |

## ⏳ WIRE-IN candidates NOT yet done (low/med risk, need a bit more UI work)
| Module | Home | Why deferred |
|---|---|---|
| `game/systems/magic/AffinityTracker.js` | MagicOverlay pre-lock progress meter | needs new UI inside MagicOverlay |
| `components/Review/SentencePractice.jsx` | new route + hub entry | needs a new route wrapper |
| `hooks/useReducedMotion.js` | adopt across framer-motion components | diffuse — incremental a11y adoption, no single mount |

## 🔧 NEEDS DEEP INTEGRATION (real features, but touch core/scene/middleware — own mini-phases)
- `game/systems/HomeDecoration.js` — needs a furniture grid-editor UI + scene entry
- `game/systems/battle/PuzzleBattleManager.js` — needs a puzzle-battle scene + React puzzle UI
- `game/systems/TownKnowledge.js` — needs a knowledge stats panel
- `game/systems/CalendarEvents.js` — needs a tick site + event consumer (partial)
- `game/systems/companions/CompanionDialogueManager.js` — needs a companion dialogue UI + trigger
- `components/Social/ProfileManager.jsx` — implies a multi-profile model the app doesn't surface
- `data/playerTitles.js` — needs a title-grant middleware + UI (overlaps achievements)
- `utils/syncMerge.js` — **belongs to Phase 103 Plan 06** (cloud-save conflict resolver)

## 🗑️ DELETE AS DEAD (18 — confirmed superseded duplicates; for Phase 98 sign-off)
RiddleGate.js, SecretWall.js, world/ZoneManager.js (dup ZoneTransition), BattleActionQueue.js
(dup BattleStateMachine), EconomyFlow.js (dup pricingAgent), EventScriptRunner.js (dup
ActionSetExecutor), GameFeel.js (dup BattleEffectManager/ScreenShake), Battle/BossList.jsx (dup
WorldMap boss nodes), Crafting/CraftingResult.jsx + IngredientSelector.jsx + ProfessionPanel.jsx
(superseded by CraftingMiniGame/RecipeBook), Onboarding/ContextualTip.jsx + FeatureIntroduction.jsx
+ FeatureSuggestion.jsx + onboardingSteps.js (superseded by TutorialHints), UI/FadingArabicText.jsx
(dup TashkeelText), Grammar/grammarStyles.js (pre-CSS-modules), HUD/StatsPanel.jsx (dup HUD strip),
utils/questHelpers.js (dup event hooks), data/audioQuizTypes.js (dup quizTypes.js),
data/factionGatedContent.js (dup factionRewards/factionShops).
→ **Awaiting user sign-off before deletion** (per Phase 98 HEALTH gate).

## 🟡 LEAVE AS-IS (available primitives / documented future infra)
UI/PixelButton.jsx, UI/PixelPanel.jsx, UI/SkeletonLoader.jsx (design-system primitives, no consumer
yet), game/systems/ActorRegistry.js (documented future migration), utils/battleHelpers.js,
utils/worldStateHelpers.js (await a battle-prep / zone-progress UI).

## 🧪 USE IN TESTS ONLY (not game features)
test/factories/{playerFactory,questFactory,vocabularyFactory}.js, utils/achievementTestHelpers.js
(DEV console harness), data/dialogueSchema.js (CI data-integrity test for npc-dialogue JSON).

## Notable secondary finding
`ListeningComprehension.jsx` + `Dictation.jsx` are real, tested components NOT handled in
QuizOverlay's quizType switch — a separate quiz gap worth a follow-up.
