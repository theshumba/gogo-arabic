# Feature Research: v11.0 Deep Systems & Content Engine

**Domain:** Arabic Learning RPG — Dialogue engine, realtime sync, learning paths, faction systems, world state, economy, mini-games, and bundle optimization
**Researched:** 2026-03-19
**Confidence:** MEDIUM-HIGH (live web research + official docs + existing codebase analysis)

---

## Feature Landscape

The 13 features for v11.0 divide into four groups by nature:

- **Infrastructure systems** (inkjs, AceBase, bundle optimization) — foundational, no visible user surface, other features depend on them
- **Game-state systems** (world state machine, faction reputation, learning path) — medium-surface, shape what players can see and do
- **World-life systems** (dynamic market, NPC gossip, environmental storytelling) — high-surface, make the world feel alive
- **Mini-games / content** (calligraphy, poetry battles, tashkeel refinement, vocab-gated zones) — direct learning moments, player-facing

---

## Table Stakes (Players Expect These)

Features whose absence makes the game feel incomplete or broken at this stage of development.

| Feature | Why Expected | Complexity | Existing Foundation | Notes |
|---------|--------------|------------|---------------------|-------|
| **inkjs dialogue migration** | 80+ lines of hardcoded JSON per NPC is unmaintainable at 573 missing dialogue lines; writers expect a proper scripting layer | MEDIUM | DialogueEngine + inkjs already installed (not yet in package.json — needs `npm install inkjs`) | Pattern: load compiled `.ink.json`, expose `variablesState` bridge to Redux, use `EXTERNALs` to call Redux dispatchers. Heaven's Vault proves the pattern at scale. |
| **World state machine** | Players who have 52 quests + 23 NPCs with conditions expect the game to remember everything they've done; inconsistency (NPC forgets a quest was resolved) destroys immersion | MEDIUM | narrativeSlice + EventBus (74 constants) + ActionSetExecutor | Standard approach: flat key-value store (string → boolean/number/string) persisted via existing IndexedDB hybrid. 500 vars at ~1KB each is trivial. Redux slice + selectors is sufficient — no separate state machine library needed. |
| **Vocabulary-gated zones (enhanced)** | Vocabulary-locked door system exists in v5.0 but is binary (yes/no); players expect feedback on exactly how many words are missing | LOW | Zone gates + mastery requirements already in v5.0 | Upgrade: show gap count ("learn 3 more words to enter"), highlight which words, surface them in next FSRS review session. |
| **Learning path system** | 3-stage path selector exists in v4.0 but doesn't change word ordering or content delivery; players who chose "Historian" expect historically-themed vocabulary first | MEDIUM | Learning Path menu exists, 3-stage defined (Scholar/Traveler/Historian) | Content: vocabulary already has domain tags. Mechanic: reorder FSRS queue by domain affinity when path is set. v10.0 Phases 48-49 absorbed here. |
| **Progressive tashkeel refinement** | v2.0 fades tashkeel per-word at mastery thresholds. This is now proven; players at intermediate level expect context-sensitive fading (still show in ambiguous contexts) | MEDIUM | v2.0 tashkeel fading + FSRS mastery sync | Research confirms: pedagogically, diacritics should be inversely correlated with proficiency AND context-sensitive (ambiguous words keep marks longer). Requires ambiguity tagging in vocabulary data. |
| **Bundle optimization (862KB → 500KB)** | 862KB initial bundle blocks first load on mobile; game is unresponsive. Players don't see a feature but feel its absence immediately | MEDIUM | Vite 7 with manualChunks support; BootScene loads all 77 assets upfront | The 500KB target is Vite's own warning threshold. Standard: manualChunks to split phaser/react/data; dynamic imports for non-critical overlays; zone-based asset lazy loading to fix BootScene. |
| **573 missing NPC dialogue lines** | Content gaps — players encounter NPCs with no dialogue for states the quests can reach; feels broken | LOW | 23 NPCs with dialogue trees, DialogueEngine wired | Pure content work. Lowest complexity item in v11.0. Should be earliest phase so later systems have dialogue to integrate with. |

---

## Differentiators (Competitive Advantage)

Features that set Gogo Arabic apart from both generic RPGs and generic language learning apps.

| Feature | Value Proposition | Complexity | Existing Foundation | Notes |
|---------|-------------------|------------|---------------------|-------|
| **Faction reputation engine** | 6 factions (scholars, merchants, travellers, artisans, nobles, mystics) create different vocabulary tracks. Scholar faction = grammar-heavy unlocks; merchant = number/commerce words. No language learning app has faction-gated vocabulary. | HIGH | FriendshipSystem (0-100, 4 tiers in v7.0), EconomyFlow, relationship-gated dialogue | Design pattern from Tyranny/Pillars: 0–100 scale per faction, unlock content at 25/50/75/100 thresholds. Faction choice on joining conflicts with one other faction (e.g. Scholars vs Travellers mild tension). Content gating: NPC dialogue, quests, shop inventory, zone access. |
| **Dynamic market simulation** | Shop prices respond to what player buys, what quests they complete, what faction they favor. Makes the Arabic economy feel like a living place. No language app does agent-based NPC pricing. | HIGH | 8 zone shops, EconomyFlow production chains, tiered currency (fils/dirham/dinar) in v7.0 | Pattern: supply/demand simple model (not full RL agent). Each item has `supply` counter (decreases on purchase, increases on quest-complete/rest). Price = base × (maxSupply / currentSupply). Caps prevent exploitation. Teaches economic Arabic vocabulary through visible price changes. |
| **NPC gossip system** | NPCs share information about player actions. Solve a quest in zone 1 → zone 2 NPCs reference it. Creates world-feel no language app has. | HIGH | NPC schedules + wander/patrol (v7.0), TownKnowledge system, ActorRegistry, EventBus | Design pattern: `GossipBus` — events player triggers emit gossip tokens (subject, verb, object in Arabic). NPCs with relationship ≥ 25 to player pick up tokens and surface them as dialogue lines. Tokens expire after N game-days. Teaches narrative Arabic (past tense verbs, proper nouns in context). |
| **Calligraphy mini-game** | Arabic letter tracing with accuracy scoring. Teaches stroke order through muscle memory — proven pedagogically superior to recognition-only approaches. Unique among Arabic learning apps; most use multiple choice only. | HIGH | Root magic calligraphic VFX in v6.0 (visual only, not interactive), existing canvas/Phaser scene system | Implementation: Phaser scene with pointer-path capture. Reference stroke as cubic Bezier stored per letter. Score = path deviation from reference (Frechet distance or simpler bounding-box overlap). 3-star rating system. 28 letters × positions = 84 stroke patterns. Serious game "Try Calligraphy" proves the scoring model at research level. |
| **Arabic poetry battles** | Fill-in-the-blank competitive poetry — player fills missing words in classical Arabic poems against NPC poets. Teaches Classical Arabic, rhyme/meter awareness, high-frequency Quranic vocabulary. Unique in language gaming. | HIGH | Word Duel boss battles (8 bosses), FSRS vocabulary (1,220 words), quiz infrastructure | Pattern: poem presented with blanks; player selects from 4 options (FSRS-sourced words at correct difficulty); NPC "poet" also fills blanks; compare scores. Classic Arabic poetry naturally teaches grammar (case endings are metrically required — player hears why they matter). |
| **Environmental storytelling (inscriptions/scrolls)** | Readable Arabic signs, inscriptions on walls, scrolls in libraries — player reads them with tashkeel support, learns vocabulary in authentic context. Heaven's Vault built its entire archaeology mechanic on this. | MEDIUM | 142 interactive objects, buildings, vocabulary-gated object interaction | Pattern from Heaven's Vault: inscription = text object with `inkjs` knot for reading interaction. Player's known vocabulary determines whether they "understand" the inscription (word-by-word comprehension check). Unknown words surface in FSRS queue. Low content overhead: one inscription = 5-15 words. |
| **AceBase realtime sync** | Replace manual REST CRUD with live object proxies. Any Redux state change auto-persists without `dispatch(save...)` calls. Developer velocity gain + zero data-loss risk. Not player-visible but eliminates the most common save-state bugs. | MEDIUM | JWT + MongoDB backend (Express 5), IndexedDB hybrid persistence (5 slices), AutoSave (3-min) | AceBase live proxy pattern: `db.ref('gameState').proxy()` returns observable object; assign properties directly and they sync. Works offline (IndexedDB cache) + reconnect sync. Key risk: AceBase is a smaller community library — verify against current npm version (check npmjs.com/package/acebase before phase starts). |

---

## Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **LLM-powered gossip / dynamic NPC dialogue** | "Make NPCs respond to anything the player says using AI" | Ongoing API cost, output inconsistency, can generate culturally inappropriate Arabic, destroys controlled learning environment, latency kills game feel. 2025 research shows LLM NPCs still struggle with factual consistency. | Use structured gossip tokens (templated Arabic sentences) — consistent, fast, culturally curated, and teaches specific grammar patterns deliberately. |
| **Full agent-based economy (RL pricing)** | "Make NPCs autonomous economic agents with reinforcement learning" | RL requires training loop, MMORPG-scale infrastructure not appropriate for single-player. EVE Online's emergent economy required millions of players. | Simple supply/demand model with capped variance is pedagogically superior (predictable patterns help learners understand cause/effect in Arabic commerce vocabulary). |
| **AceBase replacing MongoDB entirely** | "Why keep both databases?" | AceBase is designed as cache/sync layer, not primary data store. MongoDB handles auth, progress backups, server-side validation. AceBase excels at client-side live sync. Replacing MongoDB creates auth/security surface complexity. | Keep MongoDB as authoritative server store; use AceBase as client-side cache with conflict resolution on sync. |
| **inkjs managing ALL game logic** | "Move quest conditions and faction gates into ink files" | Ink is a narrative scripting language — putting faction math and FSRS calculations into ink creates unmaintainable `.ink` files. Writers cannot reason about numerical systems. | Ink handles dialogue text and branching choices. Redux handles all state. Bridge via `variablesState` and `EXTERNAL` functions — writers see clean narrative, engineers control logic. Clear separation enforced in code review. |
| **Real-time multiplayer via AceBase** | "Players could see each other's progress live!" | AceBase supports multi-tab sync, not true multiplayer. Real multiplayer is explicitly out of scope (PROJECT.md). | AceBase multi-tab sync is fine for single player. Leaderboards (not realtime) can show comparison without live multiplayer complexity. |
| **Procedural poetry generation** | "Generate infinite poems with AI" | Classical Arabic poetry has strict meter (عروض). Procedural generation cannot reliably meet metrical constraints without significant NLP work. Content quality matters deeply for cultural respect. | Curate 50-100 authentic classical poems with blanks at metrically non-critical positions. Small corpus, high quality, culturally respectful. |
| **Free-form calligraphy scoring (AI-graded)** | "Use ML model to grade writing quality" | Requires server-side ML inference, model training on Arabic handwriting datasets, GDPR implications for handwriting data. Mobile browser canvas accuracy also varies. | Deterministic stroke-path comparison (Frechet distance or bounding-box overlap) running client-side. 80% accurate for letter recognition is sufficient for gamified feedback — not calligraphy mastery certification. |

---

## Feature Dependencies

```
inkjs dialogue engine
    └──required by──> NPC gossip system (gossip triggers ink knots)
    └──required by──> Environmental storytelling (inscriptions are ink interactions)
    └──required by──> 573 missing dialogue lines (content authored in ink)
    └──requires──> World state machine (ink reads/writes world state variables)
    └──bridges via──> Redux narrativeSlice (EXTERNAL functions + variablesState)

World state machine (Redux slice, 500+ vars)
    └──required by──> inkjs integration (ink reads state variables)
    └──required by──> Faction reputation (faction scores ARE world state vars)
    └──required by──> NPC gossip (gossip tokens are world state events)
    └──required by──> Learning path system (path choice persists in world state)
    └──enhances──> Quest system (already exists: 52 quests)

Faction reputation engine
    └──requires──> World state machine (faction scores stored there)
    └──requires──> inkjs dialogue (faction-gated dialogue branches)
    └──enhances──> Dynamic market simulation (faction = price modifier)
    └──enhances──> Vocabulary-gated zones (faction membership unlocks zone access)

Learning path system
    └──requires──> World state machine (path choice stored)
    └──requires──> FSRS vocabulary data (reorders queue by domain)
    └──enhances──> Progressive tashkeel refinement (path affects tashkeel presentation rate)
    └──depends on──> Vocabulary expansion to 5,000+ (path differentiation only meaningful with rich vocabulary)

AceBase realtime sync
    └──independent of──> inkjs / faction / gossip (infrastructure layer)
    └──replaces──> Manual AutoSave (3-min) + REST CRUD calls
    └──requires──> IndexedDB (already in project via redux-persist)
    └──risk: package maturity──> Verify before phase starts

Dynamic market simulation
    └──requires──> Faction reputation (faction membership = price modifier)
    └──enhances──> EconomyFlow (already exists: production chains)
    └──enhances──> Arabic numeral haggling (already exists)

NPC gossip system
    └──requires──> inkjs (gossip surfaces as ink dialogue)
    └──requires──> World state machine (gossip tokens stored there)
    └──requires──> NPC schedules (v7.0 — NPCs must be at locations to gossip)

Calligraphy mini-game
    └──independent of──> all other systems
    └──enhances──> Root magic (calligraphic VFX already exists, v6.0)
    └──enhances──> Progressive tashkeel (player who can write letters reads with less support)

Arabic poetry battles
    └──requires──> FSRS vocabulary (pulls candidate words for fill-in-blank)
    └──enhances──> Word Duel (already exists — poetry battles are a second battle mode)
    └──conflicts with──> Time pressure mechanics (fill-in-blank must be un-timed — Krashen affective filter)

Progressive tashkeel refinement
    └──requires──> FSRS mastery data (v2.0 foundation)
    └──enhances──> Environmental storytelling (inscriptions use tashkeel appropriately)

Environmental storytelling
    └──requires──> inkjs (interactions authored in ink)
    └──requires──> 142 interactive objects (v5.0 — objects already exist, need content)
    └──enhances──> Vocabulary-gated zones (inscriptions can BE the gate)

Bundle optimization
    └──independent of──> all content systems
    └──required before──> any phase that adds new routes/overlays (prevents bundle regression)
    └──requires──> BootScene zone-based lazy loading (biggest single fix: 77 upfront asset calls)

Vocabulary expansion (1,220 → 5,000+)
    └──required by──> Learning path system (path differentiation needs domain coverage)
    └──required by──> Arabic poetry battles (needs Classical Arabic words)
    └──required by──> Environmental storytelling (inscriptions need authenticated vocabulary)
    └──enhances──> Faction reputation (each faction unlocks faction-specific words)
```

### Dependency Build Order (Critical Path)

The critical constraint is: **world state machine must be phase 1** because inkjs, faction, gossip, and learning path all write to it. The dependency chain forces this order:

1. World state machine + bundle optimization (no dependents yet, infrastructure baseline)
2. inkjs migration + 573 dialogue lines (ink needs state machine; dialogue content is used by gossip)
3. AceBase realtime sync (infrastructure, parallel-safe)
4. Learning path system + vocabulary expansion (state machine + FSRS are ready)
5. Faction reputation engine (needs state machine + inkjs)
6. Dynamic market simulation (needs faction scores)
7. Progressive tashkeel refinement (needs FSRS data, upgrade existing feature)
8. NPC gossip system (needs inkjs + state machine + NPC schedules)
9. Environmental storytelling (needs inkjs + interactive objects)
10. Calligraphy mini-game (independent, can run any time)
11. Arabic poetry battles (needs FSRS + vocabulary expansion)
12. Vocabulary-gated zones enhancement (needs faction + state machine)

---

## MVP Definition for v11.0

### Build First (Phase Foundation — enables everything else)

- [ ] **World state machine** — 500+ variable Redux slice with selectors, persisted via IndexedDB. No other v11.0 feature ships without it.
- [ ] **Bundle optimization** — Vite manualChunks + BootScene lazy loading. Must drop below 500KB before adding more systems.
- [ ] **573 missing NPC dialogue lines** — Pure content fill. All future systems plug into this dialogue. Get it done early.

### Core Systems (Phase Middle — differentiation)

- [ ] **inkjs dialogue migration** — Replace 3+ NPC JSON blobs with ink files. Use EXTERNAL bridge to Redux. Pilot with 5 NPCs before migrating all 23.
- [ ] **Learning path system** — Reorder FSRS queue by Scholar/Traveler/Historian domain tags. v4.0 UI already exists, wire the logic.
- [ ] **Faction reputation engine** — 6 factions, 0-100 scale, content gating at 25/50/75/100. Merchant + Scholar factions launch first.
- [ ] **Vocabulary expansion** — 1,220 → 5,000+ words. Required before poetry battles or differentiated paths feel meaningful.

### Differentiating Systems (Phase Late — world life + mini-games)

- [ ] **Dynamic market** — Supply/demand pricing (simple model). Faction modifier. Visible to player.
- [ ] **NPC gossip** — Gossip tokens from EventBus, surface via ink knots. Pilot 3 NPCs first.
- [ ] **Progressive tashkeel refinement** — Ambiguity tagging on vocabulary data + context-sensitive fading rules upgrade.
- [ ] **Environmental storytelling** — 20 inscriptions/scrolls as ink interactions across all 8 zones.
- [ ] **Calligraphy mini-game** — 28 letters, Phaser stroke capture, Frechet distance scoring.
- [ ] **Arabic poetry battles** — 10 poems, fill-in-blank, vs NPC poet. Plugs into Word Duel infrastructure.

### Defer to v12.0

- [ ] **AceBase realtime sync** — Valuable but current IndexedDB hybrid works. AceBase adds package risk (community library). Defer until auto-save bugs are a documented user pain.
- [ ] **Vocabulary-gated zones (enhanced UI)** — Current gates work. Enhancement (gap count + queue surface) is polish, not blocking.

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority | Depends On |
|---------|------------|---------------------|----------|-----------|
| World state machine | HIGH (everything else needs it) | MEDIUM | P1 | narrativeSlice (exists) |
| Bundle optimization | HIGH (first load performance) | MEDIUM | P1 | Vite (exists) |
| 573 missing dialogue lines | HIGH (content gaps feel broken) | LOW | P1 | DialogueEngine (exists) |
| inkjs migration | HIGH (maintainability + narrative scale) | MEDIUM | P1 | World state machine |
| Learning path system | HIGH (core v11.0 promise) | MEDIUM | P1 | World state + FSRS |
| Vocabulary expansion | HIGH (all depth systems need words) | MEDIUM | P1 | vocabulary data pipeline |
| Faction reputation engine | HIGH (differentiator, content gating) | HIGH | P1 | World state + inkjs |
| Progressive tashkeel refinement | HIGH (builds on proven v2.0 mechanic) | MEDIUM | P2 | FSRS + vocabulary tags |
| Dynamic market simulation | MEDIUM (world-life, not critical) | HIGH | P2 | Faction engine |
| NPC gossip system | HIGH (world-life differentiator) | HIGH | P2 | inkjs + state machine |
| Environmental storytelling | HIGH (reading practice in context) | MEDIUM | P2 | inkjs + interactive objects |
| Calligraphy mini-game | HIGH (unique, proven pedagogically) | HIGH | P2 | None |
| Arabic poetry battles | HIGH (Classical Arabic differentiator) | HIGH | P2 | Vocabulary expansion |
| Vocab-gated zones (enhanced) | MEDIUM (upgrade to existing feature) | LOW | P3 | World state machine |
| AceBase realtime sync | MEDIUM (DX improvement, not UX-critical) | MEDIUM | P3 | None |

---

## Reference Analysis

### inkjs Patterns From Commercial Games

| Game | Ink Usage Pattern | Lesson for Gogo Arabic |
|------|-------------------|------------------------|
| **Heaven's Vault** | Narrative director queues dialogue; ink remembers every path; writers own content | Writers author all 23 NPC trees in ink; engineers only maintain the bridge |
| **80 Days** | Generic topic bank; prioritized injection of plot-critical topics; max 3 choices shown | Limit visible NPC choices to 3; FSRS-prioritize vocabulary-teaching choices |
| **Inkle's other titles** | ink variables mirror game state (not replace it) | `variablesState` as read-only mirror of Redux; Redux is always source of truth |

Key technical pattern (HIGH confidence — from inkjs official docs and inkle postmortems):
- `story.variablesState['playerFaction']` for reads
- `story.variablesState['playerFaction'] = value` for writes (from Redux middleware)
- `story.BindExternalFunction('checkMastery', (word) => selectWordMastery(store.getState(), word))` for live Redux queries from within ink

### NPC Gossip Patterns From Games

| Game | Gossip Mechanic | Lesson |
|------|----------------|--------|
| **The Sims 4** | Gossip topics spread NPC-to-NPC based on relationship score | Relationship threshold (≥25) gates who can carry gossip tokens |
| **RimWorld** | Social log records who told whom what | Store gossip as world state events with `heardBy` array |
| **Dwarf Fortress** | Creatures recall and share specific historical events | Events reference actual player actions (quest IDs, not generic text) |

### Calligraphy Scoring Reference

- "Try Calligraphy" (serious game research, 2024): scores on decoration, neatness, completion time. Three-star rating proves sufficient granularity for gamified feedback.
- Pattern: capture pointer path as array of `{x, y, t}` points. Compare against reference Bezier at N sample points. Normalize deviation against letter bounding box. Score 0-100.
- 28 Arabic letters × 3 positions (initial/medial/final) = 84 stroke patterns needed.

### Bundle Optimization Target Path (HIGH confidence — Vite 7 docs)

Current: 862KB single chunk.
Target: 500KB (Vite's own threshold).

Strategy:
1. `manualChunks` in `vite.config.js`: separate `phaser`, `react`+`react-dom`, `framer-motion`, `@reduxjs/toolkit`, `vocabulary-data`
2. `React.lazy()` + `Suspense` for non-critical overlays (CompanionUI, ShopOverlay, CalligraphyScene)
3. BootScene: replace 77 upfront `load.image()` calls with zone-scoped manifests loaded on zone transition
4. Expected result: ~40% initial JS reduction per 2025 case studies (40% of 862KB ≈ 345KB initial, rest deferred)

---

## Sources

- [inkjs npm package](https://www.npmjs.com/package/inkjs) — v2.4.0 current as of 2026-03
- [inkle/ink GitHub](https://github.com/inkle/ink) — Official ink language source
- [Heaven's Vault narrative design (GDC postmortem)](https://www.gamedeveloper.com/design/designing-investigate-conversations) — MEDIUM confidence
- [inkjs JavaScript integration series (videlais.com)](https://videlais.com/2019/05/27/javascript-ink-part-3-getting-and-setting-variables/) — Variable bridge patterns
- [React + Redux + ink integration](https://medium.com/journocoders/create-a-news-game-with-ink-react-and-redux-part-ii-playing-your-game-on-the-web-5216e33043df) — MEDIUM confidence
- [acebase npm package](https://www.npmjs.com/package/acebase) — Live proxy pattern documentation
- [AceBase GitHub](https://github.com/appy-one/acebase) — Browser IndexedDB support details
- [Vite bundle optimization 2025 (mykolaaleksandrov.dev)](https://www.mykolaaleksandrov.dev/posts/2025/11/taming-large-chunks-vite-react/) — manualChunks strategy
- [Vite 500KB discussion](https://github.com/vitejs/vite/discussions/9440) — Warning threshold documentation
- [Arabic diacritics pedagogical approach (ACL 2024)](https://aclanthology.org/2024.acl-long.792.pdf) — Progressive diacritics inversely correlated with proficiency
- [Try Calligraphy serious game scoring](https://ejurnal.seminar-id.com/index.php/tin/article/download/8744/4273/) — Arabic calligraphy scoring model research
- [Faction reputation design patterns (Game Rant)](https://gamerant.com/rpgs-best-faction-systems/) — 0-100 scale, content threshold gating
- [NPC gossip emergent behavior (2024 research)](https://arxiv.org/html/2510.25820v1) — Structured gossip > LLM gossip for consistency
- [Environmental storytelling (GDC)](https://www.gamedeveloper.com/design/environmental-storytelling) — Readable objects, inscription design
- [Agent-based economy design (GDeveloper)](https://www.gamedeveloper.com/production/i-designed-economies-for-150m-games-here-s-my-ultimate-handbook) — Single-player economy: supply/demand simple model preferred over RL
- Existing codebase: `package.json`, `PROJECT.md`, `/src/store/`, `/src/game/`, `/src/data/` — HIGH confidence (direct inspection)

---

*Feature research for: Gogo Arabic v11.0 Deep Systems & Content Engine*
*Researched: 2026-03-19*
*Confidence: MEDIUM-HIGH (live web research for inkjs/AceBase/bundle; MEDIUM for faction/gossip/poetry patterns from game design literature)*
