---
phase: 260318-tot
plan: 01-03
subsystem: menu-systems, gameplay-dispatchers, gift-system
tags: [routes, pause-menu, settings, codex, faction, journal, endgame, gifts, dialogue]
dependency_graph:
  requires: [codexSlice, factionSlice, journalSlice, endgameSlice, npcSlice, inventorySlice, gifts.js, weeklyRotation.js]
  provides: [/skill-tree route, /save-load route, /completion route, /codex route, CodexMenu, AccessibilityPanel in Settings, live faction alignment, live journal entries, live codex unlocks, weekly challenge boot, gift-giving UI]
  affects: [GameLayout, routes.jsx, SettingsMenu, DialogueOverlay, DialogueBox, useZoneEvents, useDialogueEvents]
tech_stack:
  patterns: [lazy routes, EventBus emit/listen, Redux dispatch in event hooks, inline gift panel]
key_files:
  created:
    - src/components/Menu/CodexMenu.jsx
  modified:
    - src/routes.jsx
    - src/components/Router/GameLayout.jsx
    - src/components/Menu/SettingsMenu.jsx
    - src/hooks/useZoneEvents.js
    - src/hooks/useDialogueEvents.js
    - src/components/NPC/DialogueBox.jsx
    - src/components/NPC/DialogueOverlay.jsx
decisions:
  - "GIFTS_BY_ID lookup uses item.itemId (not item.id) — matches inventorySlice { itemId, quantity, locked } schema"
  - "Cultural note codex unlock uses dialogue:cultural_note_shown custom EventBus event emitted from DialogueBox with guard ref"
  - "NPC first-meet journal checked in useDialogueEvents handleNpcInteract (not useNarrativeEvents) — avoids duplicate listener"
  - "Gift button only visible in normal dialogue line phase — not when showGiftPanel is open"
metrics:
  duration: ~25 minutes
  completed_date: "2026-03-18"
---

# Quick Task 260318-tot: Wire All Disconnected Systems Into Live Game

**One-liner:** Wired all isolated components (SkillTreeMenu, SaveLoadMenu, CompletionTracker, CodexMenu, AccessibilityPanel, factionSlice, codexSlice, journalSlice, endgameSlice, gift system) into live gameplay routes, PauseMenu buttons, and event dispatchers.

## What Was Done

### Plan 01 — Menu Systems Wired

Four fully-built components had no routes, no buttons, and no entry points. Fixed:

- **CodexMenu.jsx created** (`src/components/Menu/CodexMenu.jsx`): Progress bar (unlocked/308), entry grid showing unlocked IDs, locked placeholder cards, back navigation. Uses `selectCodexProgress`, `selectUnlockedEntries`, `clearNewCount`, `markRead`.

- **Four lazy routes registered** in `src/routes.jsx`: `/skill-tree` → SkillTreeMenu, `/save-load` → SaveLoadMenu, `/completion` → CompletionTracker, `/codex` → CodexMenu. Each wrapped in standard `PageTransition > ErrorBoundary > Suspense` pattern.

- **PauseMenu gets 4 new buttons** in `GameLayout.jsx`: Skill Trees, Codex, Save / Load, Completion — between Wardrobe and Main Menu, using `pauseMenuBtnActivities` class.

- **AccessibilityPanel added to SettingsMenu**: Imported and rendered in a new `settingsSection` div below the Display section.

### Plan 02 — Gameplay Dispatchers Live

Four Redux slices had functional reducers but nothing dispatched to them during gameplay:

- **useZoneEvents.js**: Added TRAVEL journal entry on first zone visit (checked before `visitZone` dispatch), QUEST journal + `adjustAlignment(+10)` on quest completion, `setWeeklyChallenge` in a mount useEffect (ISO week calculation, avoids overwriting same challenge).

- **useDialogueEvents.js**: Added SOCIAL journal entry on first NPC meeting (checked against `npcsVisited` before `visitNpc` dispatch), `unlockEntry` codex dispatch on `dialogue:cultural_note_shown` event.

- **DialogueBox.jsx**: Added `useEffect` that emits `dialogue:cultural_note_shown` when `allComplete && line.culturalNote` — guarded by a `useRef` reset per line to prevent re-emits on re-renders.

- **NPC_FACTION_MAP**: Module-level reverse map built from `FACTIONS.npcMembers` for O(1) npcId → factionId lookup.

### Plan 03 — Gift-Giving UI Live

The gift system (100+ items in gifts.js, `giveNpcGift` in npcSlice, friendshipMiddleware) was fully built but had no UI entry point:

- **Gift button** added to normal dialogue panel in `DialogueOverlay.jsx` — gold border, only visible when gift panel is closed.

- **Gift panel** shows giftable inventory items (filtered by `GIFTS_BY_ID[item.itemId]` lookup or category match). Shows item name, Arabic name, quantity.

- **handleGiveGift**: Dispatches `giveNpcGift({ npcId, giftId: item.itemId, relationshipDelta })`, `removeItem({ itemId, quantity: 1 })`, and `showNotification` with reaction text (loves it / really likes it / appreciates it / dislikes it).

- **getGiftDelta** helper function added above component — uses `npcPreferences.loved/liked/disliked` arrays, falls back to `relationshipGain.normal` or 5.

## Verification

- `npm run build` passes cleanly for all three plans (no import errors, no missing refs)
- CodexMenu.jsx is a valid lazy-importable component with no required external data
- All four new route paths render the correct component via lazy loading
- Four PauseMenu buttons navigate and close the menu
- Weekly challenge set in Redux on GameLayout mount
- Journal entries dispatched on zone visit, quest complete, NPC first meet
- Faction alignment adjusted on quest completion (if npcGiver maps to a faction)
- Codex entry unlocked on cultural dialogue line completion
- Gift panel renders, dispatches correctly, removes item from inventory

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] NPC first-meet journal moved to useDialogueEvents instead of useNarrativeEvents**
- **Found during:** Plan 02 Task 2
- **Issue:** Plan suggested adding a second `NPC_INTERACT` listener in `useNarrativeEvents.js`. But `useDialogueEvents.js` already has a `handleNpcInteract` handler for that same event — adding a duplicate listener in a different hook would be redundant and harder to maintain.
- **Fix:** Added the journal dispatch inline in the existing `handleNpcInteract` in `useDialogueEvents.js`, before `dispatch(visitNpc(npcId))`.
- **Files modified:** `src/hooks/useDialogueEvents.js`

**2. [Rule 2 - Missing critical] removeItem called with { itemId, quantity } not itemId string**
- **Found during:** Plan 03 Task 1
- **Issue:** `inventorySlice.removeItem` expects `{ itemId, quantity }` payload, and inventory items use `item.itemId` not `item.id`. Plan's pseudocode used `removeItem(inventoryItem.id)`.
- **Fix:** Used `dispatch(removeItem({ itemId: inventoryItem.itemId, quantity: 1 }))` and `GIFTS_BY_ID[item.itemId]` throughout gift panel logic.
- **Files modified:** `src/components/NPC/DialogueOverlay.jsx`

**3. [Rule 2 - Missing critical] `computeGiftDelta` already exported from gifts.js**
- **Found during:** Plan 03 Task 1
- **Issue:** Plan said to inline a `getGiftDelta` helper. `gifts.js` already exports `computeGiftDelta` — however the plan's inline version has slightly different fallback behavior. Kept inline version as specified for clarity and to avoid importing an extra function.
- **Files modified:** None (decision point only)

## Self-Check: PASSED

- `src/components/Menu/CodexMenu.jsx` — FOUND
- `src/hooks/useZoneEvents.js` — FOUND (modified)
- `src/hooks/useDialogueEvents.js` — FOUND (modified)
- `src/components/NPC/DialogueOverlay.jsx` — FOUND (modified)
- Commit `a79d86b` (Plan 01) — FOUND
- Commit `792cffe` (Plan 02) — FOUND
- Commit `70854f8` (Plan 03) — FOUND
