/**
 * QUIZ_TYPE_REGISTRY — Central registry of all quiz types with gating metadata.
 * Phase 59: 12 existing + 6 Phase 60 stubs (minLevel: 999).
 * Phase 60 lowers minLevel on new types when renderers ship.
 *
 * Fields:
 *   label    — Human-readable name (used by QuizOverlay header)
 *   cluster  — Content cluster for adaptive routing (vocabulary|grammar|reading|roots|listening)
 *   minLevel — Minimum player level to unlock this type
 *   cefrMin  — Minimum CEFR level ('A1'|'A2'|'B1'|'B2'|null) — null = no gate
 */

export const CEFR_ORDER = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4 };

export const QUIZ_TYPE_REGISTRY = {
  // ── Existing 12 types ──
  'ar-to-en':        { label: 'Arabic > English',    cluster: 'vocabulary', minLevel: 1,   cefrMin: null },
  'en-to-ar':        { label: 'English > Arabic',    cluster: 'vocabulary', minLevel: 1,   cefrMin: null },
  'en-to-type-ar':   { label: 'Type Arabic',         cluster: 'vocabulary', minLevel: 3,   cefrMin: 'A1' },
  'listen':          { label: 'Listen & Choose',     cluster: 'listening',  minLevel: 1,   cefrMin: null },
  'match':           { label: 'Match Pairs',         cluster: 'vocabulary', minLevel: 1,   cefrMin: null },
  'sentence-build':  { label: 'Build a Sentence',    cluster: 'reading',    minLevel: 5,   cefrMin: 'A1' },
  'root-identify':   { label: 'Find the Root',       cluster: 'roots',      minLevel: 5,   cefrMin: 'A1' },
  'fill-blank':      { label: 'Fill in the Blank',   cluster: 'grammar',    minLevel: 2,   cefrMin: null },
  'category-sort':   { label: 'Sort Categories',     cluster: 'vocabulary', minLevel: 4,   cefrMin: 'A1' },
  'transliterate':   { label: 'Transliterate',       cluster: 'reading',    minLevel: 3,   cefrMin: 'A1' },
  'conjugation':     { label: 'Conjugation',         cluster: 'grammar',    minLevel: 4,   cefrMin: 'A1' },
  'picture-word':    { label: 'Picture Word',        cluster: 'vocabulary', minLevel: 1,   cefrMin: null },
  // ── Phase 60 types — GrammarFill renderer shipped; other types gated at minLevel: 999 ──
  'GrammarFill':     { label: 'Grammar Fill',        cluster: 'grammar',    minLevel: 4,   cefrMin: 'A1' },
  'ClozePassage':    { label: 'Cloze Passage',       cluster: 'grammar',    minLevel: 999, cefrMin: 'A2' },
  'WordOrder':       { label: 'Word Order',          cluster: 'grammar',    minLevel: 999, cefrMin: 'A1' },
  'DialectIdentify': { label: 'Dialect Identify',    cluster: 'listening',  minLevel: 999, cefrMin: 'B1' },
  'RootExpand':      { label: 'Root Expand',         cluster: 'roots',      minLevel: 999, cefrMin: 'A2' },
  'CulturalContext': { label: 'Cultural Context',    cluster: 'reading',    minLevel: 999, cefrMin: 'B1' },
};

/**
 * Check if a player's CEFR level meets the minimum requirement.
 * @param {Object} typeEntry - Registry entry with cefrMin
 * @param {string|null} cefrLevel - Player's current CEFR level
 * @returns {boolean}
 */
function isCefrEligible(typeEntry, cefrLevel) {
  if (!typeEntry.cefrMin) return true;
  if (!cefrLevel) return true; // no placement = no gate (per Research anti-pattern)
  return (CEFR_ORDER[cefrLevel] ?? 0) >= (CEFR_ORDER[typeEntry.cefrMin] ?? 1);
}

/**
 * Select a quiz type appropriate for this player's state.
 * Routes grammar-weak players (below 70% accuracy after 3+ grammar questions) to grammar
 * cluster types with 70% probability.
 * Gates types by minLevel and cefrMin.
 *
 * This is a PURE FUNCTION — no Redux imports, no side effects.
 *
 * @param {Object} clusterAccuracy - { [clusterId]: { correct: number, total: number } }
 * @param {number} playerLevel     - Current player level (from playerSlice)
 * @param {string|null} cefrLevel  - Current CEFR level ('A1'|'A2'|'B1'|'B2'|null)
 * @returns {string} Quiz type key from QUIZ_TYPE_REGISTRY
 */
export function selectQuizTypeForPlayer(clusterAccuracy, playerLevel, cefrLevel) {
  // Filter to eligible types by level + CEFR
  const eligible = Object.entries(QUIZ_TYPE_REGISTRY).filter(([, entry]) => {
    if (playerLevel < entry.minLevel) return false;
    return isCefrEligible(entry, cefrLevel);
  });

  // Grammar weakness routing: 70% chance grammar type when weakness detected
  const gc = clusterAccuracy?.grammar;
  const grammarWeak = gc && gc.total >= 3 && gc.correct / gc.total < 0.70;
  if (grammarWeak) {
    const grammarTypes = eligible.filter(([, e]) => e.cluster === 'grammar');
    if (grammarTypes.length > 0 && Math.random() < 0.70) {
      return grammarTypes[Math.floor(Math.random() * grammarTypes.length)][0];
    }
  }

  // Default: uniform random from eligible types
  if (eligible.length === 0) return 'ar-to-en'; // ultimate fallback
  return eligible[Math.floor(Math.random() * eligible.length)][0];
}
