# Phase 100: Dynamic NPC AI with Memory - Context

**Gathered:** 2026-04-17
**Status:** CONTEXT stub — NOT yet planned. Run `/gsd-plan-phase 100` when ready.
**Source:** Orchestrator-captured from v18.0 Advanced AI Systems milestone brief

<domain>
## Phase Boundary

Make NPCs feel alive across sessions. Each of the 140 NPCs remembers past conversations with the player, references the player's vocab mastery in dialogue, has a mood state that evolves based on interactions, and (optionally) has a schedule that respects prior interaction history. This converts NPCs from stateless dialogue trees into persistent entities.

This is phase 2 of v18.0 Advanced AI Systems.

</domain>

<decisions>
## Implementation Decisions (locked at stub time)

### Scope
- **In scope:** Persistent NPC memory (past conversation summaries referenced in future dialogue), vocab-mastery-aware dialogue (NPCs don't teach what you know), NPC mood state (0-100 per NPC, affects dialogue tone), schedule nudges that reference prior interactions.
- **Out of scope:** Full Stardew-style NPC schedules (already out-of-scope per PROJECT.md), LLM-generated dialogue at runtime, romance mechanics (out of scope per PROJECT.md), permadeath (out of scope), companion mechanics expansion.

### Hard Constraints
- Cultural: NPCs must remain respectful per Islamic-context guardrails (no romance references, no deity references in mood).
- All existing NPC dialogue must continue to work as a fallback when memory is empty (new player).
- Memory storage must fit IndexedDB budget — bounded-size summary per NPC, not full transcript.
- Deterministic for given input state — same conversation history → same dialogue branch.
- No game logic changes to dialogue engine — memory is injected as context, engine unchanged.

### Depends On
- Phase 99 (Curriculum Orchestrator) — mastery signals come from the orchestrator.
- Phase 97 + 98 (visual + code health foundation).
- v11.0 Deep Systems (ink dialogue engine).
- v5.0 Dialogue System (DialogueEngine).

### Preserve
- All 140 NPCs and their existing dialogue trees
- ink dialogue engine behaviour
- DialogueEngine + CompanionDialogueManager composition pattern
- All 52 quest flows

### Requirements (to be defined during plan-phase)
- Preliminary: NPCMEM-01 (NPCs reference past conversations by name — "last time you asked about X"), NPCMEM-02 (NPCs skip vocab-teaching lines for mastered words), NPCMEM-03 (NPC mood persists across sessions and affects dialogue), NPCMEM-04 (memory bounded — max N summaries per NPC), NPCMEM-05 (fallback to default dialogue on empty memory), NPCMEM-06 (cultural guardrails — no romance / no deity / respectful tone invariants tested).

</decisions>

<canonical_refs>
## Canonical References

- `.planning/PROJECT.md` — cultural constraints (Islamic context, no music, no faces, no romance)
- `src/game/systems/DialogueEngine.js` — engine to wrap
- `src/services/dialogueMemory.js` (to be created) — new memory service
- `src/data/npcs.json` — 140 NPCs
- `src/data/ink/**` — ink story files
- IndexedDB schema for conversation summaries

</canonical_refs>

<specifics>
## Specific Ideas
- Conversation summary = {npcId, lastTopic, lastMood, timestamp, vocabTaught[], playerChoices[]} — small fixed-size record
- Mood progression: neutral → friendly → trusted (unlocks new dialogue) based on interaction count
- NPC mood decay: gentle drift toward neutral if unseen for 7+ days (gameplay days, not wall-clock)
- Hijab/cultural guardrail tests: automated check that no generated/selected dialogue line contains romance verbs or deity-reference patterns

</specifics>

<deferred>
## Deferred Ideas
- LLM-generated dialogue — infrastructure not ready; stick to template-driven
- Multi-NPC group conversations — defer
- NPC-to-NPC memory (NPCs gossiping about player) — defer
- Voice synthesis of NPC lines — defer

</deferred>

---

*Phase: 100-dynamic-npc-ai-with-memory*
*Context stubbed: 2026-04-17. Run `/gsd-plan-phase 100` to produce RESEARCH + PLAN + VALIDATION.*
*Depends on Phases 97, 98, 99 completing first.*
