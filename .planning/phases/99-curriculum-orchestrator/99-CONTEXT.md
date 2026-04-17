# Phase 99: Curriculum Orchestrator - Context

**Gathered:** 2026-04-17
**Status:** CONTEXT stub — NOT yet planned. Run `/gsd-plan-phase 99` when ready.
**Source:** Orchestrator-captured from v18.0 Advanced AI Systems milestone brief

<domain>
## Phase Boundary

Build a single learning director that ties together every existing Gogo Arabic learning system — FEAT-042 through FEAT-050 (core 100 high-frequency words, trilateral root system, zone vocabulary pre-teaching, grammar scaffolding, frequency-weighted ordering, zone intro teaching middleware, teaching sessions, curriculum progress dashboard) — into a unified player-facing decision engine. The orchestrator decides **"what should the player do next"** across FSRS review, grammar lessons, zone vocab, root families, and mini-games based on player state.

This is the first phase of v18.0 Advanced AI Systems. It does NOT introduce new learning content; it orchestrates what already exists.

</domain>

<decisions>
## Implementation Decisions (locked at stub time)

### Scope
- **In scope:** Decision engine that selects next learning activity across FSRS review, grammar lessons, zone vocabulary gaps, root family coverage, and mini-games, based on player state. Surfaces recommendations in Daily Dashboard and after every quest/teaching session.
- **Out of scope:** New learning content (vocab, grammar, etc. — already shipped). Modifying FSRS algorithm. Modifying curriculum dashboard data layer (FEAT-050). Replacing the skill tree system. Adding voice recognition.

### Hard Constraints
- Must respect CEFR progression gates across all skill dimensions (vocabulary, grammar, reading, writing, conversation).
- Must not recommend content the player has already mastered (FSRS mastery ≥ 0.9).
- Must produce a deterministic recommendation for a given player-state input (testable).
- Must not touch game logic — purely a selection layer reading existing state.

### Depends On
- Phase 97 (Visual Rebuild) — stable visual layer so dashboard updates don't regress.
- Phase 98 (Code Health) — stable codebase so orchestrator builds on clean foundation.
- All v12.0 Learning Systems + Ralph FEAT-042..050 — the components being orchestrated.

### Preserve
- All existing learning activities (FSRS review, grammar, writing, reading, conversation, mini-games)
- Daily Dashboard structure (orchestrator adds to it, doesn't replace it)
- All FSRS card state and scheduler behaviour

### Requirements (to be defined during plan-phase)
- Preliminary: ORCH-01 (orchestrator selects next activity), ORCH-02 (CEFR gating respected), ORCH-03 (no mastered-content recommendations), ORCH-04 (deterministic for given state), ORCH-05 (surfaces in Daily Dashboard), ORCH-06 (surfaces after quest/teaching), ORCH-07 (telemetry — record which recommendations users follow).

</decisions>

<canonical_refs>
## Canonical References

- `.planning/PROJECT.md` — validated features, CEFR system, FSRS
- `.planning/STATE.md` — Ralph FEAT-042 through FEAT-050 (the components)
- `scripts/ralph/progress.txt` — latest FEAT details and learnings
- `src/services/curriculumDashboard.js` (FEAT-050) — existing aggregation layer
- `src/services/teachingSession.js` (FEAT-049) — existing teaching flow
- `src/data/trilateralRoots.js` (FEAT-043) — root system
- `src/data/vocabFrequency.js` (FEAT-047) — frequency-weighted ordering
- `.planning/REQUIREMENTS.md` — CEFR progression requirements

</canonical_refs>

<specifics>
## Specific Ideas
- Pure-function decision engine (no side effects) — easy to unit test deterministically
- Input: player state snapshot (FSRS counts, grammar progress, zone mastery, recently-completed activities)
- Output: ordered list of suggested activities with rationale ("you have 12 FSRS cards due", "grammar lesson A2.3 unlocks next zone")
- Start simple: rule-based priority → later layer in A/B tested weighting if needed
- Reuse existing selectors from `curriculumDashboard.js` for state reads

</specifics>

<deferred>
## Deferred Ideas
- Machine-learning-based recommendation weights — out of scope for MVP orchestrator
- Cross-player social recommendations ("other players at your level studied X") — out of scope
- Native mobile app integration — out of scope (web-first)
- LLM-based natural-language recommendations — separate phase

</deferred>

---

*Phase: 99-curriculum-orchestrator*
*Context stubbed: 2026-04-17. Run `/gsd-plan-phase 99` to produce RESEARCH + PLAN + VALIDATION.*
*Depends on Phases 97, 98 completing first.*
