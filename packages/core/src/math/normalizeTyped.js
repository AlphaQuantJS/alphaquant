/**
 * @fileoverview Optimized normalization functions using TypedArrays
 *
 * This module provides a high-performance implementation of data normalization
 * using TypedArrays to minimize memory usage and maximize execution speed.
 */

import {
  findMinMax,
  toFloat64Array,
  filterValidToTyped,
} from './utilsTyped.js';

/**
 * Normalizes values to range [0,1] using optimized TypedArray implementation
 *
 * @param {number[]|Float64Array} values - Array of numeric values to normalize
 * @param {Object} [options] - Optional parameters
 * @param {number} [options.min] - Custom minimum value (if not provided, calculated from data)
 * @param {number} [options.max] - Custom maximum value (if not provided, calculated from data)
 * @returns {Float64Array} - Normalized values as TypedArray
 * @throws {Error} - If array is empty or all values are identical
 */
export function normalizeTyped(values, options = {}) {
  // Filter out invalid values and convert to TypedArray
  const typedValues =
    values instanceof Float64Array ? values : filterValidToTyped(values);

  if (typedValues.length === 0) {
    throw new Error('Cannot normalize empty array');
  }

  // Use provided min/max or calculate from data
  const { min: customMin, max: customMax } = options;
  const { min, max } =
    customMin !== undefined && customMax !== undefined
      ? { min: customMin, max: customMax }
      : findMinMax(typedValues);

  // Check for constant values
  if (min === max) {
    throw new Error('Cannot normalize array with constant values (min = max)');
  }

  // Allocate result array
  const result = new Float64Array(typedValues.length);

  // Calculate range once
  const range = max - min;

  // Normalize values in a single pass
  for (let i = 0; i < typedValues.length; i++) {
    result[i] = (typedValues[i] - min) / range;
  }

  return result;
}

/**
 * Normalizes values to custom range [newMin, newMax]
 *
 * @param {number[]|Float64Array} values - Array of numeric values to normalize
 * @param {number} newMin - Target minimum value
 * @param {number} newMax - Target maximum value
 * @param {Object} [options] - Optional parameters
 * @param {number} [options.min] - Custom source minimum value (if not provided, calculated from data)
 * @param {number} [options.max] - Custom source maximum value (if not provided, calculated from data)
 * @returns {Float64Array} - Normalized values as TypedArray
 * @throws {Error} - If array is empty or all values are identical
 */
export function normalizeRangeTyped(values, newMin, newMax, options = {}) {
  if (typeof newMin !== 'number' || typeof newMax !== 'number') {
    throw new Error('Target range (newMin, newMax) must be numeric values');
  }

  if (newMin >= newMax) {
    throw new Error('Target range must have newMin < newMax');
  }

  // Get normalized values in [0,1] range
  const normalizedValues = normalizeTyped(values, options);

  // Calculate new range
  const newRange = newMax - newMin;

  // Scale to new range
  const result = new Float64Array(normalizedValues.length);
  for (let i = 0; i < normalizedValues.length; i++) {
    result[i] = normalizedValues[i] * newRange + newMin;
  }

  return result;
}
