/**
 * Array utility functions for tests
 */

/**
 * Converts any array (including typed arrays) to a regular JavaScript array
 * @param {any} arr - Array to convert
 * @returns {any[]} - Regular JavaScript array
 */
export function toArray(arr) {
  if (arr === null || arr === undefined) {
    return [];
  }
  return Array.from(arr);
}

/**
 * Checks equality of two arrays taking NaN values into account
 * @param {any[]} expected - Expected array
 * @param {any[]} actual - Actual array
 * @returns {boolean} - true if arrays are equal
 */
export function arraysEqual(expected, actual) {
  const expectedArray = toArray(expected);
  const actualArray = toArray(actual);

  if (expectedArray.length !== actualArray.length) {
    return false;
  }

  for (let i = 0; i < expectedArray.length; i++) {
    const expectedValue = expectedArray[i];
    const actualValue = actualArray[i];

    if (Number.isNaN(expectedValue)) {
      if (!Number.isNaN(actualValue)) {
        return false;
      }
    } else if (expectedValue !== actualValue) {
      return false;
    }
  }

  return true;
}

/**
 * Creates an array with sequential numbers
 * @param {number} start - Start value (inclusive)
 * @param {number} end - End value (exclusive)
 * @returns {number[]} - Array with sequential numbers
 */
export function range(start, end) {
  return Array.from({ length: end - start }, (_, i) => start + i);
}

/**
 * Creates a random array of specified length
 * @param {number} length - Length of the array
 * @param {number} [min=0] - Minimum value
 * @param {number} [max=100] - Maximum value
 * @returns {number[]} - Random array
 */
export function randomArray(length, min = 0, max = 100) {
  return Array.from(
    { length },
    () => Math.floor(Math.random() * (max - min + 1)) + min,
  );
}
