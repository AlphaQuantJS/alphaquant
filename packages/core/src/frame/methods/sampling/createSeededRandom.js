/**
 * createSeededRandom.js - Creates a random number generator with a specified seed
 */

/**
 * Creates a random number generator with a specified seed
 *
 * @param {number|string|boolean|undefined} [seed] - Seed for the generator, if not provided or invalid, a random seed will be used
 * @returns {function(): number} - Function returning a random number between 0 and 1
 */
export function createSeededRandom(seed) {
  // Convert seed to a valid number if it's not
  let initialSeed;

  if (seed === undefined) {
    // If seed is not provided, use current timestamp
    initialSeed = Date.now();
  } else if (typeof seed !== 'number' || isNaN(seed)) {
    // If seed is not a number, convert it to a number using a simple hash
    if (typeof seed === 'string') {
      // Simple string hash
      initialSeed = seed.split('').reduce((acc, char) => {
        return (acc << 5) - acc + char.charCodeAt(0);
      }, 0);
    } else if (typeof seed === 'boolean') {
      initialSeed = seed ? 1 : 0;
    } else {
      // For other types, use a default seed
      initialSeed = 42;
    }
  } else {
    // Use the provided seed as is
    initialSeed = seed;
  }

  // Ensure the seed is a positive integer
  initialSeed = Math.abs(Math.floor(initialSeed)) || 1; // Fallback to 1 if we get 0

  // Simple implementation of linear congruential generator
  let state = initialSeed;

  return function () {
    // Parameters from POSIX standard
    state = (state * 1103515245 + 12345) % 2147483647;
    return state / 2147483647;
  };
}
