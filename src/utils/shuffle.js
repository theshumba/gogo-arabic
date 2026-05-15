/**
 * Fisher-Yates shuffle — returns a new array with elements in random order.
 * Does NOT mutate the input array.
 *
 * @param {Array} array - The array to shuffle.
 * @returns {Array} A new shuffled copy of the input array.
 */
export function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Fisher-Yates shuffle with an explicit PRNG — for deterministic sequences.
 * Does NOT mutate the input array.
 *
 * Use this whenever the shuffle result must be reproducible (e.g., quest generation,
 * spaced listening, sentence tiles) so that the same seed always produces the same order.
 *
 * NOTE: Array.sort(() => rng() - 0.5) is a common but broken pattern — it produces
 * a biased distribution because sort's comparison function is called more than N times
 * and the results are not transitive. Use this function instead.
 *
 * @param {function} rng   - A function returning floats in [0, 1). E.g. createSeededRng(seed).
 * @param {Array}    array - The array to shuffle.
 * @returns {Array} A new shuffled copy of the input array.
 */
export function shuffleDeterministic(rng, array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
