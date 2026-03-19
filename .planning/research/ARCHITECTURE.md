# Architecture Research — v11.0 Deep Systems & Content Engine

**Researched:** 2026-03-19 | **Confidence:** HIGH

## New Components

### New Redux Slices (3)
| Slice | Purpose | Persisted? |
|-------|---------|------------|
| `worldStateSlice` | 500+ flags/counters for world state machine | Yes (IndexedDB) |
| `factionSlice` | 6 faction reputations (0-100) + tier thresholds | Yes (IndexedDB) |
| `poetrySlice` | Poetry battle state, poem collection | Yes (IndexedDB) |

### New Phaser Systems (3)
| System | Purpose |
|--------|---------|
| `InkDialogueEngine` | Wraps inkjs Story, replaces JSON dialogue parsing |
| `CalligraphyScene` | Separate Phaser scene for letter tracing (lazy-loaded) |
| `GossipManager` | Gossip token propagation between NPCs |

### New Middleware (2)
| Middleware | Purpose |
|-----------|---------|
| `factionMiddleware` | Quest/dialogue/purchase events → faction score adjustments |
| `worldStateMiddleware` | Game events → world state flag/counter updates |

## Data Flow: inkjs ↔ Redux Bridge
```
Player talks to NPC
  → InkDialogueEngine.startDialogue(npcId)
  → Load compiled .ink.json (dynamic import)
  → Inject Redux state into story.variablesState
  → story.Continue() → render text in DialogueBox
  → Player picks choice → story.ChooseChoiceIndex()
  → After dialogue: read variablesState mutations → dispatch to worldState/faction slices
  → story.state.toJson() → persist in narrativeSlice
```

## Data Flow: Gossip Token
```
Player completes quest → EventBus QUEST_COMPLETE
  → worldStateMiddleware sets flag
  → GossipManager creates token from flag
  → Tokens assigned to NPCs with relationship ≥ 25
  → On dialogue: ink checks for gossip tokens → surfaces gossip line
```

## Data Flow: Dynamic Market
```
Player enters shop → PricingAgent.recalculate(history, factionRep, supply)
  → Price = base × (maxSupply/currentSupply) × factionModifier
  → On purchase: supply decreases
  → On rest: supply partially restores
```

## Build Order (Dependency-Driven)
```
Phase N+0: Bundle optimization + world state slice (foundation)
Phase N+1: inkjs migration (pilot 5 NPCs) + missing dialogue lines (573)
Phase N+2: Learning path + vocabulary expansion (5,000+ words)
Phase N+3: Faction reputation engine
Phase N+4: Dynamic market + NPC gossip + environmental storytelling
Phase N+5: Calligraphy mini-game + Arabic poetry battles
Phase N+6: Progressive tashkeel refinement + vocab-gated zone enhancement
```

## Integration Risk Points
1. inkjs ~120KB must be lazy-loaded chunk, not initial bundle
2. World state 500+ keys needs IndexedDB persist (not localStorage)
3. DialogueEngine replacement must be incremental (adapter pattern)
4. BootScene lazy loading affects every scene transition
5. Vocabulary 1,220 → 5,000+ must stay in its own chunk

## Modified Components
- `DialogueEngine.js` → ink wrapper
- `ActionSetExecutor.js` → add faction/worldState requirement types
- `NPCManager.js` → gossip token display
- `InteractableManager.js` → inscription/scroll ink interactions
- `BootScene.js` → zone-based lazy loading
- `vite.config.js` → visualizer + inkjs chunk + lazy overlays
- `vocabularyAll.js` → expand to 5,000+
- `EconomyFlow.js` → PricingAgent model
