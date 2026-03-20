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
 *
 * domainAffinity: array of learning path IDs that this word is prioritized for.
 * Assigned post-merge based on the word's category. Used by selectNewCardsByPath
 * to reorder new card queues per player learning path (PATH-03).
 */

import curatedWords from './vocabulary.json';
import finalWords from './vocabulary-final.json';
import expandedWords from './vocabularyExpanded.js';

// ============================================================
// DOMAIN AFFINITY MAPPING — category → learning path IDs
// ============================================================
// Scholar domain — reading, writing, formal language, sciences
// Traveler domain — daily life, greetings, social, practical
// Historian domain — history, culture, geography, architecture
// ============================================================

const CATEGORY_AFFINITY = {
  // Scholar domain
  grammar: ['scholar'],
  numbers: ['scholar'],
  colors: ['scholar'],
  writing: ['scholar'],
  education: ['scholar'],
  science: ['scholar'],
  mathematics: ['scholar'],
  astronomy: ['scholar'],

  // Traveler domain
  greetings: ['traveler'],
  food: ['traveler'],
  trade: ['traveler'],
  directions: ['traveler'],
  family: ['traveler'],
  body: ['traveler'],
  clothing: ['traveler'],
  daily_life: ['traveler'],
  weather: ['traveler'],

  // Historian domain
  history: ['historian'],
  culture: ['historian'],
  geography: ['historian'],
  architecture: ['historian'],
  religion: ['historian'],
  military: ['historian'],
  government: ['historian'],

  // Shared domains
  nature: ['traveler', 'historian'],
  animals: ['traveler', 'historian'],
  time: ['scholar', 'traveler'],
  phrases: ['traveler', 'scholar'],
  adjectives: ['scholar', 'traveler', 'historian'],
  verbs_basic: ['scholar', 'traveler', 'historian'],
};

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

// Post-process: assign domainAffinity to every word based on its category.
// Words matching a learning path's domain appear first in selectNewCardsByPath.
for (const word of vocabulary) {
  word.domainAffinity = CATEGORY_AFFINITY[word.category] || [];
}

// Dev-mode affinity summary (stripped by bundler in production via dead-code elimination)
if (import.meta.env.DEV) {
  const summary = { scholar: 0, traveler: 0, historian: 0, shared: 0, none: 0 };
  for (const w of vocabulary) {
    const a = w.domainAffinity;
    if (a.length === 0) summary.none++;
    else if (a.length > 1) summary.shared++;
    else summary[a[0]]++;
  }
  // eslint-disable-next-line no-console
  console.debug('[vocabularyAll] domainAffinity distribution:', summary);
}

export default vocabulary;
