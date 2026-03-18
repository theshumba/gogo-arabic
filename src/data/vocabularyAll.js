/**
 * Consolidated vocabulary data module.
 *
 * Merges the hand-curated vocabulary.json (250 words with transliterations,
 * example sentences, and audio references) with the larger vocabulary-final.json
 * dataset (~970 additional words that have English translations).
 *
 * vocabulary.json entries take priority when IDs overlap, preserving their
 * richer metadata (transliteration, exampleSentence, audioRef, npcSource).
 *
 * Entries from vocabulary-final.json that lack an English translation (mostly
 * Quranic-only vocabulary) are excluded because the quiz and review systems
 * require an English field for all question types.
 *
 * Every exported entry is guaranteed to have at minimum:
 *   id, arabic, english, category, difficulty
 *
 * The 5,000-word vocabularyExpanded.js dataset is NOT imported eagerly.
 * Call loadExpandedVocabulary() after the game boots to merge it in.
 */

import curatedWords from './vocabulary.json';
import finalWords from './vocabulary-final.json';

// Build a Set of IDs already present in the curated dataset
const curatedIds = new Set(curatedWords.map((w) => w.id));

// Filter vocabulary-final entries: must have a non-null English translation
// and must not duplicate an ID already in the curated set.
const additionalWords = finalWords
  .filter((w) => w.english != null && w.english !== '' && !curatedIds.has(w.id))
  .map((w) => ({
    // Normalize to the schema the app expects
    id: w.id,
    arabic: w.arabic,
    english: w.english,
    transliteration: w.transliteration || null,
    category: w.category || 'general',
    difficulty: w.difficulty || 1,
    // Preserve optional fields when present
    audioRef: w.audioRef || null,
    npcSource: w.npcSource || null,
    exampleSentence: w.exampleSentence || null,
    // Carry forward vocabulary-final-specific fields that other systems may use
    source: w.source || null,
    quranRef: w.quranRef || null,
    rootLetters: w.rootLetters || null,
    partOfSpeech: w.partOfSpeech || null,
    zone: w.zone || null,
    frequency: w.frequency ?? null,
  }));

// Curated first, then vocabulary-final (~1,220 words total at boot)
const vocabulary = [...curatedWords, ...additionalWords];

export default vocabulary;

/**
 * Lazily loads the 5,000-word CEFR-tagged expanded vocabulary and merges it
 * into the live vocabulary array. Safe to call multiple times — subsequent
 * calls are no-ops once the chunk has been loaded.
 *
 * Call this in GameLayout's useEffect after Phaser boots so the expanded
 * words don't block the initial page load.
 *
 * @returns {Promise<Array>} The full merged vocabulary array
 */
let expandedLoaded = false;

export async function loadExpandedVocabulary() {
  if (expandedLoaded) return vocabulary;

  const { default: expandedWords } = await import('./vocabularyExpanded.js');

  // Build a Set of IDs already in the base vocabulary to deduplicate
  const existingIds = new Set(vocabulary.map((w) => w.id));

  const expandedDeduped = expandedWords
    .filter((w) => !existingIds.has(w.id))
    .map((w) => ({
      id: w.id,
      arabic: w.arabic,
      english: w.english,
      transliteration: w.transliteration || null,
      category: w.category || 'general',
      difficulty: w.difficulty || 1,
      root: w.root || null,
      cefrLevel: w.cefrLevel || null,
      frequency: w.frequency ?? null,
    }));

  // Mutate the exported array in-place so all existing references see the update
  vocabulary.push(...expandedDeduped);
  expandedLoaded = true;

  return vocabulary;
}
