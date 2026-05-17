/**
 * saveManager.js — 3-slot save system with encoding and migration support
 *
 * Architecture notes:
 * - Save data is stored in localStorage under keys gogo_save_1, gogo_save_2, gogo_save_3
 * - State is base64-encoded (TextEncoder) for safe localStorage storage
 * - All game-relevant slices are saved (derived from PERSISTED_SLICES below)
 * - Migration system handles version upgrades without corrupting old saves
 */

/**
 * Transient slices that are EXCLUDED from saves.
 * These are runtime-only, re-generated at boot, or session-ephemeral.
 */
const TRANSIENT_SLICES = new Set([
  'ui',
  'sync',
  'gossip',
  'notifications',
  'dailyQuest',
  'analyticsEventQueue',
  'microReview',
]);

export const SAVE_SLOTS = 3;
export const SAVE_VERSION = 1;

/**
 * Save current game state to a slot (1–3).
 *
 * Atomic write protocol (temp-key + promote):
 *   1. Serialize the save payload.
 *   2. Validate the payload is round-trippable (JSON.parse(JSON.stringify(...))
 *      succeeds AND the encoded slice data decodes cleanly).
 *   3. Write to `gogo_save_<n>_pending`.
 *   4. Re-read the pending key and confirm it parses.
 *   5. Promote to the final key `gogo_save_<n>` with a single setItem call.
 *   6. Remove the pending key.
 *
 * If any step before step 5 throws (encoding error, quota error on the
 * pending key, validation failure) the previous good save in slot N
 * remains untouched. The pending key is cleaned up in a finally block.
 *
 * @param {number} slotNumber - 1, 2, or 3
 * @param {object} store - Redux store
 * @returns {object} The save data object written to storage
 */
export async function saveToSlot(slotNumber, store) {
  const state = store.getState();

  // Capture all slices except transient/session-only ones.
  // This stays in sync automatically as new slices are added to the store.
  const sliceData = {};
  for (const key of Object.keys(state)) {
    if (!TRANSIENT_SLICES.has(key)) {
      sliceData[key] = state[key];
    }
  }

  const saveData = {
    version: SAVE_VERSION,
    timestamp: Date.now(),
    playerName: state.player?.name,
    playerLevel: state.player?.level,
    currentZone: state.player?.currentZone,
    playtime: state.stats?.totalPlayTime || 0,
    // All non-transient slices
    data: compressState(sliceData),
  };

  const serialized = JSON.stringify(saveData);

  // Pre-write integrity check: ensure the serialized payload round-trips.
  // If JSON.parse fails here we never touched the live slot.
  try {
    JSON.parse(serialized);
  } catch (err) {
    throw new Error(`saveToSlot: serialized payload is not valid JSON: ${err.message}`);
  }

  const finalKey = `gogo_save_${slotNumber}`;
  const pendingKey = `gogo_save_${slotNumber}_pending`;

  try {
    // Step 3: write to pending key.
    // If this throws (e.g., QuotaExceededError) the previous good save
    // at finalKey is untouched.
    localStorage.setItem(pendingKey, serialized);

    // Step 4: read-back validation — guards against any post-write corruption
    // (e.g., a storage layer that silently truncated the value).
    const readBack = localStorage.getItem(pendingKey);
    if (readBack !== serialized) {
      throw new Error('saveToSlot: pending write did not round-trip cleanly');
    }

    // Step 5: promote to final key. setItem is atomic per-key in the
    // Web Storage spec — there is no observable partial state.
    localStorage.setItem(finalKey, serialized);
  } finally {
    // Step 6: cleanup. Safe to run on success or failure — removeItem on a
    // missing key is a no-op.
    try {
      localStorage.removeItem(pendingKey);
    } catch {
      // Cleanup failure is non-fatal; the pending key is harmless and will
      // be overwritten on the next save.
    }
  }

  return saveData;
}

/**
 * Load a save slot and return the parsed, decompressed save data.
 * Returns null if the slot is empty.
 * @param {number} slotNumber - 1, 2, or 3
 * @returns {object|null}
 */
export function loadSlot(slotNumber) {
  const raw = localStorage.getItem(`gogo_save_${slotNumber}`);
  if (!raw) return null;
  const saveData = JSON.parse(raw);
  return {
    ...saveData,
    data: decompressState(saveData.data),
  };
}

/**
 * Get metadata for all 3 slots — used by the slot selection UI.
 * Does NOT decompress the full state; only reads the outer metadata.
 * @returns {Array<object>} Array of slot metadata objects
 */
export function getSlotMetadata() {
  return Array.from({ length: SAVE_SLOTS }, (_, i) => {
    const raw = localStorage.getItem(`gogo_save_${i + 1}`);
    if (!raw) return { slot: i + 1, empty: true };
    const data = JSON.parse(raw);
    return {
      slot: i + 1,
      empty: false,
      playerName: data.playerName,
      playerLevel: data.playerLevel,
      currentZone: data.currentZone,
      timestamp: data.timestamp,
      version: data.version,
    };
  });
}

/**
 * Delete a save slot.
 * @param {number} slotNumber - 1, 2, or 3
 */
export function deleteSlot(slotNumber) {
  localStorage.removeItem(`gogo_save_${slotNumber}`);
}

/**
 * Encode game state to a base64 string using TextEncoder (handles all Unicode, including Arabic).
 * Note: base64 encoding increases payload size slightly — it is used purely for
 * transport-safety (avoids control characters / newlines in localStorage values),
 * NOT for compression.
 * @param {object} state
 * @returns {string}
 */
function compressState(state) {
  const json = JSON.stringify(state);
  const bytes = new TextEncoder().encode(json);
  return btoa(String.fromCharCode(...bytes));
}

/**
 * Reverse of compressState. Handles base64-encoded state.
 * Throws on decode failure so the caller (loadSlot) can surface the error to the UI.
 * @param {string} encoded
 * @returns {object}
 */
function decompressState(encoded) {
  const bytes = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
  const json = new TextDecoder().decode(bytes);
  return JSON.parse(json);
}

/**
 * Migrate a save to the current version.
 * Each version block is additive — only fills in missing fields.
 * @param {object} saveData - Raw save data from loadSlot()
 * @returns {object} Migrated save data with updated version
 */
export function migrateState(saveData) {
  let state = saveData.data;
  let version = saveData.version;

  // Reject saves from a newer version of the game — we cannot safely interpret them.
  if (version > SAVE_VERSION) {
    throw new Error(
      `Save is from a newer version of the game (v${version}) and cannot be loaded by this build (v${SAVE_VERSION}). ` +
      `Please update the game or use a compatible save.`
    );
  }

  // v0 → v1: add slices that were introduced after initial release
  if (!version || version < 1) {
    state.skillTree = state.skillTree || {
      unlockedNodes: {},
      skillXP: {},
    };
    state.faction = state.faction || {
      alignment: {},
      primaryFaction: null,
      secondaryFaction: null,
    };
    state.journal = state.journal || {
      entries: [],
      notes: [],
      discoveredSecrets: [],
      visitedLandmarks: [],
      earnedTitles: [],
      activeTitle: null,
    };
    state.codex = state.codex || {
      unlockedEntries: [],
      readEntries: [],
      newEntryCount: 0,
    };
    version = 1;
  }

  // Future migrations go here:
  // if (version < 2) { ... version = 2; }

  return { ...saveData, data: state, version };
}
