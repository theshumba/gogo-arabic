# Project Research Summary

**Project:** Gogo Arabic — v11.0 Deep Systems & Content Engine
**Domain:** Arabic Learning RPG (React 19 + Phaser 3 + Redux Toolkit + Express 5 + MongoDB)
**Researched:** 2026-03-19
**Confidence:** HIGH (stack verified against live codebase; patterns confirmed from 17 existing slices and 196K LOC precedent)

## Executive Summary

Gogo Arabic v11.0 adds 13 new systems to a 196K+ LOC production codebase. The existing stack handles the vast majority of these additions without new libraries — three new Redux slices, two middleware, and three new Phaser systems cover the core game-state and world-life requirements. The only genuinely new npm dependency required is `inkjs` (v2.4.0, for narrative scripting), alongside a dev-only bundle analysis tool. Every other proposed dependency — XState, Fabric.js, AceBase, React Query — either conflicts with existing architecture, adds bundle cost without net benefit, or is fully replaceable by patterns already proven in the codebase. The key insight from research is that the codebase's existing patterns (Redux slices, EventBus, ActionSetExecutor, IndexedDB hybrid persist) are sufficient infrastructure for all 13 systems.

The dependency graph for v11.0 has a clear critical path. The `worldStateSlice` (500+ flags) is the root dependency: inkjs integration, faction reputation, NPC gossip, and learning path all write to it. This forces a foundation-first build order. Bundle optimization must also run first — adding inkjs (120KB), calligraphy, poetry, and 5,000+ vocabulary words on top of the current 862KB bundle without a pre-phase optimization pass would produce an unshippable product. Content gap resolution (573 missing NPC dialogue lines) should be tackled early so subsequent systems have dialogue to integrate with.

The primary risks are architectural, not feature-level. inkjs introduces a bidirectional state sync with Redux that can produce race conditions if timing rules are violated. The DialogueEngine.js replacement must use an adapter pattern (fallback to legacy JSON) rather than big-bang migration across all 23 NPCs. Bundle regressions after the optimization phase are a documented risk — every subsequent phase plan must include a build size check. Faction gating introduces soft-lock risk if main quest progression is ever tied to faction scores; faction gates must be restricted to bonus content only.

## Key Findings

### Recommended Stack

The existing stack (React 19 + Phaser 3 + Redux Toolkit + Vite 7) is sufficient for all v11.0 systems. Install `inkjs@^2.4.0` (narrative scripting engine, zero dependencies, browser-compatible ESM) and `rollup-plugin-visualizer@^5.12.0` (dev-only, bundle treemap analysis). All other systems use existing primitives: plain Redux slices for world state and faction reputation, Phaser 3 Graphics API for calligraphy letter tracing, and the existing FSRS + quiz infrastructure for poetry battles.

**Critical installation finding:** `inkjs` and `acebase` are described as installed in the milestone context but are NOT present in `node_modules` or `package.json`. `inkjs` must be installed before any dialogue-related phase. AceBase is deferred — its 200-300KB bundle cost conflicts with the 862KB → 500KB optimization target, and its role (live object sync) is fully covered by the existing IndexedDB hybrid persistence plus `worldStateSlice`.

**Core technologies:**
- `inkjs` v2.4.0: narrative dialogue scripting — replaces unmaintainable hardcoded JSON NPC trees with declarative `.ink` files; bridges to Redux via `variablesState` and `BindExternalFunction`
- `rollup-plugin-visualizer` v5.12.0: bundle diagnosis — required to identify which modules account for the 862KB before optimization can proceed intelligently
- Redux Toolkit `createSlice`: world state machine, faction reputation, poetry battles — 17 existing slices prove the pattern scales to 500+ variables without external state machine libraries
- Phaser 3 Graphics API: calligraphy mini-game stroke capture and scoring — avoids second canvas renderer conflict that Fabric.js or Atrament would create
- IndexedDB hybrid persist (existing, redux-persist): persistence for all 3 new slices — proven in production for 5 slices since v6.0

**What NOT to add:** XState (60KB, FSM modeling unneeded for flat flag store), Fabric.js/Atrament (second canvas renderer), AceBase (200-300KB, third persistence layer, single maintainer), React Query/SWR (overkill with existing `createAsyncThunk` patterns), react-konva (React-canvas bridge unnecessary inside Phaser context).

### Expected Features

**Must have (table stakes) — v11.0 ships these:**
- World state machine (500+ Redux flags/counters) — every other v11.0 feature depends on it
- Bundle optimization (862KB → 500KB) — current initial load is unresponsive on mobile; must resolve before adding more systems
- 573 missing NPC dialogue lines — content gaps make existing NPCs feel broken; earliest possible fix
- inkjs dialogue migration — 80+ lines of hardcoded JSON per NPC is unmaintainable; pilot 5 NPCs, adapter fallback to legacy JSON
- Learning path system (Scholar/Traveler/Historian) — v4.0 UI exists, wire FSRS queue reordering logic
- Faction reputation engine (6 factions, 0-100, threshold gating) — core differentiator, vocabulary-domain differentiation
- Vocabulary expansion (1,220 → 5,000+) — prerequisite for meaningful learning path differentiation and poetry battles

**Should have (differentiators) — complete v11.0:**
- Calligraphy mini-game (28 letters, Phaser stroke capture, Frechet distance scoring) — unique among Arabic learning apps, pedagogically proven
- Arabic poetry battles (fill-in-blank, vs NPC poet, classical Arabic) — unique in language gaming; plugs into existing Word Duel infrastructure
- NPC gossip system (gossip tokens from EventBus, ink dialogue surfacing) — world-life differentiator; requires inkjs + state machine
- Environmental storytelling (20 inscriptions/scrolls as ink interactions) — contextual reading practice; low content overhead per object
- Progressive tashkeel refinement (ambiguity tagging + context-sensitive fading upgrade) — builds on proven v2.0 mechanic
- Dynamic market simulation (supply/demand pricing, faction modifier) — world-life differentiator; no language app does agent-based NPC pricing

**Defer to v12.0:**
- AceBase realtime sync — current IndexedDB hybrid works; AceBase adds bundle cost and single-maintainer risk without solving a documented user pain
- Vocabulary-gated zones (enhanced UI with gap count) — current gates work; enhancement is polish, not blocking

### Architecture Approach

Three new Redux slices (`worldStateSlice`, `factionSlice`, `poetrySlice`) plus two middleware (`factionMiddleware`, `worldStateMiddleware`) handle all game-state requirements. Three new Phaser systems (`InkDialogueEngine`, `CalligraphyScene`, `GossipManager`) extend the existing scene hierarchy. The inkjs integration follows a strict bidirectional sync protocol: Redux state injected into `story.variablesState` before dialogue, ink variable mutations dispatched back to Redux after dialogue ends — never mid-dialogue. The DialogueEngine.js replacement uses an adapter pattern: check for `.ink.json` first, fall back to legacy JSON, enabling incremental NPC migration without breaking existing content. Six existing files require modification: `DialogueEngine.js`, `ActionSetExecutor.js`, `NPCManager.js`, `InteractableManager.js`, `BootScene.js`, `vite.config.js`, `vocabularyAll.js`, `EconomyFlow.js`.

**Major components:**
1. `InkDialogueEngine` — wraps inkjs Story, exposes `advance()` / `getChoices()` / `jumpToKnot()`, bridges Redux via `variablesState` and `BindExternalFunction`; adapter fallback to legacy JSON
2. `worldStateSlice` + `factionSlice` — flat key-value stores for 500+ world flags and 6 faction scores respectively; IndexedDB-persisted; strict `{zone}_{action}_{target}` naming convention enforced via `WORLD_STATE_KEYS` constants file
3. `GossipManager` — gossip token creation from EventBus events, propagation to NPCs with relationship >= 25, 3-day expiry, ink dialogue surfacing
4. `CalligraphyScene` — separate lazy-loaded Phaser scene with pointer-path capture, Frechet distance scoring against reference Bezier paths, 3-star feedback
5. `PricingAgent` — pure JavaScript supply/demand model per shop (not a library); price = base x (maxSupply/currentSupply) x factionModifier; price floors 50%, ceilings 200%

### Critical Pitfalls

1. **inkjs big-bang migration** — migrating all 23 NPCs at once breaks everything. Prevention: adapter pattern with `.ink.json` check + legacy JSON fallback; pilot 5 NPCs first, batch-migrate after verification.
2. **Bundle regression after optimization** — adding inkjs (120KB) + calligraphy + poetry + 5K words post-optimization recovers all lost savings. Prevention: bundle optimization is Phase 1; every subsequent phase plan must include `npm run build` size check; inkjs, CalligraphyScene, poetry all lazy-loaded.
3. **World state naming chaos** — 500+ flags with inconsistent names become unmaintainable. Prevention: `{zone}_{action}_{target}` convention enforced from day one; `WORLD_STATE_KEYS` constants file; all reads via typed selectors.
4. **Faction gating soft-locks** — faction choice locks player out of main quest items. Prevention: faction gates affect bonus content only; main storyline completable at faction score 0; test every main quest with all factions at 0.
5. **inkjs-Redux sync race conditions** — `story.variablesState` and Redux get out of sync during dialogue segments. Prevention: sync direction is always Redux to ink (before dialogue) then ink to Redux (after dialogue ends); never read Redux mid-dialogue from ink; batch dispatch after each segment.
6. **BootScene lazy loading stutters** — zone-based asset loading causes missing textures on first zone entry. Prevention: shared assets (player, UI, common NPCs) remain in initial load; zone transition loading screen handles deferred loads; preload adjacent zones during gameplay.
7. **Untested battle code (~2.6K LOC)** — poetry battles built on untested combat code makes bugs invisible. Prevention: battle code tests (BattleStateMachine, GrammarComboDetector, StatusEffectBar) are a prerequisite Wave 1 for the poetry battles phase.

## Implications for Roadmap

Based on research, the dependency graph forces a 6-phase build order. The critical path runs through world state, then inkjs, then faction, then world life systems, then mini-games. Phases N+0 and N+1 are blockers for everything downstream.

### Phase N+0: Infrastructure Baseline
**Rationale:** World state machine is the root dependency for inkjs, factions, gossip, and learning path. Bundle optimization must precede all feature additions to prevent regression. Neither can be deferred.
**Delivers:** `worldStateSlice` (500+ flags, IndexedDB-persisted, `WORLD_STATE_KEYS` constants), `factionSlice` (6 factions), `worldStateMiddleware`, bundle optimization (Vite manualChunks + BootScene lazy loading + `rollup-plugin-visualizer`), initial bundle under 500KB.
**Addresses:** World state machine, bundle optimization (both P1 table stakes)
**Avoids:** World state naming chaos (constants file); bundle regression (optimization first); zone stutter (shared vs zone-specific asset split defined here)
**Stack note:** Install `inkjs@^2.4.0` and `rollup-plugin-visualizer@^5.12.0` — both are NOT in package.json despite milestone context claiming otherwise.

### Phase N+1: Dialogue Foundation
**Rationale:** inkjs needs the state machine (Phase N+0). Dialogue content (573 lines) should be filled while migrating the engine so writers work in the new system from the start. Learning path wires into FSRS queue reordering — minimal new infrastructure, just logic.
**Delivers:** `InkDialogueEngine` with adapter fallback; 5-NPC pilot migration to `.ink.json`; 573 missing NPC dialogue lines filled; learning path FSRS queue reordering wired (v4.0 UI already exists); incremental batch migration plan for remaining 18 NPCs.
**Addresses:** inkjs migration (P1), 573 missing dialogue (P1), learning path system (P1)
**Avoids:** inkjs big-bang migration risk (adapter pattern + pilot); inkjs-Redux sync race conditions (sync timing protocol)

### Phase N+2: Vocabulary Expansion
**Rationale:** 1,220 to 5,000+ words is a prerequisite for learning path differentiation to feel meaningful and for poetry battles to have sufficient word candidates. Running this phase before factions allows faction-specific word tagging to be done in one pass.
**Delivers:** 5,000+ words with domain tags (Scholar/Traveler/Historian affinity), CEFR tags, root families, and ambiguity flags; build-time dedup + validation script; vocabulary chunk stays below 150KB.
**Addresses:** Vocabulary expansion (P1), progressive tashkeel ambiguity tags
**Avoids:** Vocabulary duplication/broken root links (validation script); vocabulary chunk size regression

### Phase N+3: Faction Reputation Engine
**Rationale:** Faction system requires world state (N+0) and inkjs (N+1) — faction-gated dialogue branches are authored in ink. Dynamic market requires faction scores as a modifier, so factions must precede market.
**Delivers:** `factionSlice` wired to `ActionSetExecutor` (new `factionRequired` requirement type); `factionMiddleware`; 6 factions with 0-100 scale, tier thresholds, and content gating at 25/50/75/100; Merchant + Scholar factions launch first; faction-gated dialogue in ink.
**Addresses:** Faction reputation engine (P1 differentiator)
**Avoids:** Faction gating soft-locks (bonus-content-only gating rule; main quest faction-0 test)

### Phase N+4: World Life Systems
**Rationale:** Dynamic market requires factions (N+3). NPC gossip requires inkjs (N+1) and state machine (N+0). Environmental storytelling requires inkjs and existing interactive objects. All three are world-life differentiators that compound each other — grouping them delivers a cohesive "world feels alive" milestone.
**Delivers:** `PricingAgent` supply/demand model in `EconomyFlow.js` with faction modifier and price caps; `GossipManager` with EventBus integration and 3-day token expiry; 20 environmental inscriptions/scrolls as ink interactions across 8 zones; progressive tashkeel refinement upgrade (context-sensitive fading using ambiguity tags from N+2).
**Addresses:** Dynamic market, NPC gossip, environmental storytelling, progressive tashkeel refinement (all P2 differentiators)
**Avoids:** Market exploitation (price floors/ceilings + slow supply regen); gossip token spam (max 2 tokens/NPC, `heard` flag); tashkeel ambiguity edge cases (ambiguity tags from N+2)

### Phase N+5: Mini-Games and Content Polish
**Rationale:** Calligraphy is independent of all other systems but grouping it with poetry battles creates a coherent "deep learning moments" milestone. Poetry battles require vocabulary expansion (N+2) and battle code test coverage as a prerequisite. Vocabulary-gated zone enhancement is pure polish at this stage.
**Delivers:** `CalligraphyScene` (lazy-loaded Phaser scene, 28 isolated letter forms, Frechet distance scoring, 3-star feedback); Arabic poetry battles (10 curated classical public-domain poems, fill-in-blank, NPC poet opponent, plugs into Word Duel infrastructure); vocab-gated zone enhancement (gap count display + FSRS queue surfacing); battle code test coverage (BattleStateMachine, GrammarComboDetector, StatusEffectBar).
**Addresses:** Calligraphy mini-game, Arabic poetry battles, vocab-gated zones enhancement (all P2/P3)
**Avoids:** Calligraphy letter form complexity (isolated forms only, 28 patterns not 112); poetry copyright (public domain classical only); untested battle code (tests before poetry phase builds on combat system)

### Phase Ordering Rationale

- World state machine precedes everything because inkjs, faction, gossip, and learning path all write to it
- Bundle optimization precedes feature additions to prevent the regression trap (optimize then add then regress)
- Dialogue content (573 lines) is filled during the inkjs migration phase so writers work in the new system immediately, not in the old JSON system
- Vocabulary expansion (N+2) precedes factions (N+3) so faction-specific word tagging can be done once with the full vocabulary available
- World life systems (N+4) are grouped together because they reference each other (market uses faction scores, gossip uses ink, inscriptions use ink) and together deliver one clear experiential milestone
- Mini-games are last because they are self-contained and do not unblock other systems; delaying them costs nothing architecturally

### Research Flags

Phases likely needing `/gsd:research-phase` during planning:
- **Phase N+1 (inkjs migration):** ink scripting language syntax for Arabic content authors, `BindExternalFunction` bridge patterns, ink save state serialization for narrativeSlice — official ink docs and inkjs GitHub are primary sources but the Redux integration pattern needs validation against the existing DialogueEngine.js structure
- **Phase N+2 (vocabulary expansion):** Arabic corpus sources for 5,000+ words, CEFR frequency lists for Arabic, root family validation tooling — content pipeline architecture needs planning before phase starts
- **Phase N+5 (calligraphy):** Frechet distance algorithm implementation for 2D stroke paths, Arabic letter Bezier reference paths, positional form detection via js-arabic-reshaper — specific implementation choices need validation

Phases with standard patterns (skip research-phase):
- **Phase N+0 (infrastructure):** Vite manualChunks and Redux slice patterns are well-documented and already proven in 17 existing slices
- **Phase N+3 (faction engine):** Faction reputation 0-100 scale with threshold gating is a standard RPG pattern; `ActionSetExecutor` extension is straightforward
- **Phase N+4 (world life):** Supply/demand pricing model and EventBus gossip token pattern are both simple and well-understood; no novel algorithms

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Installation status verified by inspecting `node_modules` and `package.json` directly; all version compatibility confirmed against existing lockfile; 17 existing Redux slices prove pattern scales |
| Features | MEDIUM-HIGH | Core system design (world state, factions, inkjs) from high-confidence sources; gossip/poetry/calligraphy patterns from game design literature and research papers (MEDIUM for secondary sources) |
| Architecture | HIGH | Build order derived from strict dependency graph analysis; adapter pattern and sync timing rules are defensive but evidence-based; existing codebase architecture (ActionSetExecutor, EventBus, IndexedDB persist) gives HIGH confidence on integration points |
| Pitfalls | HIGH | Most pitfalls are codebase-specific risks identified from direct inspection (untested battle code, bundle regression, naming chaos) rather than inferred from general patterns; prevention strategies map to existing infrastructure |

**Overall confidence:** HIGH

### Gaps to Address

- **AceBase deferral:** Research recommends deferring AceBase to v12.0 at MEDIUM confidence — if the team experiences auto-save bugs or cross-tab sync issues during v11.0, AceBase should be reconsidered at the relevant phase planning session
- **inkjs EXTERNAL function performance:** The `BindExternalFunction` bridge calls synchronous Redux selectors from within ink story execution — validate that there is no detectable frame stutter when a dialogue triggers 5+ EXTERNAL calls in sequence
- **Vocabulary corpus sources:** Research identified that 5,000+ words are required but did not identify the specific corpus or pipeline for generating them with correct root families, CEFR tags, and ambiguity flags — this is a Phase N+2 planning prerequisite
- **Arabic letter Bezier reference paths:** The calligraphy mini-game requires reference stroke paths for 28 isolated letter forms — sourcing or constructing these paths is a Phase N+5 planning task with no existing codebase foundation

## Sources

### Primary (HIGH confidence)
- `package.json` + `node_modules/` (frontend + server) — direct inspection confirming inkjs and acebase NOT installed (2026-03-19)
- `vite.config.js` — existing manualChunks strategy analyzed
- `/src/store/` — 17 existing Redux slices confirming pattern scalability
- `/src/game/` — DialogueEngine.js, ActionSetExecutor.js, EventBus constants (74 events)
- [Phaser 3 Graphics Docs](https://docs.phaser.io/phaser/concepts/gameobjects/graphics) — strokePath, pointer events for calligraphy tracing

### Secondary (MEDIUM confidence)
- [inkjs GitHub (inkle)](https://github.com/inkle/inkjs) — v2.4.0 API, `Story.Continue()`, `variablesState`, `BindExternalFunction`
- [inkjs GitHub (y-lohse fork)](https://github.com/y-lohse/inkjs) — release history, v2.4.0 Feb 2025
- [AceBase GitHub](https://github.com/appy-one/acebase) — v1.29.5 Oct 2024, live proxy pattern
- [rollup-plugin-visualizer GitHub](https://github.com/btd/rollup-plugin-visualizer) — Vite 7 / Rollup 4 compatibility
- [Vite bundle optimization (mykolaaleksandrov.dev)](https://www.mykolaaleksandrov.dev/posts/2025/11/taming-large-chunks-vite-react/) — manualChunks strategy
- [Arabic diacritics pedagogy (ACL 2024)](https://aclanthology.org/2024.acl-long.792.pdf) — progressive diacritics inversely correlated with proficiency
- [Heaven's Vault narrative design (GDC postmortem)](https://www.gamedeveloper.com/design/designing-investigate-conversations) — ink writer/engineer boundary patterns
- [Try Calligraphy serious game scoring](https://ejurnal.seminar-id.com/index.php/tin/article/download/8744/4273/) — Arabic calligraphy 3-star scoring model
- [NPC gossip emergent behavior (2024 research)](https://arxiv.org/html/2510.25820v1) — structured gossip tokens over LLM gossip
- [Agent-based economy design (GDeveloper)](https://www.gamedeveloper.com/production/i-designed-economies-for-150m-games-here-s-my-ultimate-handbook) — single-player supply/demand preferred over RL agents

### Tertiary (LOW confidence — needs validation during phase planning)
- [React + Redux + ink integration (Medium)](https://medium.com/journocoders/create-a-news-game-with-ink-react-and-redux-part-ii-playing-your-game-on-the-web-5216e33043df) — Redux bridge pattern; needs validation against inkjs v2.4.0 API
- [inkjs JavaScript series (videlais.com)](https://videlais.com/2019/05/27/javascript-ink-part-3-getting-and-setting-variables/) — variable bridge patterns; article is from 2019, verify against v2.4.0

---
*Research completed: 2026-03-19*
*Ready for roadmap: yes*
