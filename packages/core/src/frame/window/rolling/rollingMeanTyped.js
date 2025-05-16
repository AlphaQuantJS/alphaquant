/**
 * rollingMeanTyped.js - Calculation of rolling mean for typed arrays
 */

import { calculateRollingMeanDirect } from './calculateRollingMeanDirect.js';
import { calculateRollingMeanSliding } from './calculateRollingMeanSliding.js';
import { calculateRollingMeanPrefixSum } from './calculateRollingMeanPrefixSum.js';

/**
 * Calculates rolling mean for typed arrays
 *
 * @param {number[]|Float64Array} values - Array of values
 * @param {number} windowSize - Size of rolling window
 * @param {Float64Array} [result] - Optional pre-allocated result array
 * @returns {Float64Array} - Array of rolling means
 */
export function rollingMeanTyped(values, windowSize, result) {
  const n = values.length;

  // Create result array if not provided
  if (!result) {
    result = new Float64Array(n);
  }

  // Choose optimal algorithm based on window size
  if (windowSize <= 16) {
    // For small windows, direct calculation is faster
    return calculateRollingMeanDirect(values, windowSize, result);
  } else if (windowSize <= 128) {
    // For medium windows, use sliding algorithm
    return calculateRollingMeanSliding(values, windowSize, result);
  } else {
    // For large windows, use prefix sum algorithm
    return calculateRollingMeanPrefixSum(values, windowSize, result);
  }
}
