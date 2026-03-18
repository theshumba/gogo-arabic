/**
 * Consolidated vocabulary data module.
 *
 * Merges three vocabulary sources into one array (5,000+ words):
 *
 *   1. vocabulary.json        — 250 hand-curated words (richest metadata:
 *                                transliterations, example sentences, audio refs)
 *   2. vocabulary-final.json  — ~970 additional words with English translations
 *   3. vocabularyExpanded.js  — 5,000 CEFR-tagged words (A1/A2/B1/B2)
 *
 * Priority order: curated > vocabulary-final > expanded. If an ID already
 * exists in a higher-priority source, the duplicate from the lower-priority
 * source is excluded.
 *
 * Entries from vocabulary-final.json that lack an English translation (mostly
 * Quranic-only vocabulary) are excluded because the quiz and review systems
 * require an English field for all question types.
 *
 * Every exported entry is guaranteed to have at minimum:
 *   id, arabic, english, category, difficulty
 */

import curatedWords from './vocabulary.json';
import finalWords from './vocabulary-final.json';
import expandedWords from './vocabularyExpanded.js';

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

// Build a Set of all IDs from curated + additional to deduplicate expanded words
const allExistingIds = new Set([
  ...curatedWords.map((w) => w.id),
  ...additionalWords.map((w) => w.id),
]);

// Filter expanded words: exclude any ID already present in higher-priority sources
const newExpandedWords = expandedWords.filter((w) => !allExistingIds.has(w.id));

// Final export: curated first (richest metadata), then additional, then expanded
const vocabulary = [...curatedWords, ...additionalWords, ...newExpandedWords];

export default vocabulary;
