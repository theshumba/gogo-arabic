---
phase: 260318-tot
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/Router/GameLayout.jsx
  - src/routes.jsx
  - src/components/Menu/SettingsMenu.jsx
  - src/components/Menu/CodexMenu.jsx
autonomous: true

must_haves:
  truths:
    - "PauseMenu has buttons for Skill Trees, Codex, Save/Load, Completion Tracker"
    - "Each new PauseMenu button navigates to its route"
    - "SettingsMenu has an Accessibility section with AccessibilityPanel rendered below Display"
    - "CodexMenu component exists and renders codex entries from codexSlice"
    - "Routes /skill-tree, /codex, /save-load, /completion-tracker are registered and load correctly"
  artifacts:
    - path: "src/components/Menu/CodexMenu.jsx"
      provides: "Codex browser UI showing unlocked/locked entries with progress"
      min_lines: 60
    - path: "src/routes.jsx"
      provides: "Four new lazy routes: /skill-tree, /codex, /save-load, /completion-tracker"
    - path: "src/components/Router/GameLayout.jsx"
      provides: "PauseMenu with 4 new navigation buttons"
    - path: "src/components/Menu/SettingsMenu.jsx"
      provides: "AccessibilityPanel section below Display section"
  key_links:
    - from: "PauseMenu buttons"
      to: "navigate(route)"
      via: "onNavigate prop (already passed, dispatches toggleMenu then navigates)"
    - from: "src/routes.jsx"
      to: "SkillTreeMenu / SaveLoadMenu / CompletionTracker / CodexMenu"
      via: "lazy imports + Route element"
---

<objective>
Wire disconnected menu systems into the live game: add Skill Trees, Codex, Save/Load, and Completion Tracker buttons to PauseMenu; register their routes; render AccessibilityPanel in SettingsMenu; create CodexMenu component.

Purpose: All four systems are fully built (SkillTreeMenu.jsx, SaveLoadMenu.jsx, CompletionTracker.jsx, AccessibilityPanel.jsx) but unreachable — no buttons, no routes, no entry point.
Output: Four new PauseMenu buttons, four new routes, AccessibilityPanel in Settings, CodexMenu component.
</objective>

<execution_context>
@/Users/theshumba/.claude/get-shit-done/workflows/execute-plan.md
@/Users/theshumba/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

Existing components to wire up (all fully built, just disconnected):
- src/components/Skills/SkillTreeMenu.jsx — accepts no required props, self-contained
- src/components/SaveLoad/SaveLoadMenu.jsx — accepts onBack prop
- src/components/Endgame/CompletionTracker.jsx — self-contained
- src/components/Settings/AccessibilityPanel.jsx — self-contained
- src/store/slices/codexSlice.js — exports unlockEntry, selectUnlockedEntries, selectCodexProgress (308 total entries)

Pattern for new routes: lazy import + RouteFunction component wrapping in PageTransition > ErrorBoundary > Suspense. See SettingsRoute in routes.jsx for the template.
PauseMenu onNavigate prop: calls dispatch(toggleMenu()) then navigate(path) — already wired in GameLayout.jsx lines 303-307.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create CodexMenu component</name>
  <files>src/components/Menu/CodexMenu.jsx</files>
  <action>
    Create src/components/Menu/CodexMenu.jsx — a read-only codex browser showing unlocked entries and overall progress.

    Structure:
    - Import useSelector from react-redux, useNavigate from react-router-dom
    - Import selectUnlockedEntries, selectCodexProgress, selectNewEntryCount, clearNewCount, markRead from codexSlice.js
    - Import CODEX_ENTRIES from data/codex.js if the file exists; otherwise display a placeholder list using the 308-entry count from codexSlice

    Layout (inline styles matching game dark theme #1a1a2e background, #E63946 red accents):
    - Title: "Codex" + Arabic subtitle "الموسوعة"
    - Progress bar: "{unlocked} / 308 entries unlocked" with a filled bar (percentage from selectCodexProgress)
    - Entry grid or list: for each unlocked entry show its id (or name if available), for locked entries show "???" placeholder — max 308 total slots
    - If codex.js doesn't exist, show a message "No entries yet — discover lore by talking to NPCs and exploring the world" with the progress bar still visible
    - Back button that calls navigate(-1)

    Check if src/data/codex.js exists first (Bash: ls src/data/codex.js). If it does, import CODEX_ENTRIES and map over them; if not, just show the progress stats and a "explore to unlock entries" message. Do not create a codex.js data file — that's out of scope.

    No CSS module needed — use inline styles consistent with SettingsMenu.jsx containerStyle pattern (#1a1a2e background, gold #D4A843 accents for headers, red #E63946 for progress bar fill).
  </action>
  <verify>No import errors when routes.jsx lazy-imports the component. Component renders without crashing when navigating to /codex.</verify>
  <done>CodexMenu.jsx exists, imports cleanly from codexSlice, shows progress bar and entry state without runtime errors.</done>
</task>

<task type="auto">
  <name>Task 2: Register four new routes in routes.jsx</name>
  <files>src/routes.jsx</files>
  <action>
    Add four lazy imports and route components to src/routes.jsx, following the exact pattern of existing routes:

    1. Lazy imports (add after existing lazy block around line 36):
    ```
    const SkillTreeMenu = lazy(() => import('./components/Skills/SkillTreeMenu.jsx'));
    const SaveLoadMenu  = lazy(() => import('./components/SaveLoad/SaveLoadMenu.jsx'));
    const CompletionTracker = lazy(() => import('./components/Endgame/CompletionTracker.jsx'));
    const CodexMenu     = lazy(() => import('./components/Menu/CodexMenu.jsx'));
    ```

    2. Route function components (add after RootExplorerRoute, before the router export):
    ```
    function SkillTreeRoute() {
      const { goBack } = useGameNavigation();
      return (
        <PageTransition>
          <ErrorBoundary>
            <Suspense fallback={<LoadingScreen />}>
              <SkillTreeMenu onBack={goBack} />
            </Suspense>
          </ErrorBoundary>
        </PageTransition>
      );
    }

    function SaveLoadRoute() {
      const { goBack } = useGameNavigation();
      return (
        <PageTransition>
          <ErrorBoundary>
            <Suspense fallback={<LoadingScreen />}>
              <SaveLoadMenu onBack={goBack} />
            </Suspense>
          </ErrorBoundary>
        </PageTransition>
      );
    }

    function CompletionTrackerRoute() {
      const { goBack } = useGameNavigation();
      return (
        <PageTransition>
          <ErrorBoundary>
            <Suspense fallback={<LoadingScreen />}>
              <CompletionTracker onBack={goBack} />
            </Suspense>
          </ErrorBoundary>
        </PageTransition>
      );
    }

    function CodexRoute() {
      const { goBack } = useGameNavigation();
      return (
        <PageTransition>
          <ErrorBoundary>
            <Suspense fallback={<LoadingScreen />}>
              <CodexMenu onBack={goBack} />
            </Suspense>
          </ErrorBoundary>
        </PageTransition>
      );
    }
    ```

    3. Route entries (add inside the router array, after the /roots route):
    ```
    { path: '/skill-tree', element: <SkillTreeRoute />, errorElement: <RouteErrorBoundary /> },
    { path: '/save-load',  element: <SaveLoadRoute />,  errorElement: <RouteErrorBoundary /> },
    { path: '/completion', element: <CompletionTrackerRoute />, errorElement: <RouteErrorBoundary /> },
    { path: '/codex',      element: <CodexRoute />,     errorElement: <RouteErrorBoundary /> },
    ```

    Note: Check SkillTreeMenu.jsx and SaveLoadMenu.jsx signatures — if they don't accept onBack, pass nothing (do not break them with unused props; React ignores extra props but undefined destructuring can throw).
  </action>
  <verify>npm run build completes without import errors. Navigate to /skill-tree, /save-load, /completion, /codex — each loads its component.</verify>
  <done>All four routes registered in createBrowserRouter, each loads the correct lazy component wrapped in ErrorBoundary + Suspense.</done>
</task>

<task type="auto">
  <name>Task 3: Wire PauseMenu buttons and AccessibilityPanel in SettingsMenu</name>
  <files>
    src/components/Router/GameLayout.jsx
    src/components/Menu/SettingsMenu.jsx
  </files>
  <action>
    ### GameLayout.jsx — PauseMenu new buttons

    In the PauseMenu component (lines 134-156), add four new buttons to the pauseMenuButtons div, between the Wardrobe button and the Main Menu button:

    ```jsx
    <button onClick={() => { audioManager.playSFX('click'); onNavigate('/skill-tree'); }} className={styles.pauseMenuBtnActivities}>
      Skill Trees
    </button>
    <button onClick={() => { audioManager.playSFX('click'); onNavigate('/codex'); }} className={styles.pauseMenuBtnActivities}>
      Codex
    </button>
    <button onClick={() => { audioManager.playSFX('click'); onNavigate('/save-load'); }} className={styles.pauseMenuBtnActivities}>
      Save / Load
    </button>
    <button onClick={() => { audioManager.playSFX('click'); onNavigate('/completion'); }} className={styles.pauseMenuBtnActivities}>
      Completion
    </button>
    ```

    Use className={styles.pauseMenuBtnActivities} (same grey secondary button style as Profile and Wardrobe). Keep the Main Menu button last.

    ### SettingsMenu.jsx — AccessibilityPanel section

    1. Add import at top:
    ```js
    import AccessibilityPanel from '../Settings/AccessibilityPanel.jsx';
    ```

    2. After the closing tag of the Display settingsSection div (after the Keyboard Mode settingRow, before the Back button), add:
    ```jsx
    {/* Accessibility Section */}
    <div className={styles.settingsSection}>
      <div className={styles.sectionHeading}>Accessibility</div>
      <AccessibilityPanel />
    </div>
    ```

    Before inserting, read AccessibilityPanel.jsx to confirm it accepts no required props and uses its own Redux state (it should — it's self-contained). If it requires a container div with a specific class, wrap accordingly. Do not add a CSS module for this wrapper; use the existing styles.settingsSection class which already handles the section layout.
  </action>
  <verify>
    1. Open game, press Escape — PauseMenu shows 4 new buttons.
    2. Click each button — navigates to correct route (closes PauseMenu first).
    3. Navigate to /settings — Accessibility section visible below Display section.
  </verify>
  <done>PauseMenu has Skill Trees, Codex, Save/Load, Completion buttons. SettingsMenu shows AccessibilityPanel in an Accessibility section.</done>
</task>

</tasks>

<verification>
- npm run build passes (no missing imports, no broken lazy references)
- All 4 PauseMenu buttons exist and navigate correctly
- /skill-tree, /save-load, /completion, /codex routes all render without crashing
- SettingsMenu Accessibility section visible at /settings
- CodexMenu shows progress bar with correct total (308)
</verification>

<success_criteria>
All systems that existed as isolated components are now reachable from the live game. No dead code. No runtime errors on any new route.
</success_criteria>

<output>
After completion, create `.planning/quick/260318-tot-wire-all-disconnected-systems-into-live-/260318-tot-01-SUMMARY.md`
</output>

---
phase: 260318-tot
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - src/hooks/useZoneEvents.js
  - src/hooks/useNarrativeEvents.js
  - src/hooks/useDialogueEvents.js
  - src/data/factions.js
autonomous: true

must_haves:
  truths:
    - "Completing a quest dispatches adjustAlignment for the quest-giver NPC's faction"
    - "A culturalNote line in dialogue dispatches unlockEntry to codexSlice"
    - "Entering a zone for the first time dispatches addJournalEntry (TRAVEL category)"
    - "Completing a quest dispatches addJournalEntry (QUEST category)"
    - "Meeting an NPC for the first time (first dialogue open) dispatches addJournalEntry (SOCIAL category)"
    - "On GameLayout mount, weeklyChallenge is loaded from weeklyRotation.js and dispatched via setWeeklyChallenge"
  artifacts:
    - path: "src/hooks/useZoneEvents.js"
      provides: "addJournalEntry on first zone visit, setWeeklyChallenge on mount"
    - path: "src/hooks/useNarrativeEvents.js"
      provides: "addJournalEntry on NPC first meet"
    - path: "src/hooks/useDialogueEvents.js"
      provides: "unlockEntry codex dispatch when culturalNote line completes"
    - path: "src/hooks/useZoneEvents.js"
      provides: "adjustAlignment on quest completion"
  key_links:
    - from: "useZoneEvents completeQuest path"
      to: "adjustAlignment(factionId, amount)"
      via: "quest's npcGiver → FACTION_BY_ID lookup via npcMembers"
    - from: "DialogueBox culturalNote render (allComplete)"
      to: "unlockEntry(npcId + '_cultural_' + lineIndex)"
      via: "DIALOGUE_CULTURAL_NOTE_SHOWN event on EventBus or inline in useDialogueEvents"
---

<objective>
Wire gameplay dispatchers: faction alignment from quest completions, codex unlocks from NPC cultural dialogue, journal entries from zone visits/quest completions/NPC first meetings, and weekly challenge loading on boot.

Purpose: factionSlice, codexSlice, journalSlice, and endgameSlice all have fully functional reducers but nothing dispatches to them during gameplay.
Output: All four live-event dispatch wires active in the existing event hook files.
</objective>

<execution_context>
@/Users/theshumba/.claude/get-shit-done/workflows/execute-plan.md
@/Users/theshumba/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

Key files to understand before editing:
- src/hooks/useZoneEvents.js — handleZoneChange already dispatches visitZone; quest completion already dispatches completeQuest. Add journal + faction dispatch here.
- src/hooks/useNarrativeEvents.js — handleRelationshipChanged and handleTopicSelected already exist. Add NPC-first-meet journal entry here.
- src/hooks/useDialogueEvents.js — handles dialogue events. Add codex unlock dispatch here.
- src/store/slices/factions.js — FACTION_BY_ID map and npcMembers arrays (npcMembers per faction: scholars=['scholar_ibrahim','librarian_fatima','calligrapher_hassan','mentor_amira'], merchants, artisans, travelers, guardians, artists).
- src/store/slices/codexSlice.js — unlockEntry(entryId: string) action.
- src/store/slices/journalSlice.js — addJournalEntry({ text, textArabic?, category, timestamp? }) action. JOURNAL_CATEGORIES exported from same file.
- src/store/slices/endgameSlice.js — setWeeklyChallenge(challenge) action.
- src/data/weeklyRotation.js — exports WEEKLY_CHALLENGES array (52 items, each with week: 1-52).
- src/store/store.js — accessible as import { store } from '../store/store.js' for direct state reads in event handlers (existing pattern in useZoneEvents and useNarrativeEvents).

NPC-to-faction lookup strategy: build a reverse map at module top level from FACTIONS.npcMembers: { [npcId]: factionId }. Use this in the quest-complete handler to find factionId from quest.npcGiver.
Weekly challenge: compute current week-of-year (new Date(), getWeekOfYear helper), find matching challenge from WEEKLY_CHALLENGES, dispatch only if store.getState().endgame.weeklyChallenge?.id !== challenge.id (avoid overwriting on every re-render).
</context>

<tasks>

<task type="auto">
  <name>Task 1: Quest completion → faction alignment + journal; zone visit → journal; boot → weekly challenge</name>
  <files>src/hooks/useZoneEvents.js</files>
  <action>
    Read useZoneEvents.js fully before editing. Three changes:

    ### A. Imports — add at top:
    ```js
    import { adjustAlignment } from '../store/slices/factionSlice.js';
    import { addJournalEntry, JOURNAL_CATEGORIES } from '../store/slices/journalSlice.js';
    import { setWeeklyChallenge } from '../store/slices/endgameSlice.js';
    import { FACTIONS } from '../data/factions.js';
    import { WEEKLY_CHALLENGES } from '../data/weeklyRotation.js';
    ```

    ### B. NPC-to-faction reverse map — add as module-level constant after imports:
    ```js
    const NPC_FACTION_MAP = Object.fromEntries(
      FACTIONS.flatMap((f) => f.npcMembers.map((npcId) => [npcId, f.id]))
    );
    ```

    ### C. handleZoneChange — after `dispatch(visitZone(zone))`, add journal entry for first visit:
    ```js
    // Journal: first zone visit
    const visitedZones = store.getState().quests.zonesVisited || [];
    if (!visitedZones.includes(zone)) {
      const zoneLabel = zone.replace(/_/g, ' ');
      dispatch(addJournalEntry({
        text: `You entered ${zoneLabel} for the first time.`,
        textArabic: '',
        category: JOURNAL_CATEGORIES.TRAVEL,
      }));
    }
    ```
    Note: visitZone is dispatched just before this check — read zonesVisited BEFORE dispatching visitZone, or check if zone is already in the pre-dispatch state. Read the existing `dispatch(visitZone(zone))` line and place the journal check BEFORE that dispatch so the "not yet in list" check is clean.

    ### D. Quest completion path — after each `dispatch(completeQuest(qd.id))` block, add:
    ```js
    // Journal: quest completed
    dispatch(addJournalEntry({
      text: `Quest completed: "${qd.title}"`,
      textArabic: qd.titleArabic || '',
      category: JOURNAL_CATEGORIES.QUEST,
    }));
    // Faction: adjust alignment for quest giver's faction
    if (qd.npcGiver) {
      const factionId = NPC_FACTION_MAP[qd.npcGiver];
      if (factionId) {
        dispatch(adjustAlignment({ factionId, amount: 10 }));
      }
    }
    ```

    ### E. Weekly challenge on hook mount — add a separate useEffect (outside the main EventBus useEffect) inside useZoneEvents:
    ```js
    // Load weekly challenge on mount
    useEffect(() => {
      const existing = store.getState().endgame?.weeklyChallenge;
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const weekNum = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
      const clampedWeek = Math.max(1, Math.min(52, weekNum));
      const challenge = WEEKLY_CHALLENGES.find((c) => c.week === clampedWeek) || WEEKLY_CHALLENGES[0];
      if (!existing || existing.id !== challenge.id) {
        dispatch(setWeeklyChallenge(challenge));
      }
    }, [dispatch]);
    ```
  </action>
  <verify>
    In browser console with DEV mode: complete a quest → check Redux devtools for adjustAlignment + addJournalEntry dispatches. Travel to a new zone → check for TRAVEL journal entry. On fresh load → endgame.weeklyChallenge is set in Redux state.
  </verify>
  <done>Quest completions dispatch adjustAlignment (10 pts to npcGiver's faction) and QUEST journal entry. Zone first visits dispatch TRAVEL journal entry. Weekly challenge set in Redux on boot.</done>
</task>

<task type="auto">
  <name>Task 2: NPC first-meet journal; cultural dialogue → codex unlock</name>
  <files>
    src/hooks/useNarrativeEvents.js
    src/hooks/useDialogueEvents.js
  </files>
  <action>
    ### useNarrativeEvents.js — NPC first meeting journal entry

    Read the file first. Add:

    1. New import:
    ```js
    import { addJournalEntry, JOURNAL_CATEGORIES } from '../store/slices/journalSlice.js';
    ```

    2. New handler listening to EVENTS.NPC_INTERACT (the event Phaser emits when a player walks up to an NPC — payload: { npcId, npcName? }):
    ```js
    const handleNpcInteract = ({ npcId, npcName }) => {
      // Only journal on first-ever interaction with this NPC
      const dialogueState = store.getState().npc?.dialogueState || {};
      if (!dialogueState[npcId]) {
        dispatch(addJournalEntry({
          text: `You met ${npcName || npcId.replace(/_/g, ' ')} for the first time.`,
          textArabic: '',
          category: JOURNAL_CATEGORIES.SOCIAL,
        }));
      }
    };
    ```

    3. Register/unregister in the useEffect:
    ```js
    EventBus.on(EVENTS.NPC_INTERACT, handleNpcInteract);
    // in return:
    EventBus.off(EVENTS.NPC_INTERACT, handleNpcInteract);
    ```

    Note: EVENTS.NPC_INTERACT = 'phaser:npc:interact' (confirmed in eventBusTypes.js line 64). The dialogueState check ensures we only journal on first-ever open, not every conversation.

    ---

    ### useDialogueEvents.js — Cultural note shown → codex unlock

    Read the file first. Find where DIALOGUE_TOPIC_SELECTED or other dialogue lifecycle events are handled.

    Add:
    1. Import:
    ```js
    import { unlockEntry } from '../store/slices/codexSlice.js';
    ```

    2. Listen to EVENTS.DIALOGUE_LINE_COMPLETE (or EVENTS.DIALOGUE_TOPIC_SELECTED — whichever fires when a dialogue line with culturalNote finishes). If neither is a clean hook, use EVENTS.DIALOGUE_TOPIC_SELECTED which fires whenever a topic completes.

    Actually: emit a new EventBus event from DialogueBox.jsx when culturalNote is shown (allComplete + line.culturalNote truthy), then listen here. Add to DialogueBox.jsx:
    ```js
    import { EventBus } from '../../utils/eventBus.js';
    import { EVENTS } from '../../utils/eventBusTypes.js';
    // in the useEffect or render where allComplete + line.culturalNote renders:
    useEffect(() => {
      if (allComplete && line?.culturalNote) {
        EventBus.emit('dialogue:cultural_note_shown', { npcId, lineKey: line.culturalNote.slice(0, 20) });
      }
    }, [allComplete, line?.culturalNote, npcId]);
    ```
    (DialogueBox receives npcId from DialogueOverlay — check if it's passed as a prop. If not, use line.id or a unique key derived from culturalNote text.)

    Then in useDialogueEvents.js:
    ```js
    const handleCulturalNoteShown = ({ npcId, lineKey }) => {
      const entryId = `cultural_${npcId || 'npc'}_${lineKey.replace(/\s/g, '_')}`;
      dispatch(unlockEntry(entryId));
    };
    EventBus.on('dialogue:cultural_note_shown', handleCulturalNoteShown);
    // in return:
    EventBus.off('dialogue:cultural_note_shown', handleCulturalNoteShown);
    ```

    Before modifying DialogueBox.jsx, read it to find where `allComplete && line.culturalNote` renders (currently around line 151) and confirm what props it receives. Use useEffect with [allComplete, line] deps — emit only when both become true in the same render cycle. Guard with a ref to avoid re-emitting on unrelated re-renders.
  </action>
  <verify>
    Open dialogue with an NPC for the first time → Redux state shows new SOCIAL journal entry. Progress through a dialogue line that has culturalNote → Redux state shows new unlocked codex entry (codex.unlockedEntries grows by 1).
  </verify>
  <done>First NPC interaction journals a SOCIAL entry. Cultural dialogue lines trigger codex unlocks. Both dispatch to Redux correctly.</done>
</task>

</tasks>

<verification>
- Redux devtools: endgame.weeklyChallenge set on game load
- Redux devtools: journal.entries grows on zone visit, quest completion, NPC first meet
- Redux devtools: faction.alignment[factionId] increments when quest with npcGiver is completed
- Redux devtools: codex.unlockedEntries grows after seeing a culturalNote
</verification>

<success_criteria>
All four gameplay slices (factionSlice, codexSlice, journalSlice, endgameSlice) receive live dispatches during normal gameplay — no longer isolated dead state.
</success_criteria>

<output>
After completion, create `.planning/quick/260318-tot-wire-all-disconnected-systems-into-live-/260318-tot-02-SUMMARY.md`
</output>

---
phase: 260318-tot
plan: 03
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/NPC/DialogueOverlay.jsx
autonomous: true

must_haves:
  truths:
    - "When talking to an NPC, a 'Give Gift' button appears in the dialogue overlay"
    - "Clicking 'Give Gift' opens a gift picker showing player's giftable inventory items"
    - "Selecting a gift dispatches giveNpcGift (npcSlice) and removes the item from inventory"
    - "A toast confirms the gift with the NPC's reaction (liked/loved/normal/disliked)"
    - "Gift UI only appears for NPCs that have a friendship entry (all NPCs qualify)"
  artifacts:
    - path: "src/components/NPC/DialogueOverlay.jsx"
      provides: "GiftPanel inline component showing giftable items from inventory + dispatch on select"
  key_links:
    - from: "DialogueOverlay gift button"
      to: "giveNpcGift({ npcId, giftId, relationshipDelta })"
      via: "getGiftBonus(gift, npcId) from utils/companionRelationship.js for relationshipDelta"
    - from: "gift dispatch"
      to: "removeItem(itemId) from inventorySlice"
      via: "inventory item consumed on gift"
---

<objective>
Wire gift-giving UI into the NPC interaction overlay so players can give gifts to NPCs during dialogue.

Purpose: The gift system (gifts.js with 100+ items, npcSlice.giveNpcGift, friendshipMiddleware) is fully built but unreachable — no UI entry point exists in dialogue.
Output: Inline gift panel in DialogueOverlay with item picker, dispatch, and confirmation toast.
</objective>

<execution_context>
@/Users/theshumba/.claude/get-shit-done/workflows/execute-plan.md
@/Users/theshumba/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

Key systems:
- src/data/gifts.js — 100+ gift items with npcPreferences: { loved, liked, disliked }. Each has id, name, nameArabic, category, value, relationshipGain: { normal, liked, loved, disliked }.
- src/store/slices/npcSlice.js — giveNpcGift({ npcId, giftId, relationshipDelta }) action. selectGiftsGivenToNpc(npcId) selector.
- src/store/slices/inventorySlice.js — selectInventoryItems selector, removeItem(itemId) action (used in CompanionUI.jsx line 17 — same pattern to follow).
- src/utils/companionRelationship.js — getGiftBonus(gift, npcId) — may need to adapt or inline the preference lookup using gift.npcPreferences directly.
- src/store/slices/uiSlice.js — showNotification({ message, type }) for toast confirmation.
- DialogueOverlay.jsx already imports useSelector, useDispatch, closeDialogue, npcsData, EventBus, EVENTS. Build on existing imports.

Gift preference logic (inline, no need for companionRelationship.js if it's companion-specific):
```js
function getGiftDelta(gift, npcId) {
  if (gift.npcPreferences.loved.includes(npcId)) return gift.relationshipGain.loved;
  if (gift.npcPreferences.liked.includes(npcId)) return gift.relationshipGain.liked;
  if (gift.npcPreferences.disliked.includes(npcId)) return gift.relationshipGain.disliked;
  return gift.relationshipGain.normal;
}
```

The gift picker should show items from inventory that match gift categories ('food','crafts','books','clothing','tools','luxury','cultural') — check inventory item schema to see if items have a category field that matches. If not, show all inventory items and let player choose any item as gift (use the item's id to look up in GIFTS array from gifts.js — if found it's a proper gift, if not treat as generic gift with normal delta of 5).

DialogueOverlay currently shows dialogue in an overlay panel. Add a small "Give Gift" button to the bottom of the dialogue panel (outside the main dialogue flow — always visible when phase !== 'hub' to avoid conflicting with topic selection). The gift panel slides in as a bottom sheet or inline section within the same overlay.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add gift-giving UI to DialogueOverlay</name>
  <files>src/components/NPC/DialogueOverlay.jsx</files>
  <action>
    Read DialogueOverlay.jsx fully before editing (it's ~300+ lines).

    ### Step 1 — New imports
    Add at top:
    ```js
    import { giveNpcGift } from '../../store/slices/npcSlice.js';
    import { selectInventoryItems, removeItem } from '../../store/slices/inventorySlice.js';
    import { showNotification } from '../../store/slices/uiSlice.js';
    import { GIFTS, GIFTS_BY_ID } from '../../data/gifts.js';
    ```
    Check gifts.js for its exports — the file likely exports GIFTS as the full array and a GIFTS_BY_ID map. If only the array is exported, derive GIFTS_BY_ID inline: `const GIFTS_BY_ID = Object.fromEntries(GIFTS.map(g => [g.id, g]));`

    ### Step 2 — State
    Add inside DialogueOverlay function body:
    ```js
    const inventoryItems = useSelector(selectInventoryItems);
    const [showGiftPanel, setShowGiftPanel] = useState(false);

    // Gift categories that come from gifts.js
    const GIFT_CATEGORIES = ['food', 'crafts', 'books', 'clothing', 'tools', 'luxury', 'cultural'];

    // Items in inventory that are registered gifts OR any inventory item (fallback)
    const giftableItems = inventoryItems.filter((item) =>
      GIFTS_BY_ID[item.id] || GIFT_CATEGORIES.includes(item.category)
    );
    ```

    ### Step 3 — Gift delta helper (add outside component, above DialogueOverlay)
    ```js
    function getGiftDelta(gift, npcId) {
      if (!gift) return 5; // generic item, normal delta
      if ((gift.npcPreferences?.loved || []).includes(npcId)) return gift.relationshipGain.loved;
      if ((gift.npcPreferences?.liked || []).includes(npcId)) return gift.relationshipGain.liked;
      if ((gift.npcPreferences?.disliked || []).includes(npcId)) return gift.relationshipGain.disliked;
      return gift.relationshipGain?.normal ?? 5;
    }
    ```

    ### Step 4 — handleGiveGift function (add in component body)
    ```js
    const handleGiveGift = (inventoryItem) => {
      const gift = GIFTS_BY_ID[inventoryItem.id];
      const delta = getGiftDelta(gift, npcId);
      dispatch(giveNpcGift({ npcId, giftId: inventoryItem.id, relationshipDelta: delta }));
      dispatch(removeItem(inventoryItem.id));
      const reactionLabel = delta >= 20 ? 'loves it!' : delta >= 10 ? 'really likes it!' : delta < 0 ? 'dislikes it.' : 'appreciates it.';
      const giftName = gift?.name || inventoryItem.name || inventoryItem.id;
      dispatch(showNotification({
        message: `${npc?.name || npcId} ${reactionLabel} (+${delta} friendship)`,
        type: 'info',
      }));
      setShowGiftPanel(false);
    };
    ```

    ### Step 5 — "Give Gift" button placement
    In the JSX, find where DialogueChoices or the main dialogue panel renders. Add the gift button and gift panel AFTER the dialogue box area but INSIDE the main overlay panel div, only when `phase !== 'topic_selection'` and `!showGiftPanel`:

    ```jsx
    {/* Gift-giving button — shows when not in topic selection */}
    {phase !== 'topic_selection' && (
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '4px 8px' }}>
        <button
          onClick={() => setShowGiftPanel(true)}
          style={{
            background: 'transparent',
            border: '1px solid #D4A843',
            color: '#D4A843',
            borderRadius: 4,
            padding: '4px 12px',
            fontSize: 12,
            cursor: 'pointer',
          }}
          aria-label="Give a gift to this NPC"
        >
          Gift
        </button>
      </div>
    )}

    {/* Gift panel */}
    {showGiftPanel && (
      <div style={{
        background: '#1a1a2e',
        border: '1px solid #D4A843',
        borderRadius: 8,
        padding: 12,
        margin: '8px 0',
        maxHeight: 200,
        overflowY: 'auto',
      }}>
        <div style={{ color: '#D4A843', fontWeight: 'bold', marginBottom: 8, fontSize: 14 }}>
          Choose a Gift
        </div>
        {giftableItems.length === 0 && (
          <div style={{ color: '#888', fontSize: 12 }}>No giftable items in your inventory.</div>
        )}
        {giftableItems.map((item) => {
          const gift = GIFTS_BY_ID[item.id];
          return (
            <button
              key={item.id}
              onClick={() => handleGiveGift(item)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                background: 'transparent',
                border: '1px solid #333',
                borderRadius: 4,
                color: '#fff',
                padding: '6px 8px',
                marginBottom: 4,
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              {gift?.name || item.name || item.id}
              {gift?.nameArabic && <span style={{ color: '#888', marginLeft: 8, fontSize: 11 }}>{gift.nameArabic}</span>}
            </button>
          );
        })}
        <button
          onClick={() => setShowGiftPanel(false)}
          style={{ color: '#888', background: 'transparent', border: 'none', cursor: 'pointer', marginTop: 4, fontSize: 12 }}
        >
          Cancel
        </button>
      </div>
    )}
    ```

    Verify inventorySlice removeItem signature — it may take itemId directly or { id }. Read inventorySlice.js briefly if needed and match the existing pattern from CompanionUI.jsx (line 17 imports removeItem, line ~120 uses it).
  </action>
  <verify>
    Open dialogue with any NPC → "Gift" button visible. Click Gift → panel shows inventory giftable items (or "No giftable items" if inventory empty). Select an item → toast appears with NPC reaction, item removed from inventory, gift logged in npc.giftsGiven Redux state.
  </verify>
  <done>Gift panel renders inside DialogueOverlay. giveNpcGift and removeItem dispatched correctly. Friendship updates. Toast confirms reaction.</done>
</task>

</tasks>

<verification>
- Redux devtools: npc.giftsGiven[npcId] gets a new entry after gifting
- Redux devtools: npc.friendship[npcId] changes by expected delta
- Redux devtools: inventory item removed after gifting
- Toast notification appears with reaction text
- "No giftable items" message shows if inventory is empty
</verification>

<success_criteria>
Players can give gifts to NPCs during dialogue. Gift system is live: inventory items consumed, friendship updated, reaction toasted.
</success_criteria>

<output>
After completion, create `.planning/quick/260318-tot-wire-all-disconnected-systems-into-live-/260318-tot-03-SUMMARY.md`
</output>
