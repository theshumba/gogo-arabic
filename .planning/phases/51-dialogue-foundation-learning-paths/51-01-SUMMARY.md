---
phase: 51-dialogue-foundation-learning-paths
plan: 01
subsystem: dialogue
tags: [inkjs, ink, dialogue, redux, vite, chunking, learning-paths]

# Dependency graph
requires:
  - phase: 50-bundle-optimization
    provides: "Bundle at 402KB with Vite manualChunks infrastructure already in place"
  - phase: 50-world-state
    provides: "worldStateSlice with setFlag/selectFlag and WORLD_STATE_KEYS constants"
provides:
  - "inkjs 2.4.0 installed as runtime dependency"
  - "InkDialogueEngine adapter class with legacy JSON fallback pattern"
  - "Vite ink-vendor and ink-dialogue manual chunk configuration"
  - "5 compiled .ink.json dialogue files for pilot NPCs"
  - "5 .ink source files with Arabic dialogue and EXTERNAL function declarations"
  - "scripts/compile-ink.mjs build script using inkjs/compiler/Compiler"
  - "ink:compile npm script"
affects:
  - 51-02 (companion-dialogue)
  - 51-03 (amira-path-choice-tree)
  - 51-04 (learning-path-fsrs)
  - Phase 54 (gossip, inscriptions)
  - Any future NPC ink dialogue work

# Tech tracking
tech-stack:
  added:
    - "inkjs@2.4.0 — compiled .ink.json story runtime (zero deps, ESM)"
  patterns:
    - "Adapter pattern: InkDialogueEngine tries .ink.json first, falls back to legacy DialogueEngine"
    - "import.meta.glob for Vite-safe build-time enumeration of all .ink.json files"
    - "Lazy import('inkjs') inside loadForNpc() so inkjs never enters main bundle"
    - "EXTERNAL function declarations required in .ink source for inkjs compiler"
    - "syncStateIn/syncStateOut pattern for Redux ↔ ink variablesState bridging"

key-files:
  created:
    - src/game/systems/InkDialogueEngine.js
    - src/data/ink-source/guide-amira.ink
    - src/data/ink-source/scholar-yusuf.ink
    - src/data/ink-source/merchant-fatima.ink
    - src/data/ink-source/student-khalid.ink
    - src/data/ink-source/librarian-ibrahim.ink
    - src/data/ink/guide-amira.ink.json
    - src/data/ink/scholar-yusuf.ink.json
    - src/data/ink/merchant-fatima.ink.json
    - src/data/ink/student-khalid.ink.json
    - src/data/ink/librarian-ibrahim.ink.json
    - scripts/compile-ink.mjs
  modified:
    - package.json (inkjs dependency + ink:compile script)
    - package-lock.json
    - vite.config.js (ink-vendor + ink-dialogue manualChunks)

key-decisions:
  - "inkjs Compiler requires EXTERNAL keyword declarations in .ink source — plan omitted these, auto-fixed"
  - "import.meta.glob with lazy loader pattern chosen over direct dynamic import for Vite chunk safety"
  - "syncStateOut iterates WORLD_STATE_KEYS values (known safe set) not raw ink globalVariables to avoid store pollution"

patterns-established:
  - "EXTERNAL declarations: all .ink files must declare EXTERNAL for every function called via ~ syntax"
  - "Ink compile workflow: edit src/data/ink-source/*.ink, run npm run ink:compile, commit both .ink and .ink.json"
  - "New ink NPCs: add .ink source + compile; InkDialogueEngine picks up via import.meta.glob automatically"

requirements-completed:
  - INFRA-07
  - INFRA-08
  - INFRA-09

# Metrics
duration: 25min
completed: 2026-03-19
---

# Phase 51 Plan 01: Ink Dialogue Foundation Summary

**inkjs adapter with Redux bridge (syncStateIn/syncStateOut), 5 BindExternalFunction bindings, and 5 pilot NPC .ink.json files compiled from Arabic-language ink source**

## Performance

- **Duration:** 25 min
- **Started:** 2026-03-19T23:30:00Z
- **Completed:** 2026-03-19T23:55:00Z
- **Tasks:** 2/2
- **Files modified:** 15

## Accomplishments
- inkjs 2.4.0 installed; Vite chunked to ink-vendor (separate from main bundle) via manualChunks
- InkDialogueEngine.js adapter class: ink Story + legacy DialogueEngine fallback, same interface for all callers
- 5 pilot NPCs (guide-amira, scholar-yusuf, merchant-fatima, student-khalid, librarian-ibrahim) have compiled .ink.json files ready to be loaded by the adapter
- Redux ↔ ink bridge: syncStateIn() pushes worldState.flags + player.learningPath into ink variablesState; syncStateOut() flushes mutations back via setFlag dispatches
- compile-ink.mjs build script using official inkjs/compiler/Compiler (not hand-rolled JSON)

## Task Commits

Each task was committed atomically:

1. **Task 1: Install inkjs + Create InkDialogueEngine adapter + Vite chunking** - `9e95199` (feat)
2. **Task 2: Author 5 pilot NPC compiled .ink.json dialogue files** - `8b33735` (feat)

**Plan metadata:** (docs commit below)

## Files Created/Modified
- `src/game/systems/InkDialogueEngine.js` - Adapter wrapping ink Story with legacy DialogueEngine fallback; syncStateIn/syncStateOut; 5 BindExternalFunction bindings
- `src/data/ink-source/guide-amira.ink` - Amira general dialogue (Arabic, cultural content, EXTERNAL declarations)
- `src/data/ink-source/scholar-yusuf.ink` - Yusuf manuscript scholar dialogue (Arabic, historical content)
- `src/data/ink-source/merchant-fatima.ink` - Fatima trade dialogue (Arabic, Silk Road content)
- `src/data/ink-source/student-khalid.ink` - Khalid fellow-student dialogue (Arabic, learning tips)
- `src/data/ink-source/librarian-ibrahim.ink` - Ibrahim library dialogue (Arabic, manuscript content)
- `src/data/ink/guide-amira.ink.json` - Compiled ink story (inkVersion: 21)
- `src/data/ink/scholar-yusuf.ink.json` - Compiled ink story (inkVersion: 21)
- `src/data/ink/merchant-fatima.ink.json` - Compiled ink story (inkVersion: 21)
- `src/data/ink/student-khalid.ink.json` - Compiled ink story (inkVersion: 21)
- `src/data/ink/librarian-ibrahim.ink.json` - Compiled ink story (inkVersion: 21)
- `scripts/compile-ink.mjs` - Node.js build script using inkjs/compiler/Compiler
- `package.json` - Added inkjs dependency + ink:compile script
- `vite.config.js` - Added ink-vendor and ink-dialogue manualChunks entries

## Decisions Made
- syncStateOut() iterates WORLD_STATE_KEYS values (known safe set) rather than raw ink globalVariables to prevent unknown ink-internal variables from polluting the Redux store
- import.meta.glob used at module level (not inside loadForNpc) so Vite can enumerate files at build time — this is the Vite-safe dynamic import pattern from RESEARCH.md

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Added EXTERNAL declarations to all .ink source files**
- **Found during:** Task 2 (compile script execution)
- **Issue:** inkjs Compiler threw "Compilation failed" when .ink files used `~ changeRelationship(...)` without EXTERNAL keyword declarations. The plan's sample ink source omitted the required `EXTERNAL functionName(params)` declarations at the top of each .ink file.
- **Fix:** Added `EXTERNAL changeRelationship(npcId, amount)`, `EXTERNAL setLearningPath(path)`, `EXTERNAL startQuest(questId)`, `EXTERNAL getFlag(key)`, and `EXTERNAL getLearningPath()` to the top of all 5 .ink source files before compilation
- **Files modified:** All 5 `src/data/ink-source/*.ink` files
- **Verification:** `npm run ink:compile` succeeded for all 5 files; all .ink.json have inkVersion: 21
- **Committed in:** `8b33735` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)
**Impact on plan:** Auto-fix was necessary for compilation to succeed. All ink source content from the plan was preserved exactly. The EXTERNAL declarations are a required ink language feature, not an addition to scope.

## Issues Encountered
- inkjs Compiler requires `EXTERNAL` keyword declarations in ink source for all functions called via `~` syntax — not documented in plan but required by ink language spec. Fixed by adding declarations to all 5 source files.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- INFRA-07, INFRA-08, INFRA-09 all satisfied
- InkDialogueEngine.js is ready to be instantiated by NPC interaction scenes
- 5 pilot NPCs have ink files — talking to any of them will use ink path; all other NPCs fall back to legacy DialogueEngine automatically
- Plan 51-03 (Amira path-choice tree) can extend guide-amira.ink with the full learning path choice sequence
- Pattern established: `npm run ink:compile` regenerates all .ink.json from source

---
*Phase: 51-dialogue-foundation-learning-paths*
*Completed: 2026-03-19*

## Self-Check: PASSED

Files verified:
- FOUND: src/game/systems/InkDialogueEngine.js
- FOUND: src/data/ink/guide-amira.ink.json
- FOUND: src/data/ink/scholar-yusuf.ink.json
- FOUND: src/data/ink/merchant-fatima.ink.json
- FOUND: src/data/ink/student-khalid.ink.json
- FOUND: src/data/ink/librarian-ibrahim.ink.json
- FOUND: scripts/compile-ink.mjs

Commits verified:
- FOUND: 9e95199 (Task 1 — InkDialogueEngine adapter)
- FOUND: 8b33735 (Task 2 — 5 NPC ink files)
