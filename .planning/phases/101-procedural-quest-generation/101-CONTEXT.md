# Phase 101: Procedural Quest Generation - Context

**Gathered:** 2026-04-17
**Status:** CONTEXT stub — NOT yet planned. Run `/gsd-plan-phase 101` when ready.
**Source:** Orchestrator-captured from v18.0 Advanced AI Systems milestone brief

<domain>
## Phase Boundary

Generate quests procedurally from player FSRS state + current zone + target root families + weak areas. Each generated quest is contextual ("your weakest root is k-t-b — fetch 3 items whose names contain this root"), playable (uses existing quest mechanics), and never repeats stale content (7-day rolling window per player).

This is phase 3 of v18.0 Advanced AI Systems, the most experimental of the three.

**Note:** PROJECT.md lists "Procedural quests" in Out of Scope with rationale "Educational content needs curation." This phase REVISITS that decision for ORCHESTRATOR-driven micro-quests (practice quests — NOT replacing curated narrative quests). The 52 authored quests remain canonical; procedural generation adds a per-player practice layer.

</domain>

<decisions>
## Implementation Decisions (locked at stub time)

### Scope
- **In scope:** Template-based quest generation (not free-form) from a curated template library. Templates parameterised by FSRS state + zone + root families. Generated quests surface as "practice quests" distinct from the 52 authored narrative quests. 7-day rolling de-dupe per player.
- **Out of scope:** Replacing or modifying the 52 authored narrative quests. LLM-generated quest text. Procedural NPCs (only existing NPCs appear in generated quests). Procedural zones. Full dynamic storytelling.

### Hard Constraints
- **Curated templates only.** Every generated quest traces back to one of a small set (~20) of human-authored templates. No free-form text generation.
- **Cultural guardrails.** Templates pre-validated against PROJECT.md Islamic-context rules; generation can only slot approved vocabulary/NPCs/items.
- **Narrative coherence.** Generated quest must not contradict canonical story (e.g., can't send player to "enter the dragon's cave" if there's no dragon in the world).
- **Quality gate.** Each generated quest is automatically smoke-tested (can it be completed without errors?) before being offered to the player.
- **Reverts cleanly.** If a generated quest is abandoned, the quest slot is freed — no state drift.

### Depends On
- Phase 99 (Curriculum Orchestrator) — provides weak-area signals that parameterise templates.
- Phase 100 (Dynamic NPC AI with Memory) — generated quests can reference NPC mood/memory for contextual flavour.
- Phase 97 + 98 foundation.
- Existing quest engine (v5.0 + v7.0 ActionSetExecutor + EventScriptRunner).

### Preserve
- All 52 authored quests and their reward/progression logic
- Quest engine internals (generator produces quest data matching existing schema)
- Quest gating / prerequisites for narrative quests
- Player progress through authored story arcs

### Requirements (to be defined during plan-phase)
- Preliminary: PROCQUEST-01 (templates parameterised by FSRS + zone + roots), PROCQUEST-02 (narrative coherence check automated), PROCQUEST-03 (7-day rolling de-dupe per player), PROCQUEST-04 (cultural-guardrail filter at template-library review and at generation time), PROCQUEST-05 (generated quests distinct from authored — separate "practice quests" UI surface), PROCQUEST-06 (all 52 authored quests untouched), PROCQUEST-07 (auto-smoke-test before offering), PROCQUEST-08 (clean revert on abandonment).

</decisions>

<canonical_refs>
## Canonical References

- `.planning/PROJECT.md` — out-of-scope rationale for procedural quests; this phase's scope threads through that rationale carefully
- `src/data/quests.json` — 52 authored quests (do not modify)
- `src/game/systems/QuestManager.js` (if exists) — schema the generator must match
- `src/game/systems/ActionSetExecutor.js` — event actions available to generated quests
- `src/data/trilateralRoots.js` — root families for parameterisation

</canonical_refs>

<specifics>
## Specific Ideas
- Template example: `{zoneId, npcA, npcB, targetRoot} → "Go to {zoneId}. Talk to {npcA}. Fetch 3 items whose Arabic names share root {targetRoot}. Return to {npcB}."` — pure slot-filling.
- Narrative coherence check: reject templates that reference entities not present in current game state (e.g., npcA hasn't been met yet).
- Surface: "Practice quests" in Daily Dashboard / Curriculum Orchestrator output, clearly badged as such.
- Testing: property-based tests that generate 1000 quests and assert every one passes narrative + cultural + completability checks.

</specifics>

<deferred>
## Deferred Ideas
- LLM-generated flavour text — defer to future phase
- Player-authored quests / quest-editor — defer
- Shared procedural quests across players — defer
- Procedural boss battles — defer

</deferred>

---

*Phase: 101-procedural-quest-generation*
*Context stubbed: 2026-04-17. Run `/gsd-plan-phase 101` to produce RESEARCH + PLAN + VALIDATION.*
*Depends on Phases 97, 98, 99, 100 completing first.*
*Re-reads PROJECT.md out-of-scope rationale; practice quests are additive, not a replacement for authored quests.*
