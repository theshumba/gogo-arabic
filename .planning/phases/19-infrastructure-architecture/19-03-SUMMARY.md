---
phase: 19-infrastructure-architecture
plan: 03
status: DONE
commit: f516453
---

# 19-03 Summary: useEventBusListeners Domain Sub-Hooks

## What was done
Refactored the monolithic `useEventBusListeners` hook (424 LOC, 21 event registrations) into a thin orchestrator (22 LOC) delegating to 5 domain-specific sub-hooks.

## Artifacts created/modified

| File | LOC | Events | Purpose |
|------|-----|--------|---------|
| `src/hooks/useEventBusListeners.js` | 22 | 0 | Thin orchestrator calling 5 sub-hooks |
| `src/hooks/useDialogueEvents.js` | 72 | 1 | NPC interaction + exploration quest tracking |
| `src/hooks/useZoneEvents.js` | 131 | 4 | Zone change, unlock gating, transition, fast travel |
| `src/hooks/useObjectEvents.js` | 154 | 5 | Sign, bookshelf, chest, door handlers + trackWordLearned |
| `src/hooks/useNarrativeEvents.js` | 32 | 2 | Story flags + NPC relationships (placeholder for Phase 20+) |
| `src/hooks/useMiscEvents.js` | 82 | 11 | Quiz, SFX, VFX, navigation, achievement VFX |
| `src/utils/eventBusTypes.js` | +6 | +2 | Added NARRATIVE_FLAG_SET, NARRATIVE_RELATIONSHIP_CHANGED |

## Verification
- 23 `EventBus.on` / 23 `EventBus.off` — every listener has matching cleanup
- 21 original handlers preserved + 2 new narrative events = 23 total
- `npx vite build` passes — main bundle 279.83KB (< 500KB)
- `npx vitest run` — 551 passing, 3 pre-existing failures (unchanged)
- GameLayout.jsx call signature unchanged: `useEventBusListeners(phaserRef, playSFX, navigate)`

## Key decisions
- `trackWordLearned` helper moved into `useObjectEvents` (only caller is `handleBookshelfInteract`)
- `useNarrativeEvents` is intentionally small — will grow in Phase 20 (Dialogue) and Phase 26 (Narrative)
- Achievement VFX `useEffect` placed in `useMiscEvents` alongside other VFX emitters
