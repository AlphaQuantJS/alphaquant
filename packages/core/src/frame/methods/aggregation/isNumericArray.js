/**
 * Checks if an array contains only numeric values (ignoring null/undefined/NaN)
 *
 * @param {Array<any>} arr - Array to check
 * @returns {boolean} - true if array contains only numeric values
 */
export function isNumericArray(arr) {
  // If this is a Float64Array, then all values are numeric
  if (arr instanceof Float64Array) {
    return true;
  }

  // Check each value in the array
  for (let i = 0; i < arr.length; i++) {
    const val = arr[i];

    // Skip NaN, null, undefined
    if (val !== val || val === null || val === undefined) {
      continue;
    }

    // If value is not a number, return false
    if (typeof val !== 'number') {
      return false;
    }
  }

  // All values are numeric
  return true;
}
