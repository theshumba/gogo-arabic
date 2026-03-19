# Pitfalls Research — v11.0 Deep Systems & Content Engine

**Researched:** 2026-03-19 | **Confidence:** HIGH

## Critical Pitfalls

### 1. inkjs Migration — Big-Bang Replacement Risk
**Pitfall:** Migrating all 23 NPCs + 142 objects from JSON to ink at once breaks everything.
**Prevention:** Adapter pattern — InkDialogueEngine checks for .ink.json, falls back to legacy JSON. Pilot 5 NPCs first, batch-migrate rest after verification.
**Phase impact:** inkjs phase must include adapter pattern.

### 2. Bundle Regression After Optimization
**Pitfall:** Optimize to 500KB, then add inkjs (120KB) + calligraphy + poetry + 5K words → back to 700KB+.
**Prevention:** Bundle optimization is Phase 1. Every subsequent phase includes `npm run build` size check. inkjs, calligraphy, poetry all lazy-loaded.
**Phase impact:** Every phase plan must verify bundle size.

### 3. World State Naming Chaos
**Pitfall:** 500+ flags with inconsistent names become unmaintainable.
**Prevention:** Enforce `{zone}_{action}_{target}` convention. Create WORLD_STATE_KEYS constants. All reads via typed selectors.
**Phase impact:** World state phase must include constants file.

### 4. inkjs-Redux Sync Race Conditions
**Pitfall:** ink variablesState and Redux get out of sync during dialogue.
**Prevention:** Sync is always Redux→ink (before dialogue) and ink→Redux (after dialogue ends). Never read Redux mid-dialogue from ink. Batch dispatch after each segment.
**Phase impact:** inkjs plan must specify sync timing.

### 5. Faction Gating Soft-Locks
**Pitfall:** Faction choice locks player out of items needed for main quest.
**Prevention:** Faction gates affect BONUS content only. Main storyline completable at faction score 0. Test every main quest with all factions at 0.
**Phase impact:** Faction phase includes faction-agnostic main quest test.

### 6. Vocabulary Expansion Duplicates
**Pitfall:** 5,000+ words with duplicates, broken root links, or CEFR errors break FSRS.
**Prevention:** Dedup script on `arabic` field. Root family validation. CEFR tag check against frequency lists. Build-time validation (like existing Zod dialogue check).
**Phase impact:** Vocab phase includes validation script.

### 7. BootScene Lazy Loading — Zone Stutters
**Pitfall:** Zone-based loading causes missing textures on first zone entry.
**Prevention:** Zone transition loading screen (exists in v4.0). Preload adjacent zones during gameplay. Shared assets (player, UI, common NPCs) stay in initial load.
**Phase impact:** Bundle phase defines shared vs zone-specific assets.

### 8. Dynamic Market Exploitation
**Pitfall:** Buy-low-sell-high loop between zones = infinite gold.
**Prevention:** Price floors (50%) and ceilings (200%). Sell-back always lower than buy. Slow supply regen (once per rest). Gold cap warning event.
**Phase impact:** Market phase includes price caps and exploitation test.

### 9. Calligraphy Letter Form Complexity
**Pitfall:** Arabic letters have 4 positional forms (28×4=112 patterns, not 28).
**Prevention:** Start with isolated forms only (28). Add positional forms as stretch goal. Use js-arabic-reshaper for form detection.
**Phase impact:** Calligraphy phase targets isolated forms first.

### 10. Untested Battle Code (~2.6K LOC)
**Pitfall:** Poetry battles built on untested combat code. Bugs invisible.
**Prevention:** Add battle code tests as prerequisite before poetry battles. Min: BattleStateMachine, GrammarComboDetector, StatusEffectBar tests.
**Phase impact:** Poetry phase Wave 1 = battle test coverage.

## Medium-Risk Pitfalls

### 11. Gossip Token Spam
NPCs repeat same gossip. Prevention: 3-day expiry, max 2 tokens/NPC, `heard` flag.

### 12. Learning Path Shallow Differentiation
Paths feel identical. Prevention: Min 200 words differ in first-encounter order. 3 exclusive side quests per path.

### 13. Poetry Content Copyright
Using copyrighted poems. Prevention: Public domain classical poetry only (pre-1900). 10 curated poems to start.

### 14. Tashkeel Ambiguity Edge Cases
Removing diacritics from ambiguous words. Prevention: `ambiguous: true` tag. Ambiguous words keep tashkeel always.
