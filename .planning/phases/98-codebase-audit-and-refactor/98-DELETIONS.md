# Phase 98 Plan 01 — Deletion Candidate Ledger

**Date:** 2026-05-29  **Commit:** 0e6189f

> **HOW TO USE:** each row is a *candidate*, not a confirmed deletion. Orphan detection (zero internal importers, non-entry) has false positives — a module may be lazy-loaded via a computed path, referenced in a registry/map, or a genuine entry point. **Verify each before approving.** Tick Approved only after confirming it is truly unreferenced. No deletion happens without your sign-off (HEALTH gate).

**101 orphaned-module candidates** (zero internal importers). Already-confirmed dead this session: `StatsPanel.jsx` chain (handled in commit 8b93304).

### src/components/Analytics (1)

- [ ] `src/components/Analytics/ExpandedAnalyticsDashboard.jsx` — Approved / Rejected

### src/components/Battle (2)

- [ ] `src/components/Battle/ArenaLeaderboard.jsx` — Approved / Rejected
- [ ] `src/components/Battle/BossList.jsx` — Approved / Rejected

### src/components/Companions (2)

- [ ] `src/components/Companions/CompanionCommentBubble.jsx` — Approved / Rejected
- [ ] `src/components/Companions/CompanionUI.jsx` — Approved / Rejected

### src/components/Crafting (3)

- [ ] `src/components/Crafting/CraftingResult.jsx` — Approved / Rejected
- [ ] `src/components/Crafting/IngredientSelector.jsx` — Approved / Rejected
- [ ] `src/components/Crafting/ProfessionPanel.jsx` — Approved / Rejected

### src/components/Grammar (1)

- [ ] `src/components/Grammar/grammarStyles.js` — Approved / Rejected

### src/components/HUD (1)

- [ ] `src/components/HUD/StatsPanel.jsx` — Approved / Rejected

### src/components/Idioms (3)

- [ ] `src/components/Idioms/DailyIdiom.jsx` — Approved / Rejected
- [ ] `src/components/Idioms/IdiomExplorer.jsx` — Approved / Rejected
- [ ] `src/components/Idioms/IdiomQuiz.jsx` — Approved / Rejected

### src/components/MiniGames (4)

- [ ] `src/components/MiniGames/CrosswordGame.jsx` — Approved / Rejected
- [ ] `src/components/MiniGames/MemoryMatchGame.jsx` — Approved / Rejected
- [ ] `src/components/MiniGames/NumberChallengeGame.jsx` — Approved / Rejected
- [ ] `src/components/MiniGames/WordSearchGame.jsx` — Approved / Rejected

### src/components/Onboarding (4)

- [ ] `src/components/Onboarding/ContextualTip.jsx` — Approved / Rejected
- [ ] `src/components/Onboarding/FeatureIntroduction.jsx` — Approved / Rejected
- [ ] `src/components/Onboarding/FeatureSuggestion.jsx` — Approved / Rejected
- [ ] `src/components/Onboarding/onboardingSteps.js` — Approved / Rejected

### src/components/Phonetics (3)

- [ ] `src/components/Phonetics/MinimalPairChallenge.jsx` — Approved / Rejected
- [ ] `src/components/Phonetics/PhoneticsGuide.jsx` — Approved / Rejected
- [ ] `src/components/Phonetics/PronunciationChallenge.jsx` — Approved / Rejected

### src/components/Quiz (2)

- [ ] `src/components/Quiz/Dictation.jsx` — Approved / Rejected
- [ ] `src/components/Quiz/ListeningComprehension.jsx` — Approved / Rejected

### src/components/Review (1)

- [ ] `src/components/Review/SentencePractice.jsx` — Approved / Rejected

### src/components/Roots (1)

- [ ] `src/components/Roots/RootFamilyCard.jsx` — Approved / Rejected

### src/components/Social (3)

- [ ] `src/components/Social/LeaderboardPanel.jsx` — Approved / Rejected
- [ ] `src/components/Social/ProfileManager.jsx` — Approved / Rejected
- [ ] `src/components/Social/StatsShareCard.jsx` — Approved / Rejected

### src/components/UI (5)

- [ ] `src/components/UI/FadingArabicText.jsx` — Approved / Rejected
- [ ] `src/components/UI/PauseMenu.jsx` — Approved / Rejected
- [ ] `src/components/UI/PixelButton.jsx` — Approved / Rejected
- [ ] `src/components/UI/PixelPanel.jsx` — Approved / Rejected
- [ ] `src/components/UI/SkeletonLoader.jsx` — Approved / Rejected

### src/data/audioQuizTypes.js (1)

- [ ] `src/data/audioQuizTypes.js` — Approved / Rejected

### src/data/battleOpponents.js (1)

- [ ] `src/data/battleOpponents.js` — Approved / Rejected

### src/data/companionBackstories.js (1)

- [ ] `src/data/companionBackstories.js` — Approved / Rejected

### src/data/conversationScenariosExpanded.js (1)

- [ ] `src/data/conversationScenariosExpanded.js` — Approved / Rejected

### src/data/culturalTrivia.js (1)

- [ ] `src/data/culturalTrivia.js` — Approved / Rejected

### src/data/dialogueSchema.js (1)

- [ ] `src/data/dialogueSchema.js` — Approved / Rejected

### src/data/factionGatedContent.js (1)

- [ ] `src/data/factionGatedContent.js` — Approved / Rejected

### src/data/factionShops.js (1)

- [ ] `src/data/factionShops.js` — Approved / Rejected

### src/data/grammarRules.js (1)

- [ ] `src/data/grammarRules.js` — Approved / Rejected

### src/data/linguisticAbilities.js (1)

- [ ] `src/data/linguisticAbilities.js` — Approved / Rejected

### src/data/mainQuestline.js (1)

- [ ] `src/data/mainQuestline.js` — Approved / Rejected

### src/data/npcBackstories.js (1)

- [ ] `src/data/npcBackstories.js` — Approved / Rejected

### src/data/npcContextDialogue.js (1)

- [ ] `src/data/npcContextDialogue.js` — Approved / Rejected

### src/data/npcDialogueExpansion.js (1)

- [ ] `src/data/npcDialogueExpansion.js` — Approved / Rejected

### src/data/npcSchedules.js (1)

- [ ] `src/data/npcSchedules.js` — Approved / Rejected

### src/data/playerTitles.js (1)

- [ ] `src/data/playerTitles.js` — Approved / Rejected

### src/data/readingPassagesExpanded.js (1)

- [ ] `src/data/readingPassagesExpanded.js` — Approved / Rejected

### src/data/sideQuestChains.js (1)

- [ ] `src/data/sideQuestChains.js` — Approved / Rejected

### src/data/themedVocabSets.js (1)

- [ ] `src/data/themedVocabSets.js` — Approved / Rejected

### src/data/vocabCollections.js (1)

- [ ] `src/data/vocabCollections.js` — Approved / Rejected

### src/data/zoneBosses.js (1)

- [ ] `src/data/zoneBosses.js` — Approved / Rejected

### src/game/objects (2)

- [ ] `src/game/objects/RiddleGate.js` — Approved / Rejected
- [ ] `src/game/objects/SecretWall.js` — Approved / Rejected

### src/game/systems (16)

- [ ] `src/game/systems/ActorRegistry.js` — Approved / Rejected
- [ ] `src/game/systems/BattleActionQueue.js` — Approved / Rejected
- [ ] `src/game/systems/CalendarEvents.js` — Approved / Rejected
- [ ] `src/game/systems/EconomyFlow.js` — Approved / Rejected
- [ ] `src/game/systems/EventScriptRunner.js` — Approved / Rejected
- [ ] `src/game/systems/GameFeel.js` — Approved / Rejected
- [ ] `src/game/systems/HomeDecoration.js` — Approved / Rejected
- [ ] `src/game/systems/LoadingTips.js` — Approved / Rejected
- [ ] `src/game/systems/TownKnowledge.js` — Approved / Rejected
- [ ] `src/game/systems/VocabRandomizer.js` — Approved / Rejected
- [ ] `src/game/systems/battle/ArenaController.js` — Approved / Rejected
- [ ] `src/game/systems/battle/BossRushController.js` — Approved / Rejected
- [ ] `src/game/systems/battle/PuzzleBattleManager.js` — Approved / Rejected
- [ ] `src/game/systems/companions/CompanionDialogueManager.js` — Approved / Rejected
- [ ] `src/game/systems/magic/AffinityTracker.js` — Approved / Rejected
- [ ] `src/game/systems/world/WorldSnapshot.js` — Approved / Rejected

### src/hooks/useReducedMotion.js (1)

- [ ] `src/hooks/useReducedMotion.js` — Approved / Rejected

### src/services/api.js (1)

- [ ] `src/services/api.js` — Approved / Rejected

### src/services/curriculumDashboard.js (1)

- [ ] `src/services/curriculumDashboard.js` — Approved / Rejected

### src/services/miniGameScaler.js (1)

- [ ] `src/services/miniGameScaler.js` — Approved / Rejected

### src/services/npcRelationshipService.js (1)

- [ ] `src/services/npcRelationshipService.js` — Approved / Rejected

### src/services/questGenerator.js (1)

- [ ] `src/services/questGenerator.js` — Approved / Rejected

### src/services/teachingSession.js (1)

- [ ] `src/services/teachingSession.js` — Approved / Rejected

### src/store/middleware (4)

- [ ] `src/store/middleware/companionXpMiddleware.js` — Approved / Rejected
- [ ] `src/store/middleware/progressSnapshotMiddleware.js` — Approved / Rejected
- [ ] `src/store/middleware/skillTreeXpMiddleware.js` — Approved / Rejected
- [ ] `src/store/middleware/vocabRateMiddleware.js` — Approved / Rejected

### src/store/selectors (1)

- [ ] `src/store/selectors/selectQuestVocabMet.js` — Approved / Rejected

### src/test/factories (3)

- [ ] `src/test/factories/playerFactory.js` — Approved / Rejected
- [ ] `src/test/factories/questFactory.js` — Approved / Rejected
- [ ] `src/test/factories/vocabularyFactory.js` — Approved / Rejected

### src/test/testUtils.jsx (1)

- [ ] `src/test/testUtils.jsx` — Approved / Rejected

### src/utils/achievementTestHelpers.js (1)

- [ ] `src/utils/achievementTestHelpers.js` — Approved / Rejected

### src/utils/adaptiveQuizPool.js (1)

- [ ] `src/utils/adaptiveQuizPool.js` — Approved / Rejected

### src/utils/battleHelpers.js (1)

- [ ] `src/utils/battleHelpers.js` — Approved / Rejected

### src/utils/conversationScoring.js (1)

- [ ] `src/utils/conversationScoring.js` — Approved / Rejected

### src/utils/questHelpers.js (1)

- [ ] `src/utils/questHelpers.js` — Approved / Rejected

### src/utils/questMarkerEngine.js (1)

- [ ] `src/utils/questMarkerEngine.js` — Approved / Rejected

### src/utils/spellDiscoveryEngine.js (1)

- [ ] `src/utils/spellDiscoveryEngine.js` — Approved / Rejected

### src/utils/syncMerge.js (1)

- [ ] `src/utils/syncMerge.js` — Approved / Rejected

### src/utils/worldStateHelpers.js (1)

- [ ] `src/utils/worldStateHelpers.js` — Approved / Rejected

### src/world/ZoneManager.js (1)

- [ ] `src/world/ZoneManager.js` — Approved / Rejected

