/**
 * getUniqueValues.js - Returns unique values from array
 */

/**
 * Returns unique values from array
 *
 * @param {Array<any> | Float64Array} array - Input array
 * @returns {any[]} - Array of unique values
 */
export function getUniqueValues(array) {
  // Use Set to get unique values
  if (array instanceof Float64Array) {
    // For Float64Array, we need to convert to regular array first
    const uniqueSet = new Set();
    for (let i = 0; i < array.length; i++) {
      const value = array[i];
      if (value === value) {
        // Check for NaN
        uniqueSet.add(value);
      }
    }
    return Array.from(uniqueSet);
  } else {
    // For regular arrays, we can use Set directly
    const uniqueSet = new Set();
    for (let i = 0; i < array.length; i++) {
      uniqueSet.add(array[i]);
    }
    return Array.from(uniqueSet);
  }
}
