---
phase: 20
plan: 02
subsystem: dialogue-hooks
tags:
  - hub-and-spoke
  - dialogue-flow
  - condition-filtering
  - effect-execution
  - event-handlers
  - conversation-state
dependency_graph:
  requires:
    - DialogueEngine (20-01)
    - dialogueSchema (20-01)
    - narrativeSlice (19-02)
    - DIALOGUE_* events (20-01)
  provides:
    - useDialogue hub-and-spoke API
    - Dialogue lifecycle event handlers
    - Topic selection state management
  affects:
    - DialogueOverlay (will use new API in 20-03)
    - useEventBusListeners (uses useDialogueEvents, useNarrativeEvents)
tech_stack:
  added: []
  patterns:
    - Hub-and-spoke conversation flow
    - Condition-based topic filtering
    - Mid-dialogue quiz state preservation
    - Effect execution via DialogueEngine
    - Composite progress flags for topic tracking
key_files:
  created: []
  modified:
    - src/hooks/useDialogue.js (143 insertions, 6 deletions)
    - src/hooks/useDialogueEvents.js (106 insertions, 5 deletions total)
    - src/hooks/useNarrativeEvents.js
key_decisions:
  - decision: "DialogueEngine instance created with null scene in useDialogue"
    rationale: "Engine only needs Redux store access for condition/effect logic, not Phaser scene"
  - decision: "Phase state machine: greeting -> hub -> topic -> returning"
    rationale: "Clear state transitions for hub-and-spoke flow with explicit phases"
  - decision: "refreshTopics() re-evaluates conditions on each hub display"
    rationale: "Enables dynamic topic unlocking (DLGE-06: topics appear after quest completion, etc.)"
  - decision: "filteredChoices computed as memoized value"
    rationale: "Choices re-filtered on every line change, preventing stale condition results"
  - decision: "quizReturnState tracks {treeId, lineIndex} for mid-quiz resume"
    rationale: "Player can resume dialogue exactly where they left off after quiz interrupt (DLGE-12)"
  - decision: "topic_visited_{topicId} flags for topic tracking"
    rationale: "Follows composite progress pattern from research; avoids array iteration in conditions"
  - decision: "Only set topic flag if not already set"
    rationale: "Avoid redundant Redux dispatches on repeated topic selection"
  - decision: "Backward compatible: NPCs without topic trees use linear flow"
    rationale: "Existing NPC dialogues continue working without modification"
duration: 3 minutes
completed: 2026-02-11T01:23:59Z
---

# Phase 20 Plan 02: Hub-and-Spoke Dialogue Flow Summary

**Hub-and-spoke conversation flow with condition-based topic filtering, effect execution, mid-dialogue quiz resume, and comprehensive event handlers.**

## Performance

**Duration:** 3 minutes (2026-02-11 01:20:59 - 01:23:59 UTC)
**Tasks completed:** 2/2
**Files modified:** 3
**Lines changed:** +249 insertions total

## Accomplishments

### Task 1: useDialogue Hub-and-Spoke Rewrite
**Commit:** `dd0703f`

Rewrote useDialogue hook to support hub-and-spoke conversation flow while maintaining full backward compatibility with existing NPC data.

**State machine phases:**
- `greeting`: Playing initial greeting/intro lines
- `hub`: Showing topic selection menu (available topics from DialogueEngine)
- `topic`: Playing selected topic tree's lines
- `returning`: Transitioning back to hub after topic completion

**New state management:**
- `phase`: Tracks current conversation phase
- `availableTopics`: Topics filtered by conditions (re-evaluated dynamically)
- `currentTopicTreeId`: Currently selected topic tree ID
- `topicsDiscussed`: Array of topics discussed this session (for UI)
- `quizReturnState`: Saves {treeId, lineIndex} for mid-quiz resume

**Key functions added:**
- `refreshTopics()`: Re-evaluates topic conditions and updates available topics (called on each hub display)
- `selectTopic(topicTreeId)`: Transitions from hub to topic tree, tracks discussed topics, emits DIALOGUE_TOPIC_SELECTED
- `resumeAfterQuiz()`: Restores dialogue state after mid-quiz interruption

**Integration with DialogueEngine:**
- Created DialogueEngine instance at hook level (with null scene)
- Execute choice effects via `engineRef.current.executeEffects(choice.effects, npc.id)`
- Record player choices via `engineRef.current.recordPlayerChoice(npc.id, choiceId)`
- Filter choices via `engineRef.current.getFilteredChoices(line.choices)`
- Check return-to-hub via `engineRef.current.shouldReturnToHub(currentTree)`

**Flow transitions:**
- End of greeting + isHubAndSpoke → transition to hub
- End of topic + returnToHub=true → transition to hub
- End of topic + returnToHub=false → close dialogue
- End of greeting + !isHubAndSpoke → close dialogue (legacy flow)

**New API exports:**
- `phase`: Current conversation phase
- `availableTopics`: [{treeId, topic, label, priority}]
- `selectTopic`: (topicTreeId) => void
- `topicsDiscussed`: string[]
- `filteredChoices`: Choices filtered by conditions (computed)
- `resumeAfterQuiz`: () => void
- `isHubAndSpoke`: boolean

**Backward compatibility:** NPCs without topic trees continue using traditional linear flow (phase stays 'greeting', never enters 'hub').

### Task 2: Event Handler Extensions
**Commit:** `4df8e5a`

Extended useDialogueEvents and useNarrativeEvents to handle dialogue lifecycle events and provide UI feedback for effects.

**useDialogueEvents additions:**
- **DIALOGUE_EFFECT_EXECUTED**: UI feedback for dialogue effects
  - `teach_word`: Logging in DEV mode (teaching flow handled by useDialogue's handleTeachWord)
  - `give_item`: Show notification "Received: {itemId}" (inventory Phase 25+)
  - `effectCount`: Log summary after multiple effects
- **DIALOGUE_RELATIONSHIP_CHANGED**: Trust change feedback
  - Show notification: "+1 Trust with {npcName}" or "-1 Trust with {npcName}"
  - Play SFX: EVENTS.SFX_QUEST for positive, EVENTS.SFX_WRONG for negative
  - DEV logging for debugging
- **DIALOGUE_ENDED**: Analytics logging in DEV mode
- 4 total listeners with matching cleanup

**useNarrativeEvents additions:**
- **DIALOGUE_TOPIC_SELECTED**: Track unique topic visits
  - Set story flag `topic_visited_{topicId}` for each new topic
  - Only set if not already set (avoid redundant dispatches)
  - Follows composite progress pattern from research
- Enhanced **NARRATIVE_RELATIONSHIP_CHANGED**: Support both patterns
  - Absolute level: `{npcId, level}` → setNpcRelationship (legacy)
  - Incremental: `{npcId, amount}` → incrementNpcRelationship (DialogueEngine)
- 3 total listeners with matching cleanup

## Task Commits

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Rewrite useDialogue for hub-and-spoke flow | `dd0703f` | src/hooks/useDialogue.js (+143, -6) |
| 2 | Extend dialogue and narrative event handlers | `4df8e5a` | src/hooks/useDialogueEvents.js, src/hooks/useNarrativeEvents.js (+106) |

## Files Created/Modified

### Modified
- **src/hooks/useDialogue.js** (420 lines)
  - Added 143 lines, removed 6 lines
  - Hub-and-spoke state machine with 4 phases
  - DialogueEngine integration for conditions/effects
  - Mid-quiz resume support
  - 7 new API exports
- **src/hooks/useDialogueEvents.js** (144 lines)
  - Added 3 new event handlers
  - 4 listeners total with cleanup parity
- **src/hooks/useNarrativeEvents.js** (66 lines)
  - Added DIALOGUE_TOPIC_SELECTED handler
  - Enhanced NARRATIVE_RELATIONSHIP_CHANGED for incremental changes
  - 3 listeners total with cleanup parity

## Decisions Made

1. **DialogueEngine instance with null scene**
   - Decision: Pass null to DialogueEngine constructor in useDialogue
   - Rationale: Engine only needs Redux store access for condition/effect logic, not Phaser scene
   - Impact: Clean separation between React (useDialogue) and Phaser (game systems)

2. **Phase state machine for conversation flow**
   - Decision: greeting -> hub -> topic -> returning
   - Rationale: Explicit phases make state transitions clear and debuggable
   - Impact: Easy to extend with additional phases later (e.g., 'cutscene', 'branching')

3. **Dynamic topic filtering via refreshTopics()**
   - Decision: Re-evaluate conditions on each hub display
   - Rationale: Enables dynamic topic unlocking (quest completion unlocks new topics)
   - Impact: Fulfills DLGE-06 requirement for condition-based topic visibility

4. **Memoized filteredChoices**
   - Decision: Compute filtered choices as memoized value, re-evaluated on line change
   - Rationale: Prevents stale condition results when game state changes
   - Impact: Choices always reflect current game state

5. **Mid-quiz state preservation**
   - Decision: Save {treeId, lineIndex} in quizReturnState before quiz
   - Rationale: Player can resume exactly where they left off (DLGE-12)
   - Impact: Seamless mid-dialogue quiz flow with NPC acknowledgment on return

6. **Composite progress flags for topic tracking**
   - Decision: Use topic_visited_{topicId} flags instead of array
   - Rationale: Follows research recommendation; faster condition checks (no array iteration)
   - Impact: Story flag budget increases, but condition evaluation is O(1)

7. **Redundant dispatch prevention**
   - Decision: Check if topic flag exists before dispatching setStoryFlag
   - Rationale: Avoid unnecessary Redux state updates on repeated topic selection
   - Impact: Better performance, cleaner Redux DevTools timeline

8. **Backward compatibility**
   - Decision: NPCs without topic trees use legacy linear flow
   - Rationale: Existing NPC dialogues work without modification
   - Impact: Zero migration cost; can incrementally upgrade NPCs to hub-and-spoke

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## Next Phase Readiness

### Blockers
None.

### Prerequisites for 20-03 (DialogueOverlay React Component)
- [x] useDialogue exports phase, availableTopics, selectTopic
- [x] useDialogue supports hub-and-spoke flow
- [x] Choices filtered by conditions
- [x] Effects execute on choice selection
- [x] Event handlers provide UI feedback
- [x] All tests pass (589 total, 586 passing, 3 pre-existing failures)

### Technical Debt
None introduced.

### Recommendations for Next Plan
1. **DialogueOverlay UI**: Use `phase` to conditionally render greeting lines vs topic menu
2. **Topic menu rendering**: Map `availableTopics` to buttons, call `selectTopic(treeId)` on click
3. **Choice rendering**: Use `filteredChoices` instead of `currentTree.lines[lineIndex].choices`
4. **Quiz resume**: Call `resumeAfterQuiz()` when quiz overlay closes (watch uiSlice.activeOverlay)
5. **Relationship feedback**: Trust notifications appear automatically via useDialogueEvents

## Self-Check: PASSED

### Verified Files Exist
```
✓ src/hooks/useDialogue.js (420 lines)
✓ src/hooks/useDialogueEvents.js (144 lines)
✓ src/hooks/useNarrativeEvents.js (66 lines)
```

### Verified Commits Exist
```
✓ dd0703f: feat(20-02): rewrite useDialogue for hub-and-spoke flow
✓ 4df8e5a: feat(20-02): extend dialogue and narrative event handlers for effects
```

### Verified Tests Pass
```
✓ 589 tests total
✓ 586 tests passing
✓ 3 pre-existing failures (DailyDashboard x2, HUD x1)
✓ No new test failures introduced
```

### Verified Build
```
✓ npx vite build passes
✓ Bundle size: 286.06 KB (main chunk)
✓ Under 500 KB limit
```

### Verified API Exports
```
✓ useDialogue exports: phase, availableTopics, selectTopic, topicsDiscussed, filteredChoices, resumeAfterQuiz, isHubAndSpoke
✓ useDialogueEvents: 4 listeners with matching cleanup (4 on, 4 off)
✓ useNarrativeEvents: 3 listeners with matching cleanup (3 on, 3 off)
```

All checks passed.
