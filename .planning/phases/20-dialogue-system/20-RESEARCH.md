# Phase 20: Dialogue System - Research

**Researched:** 2026-02-11
**Domain:** NPC dialogue systems, branching narratives, personality modeling, educational conversation UI
**Confidence:** HIGH

## Summary

Phase 20 builds a production-grade dialogue system on top of the existing infrastructure from Phase 19. The codebase already has a working foundation: dialogueSchema.js (Zod validation), useDialogue hook (tree traversal), DialogueOverlay components (540 LOC total), npcs.json (23 NPCs with 219 teachWord references and 38 choice branches), narrativeSlice (Redux state for flags/relationships), and EVENTS constants for dialogue lifecycle.

The core challenge is extending this simple linear/branching system into a **hub-and-spoke multi-topic architecture** where NPCs have distinct personalities, conditional dialogue that responds to quest/story state, relationship tracking, and dialogue effects (quest triggers, item rewards, vocabulary teaching, world state changes). The existing culturalDialogues.js (8 topics, 383 LOC) demonstrates the pattern for rich educational content.

Modern dialogue systems use **condition-based branching** (quest state, stats, reputation, previous choices) and **effect execution** (quest triggers, item rewards, state changes). The key architectural decision is whether to extend the current JSON-driven approach (npcs.json validated by Zod) or introduce a DialogueEngine Phaser system that handles tree traversal, condition evaluation, and effect execution separately from the React UI layer.

**Primary recommendation:** Extend npcs.json with new fields (conditions, effects, personality, topics), update dialogueSchema.js to validate them, create a DialogueEngine Phaser system for condition/effect logic, redesign DialogueOverlay for hub-and-spoke topic selection, and integrate with narrativeSlice for relationship tracking and story flags.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Zod | ^4.3.6 | JSON schema validation | Already installed, validates npcs.json at build time via dialogueSchema.js |
| Redux Toolkit | ^2.11.2 | State management (narrativeSlice) | Already installed, handles story flags, NPC relationships (0-5), choice history |
| Phaser | ^3.90.0 | Game engine for DialogueEngine | Already installed, NPCManager + EventBus integration exists |
| React | ^19.2.4 | UI components (DialogueOverlay) | Already installed, 540 LOC of dialogue UI components exist |
| Framer Motion | ^11.15.0 | Dialogue UI animations | Already installed, used in DialogueOverlay for backdrop/box transitions |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| EventBus | Custom | Phaser ↔ React communication | Already implemented, EVENTS.NPC_INTERACT, EVENTS.PLAYER_FREEZE constants exist |
| useDialogue hook | Custom | Dialogue tree traversal logic | Already implemented, handles tree selection, line advancement, choices, quiz triggering |
| SceneStackManager | Custom | Building entry/exit scene lifecycle | Already implemented in Phase 19-04, ready for interior dialogue scenes |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| JSON-driven dialogue | Yarn Spinner, ink, Twine | JSON is already validated by Zod, no new dependencies, easier to extend with custom fields |
| Custom DialogueEngine | Phaser plugin ecosystem (hawkins/phaser-dialogue) | Custom solution integrates with existing EventBus, narrativeSlice, and quest system |
| Hub-and-spoke UI | Linear conversation flow | Hub-and-spoke supports multi-topic conversations required by DLGE-02, DLGE-07 |

**Installation:**
No new dependencies needed — all required libraries already installed.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── game/
│   └── systems/
│       └── DialogueEngine.js       # NEW: Condition evaluation, effect execution, tree traversal
├── data/
│   ├── npcs.json                   # EXTEND: Add conditions, effects, personality, topics
│   └── dialogueSchema.js           # EXTEND: Validate new fields
├── store/
│   └── slices/
│       └── narrativeSlice.js       # EXISTS: Story flags, NPC relationships (0-5), choice history
├── components/
│   └── NPC/
│       ├── DialogueOverlay.jsx     # REDESIGN: Hub-and-spoke topic selection UI
│       ├── TopicSelectionMenu.jsx  # NEW: Topic grid with relationship indicator
│       └── VocabularyHighlight.jsx # NEW: Inline Arabic word hover tooltips
└── utils/
    └── eventBusTypes.js            # EXTEND: Add dialogue-specific events (already has EVENTS.NPC_INTERACT)
```

### Pattern 1: Hub-and-Spoke Dialogue Architecture
**What:** Central greeting node → selectable topic branches (lore, teaching, gossip, quests) → return to hub or end conversation.

**When to use:** Multi-topic conversations where NPCs have 3+ distinct conversation paths (required by DLGE-02, DLGE-07).

**Example:**
```javascript
// npcs.json structure
{
  "id": "scholar-yusuf",
  "personality": {
    "tone": "formal_scholar",
    "catchphrase": "طالب العلم",
    "interests": ["grammar", "history", "philosophy"]
  },
  "dialogueTrees": [
    {
      "id": "hub",
      "trigger": "first_meeting",
      "topic": "greeting",
      "lines": [
        {
          "speaker": "npc",
          "arabic": "السَّلامُ عَلَيْكُم يا طالب العِلْم",
          "english": "Peace be upon you, seeker of knowledge",
          "transliteration": "as-salaamu alaykum ya taalib al-ilm"
        },
        {
          "speaker": "player",
          "choices": [
            { "text": "Teach me vocabulary", "next": "topic_teaching", "topic": "teaching" },
            { "text": "Tell me about this place", "next": "topic_lore", "topic": "lore" },
            { "text": "Any quests for me?", "next": "topic_quests", "topic": "quests", "condition": { "relationship": { "min": 1 } } }
          ]
        }
      ]
    },
    {
      "id": "topic_teaching",
      "topic": "teaching",
      "lines": [ /* vocabulary teaching lines */ ],
      "returnToHub": true
    }
  ]
}
```

### Pattern 2: Condition-Based Branching
**What:** Dialogue options/trees appear/hide based on quest state, story flags, relationship level, vocabulary mastery.

**When to use:** Dynamic conversations that respond to player progression (DLGE-04, DLGE-06).

**Example:**
```javascript
// DialogueEngine.js (Phaser system)
class DialogueEngine {
  evaluateCondition(condition, context) {
    const { quests, storyFlags, relationships, vocabulary } = context;

    if (condition.quest) {
      const quest = quests[condition.quest.id];
      if (condition.quest.status && quest?.status !== condition.quest.status) return false;
    }

    if (condition.storyFlag) {
      const flag = storyFlags[condition.storyFlag.key];
      if (flag !== condition.storyFlag.value) return false;
    }

    if (condition.relationship) {
      const level = relationships[this.npcId] || 0;
      if (condition.relationship.min && level < condition.relationship.min) return false;
      if (condition.relationship.max && level > condition.relationship.max) return false;
    }

    if (condition.vocabulary) {
      const learned = vocabulary[condition.vocabulary.wordId];
      if (condition.vocabulary.mastered && !learned) return false;
    }

    return true;
  }
}
```

### Pattern 3: Dialogue Effects Execution
**What:** Player choices trigger effects: start/complete quests, give items, teach words, change NPC relationship, set story flags, unlock areas.

**When to use:** Meaningful player choices that affect game state (DLGE-05, DLGE-08).

**Example:**
```javascript
// npcs.json choice with effects
{
  "speaker": "player",
  "choices": [
    {
      "text": "I'll help you find the book",
      "next": "quest_accepted",
      "effects": [
        { "type": "quest_start", "questId": "lost_book_quest" },
        { "type": "relationship_change", "amount": 1 },
        { "type": "story_flag", "flag": "helped_scholar", "value": true }
      ]
    },
    {
      "text": "I'm too busy right now",
      "next": "quest_declined",
      "effects": [
        { "type": "relationship_change", "amount": -1 }
      ]
    }
  ]
}

// DialogueEngine.js
executeEffects(effects) {
  effects.forEach(effect => {
    switch (effect.type) {
      case 'quest_start':
        EventBus.emit(EVENTS.QUEST_START, { questId: effect.questId });
        break;
      case 'relationship_change':
        store.dispatch(incrementNpcRelationship({ npcId: this.npcId, amount: effect.amount }));
        break;
      case 'story_flag':
        store.dispatch(setStoryFlag({ flag: effect.flag, value: effect.value }));
        break;
      case 'teach_word':
        this.handleTeachWord(effect.wordId);
        break;
      case 'give_item':
        store.dispatch(addItem({ itemId: effect.itemId, quantity: effect.quantity }));
        break;
    }
  });
}
```

### Pattern 4: NPC Personality in Dialogue
**What:** Each NPC has distinct tone, speech patterns, catchphrases, and interests reflected in dialogue lines.

**When to use:** Creating memorable NPCs with unique voices (DLGE-03).

**Example:**
```javascript
// npcs.json personality fields
{
  "id": "merchant-fatima",
  "personality": {
    "tone": "casual_merchant",          // formal_scholar | casual_merchant | gruff_warrior | cheerful_farmer
    "catchphrase": "تَفَضَّل يا زَبون",  // "Come in, customer" (repeated in greetings)
    "speechPattern": {
      "repetition": ["تَفَضَّل", "طَيِّب"], // Words frequently used
      "rhythm": "quick",                   // quick | slow | measured
      "formality": "casual"                // formal | casual | familiar
    },
    "interests": ["trade", "gossip", "bargaining"],
    "mood": "cheerful"                     // cheerful | serious | worried | excited
  }
}

// DialogueOverlay.jsx — display mood/relationship
<div className={styles.npcHeader}>
  <DialoguePortrait npc={npc} mood={npc.personality.mood} />
  <RelationshipIndicator npcId={npc.id} level={relationships[npc.id] || 0} />
</div>
```

### Pattern 5: Inline Vocabulary Highlighting
**What:** Dialogue lines highlight Arabic vocabulary words with hover/tap tooltips showing translation hints.

**When to use:** Educational dialogue that teaches new words inline (DLGE-10).

**Example:**
```javascript
// DialogueBox.jsx with inline highlights
function VocabularyHighlight({ word, children }) {
  const vocab = vocabulary.find(w => w.id === word.id);
  return (
    <Tooltip content={`${vocab.english} (${vocab.transliteration})`}>
      <mark className={styles.vocabHighlight}>{children}</mark>
    </Tooltip>
  );
}

// In DialogueBox rendering
{line.inlineVocab && line.inlineVocab.map(word => (
  <VocabularyHighlight word={word} key={word.id}>
    {word.arabicText}
  </VocabularyHighlight>
))}
```

### Anti-Patterns to Avoid
- **Exponential branching:** Every choice creates 2+ permanent branches → complexity explosion. Use hub-and-spoke with return-to-hub to limit branch count.
- **Hardcoded conditions:** Embedding quest IDs, flag names in code → brittle, hard to maintain. Store conditions as JSON data validated by Zod.
- **No conversation history:** Player forgets what NPCs said → frustrating. Track choice history in narrativeSlice (already exists).
- **Static dialogue:** NPCs say same thing regardless of progression → feels dead. Use conditions + story flags to unlock new topics.
- **Missing relationship feedback:** Player choices affect relationship but no visual indicator → unclear consequences. Show relationship level (0-5) in UI.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dialogue tree editor GUI | Visual node-based editor in browser | JSON files validated by Zod | GUI editors add complexity, require build tooling; JSON is version-controllable, Zod provides validation |
| TypeScript definitions for dialogue | Manual .d.ts files | Zod schema with `.parse()` return type | Zod infers TypeScript types automatically from schema, single source of truth |
| Conversation history UI | Custom scrollable chat log | narrativeSlice `choiceHistory` array | Already implemented, persisted to redux-persist, includes timestamp/npcId/choiceId |
| Relationship level clamping | Manual Math.min/max in every action | narrativeSlice `setNpcRelationship` | Already clamped to 0-5 in reducer, prevents invalid states |
| NPC quest marker logic | Custom indicator system | selectNpcQuestMarkers selector | Already implemented in questSlice, used by NPCManager for ! and ? markers |

**Key insight:** Phase 19 built the infrastructure (narrativeSlice, EventBus, Zod validation, SceneStackManager). Phase 20 extends JSON data structure + adds DialogueEngine logic, not new architectural patterns.

## Common Pitfalls

### Pitfall 1: Condition Evaluation Timing
**What goes wrong:** Conditions evaluated at dialogue start → player completes quest mid-conversation → new topics don't appear until next visit.

**Why it happens:** Condition evaluation happens once when dialogue opens, not reactively.

**How to avoid:** Re-evaluate conditions when returning to hub node (topic selection screen). DialogueEngine checks conditions each time hub is displayed.

**Warning signs:** Player reports "NPC didn't acknowledge I completed the quest even though I'm still talking to them."

### Pitfall 2: Story Flag Budget Exhaustion
**What goes wrong:** narrativeSlice has 50-flag limit with DEV warning. Phase 20 adds quest flags, NPC flags, building flags → exceeds budget → warning spam.

**Why it happens:** Flag proliferation without planning. Every dialogue branch creates a flag.

**How to avoid:** Use composite flags (`scholar_yusuf_progress: 0-5` instead of `scholar_yusuf_topic_1_seen: true`, `scholar_yusuf_topic_2_seen: true`, etc.). Reserve flags for story milestones, not dialogue trees.

**Warning signs:** Console shows `[narrativeSlice] Story flag budget: 50 flags max` repeatedly during development.

### Pitfall 3: Dialogue-Quest Coupling
**What goes wrong:** Dialogue hardcodes quest IDs → quest gets renamed/removed → dialogue breaks silently.

**Why it happens:** No validation that quest IDs in dialogue conditions exist in quests.json.

**How to avoid:** Extend dialogueSchema.js to cross-reference quest IDs against quests.json at build time. Vite plugin fails build if dialogue references non-existent quest.

**Warning signs:** Player selects quest-related dialogue option → nothing happens → quest not in quests.json.

### Pitfall 4: Missing Return-to-Hub Links
**What goes wrong:** Player selects topic → conversation ends → can't access other topics → frustrating UX.

**Why it happens:** Dialogue tree has no `returnToHub: true` field or explicit choice to go back.

**How to avoid:** Validate in dialogueSchema that every topic tree either has `returnToHub: true` or ends with a choice that links back to hub. Document pattern in npcs.json comments.

**Warning signs:** Players complain "I can only ask one question before NPC dismisses me."

### Pitfall 5: Relationship Changes Without Feedback
**What goes wrong:** Player makes choice → relationship changes → no visual/audio cue → player doesn't notice.

**Why it happens:** `incrementNpcRelationship` action dispatched silently, no UI/SFX tied to it.

**How to avoid:** DialogueEngine emits `EVENTS.NPC_RELATIONSHIP_CHANGED` with delta (+1, -1). UI displays brief "+1 Trust" floating text. SFX plays positive/negative sound.

**Warning signs:** Playtesters report "I don't know if choices matter" even though relationship system works.

### Pitfall 6: Inline Vocabulary Performance
**What goes wrong:** Every dialogue line with 10+ Arabic words creates 10+ React components with hover tooltips → lag on low-end devices.

**Why it happens:** Over-highlighting. Not every Arabic word needs a tooltip.

**How to avoid:** Only highlight words in `line.inlineVocab` array (explicitly marked by dialogue author), not automatic regex highlighting of all Arabic. Limit to 3-5 highlights per line.

**Warning signs:** Dialogue overlay frame drops below 60fps on test devices.

## Code Examples

Verified patterns from existing codebase:

### Current npcs.json Structure
```javascript
// Source: /Users/theshumba/Documents/GitHub/gogo-arabic/src/data/npcs.json
{
  "id": "scholar-yusuf",
  "name": "Scholar Yusuf",
  "nameArabic": "الشَّيْخ يوسُف",
  "portrait": "portrait-scholar-yusuf",
  "role": "Teaches alphabet and grammar foundations",
  "greeting": {
    "arabic": "السَّلامُ عَلَيْكُم يا طالِب العِلْم",
    "english": "Peace be upon you, seeker of knowledge",
    "transliteration": "as-salaamu alaykum ya taalib al-ilm"
  },
  "dialogueTrees": [
    {
      "id": "intro",
      "trigger": "first_meeting",
      "lines": [
        {
          "speaker": "npc",
          "arabic": "أَهْلاً وَسَهْلاً! أَنا الشَّيْخ يوسُف",
          "english": "Welcome! I am Sheikh Yusuf.",
          "transliteration": "ahlan wa sahlan! ana ash-shaykh yuusuf"
        },
        {
          "speaker": "player",
          "choices": [
            {
              "arabic": "نَعَم!",
              "english": "Yes!",
              "next": "teach_greetings_1"
            }
          ]
        }
      ]
    }
  ]
}
```

### Current dialogueSchema.js Validation
```javascript
// Source: /Users/theshumba/Documents/GitHub/gogo-arabic/src/data/dialogueSchema.js
import { z } from 'zod';

const dialogueLineSchema = z.object({
  speaker: z.string().optional(),
  arabic: z.string().optional(),
  english: z.string().optional(),
  transliteration: z.string().optional(),
  teachWord: z.string().optional(),
  action: z.string().optional(),
  choices: z.array(z.object({
    arabic: z.string(),
    english: z.string(),
    next: z.string().nullable().optional(),
  }).passthrough()).optional(),
}).passthrough();

const dialogueTreeSchema = z.object({
  id: z.string(),
  trigger: z.string().optional(),
  lines: z.array(dialogueLineSchema).min(1),
}).passthrough();

export const dialogueSchema = z.array(z.object({
  id: z.string(),
  name: z.string(),
  greeting: z.object({
    arabic: z.string(),
    english: z.string(),
    transliteration: z.string().optional(),
  }).passthrough(),
  dialogueTrees: z.array(dialogueTreeSchema).min(1),
}).passthrough());
```

### Current useDialogue Hook Pattern
```javascript
// Source: /Users/theshumba/Documents/GitHub/gogo-arabic/src/hooks/useDialogue.js
export function useDialogue(npc) {
  const dispatch = useDispatch();
  const dialogueState = useSelector((s) => s.npc.dialogueState);

  // Pick tree based on visit history
  const currentTree = useMemo(
    () => (npc ? pickDialogueTree(npc, dialogueState) : null),
    [npc?.id]
  );

  const [lineIndex, setLineIndex] = useState(0);

  const advance = useCallback(() => {
    const line = currentTree?.lines[lineIndex];

    if (line?.teachWord) {
      handleTeachWord(line.teachWord);
    }

    const nextIdx = lineIndex + 1;
    if (nextIdx < currentTree.lines.length) {
      const nextLine = currentTree.lines[nextIdx];

      if (nextLine.action === 'quiz') {
        dispatch(openQuiz({ words: quizWords, quizType: nextLine.quizType }));
        return;
      }

      setLineIndex(nextIdx);
    } else {
      close();
    }
  }, [currentTree, lineIndex, handleTeachWord, dispatch, close]);

  return { currentTree, lineIndex, advance, handleChoice };
}
```

### Current EventBus Dialogue Events
```javascript
// Source: /Users/theshumba/Documents/GitHub/gogo-arabic/src/utils/eventBusTypes.js
export const EVENTS = Object.freeze({
  /** Phaser → React: player pressed SPACE near NPC, open dialogue overlay */
  NPC_INTERACT: 'phaser:npc:interact',

  /** React → Phaser: freeze player movement (e.g. when overlay opens) */
  PLAYER_FREEZE: 'react:player:freeze',

  /** React → Phaser: unfreeze player movement (e.g. when overlay closes) */
  PLAYER_UNFREEZE: 'react:player:unfreeze',

  /** React → Redux: set a story flag in narrativeSlice */
  NARRATIVE_FLAG_SET: 'react:narrative:flag-set',

  /** React → Redux: change NPC relationship level in narrativeSlice */
  NARRATIVE_RELATIONSHIP_CHANGED: 'react:narrative:relationship-changed',
});
```

### Current narrativeSlice Selectors
```javascript
// Source: /Users/theshumba/Documents/GitHub/gogo-arabic/src/store/slices/narrativeSlice.js
export const selectStoryFlags = (state) => state.narrative.storyFlags;
export const selectNpcRelationships = (state) => state.narrative.npcRelationships;
export const selectChoiceHistory = (state) => state.narrative.choiceHistory;

export const selectNpcRelationship = (npcId) => (state) =>
  state.narrative.npcRelationships[npcId] ?? 0;

export const selectHasMadeChoice = (npcId, choiceId) =>
  createSelector(
    [selectChoiceHistory],
    (choiceHistory) =>
      choiceHistory.some(
        (entry) => entry.npcId === npcId && entry.choiceId === choiceId
      )
  );
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Linear dialogue trees | Hub-and-spoke topic selection | Industry trend 2024-2026 | Allows multi-topic conversations, prevents conversation exhaustion |
| Static NPC dialogue | Dynamic dialogue with conditions/flags | BioWare RPGs → modern narrative games | NPCs respond to player progression, feel alive |
| Separate dialogue + quest systems | Unified dialogue effects (quest triggers, relationship changes) | Witcher 3 → Baldur's Gate 3 | Dialogue has meaningful consequences, not just flavor text |
| Manual TypeScript types for dialogue | Zod schema validation + type inference | TypeScript ecosystem maturation 2024+ | Single source of truth, runtime validation + compile-time types |
| Visual dialogue editors (Yarn, Twine) | JSON-driven with build-time validation | Modern web game trend 2025-2026 | Version control friendly, no external editor dependency |

**Deprecated/outdated:**
- Hardcoded dialogue strings in code: Modern practice uses JSON data files validated at build time.
- Dialogue trees without conditions: Industry expects dynamic conversations that respond to game state.
- Missing relationship systems: Players expect NPCs to remember interactions (trust meters, friendship levels).

## Open Questions

1. **Should DialogueEngine be a Phaser system or a standalone utility class?**
   - What we know: Existing pattern is Phaser systems (NPCManager, SceneStackManager, InteractableManager). DialogueEngine needs access to Redux store for condition evaluation.
   - What's unclear: Whether DialogueEngine should live in Phaser scene lifecycle (created in WorldScene.create()) or be instantiated by useDialogue hook.
   - Recommendation: **Phaser system pattern** — instantiated in WorldScene, accessed via `this.scene.dialogueEngine`. Matches NPCManager pattern, allows direct EventBus integration.

2. **How many NPCs should have full multi-topic conversations vs. simple linear dialogue?**
   - What we know: DLGE-07 requires 30 NPCs with deep conversations (3+ topics each). Current npcs.json has 23 NPCs.
   - What's unclear: Whether all 23 existing NPCs should be upgraded or if 7 new NPCs should be added.
   - Recommendation: **Upgrade 15 major NPCs** (one per zone + key quest givers) to 3+ topics, keep 8 minor NPCs with simple linear dialogue, add 15 new NPCs with full topic trees. Total: 30 multi-topic NPCs.

3. **Should conversation history be a scrollable log or a summary of past topics?**
   - What we know: DLGE-13 requires reviewing conversation history. narrativeSlice has choiceHistory array (timestamps, npcId, choiceId).
   - What's unclear: UI design — full chat log (performance concern) vs. "Topics Discussed" summary list.
   - Recommendation: **"Topics Discussed" summary** — lighter UI, faster to scan, less memory intensive. Show list of unlocked topics with checkmarks for completed ones.

4. **How to handle mid-dialogue quizzes (DLGE-12) without breaking conversation flow?**
   - What we know: Current system opens quiz overlay, closes dialogue. useDialogue hook already handles `action: "quiz"` lines.
   - What's unclear: Whether quiz results should affect conversation (pass → continue, fail → NPC comments).
   - Recommendation: **Quiz as dialogue interruption with result acknowledgment** — after quiz closes, return to dialogue with NPC commenting on performance ("Well done!" vs. "Let's review again").

5. **What's the best way to prevent story flag budget exhaustion?**
   - What we know: narrativeSlice caps flags at 50 with DEV warning. Phase 20 adds dialogue progression tracking.
   - What's unclear: Should dialogue use NPC-specific progress counters instead of individual flags?
   - Recommendation: **Composite progress flags** — `npc_scholar_yusuf_progress: 0-10` (number) instead of 10 boolean flags. Reserve boolean flags for major story milestones only.

## Sources

### Primary (HIGH confidence)
- Existing codebase:
  - `/Users/theshumba/Documents/GitHub/gogo-arabic/src/data/dialogueSchema.js` — Zod schema validation pattern
  - `/Users/theshumba/Documents/GitHub/gogo-arabic/src/hooks/useDialogue.js` — Tree traversal, choice handling
  - `/Users/theshumba/Documents/GitHub/gogo-arabic/src/components/NPC/DialogueOverlay.jsx` — UI component structure (540 LOC total)
  - `/Users/theshumba/Documents/GitHub/gogo-arabic/src/store/slices/narrativeSlice.js` — Story flags, relationships, choice history
  - `/Users/theshumba/Documents/GitHub/gogo-arabic/src/data/npcs.json` — 23 NPCs, 219 teachWord references, 38 choice branches
  - `/Users/theshumba/Documents/GitHub/gogo-arabic/src/data/culturalDialogues.js` — 8 cultural topics, 383 LOC educational content
  - `/Users/theshumba/Documents/GitHub/gogo-arabic/.planning/phases/19-infrastructure-architecture/19-04-SUMMARY.md` — SceneStackManager + Zod validation implementation
- Package.json: Zod ^4.3.6, React ^19.2.4, Redux Toolkit ^2.11.2, Phaser ^3.90.0, Framer Motion ^11.15.0

### Secondary (MEDIUM confidence)
- [Branching Conversation Systems and the Working Writer, Part 1: Introduction](https://www.gamedeveloper.com/design/branching-conversation-systems-and-the-working-writer-part-1-introduction) — Dialogue tree design patterns, condition-based branching
- [Dialogue Trees: Creating Branching Narratives in Games](https://www.designthegame.com/learning/tutorial/dialogue-trees-creating-branching-narratives-games) — Hub-and-spoke architecture, branching complexity management
- [The Branching Dialogue Nightmare: Why Your First Dialogue System Will Fail (And How to Fix It)](https://storyflow-editor.com/blog/branching-dialogue-nightmare-how-to-fix/) — Visual node systems prevent complexity explosions
- [The Ultimate Branching Dialogue Tool for Game Developers | Drafft](https://drafft.dev/blog/branching-dialogue-tool) — Modern tools feature condition/property management without hardcoding
- [Zod Arrays: From Basics to Array of Objects Validation - Tecktol](https://tecktol.com/zod-array/) — Nested array/object validation patterns
- [Zod Documentation](https://zod.dev/) — Official API reference for schema validation
- [An architecture for Phaser JS + Redux](http://orta.io/notes/games/phaser-redux/) — User inputs trigger Redux actions, Phaser renderer reads state
- [GitHub - hawkins/phaser-dialogue](https://github.com/hawkins/phaser-dialogue) — Phaser extension for managing dialogue (alternative approach)
- [Dialog - Notes of Phaser 3](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/ui-dialog/) — Dialog components with background, title, content, choices
- [The Hidden Language of Video Game NPCs](https://dicmat.com/whoa/npc-language-patterns) — Speech patterns, catchphrases, distinct NPC voices
- [Worldbuilding With NPC Dialogue: A Beginner's Guide](https://www.gamedeveloper.com/design/worldbuilding-with-npc-dialogue-a-beginner-s-guide) — Giving NPCs distinct tone, speech habits, rhythm variations
- [Lingopie - Learn a new language just by watching TV shows with subtitles](https://lingopie.com/) — Hover-over translations, inline vocabulary highlighting
- [Creating Epic Quest Chains with Branching Narratives: A Comprehensive Guide](https://www.questful.dev/blog/quests/creating-epic-quest-chains-with-branching-narrativ) — Dialogue choices control quests, branching has tangible consequences

### Tertiary (LOW confidence)
- [AI NPC Agent: Revolutionizing Gaming Through Intelligent Non-Player Characters in 2026](https://www.jenova.ai/en/resources/ai-npc-agent) — ~50% of studios using AI for NPC dialogue generation (industry trend, not applicable to Phase 20)
- [React Stack Patterns 2026](https://www.patterns.dev/react/react-2026/) — AI-driven conversational interfaces trend (not relevant for JSON-driven dialogue)

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** — All dependencies already installed, verified in package.json and existing codebase
- Architecture: **HIGH** — Existing patterns (Phaser systems, Zod validation, EventBus, Redux slices) established in Phase 19, Phase 20 extends rather than replaces
- Pitfalls: **MEDIUM** — Story flag budget, dialogue-quest coupling, return-to-hub missing links identified from codebase inspection, not verified through user testing
- Code examples: **HIGH** — All examples extracted from existing codebase with file paths verified
- Hub-and-spoke UI pattern: **MEDIUM** — Pattern widely documented in game design articles, not yet implemented in this codebase
- NPC personality design: **MEDIUM** — Best practices from game design articles, specific implementation (tone, catchphrase fields) needs validation

**Research date:** 2026-02-11
**Valid until:** 2026-03-13 (30 days — stable domain, Zod/Phaser/React APIs unlikely to change)
