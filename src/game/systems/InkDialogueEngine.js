import { store } from '../../store/store.js';
import { setFlag } from '../../store/slices/worldStateSlice.js';
import { WORLD_STATE_KEYS } from '../../data/worldStateKeys.js';
import { setLearningPath, setTutorialPhase } from '../../store/slices/playerSlice.js';
import { updateQuestProgress } from '../../store/slices/questSlice.js';
import { incrementNpcRelationship } from '../../store/slices/narrativeSlice.js';

/**
 * InkDialogueEngine
 *
 * Adapter that wraps an inkjs Story for ink-scripted NPCs,
 * with automatic fallback to the legacy DialogueEngine for
 * any NPC that does not have a compiled .ink.json file.
 *
 * INFRA-07: Adapter pattern — ink Story OR legacy JSON, same interface
 * INFRA-08: import.meta.glob enumerates all .ink.json at build time (Vite-safe)
 * INFRA-09: syncStateIn / syncStateOut bridge Redux worldState ↔ ink variablesState
 */

// Vite-safe dynamic import pattern (Pitfall 2 from RESEARCH.md)
// Enumerates all .ink.json files at build time so Vite can chunk them correctly.
const INK_FILES = import.meta.glob('../data/ink/*.ink.json');

export class InkDialogueEngine {
  /**
   * @param {Phaser.Scene} scene - Active Phaser scene (passed through for future use)
   * @param {import('./DialogueEngine.js').DialogueEngine} legacyDialogueEngine - Fallback legacy engine
   */
  constructor(scene, legacyDialogueEngine) {
    this.scene = scene;
    this.legacy = legacyDialogueEngine;
    this._story = null;
    this._inkLoaded = false;
    this._currentNpcId = null;
  }

  /**
   * Attempt to load a compiled .ink.json for the given NPC.
   * If no ink file exists, _inkLoaded stays false and all calls
   * transparently fall through to the legacy engine.
   *
   * @param {string} npcId - e.g. 'guide-amira', 'scholar-yusuf'
   */
  async loadForNpc(npcId) {
    const key = `../data/ink/${npcId}.ink.json`;
    const loader = INK_FILES[key];

    if (!loader) {
      // No compiled ink file for this NPC — use legacy path
      this._inkLoaded = false;
      return;
    }

    try {
      const mod = await loader();
      const { Story } = await import('inkjs');
      this._story = new Story(mod.default);
      this._bindExternalFunctions();
      this._inkLoaded = true;
      this._currentNpcId = npcId;
    } catch (err) {
      console.warn(`[InkDialogueEngine] Failed to load ink story for ${npcId}:`, err);
      this._inkLoaded = false;
    }
  }

  /**
   * Load the path-choice ink story for Guide Amira.
   * Fires after the first word is learned (ONBOARDING_FIRST_WORD_LEARNED),
   * presenting Scholar / Traveler / Historian choices through in-world dialogue.
   *
   * PATH-01 / PATH-02: uses guide-amira-path.ink.json (not the general guide-amira.ink.json)
   */
  async loadPathChoice() {
    const key = '../data/ink/guide-amira-path.ink.json';
    const loader = INK_FILES[key];

    if (!loader) {
      this._inkLoaded = false;
      return;
    }

    try {
      const mod = await loader();
      const { Story } = await import('inkjs');
      this._story = new Story(mod.default);
      this._bindExternalFunctions();
      this._inkLoaded = true;
      this._currentNpcId = 'guide-amira-path';
    } catch (err) {
      console.warn('[InkDialogueEngine] Failed to load path-choice ink story:', err);
      this._inkLoaded = false;
    }
  }

  /**
   * Whether an ink Story was successfully loaded for the current NPC.
   * @returns {boolean}
   */
  get isInkLoaded() {
    return this._inkLoaded;
  }

  /**
   * INFRA-09: Copy relevant Redux state INTO ink variablesState before dialogue starts.
   * Only syncs keys that are actually declared as variables in the ink story
   * (silently skips unknown keys via try/catch).
   */
  syncStateIn() {
    if (!this._inkLoaded) return;

    const state = store.getState();
    const flags = state.worldState?.flags ?? {};

    // Sync all world state flags into ink variables
    for (const [key, value] of Object.entries(flags)) {
      try {
        this._story.variablesState[key] = value;
      } catch {
        // Ink variable not declared in this story — skip silently
      }
    }

    // Sync learning path (player slice)
    try {
      this._story.variablesState['player_learning_path'] = state.player?.learningPath || '';
    } catch {
      // Variable not declared in this story — skip
    }

    // Sync onboarding complete flag (player slice)
    try {
      this._story.variablesState['player_onboarding_complete'] = !!(state.player?.onboardingComplete);
    } catch {
      // Variable not declared in this story — skip
    }
  }

  /**
   * INFRA-09: Flush ink variablesState mutations BACK to Redux worldState after dialogue ends.
   * Only writes keys that are in WORLD_STATE_KEYS to avoid polluting the store.
   */
  syncStateOut() {
    if (!this._inkLoaded) return;

    const knownValues = new Set(Object.values(WORLD_STATE_KEYS));
    const globalVars = this._story.variablesState?._globalVariables?.keys?.() ?? [];

    for (const varName of knownValues) {
      try {
        const value = this._story.variablesState[varName];
        if (value !== undefined) {
          store.dispatch(setFlag({ key: varName, value }));
        }
      } catch {
        // Variable not in this story — skip
      }
    }

    // Suppress unused variable warning for globalVars (enumeration not used here
    // because we iterate knownValues instead for safety)
    void globalVars;
  }

  /**
   * Bind Redux dispatch actions as external functions callable from ink scripts.
   * ink calls these via: ~ setLearningPath("scholar")
   * @private
   */
  _bindExternalFunctions() {
    // Set learning path + mark path-chosen flag
    this._story.BindExternalFunction('setLearningPath', (path) => {
      store.dispatch(setLearningPath(path));
      store.dispatch(setFlag({ key: WORLD_STATE_KEYS.ONBOARDING_PATH_CHOSEN, value: true }));
    });

    // Start a quest (sets it to active with progress 0)
    this._story.BindExternalFunction('startQuest', (questId) => {
      store.dispatch(updateQuestProgress({ questId, amount: 0 }));
    });

    // Change NPC relationship by a delta amount
    this._story.BindExternalFunction('changeRelationship', (npcId, amount) => {
      store.dispatch(incrementNpcRelationship({ npcId, amount }));
    });

    // Read a world state flag from Redux (for ink conditionals)
    this._story.BindExternalFunction('getFlag', (key) => {
      return store.getState().worldState?.flags?.[key] ?? false;
    });

    // Read the player's current learning path (for ink conditionals)
    this._story.BindExternalFunction('getLearningPath', () => {
      return store.getState().player?.learningPath || '';
    });
  }

  // ─── Story control ───────────────────────────────────────────

  /**
   * Whether the story has more content to output.
   * @returns {boolean}
   */
  canContinue() {
    return this._inkLoaded ? this._story.canContinue : false;
  }

  /**
   * Advance the story and return the next line of dialogue.
   * @returns {string|null}
   */
  continue() {
    return this._inkLoaded ? this._story.Continue() : null;
  }

  /**
   * Current list of player choice options (if any).
   * @returns {import('inkjs').Choice[]}
   */
  currentChoices() {
    return this._inkLoaded ? this._story.currentChoices : [];
  }

  /**
   * Select a choice by index (0-based).
   * @param {number} index
   */
  chooseChoiceIndex(index) {
    if (this._inkLoaded) {
      this._story.ChooseChoiceIndex(index);
    }
  }

  /**
   * Reset the story state and clear the loaded story.
   * Call after dialogue ends to free memory.
   */
  reset() {
    if (this._inkLoaded) {
      this._story.ResetState();
    }
    this._inkLoaded = false;
    this._story = null;
    this._currentNpcId = null;
  }

  /**
   * Convenience method: sync state in, collect all text lines until a choice or END.
   * @returns {{ lines: string[], choices: import('inkjs').Choice[] }}
   */
  getDialogueLines() {
    this.syncStateIn();
    const lines = [];
    while (this.canContinue()) {
      lines.push(this.continue());
    }
    return { lines, choices: this.currentChoices() };
  }
}
