# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-10)

**Core value:** Players naturally learn Arabic through guided exploration and interaction in an engaging RPG world — never wondering "what should I do next?" or "how do I practice?"
**Current focus:** Phase 20 - Dialogue System

## Current Position

Phase: 20 of 26 (Dialogue System)
Plan: 3 of 6 in current phase (in progress)
Status: In progress — Wave 2 complete, Wave 3 next
Last activity: 2026-02-11 — Completed 20-04-PLAN.md (NPC Personality & Hub-Spoke Dialogue)

Progress: [█░░░░░░░░░] 15.0% (1/8 v5.0 phases complete, 3/6 plans in Phase 20 complete)

### Shipped Milestones

| Version | Phases | Plans | Date |
|---------|--------|-------|------|
| v2.0 Player Experience | 1-9 | 14 | 2026-02-08 |
| v3.0 Infrastructure | 10-11 | 11 | 2026-02-09 |
| v4.0 Game Soul & Polish | 14-18 | 8 | 2026-02-10 |

## Performance Metrics

**v2.0:** 9 phases, 14 plans, 253 files, 1 day
**v3.0:** 2 phases (of 4), 11 plans, 1 day
**v4.0:** 5 phases, 8 plans, 28 files, 1,526 insertions, 1 day

**Cumulative:** 16 phases, 33 plans shipped across 3 milestones in 3 days

**v5.0 in progress:**
- Total plans completed: 7 (19-01, 19-02, 19-03, 19-04, 20-01, 20-02, 20-04)
- Phase 19 complete: 4/4 plans shipped
- Phase 20 in progress: 3/6 plans complete (Wave 2 complete)

## Accumulated Context

### Decisions

Decisions logged in PROJECT.md Key Decisions table.
Recent decisions affecting v5.0:

- v4.0: Zero new dependencies — Howler.js + Phaser 3 + Framer Motion sufficient
- v4.0: Parallel execution preferred by user for speed
- v3.0: Skip TypeScript migration — UX fixes higher priority
- v2.0: CSS Modules for new components — consistency pattern

**Phase 19 decisions (19-01):**
- eventBusTypes.js: 33 constants (30 planned + open-shop discovered via grep), frozen object
- event naming: source:category:action (phaser: or react: prefix shows data flow direction)
- test files updated atomically: 3 test files asserting old event names updated in same Task 2 commit

**Phase 19 decisions (19-02):**
- narrativeSlice: resetNarrativeProgress uses `return { ...initialState }` spread for clean immutable reset
- narrativeSlice: selectHasMadeChoice is memoized via createSelector (iterates array); selectNarrativeFlagCount is plain (O(1) Object.keys)
- sceneMock: sys.scene.manager added alongside scene.manager — SceneStackManager uses both access patterns
- narrativeSlice: story flag budget is 50 max with DEV-mode console.warn (not enforced hard limit)

**Phase 20 decisions (20-01):**
- dialogueSchema: All new fields optional for backward compatibility — existing npcs.json validates without modification
- DialogueEngine: Condition evaluation uses AND-combination (all conditions must pass)
- DialogueEngine: teach_word and give_item emit events rather than directly mutating state (React handles FSRS, inventory not yet implemented)
- DialogueEngine: relationship_change emits DIALOGUE_RELATIONSHIP_CHANGED for real-time UI feedback

**Phase 20 decisions (20-02):**
- useDialogue: Phase state machine (greeting -> hub -> topic -> returning) for hub-and-spoke flow
- useDialogue: DialogueEngine instance created with null scene (only needs Redux store access)
- useDialogue: refreshTopics() re-evaluates conditions on each hub display for dynamic topic unlocking
- useDialogue: quizReturnState tracks {treeId, lineIndex} for mid-quiz resume
- useNarrativeEvents: topic_visited_{topicId} flags follow composite progress pattern (O(1) condition checks)
- useDialogue: Backward compatible with legacy linear flow for NPCs without topic trees

**Phase 20 decisions (20-04):**
- Hub tree replaces old "return_default" tree — becomes new default entry point for repeat visits
- Topic trees use returnToHub=true to enable player-controlled conversation flow
- Personality catchphrases are culturally authentic Arabic phrases with transliteration
- Quest ID conditions reference real quests from quests.json (validated during implementation)
- Composite story flags (npc_progress_scholar_yusuf) preferred over boolean flags for scalability
- InlineVocab limited to 1-3 words per line to avoid performance issues
- Relationship gates set at min 1-2 (accessible early) to encourage player-NPC bonding
- Backward compatibility: ALL existing dialogue trees kept intact, new trees added alongside

### Open Items Carried Forward
- Audio asset files (MP3s) need to be created/sourced
- Only 4 locked doors across 8 zones (partial coverage)
- Backend hardening deferred since v3.0 (Phases 12-13)

### v5.0 User Feedback Driving This Milestone
- Onboarding only teaches controls, not purpose — player lost from minute one
- World feels empty — houses, pillars, pond, trees. Nothing interactive.
- Can't enter buildings, chests are rocks with text
- No story or narrative pulling player forward
- No structure — doesn't know who to talk to or where to go
- NPCs feel like signposts, not characters
- "Every other game I play, I know where I'm going. I can't do that here."

### Blockers/Concerns

**Phase 19 DONE:**
- EventBus: 35 namespaced constants, zero raw strings
- narrativeSlice: story flags, NPC relationships, choice history, building visits
- useEventBusListeners: 22 LOC orchestrator + 5 domain sub-hooks (23 events)
- SceneStackManager: push/pop scene lifecycle with 7 tests
- Zod: dialogueSchema.js validates npcs.json at build time
- Tests: 561 total, 558 passing, bundle 280KB

**Phase 20 Wave 1 (20-01 DONE):**
- DialogueEngine: condition evaluation, effect execution, hub-and-spoke topic filtering
- Extended dialogueSchema: conditions, effects, personality, inlineVocab (all optional)
- 5 new dialogue EVENTS: TOPIC_SELECTED, EFFECT_EXECUTED, QUIZ_REQUESTED, ENDED, RELATIONSHIP_CHANGED
- Tests: 589 total, 586 passing (+28 DialogueEngine tests), bundle 280.85KB

**Phase 20 Wave 2 (20-02 DONE, 20-04 DONE):**
- useDialogue: Hub-and-spoke flow with greeting -> hub -> topic -> returning phases
- useDialogue: DialogueEngine integration (conditions, effects, topic filtering)
- useDialogue: 7 new API exports (phase, availableTopics, selectTopic, topicsDiscussed, filteredChoices, resumeAfterQuiz, isHubAndSpoke)
- useDialogueEvents: 3 new handlers (EFFECT_EXECUTED, RELATIONSHIP_CHANGED, ENDED) with UI feedback
- useNarrativeEvents: DIALOGUE_TOPIC_SELECTED handler for topic visit tracking
- **15 NPCs upgraded:** personality fields, hub-spoke dialogue (118 trees total)
- **NPC personality:** 8 distinct tones, culturally authentic catchphrases
- **Relationship gates:** 5 NPCs with gated topics (min 1-2)
- **Vocabulary teaching:** 14 NPCs with teachWord, 6 with inlineVocab highlights
- **Quest integration:** 10 NPCs can trigger quest starts
- Tests: 589 total, 586 passing (3 pre-existing failures), bundle 286.06KB

**v5.0 scope:**
- 100 requirements across 8 phases — largest milestone yet
- Content creation workload (30 NPC conversations, 15 interiors, 100 objects) significant
- Research suggests Infrastructure → Dialogue → Onboarding order to avoid rework

### Pending Todos

None.

## Session Continuity

Last session: 2026-02-11 (Phase 20 Wave 2 complete)
Stopped at: 20-04 complete — NPC Personality & Hub-Spoke Dialogue
Resume file: .planning/phases/20-dialogue-system/20-03-PLAN.md or 20-05-PLAN.md

**Next step:** Execute Plan 20-03 (DialogueOverlay React component) or Plan 20-05 (Wave 3)

**Note:** Plan 20-02 and 20-04 executed in parallel. Plan 20-03 may have been completed by parallel agent. Check .planning/phases/20-dialogue-system/ for summaries before proceeding.

---
*State initialized: 2026-02-08*
*Last updated: 2026-02-11 — Phase 20 Plan 04 complete*
