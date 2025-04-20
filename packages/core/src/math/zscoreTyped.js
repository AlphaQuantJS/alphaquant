/**
 * @fileoverview Optimized Z-score standardization using TypedArrays
 *
 * This module provides a high-performance implementation of Z-score standardization
 * using TypedArrays to minimize memory usage and maximize execution speed.
 */

import {
  calculateMeanAndStd,
  toFloat64Array,
  filterValidToTyped,
} from './utilsTyped.js';

/**
 * Performs Z-score standardization using optimized TypedArray implementation
 * Z-score transforms values to have mean=0 and standard deviation=1
 *
 * @param {number[]|Float64Array} values - Array of numeric values to standardize
 * @param {Object} [options] - Optional parameters
 * @param {number} [options.mean] - Custom mean value (if not provided, calculated from data)
 * @param {number} [options.std] - Custom standard deviation (if not provided, calculated from data)
 * @returns {Float64Array} - Z-score standardized values as TypedArray
 * @throws {Error} - If array is empty or has zero standard deviation
 */
export function zscoreTyped(values, options = {}) {
  // Filter out invalid values and convert to TypedArray
  const typedValues =
    values instanceof Float64Array ? values : filterValidToTyped(values);

  if (typedValues.length === 0) {
    throw new Error('Cannot calculate z-score of empty array');
  }

  // Use provided mean/std or calculate from data
  const { mean: customMean, std: customStd } = options;
  const { mean, std } =
    customMean !== undefined && customStd !== undefined
      ? { mean: customMean, std: customStd }
      : calculateMeanAndStd(typedValues);

  // Check for zero standard deviation
  if (std === 0) {
    throw new Error('Cannot calculate z-score when standard deviation is zero');
  }

  // Allocate result array
  const result = new Float64Array(typedValues.length);

  // Calculate z-scores in a single pass
  for (let i = 0; i < typedValues.length; i++) {
    result[i] = (typedValues[i] - mean) / std;
  }

  return result;
}

/**
 * Performs robust Z-score standardization using median and MAD
 * More resistant to outliers than traditional z-score
 *
 * @param {number[]|Float64Array} values - Array of numeric values to standardize
 * @returns {Float64Array} - Robust Z-score standardized values as TypedArray
 * @throws {Error} - If array is empty or has zero MAD
 */
export function robustZscoreTyped(values) {
  // Filter out invalid values and convert to TypedArray
  const typedValues =
    values instanceof Float64Array ? values : filterValidToTyped(values);

  if (typedValues.length === 0) {
    throw new Error('Cannot calculate robust z-score of empty array');
  }

  // Create a copy for sorting (to find median)
  const sortedValues = new Float64Array(typedValues);
  sortedValues.sort();

  // Calculate median
  const mid = Math.floor(sortedValues.length / 2);
  const median =
    sortedValues.length % 2 === 0
      ? (sortedValues[mid - 1] + sortedValues[mid]) / 2
      : sortedValues[mid];

  // Calculate absolute deviations from median
  const deviations = new Float64Array(typedValues.length);
  for (let i = 0; i < typedValues.length; i++) {
    deviations[i] = Math.abs(typedValues[i] - median);
  }

  // Sort deviations to find MAD
  deviations.sort();
  const mad =
    deviations.length % 2 === 0
      ? (deviations[mid - 1] + deviations[mid]) / 2
      : deviations[mid];

  // Check for zero MAD
  if (mad === 0) {
    throw new Error('Cannot calculate robust z-score when MAD is zero');
  }

  // Constant factor to make MAD comparable to standard deviation
  // for normal distribution
  const madScale = 1.4826;

  // Calculate robust z-scores
  const result = new Float64Array(typedValues.length);
  for (let i = 0; i < typedValues.length; i++) {
    result[i] = (typedValues[i] - median) / (mad * madScale);
  }

  return result;
}
