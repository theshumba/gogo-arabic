# Requirements: GoGo Arabic v5.0 — The Real Game

**Defined:** 2026-02-10
**Core Value:** Players naturally learn Arabic through guided exploration and interaction in an engaging RPG world — never wondering "what should I do next?" or "how do I practice?"

## v5.0 Requirements

Requirements for v5.0 milestone. Each maps to roadmap phases.

### Onboarding

- [x] **ONBR-01**: Player meets a mentor character within 30 seconds of starting a new game
- [x] **ONBR-02**: Mentor explains the game's purpose (learn Arabic through exploration) through in-world dialogue, not a modal overlay
- [x] **ONBR-03**: Player completes a guided first mission that teaches the core loop (explore → talk → quest → learn) in under 90 seconds
- [x] **ONBR-04**: Player learns their first Arabic word through narrative context within the first minute of gameplay
- [x] **ONBR-05**: Current 6-step OnboardingFlow modal is replaced with in-world mentor-driven playable quest
- [x] **ONBR-06**: Mentor character is findable throughout the game for hints and guidance on what to do next
- [x] **ONBR-07**: Onboarding teaches zone navigation by having the mentor send the player to a specific nearby NPC
- [x] **ONBR-08**: Onboarding includes a skip option for returning players that jumps past tutorial content
- [x] **ONBR-09**: Contextual tutorials trigger when player first encounters new mechanics (buildings, objects, quizzes) instead of explaining everything upfront
- [x] **ONBR-10**: Onboarding rewards the player with their first quest completion, XP, and Dirhams to establish the reward loop

### Dialogue System

- [x] **DLGE-01**: DialogueEngine Phaser system manages dialogue tree traversal, branching, condition evaluation, and effect execution
- [x] **DLGE-02**: Player can have multi-topic conversations with NPCs via hub-and-spoke structure (central greeting → selectable topics like lore, teaching, gossip, quests)
- [x] **DLGE-03**: NPCs display distinct personality in dialogue through tone, interests, catchphrases, and speech patterns
- [x] **DLGE-04**: Dialogue supports conditional branching based on quest state, story flags, player choices, and vocabulary mastery
- [x] **DLGE-05**: Player choices in dialogue affect NPC relationship levels (tracked as 0-5 trust meter per NPC)
- [x] **DLGE-06**: NPC conversations change based on story progression — new topics unlock, old topics update, NPCs reference past events
- [x] **DLGE-07**: At least 30 NPCs across all zones have deep multi-topic conversation trees with 3+ topics each
- [x] **DLGE-08**: Dialogue can trigger effects: start/complete quests, give items, unlock areas, change NPC state, teach words, open shops
- [x] **DLGE-09**: DialogueOverlay component redesigned to support topic selection UI, relationship indicator, and NPC mood display
- [x] **DLGE-10**: Dialogue lines support inline Arabic vocabulary highlights with hover/tap translation hints
- [x] **DLGE-11**: NPC dialogue data stored in extended npcs.json format with conditions, effects, personality fields, and topic arrays
- [x] **DLGE-12**: Dialogue system supports interrupting conversations to trigger mid-dialogue quizzes on taught words
- [x] **DLGE-13**: Player can review conversation history with an NPC to recall previously discussed topics
- [x] **DLGE-14**: EventBus events for dialogue use namespaced convention (e.g., `dialogue:choice-made`, `dialogue:topic-selected`)

### Narrative & Story

- [x] **NARR-01**: narrativeSlice added to Redux store tracking story flags, player choices, NPC relationships, and world object states
- [x] **NARR-02**: Story flags use structured format (enums and numbered stages, not booleans) with a budget cap of 50 flags
- [x] **NARR-03**: At least 3 major branching points in the main storyline where player choices lead to different quest outcomes
- [x] **NARR-04**: Diamond-structure narrative branching — paths diverge on choices but reconverge at key story milestones
- [x] **NARR-05**: NPC relationship levels (0-5 per NPC) unlock exclusive dialogue topics, quests, and rewards at higher tiers
- [x] **NARR-06**: A main storyline exists that spans all 8 zones, giving the player an overarching goal and motivation
- [x] **NARR-07**: Each zone has a local story arc (zone-specific quest chain) that ties into the main storyline
- [x] **NARR-08**: Story progression is visible to the player through a quest journal or story log
- [x] **NARR-09**: NPCs in other zones react to the player's reputation and story progress in different zones
- [x] **NARR-10**: At least 10 story-driven quests (narrative quests with dialogue, choices, consequences) complement the existing 52 learning quests
- [x] **NARR-11**: The mentor character has a story arc that evolves across zones, not just a static help NPC
- [x] **NARR-12**: World state changes persist — if a quest unlocks a bridge or opens a gate, it stays changed permanently

### Buildings & Interiors

- [x] **BLDG-01**: SceneStackManager Phaser system handles building entry/exit via scene pause/launch/resume (distinct from ZoneTransition)
- [x] **BLDG-02**: Player can enter buildings by interacting with doors — door interaction pauses WorldScene and launches InteriorScene
- [x] **BLDG-03**: At least 15 buildings across zones have explorable interior maps with unique layouts
- [x] **BLDG-04**: Interior scenes reuse existing systems (PlayerController, NPCManager, InteractableManager, MapLoader, DOMOverlay)
- [x] **BLDG-05**: Each interior has a distinct purpose — shops for items, library for lore, homes for NPC relationships, guild for quests, mosque for cultural lessons
- [x] **BLDG-06**: Player exits interiors seamlessly by walking to the door, returning to the exact exterior position they entered from
- [x] **BLDG-07**: Interior maps contain NPCs with unique dialogue not available in the exterior world
- [x] **BLDG-08**: Interior maps contain interactive objects (bookshelves, tables, beds, workstations) relevant to the building's purpose
- [x] **BLDG-09**: Building doors show visual feedback when approachable (glow, prompt) matching existing InteractableManager proximity patterns
- [x] **BLDG-10**: Audio crossfades between exterior zone BGM and interior ambient when entering/exiting buildings
- [x] **BLDG-11**: Buildings can be locked and unlock based on quest progress or story flags, with clear feedback to the player
- [x] **BLDG-12**: Interior maps are small (max 20x20 tiles) with clear exit indicators to prevent players getting lost

### Interactive Objects

- [x] **OBJT-01**: InteractableManager extended to support new object types: market stalls, statues, paintings, fountains, lanterns, crates, barrels, cooking pots
- [x] **OBJT-02**: Object inspection displays contextual information — lore text, Arabic vocabulary, cultural notes, or hints
- [x] **OBJT-03**: At least 100 interactive objects placed across all 8 zones and building interiors
- [x] **OBJT-04**: Objects teach vocabulary in semantic clusters — market zone has trade words, library has knowledge words, homes have family words
- [x] **OBJT-05**: Some objects change state based on quest/story progress (locked chest → unlockable, broken bridge → repaired, hidden passage → revealed)
- [x] **OBJT-06**: Object interaction data stored in zone config with type, position, label, content, conditions, and effects fields
- [x] **OBJT-07**: ObjectInteractionOverlay React component displays rich object inspection UI with Arabic text, translation, and optional image
- [x] **OBJT-08**: Interactive objects have visual cues distinguishing them from decorative objects (subtle glow, sparkle, or distinct sprite)
- [x] **OBJT-09**: Object type budget limited to 8 types max to prevent InteractableManager bloat (behavior composition over class-per-type)
- [x] **OBJT-10**: Object states persist in narrativeSlice.worldObjectStates so changes survive zone transitions and game sessions
- [x] **OBJT-11**: Some objects reward exploration — hidden items, rare vocabulary words, lore scrolls in off-path locations
- [x] **OBJT-12**: Minimum 1 interactive object per 5x5 tile area density guideline to prevent empty zones

### Progression & Structure

- [x] **PROG-01**: Zones are gated by vocabulary mastery milestones — player must demonstrate learning before entering new zones
- [x] **PROG-02**: Player always has a visible "next objective" indicator (compass arrow, quest marker, or HUD prompt) showing where to go
- [x] **PROG-03**: Quest log redesigned to show clear next-step instructions for each active quest with progress percentage
- [x] **PROG-04**: Zone gates unlock visibly in the world — bridges repair, gates open, paths clear — when conditions are met
- [x] **PROG-05**: Learning Path progression enforced in world exploration — alphabet mastery unlocks vocabulary quests, vocabulary mastery unlocks grammar zones
- [x] **PROG-06**: World Map updated to show zone lock/unlock status with specific requirements to unlock each zone
- [x] **PROG-07**: Recommended quest path highlighted in quest log so player always knows the optimal next quest
- [x] **PROG-08**: Zone completion percentage visible on World Map accounts for quests, NPCs talked to, objects found, and buildings explored
- [x] **PROG-09**: Achievement milestones tied to zone progression — completing all of a zone's content awards a zone mastery badge
- [x] **PROG-10**: NPC quest markers (!/?) update to reflect story quests in addition to learning quests
- [x] **PROG-11**: Fast travel to a zone is only unlocked after the player has walked there at least once
- [x] **PROG-12**: Progression gates display clear requirements when player approaches (e.g., "Learn 50 words to cross this bridge")

### Vocabulary Integration

- [x] **VCAB-01**: NPC dialogue teaches vocabulary words in narrative context — words appear naturally in conversation, not as flashcard inserts
- [x] **VCAB-02**: Each zone's NPCs teach vocabulary relevant to that zone's theme (market = commerce, library = knowledge, temple = religion/philosophy)
- [x] **VCAB-03**: Arabic words in dialogue are highlighted with inline translation hints (tap/hover to see English meaning)
- [x] **VCAB-04**: Quest descriptions use learned vocabulary with contextual reinforcement of previously taught words
- [x] **VCAB-05**: At least 200 of the 1,220 vocabulary words are integrated into dialogue and world objects (not just quizzes)
- [x] **VCAB-06**: FSRS review sessions can trigger as contextual quests — "Merchant needs help" triggers review of market vocabulary
- [x] **VCAB-07**: Each NPC "owns" 10-20 vocabulary words from the existing 1,220, mapped to their zone's semantic category
- [x] **VCAB-08**: World objects (signs, books, posters) display Arabic text that teaches vocabulary when inspected
- [x] **VCAB-09**: Vocabulary encountered in dialogue is automatically added to FSRS review queue (same as quiz-taught words)
- [x] **VCAB-10**: Difficulty of Arabic in NPC dialogue adapts to player's vocabulary mastery level (more known words → more Arabic in conversation)
- [x] **VCAB-11**: Each zone's vocabulary density follows comprehensible input principle — 95% known words, 5% new words
- [x] **VCAB-12**: Vocabulary words taught through narrative context show higher retention tracking separate from quiz-taught words

### Infrastructure & Architecture

- [x] **INFR-01**: useEventBusListeners refactored from monolithic hook (~380 LOC) into domain-specific sub-hooks (useDialogueEvents, useBuildingEvents, useObjectEvents, useNarrativeEvents)
- [x] **INFR-02**: EventBus events use namespaced naming convention (`source:category:action`) with centralized registry in eventBusTypes.js
- [x] **INFR-03**: narrativeSlice is the single new Redux slice added (max 13 total) — building states, object states, and NPC relationships all live here
- [x] **INFR-04**: Dialogue data JSON schema validated at build time to prevent malformed conversation trees from crashing the game
- [x] **INFR-05**: Scene lifecycle correctly manages pause/launch/resume for building transitions without memory leaks
- [x] **INFR-06**: All new Phaser systems (DialogueEngine, SceneStackManager) follow existing delegation pattern owned by WorldScene
- [x] **INFR-07**: narrativeSlice state persists via existing Redux-persist/localStorage mechanism alongside other player state
- [x] **INFR-08**: Build remains under 500KB main bundle after all v5.0 features added (currently 264KB)
- [x] **INFR-09**: Existing 548-test suite passes after all v5.0 changes — no regressions in core game systems
- [x] **INFR-10**: New features respect prefers-reduced-motion for any added animations (object glows, door transitions, etc.)

### UX & Polish

- [x] **UXPL-01**: Arabic text in dialogue handles RTL rendering, diacritics spacing, and line wrapping without overflow
- [x] **UXPL-02**: Building entry/exit transitions include door animation + audio SFX matching existing zone transition polish level
- [x] **UXPL-03**: Interactive object discovery aided by subtle visual cues (sparkle particles, distinct tinting) from existing VFX system
- [x] **UXPL-04**: NPC conversation UI accessible via keyboard with focus management matching existing overlay patterns (useFocusTrap)
- [x] **UXPL-05**: All new overlays (ObjectInteractionOverlay, redesigned DialogueOverlay) use CSS Modules matching existing component style patterns
- [x] **UXPL-06**: Mobile-responsive touch targets for dialogue topic selection and object interaction (minimum 44px tap targets)

## Future Requirements (v5.1+)

### Personalization

- **PERS-01**: Living world events with NPC schedules and time-of-day routines
- **PERS-02**: Environmental Arabic — all world text (signs, shop names, posters) rendered in Arabic script
- **PERS-03**: Adaptive difficulty paths based on player performance analytics
- **PERS-04**: Voice acting for 10-15 key NPCs with Arabic dialogue and subtitles

### Advanced Features

- **ADVN-01**: Co-op learning mode (requires architectural rewrite to client-server model)
- **ADVN-02**: AI-driven NPC dialogue with NLP models for natural conversation
- **ADVN-03**: Procedural quest generation from FSRS review schedule

## Out of Scope

| Feature | Reason |
|---------|--------|
| Multiplayer/real-time features | High complexity, single-player focus, requires architectural rewrite |
| Mobile native app | Web-first, responsive CSS covers mobile |
| TypeScript migration | Too large, not blocking UX issues |
| OAuth login | Email/password sufficient |
| Admin dashboard | Not user-facing |
| Voice recognition | Complex ML, accuracy issues, high dev cost |
| Full NPC schedules (Stardew-style) | High complexity, frustrating for quest-finding — defer to v5.1 |
| Day/night cycle | Complex, not core to "soul" feeling |
| Procedural quests | Educational content needs curation |
| Arabic dialect switching | Confuses learners, exponential content |
| Leaderboards/competitive rankings | Research shows negative effects on learning motivation |
| Gacha/loot box cosmetics | Predatory, undermines educational trust |
| Decontextualized flashcard mode | Game's value is contextualized learning — Anki/Quizlet do flashcards better |
| Every building interior | Art/design workload explosion — focus on 15 key interiors with purpose |
| Explanatory cutscenes | Show don't tell — use environmental storytelling and NPC conversations |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFR-01 | 19 | Complete |
| INFR-02 | 19 | Complete |
| INFR-03 | 19 | Complete |
| INFR-04 | 19 | Complete |
| INFR-05 | 19 | Complete |
| INFR-06 | 19 | Complete |
| INFR-07 | 19 | Complete |
| INFR-08 | 19 | Complete |
| INFR-09 | 19 | Complete |
| INFR-10 | 19 | Complete |
| DLGE-01 | 20 | Complete |
| DLGE-02 | 20 | Complete |
| DLGE-03 | 20 | Complete |
| DLGE-04 | 20 | Complete |
| DLGE-05 | 20 | Complete |
| DLGE-06 | 20 | Complete |
| DLGE-07 | 20 | Complete |
| DLGE-08 | 20 | Complete |
| DLGE-09 | 20 | Complete |
| DLGE-10 | 20 | Complete |
| DLGE-11 | 20 | Complete |
| DLGE-12 | 20 | Complete |
| DLGE-13 | 20 | Complete |
| DLGE-14 | 20 | Complete |
| ONBR-01 | 21 | Complete |
| ONBR-02 | 21 | Complete |
| ONBR-03 | 21 | Complete |
| ONBR-04 | 21 | Complete |
| ONBR-05 | 21 | Complete |
| ONBR-06 | 21 | Complete |
| ONBR-07 | 21 | Complete |
| ONBR-08 | 21 | Complete |
| ONBR-09 | 21 | Complete |
| ONBR-10 | 21 | Complete |
| BLDG-01 | 22 | Complete |
| BLDG-02 | 22 | Complete |
| BLDG-03 | 22 | Complete |
| BLDG-04 | 22 | Complete |
| BLDG-05 | 22 | Complete |
| BLDG-06 | 22 | Complete |
| BLDG-07 | 22 | Complete |
| BLDG-08 | 22 | Complete |
| BLDG-09 | 22 | Complete |
| BLDG-10 | 22 | Complete |
| BLDG-11 | 22 | Complete |
| BLDG-12 | 22 | Complete |
| OBJT-01 | 23 | Complete |
| OBJT-02 | 23 | Complete |
| OBJT-03 | 23 | Complete |
| OBJT-04 | 23 | Complete |
| OBJT-05 | 23 | Complete |
| OBJT-06 | 23 | Complete |
| OBJT-07 | 23 | Complete |
| OBJT-08 | 23 | Complete |
| OBJT-09 | 23 | Complete |
| OBJT-10 | 23 | Complete |
| OBJT-11 | 23 | Complete |
| OBJT-12 | 23 | Complete |
| PROG-01 | 24 | Complete |
| PROG-02 | 24 | Complete |
| PROG-03 | 24 | Complete |
| PROG-04 | 24 | Complete |
| PROG-05 | 24 | Complete |
| PROG-06 | 24 | Complete |
| PROG-07 | 24 | Complete |
| PROG-08 | 24 | Complete |
| PROG-09 | 24 | Complete |
| PROG-10 | 24 | Complete |
| PROG-11 | 24 | Complete |
| PROG-12 | 24 | Complete |
| VCAB-01 | 25 | Complete |
| VCAB-02 | 25 | Complete |
| VCAB-03 | 25 | Complete |
| VCAB-04 | 25 | Complete |
| VCAB-05 | 25 | Complete |
| VCAB-06 | 25 | Complete |
| VCAB-07 | 25 | Complete |
| VCAB-08 | 25 | Complete |
| VCAB-09 | 25 | Complete |
| VCAB-10 | 25 | Complete |
| VCAB-11 | 25 | Complete |
| VCAB-12 | 25 | Complete |
| NARR-01 | 25 | Complete |
| NARR-02 | 25 | Complete |
| NARR-03 | 26 | Complete |
| NARR-04 | 26 | Complete |
| NARR-05 | 26 | Complete |
| NARR-06 | 26 | Complete |
| NARR-07 | 26 | Complete |
| NARR-08 | 26 | Complete |
| NARR-09 | 26 | Complete |
| NARR-10 | 26 | Complete |
| NARR-11 | 26 | Complete |
| NARR-12 | 26 | Complete |
| UXPL-01 | 26 | Complete |
| UXPL-02 | 26 | Complete |
| UXPL-03 | 26 | Complete |
| UXPL-04 | 26 | Complete |
| UXPL-05 | 26 | Complete |
| UXPL-06 | 26 | Complete |

**Coverage:**
- v5.0 requirements: 100 total
- Mapped to phases: 100 ✓
- Unmapped: 0 ✓

**By Category:**
- Infrastructure (INFR): 10 requirements → Phase 19
- Dialogue System (DLGE): 14 requirements → Phase 20
- Onboarding (ONBR): 10 requirements → Phase 21
- Buildings (BLDG): 12 requirements → Phase 22
- Interactive Objects (OBJT): 12 requirements → Phase 23
- Progression (PROG): 12 requirements → Phase 24
- Vocabulary Integration (VCAB): 12 requirements → Phase 25
- Narrative & Story (NARR): 12 requirements → Phase 25 (2), Phase 26 (10)
- UX & Polish (UXPL): 6 requirements → Phase 26

---
*Requirements defined: 2026-02-10*
*Last updated: 2026-02-12 — all 100 requirements COMPLETE (v5.0 shipped)*
