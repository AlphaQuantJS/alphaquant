/**
 * @fileoverview Optimized math utility functions using TypedArrays
 *
 * This module provides high-performance implementations of common
 * mathematical operations using TypedArrays to minimize memory usage
 * and maximize execution speed.
 */

/**
 * Finds minimum and maximum values in a numeric array in a single pass
 *
 * @param {number[]|Float64Array} values - Array of numeric values
 * @returns {{min: number, max: number}} - Object with min and max values
 * @throws {Error} - If array is empty
 */
export function findMinMax(values) {
  if (!values || values.length === 0) {
    throw new Error('Cannot find min/max of empty array');
  }

  let min = values[0];
  let max = values[0];

  // Single pass through the array
  for (let i = 1; i < values.length; i++) {
    const v = values[i];
    if (v < min) min = v;
    if (v > max) max = v;
  }

  return { min, max };
}

/**
 * Calculates mean and standard deviation in a single pass (optimized algorithm)
 * Uses Welford's online algorithm for numerical stability
 *
 * @param {number[]|Float64Array} values - Array of numeric values
 * @returns {{mean: number, std: number}} - Object with mean and standard deviation
 * @throws {Error} - If array is empty
 */
export function calculateMeanAndStd(values) {
  if (!values || values.length === 0) {
    throw new Error('Cannot calculate mean/std of empty array');
  }

  const n = values.length;
  let mean = 0;
  let M2 = 0;

  // Welford's online algorithm for mean and variance
  for (let i = 0; i < n; i++) {
    const x = values[i];
    const delta = x - mean;
    mean += delta / (i + 1);
    const delta2 = x - mean;
    M2 += delta * delta2;
  }

  // Calculate variance and std
  const variance = n > 1 ? M2 / n : 0;
  const std = Math.sqrt(variance);

  return { mean, std };
}

/**
 * Converts a regular array to Float64Array for optimized calculations
 *
 * @param {number[]|Float64Array} values - Regular array of numbers or Float64Array
 * @returns {Float64Array} - TypedArray for optimized calculations
 * @throws {Error} - If array contains non-numeric values
 */
export function toFloat64Array(values) {
  if (!values || values.length === 0) {
    return new Float64Array(0);
  }

  // If already a Float64Array, return as is
  if (values instanceof Float64Array) {
    return values;
  }

  // Create a new Float64Array with the same length
  const typedArray = new Float64Array(values.length);

  // Copy values, checking for non-numeric values
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (typeof v !== 'number' || Number.isNaN(v)) {
      throw new Error(`Array contains non-numeric value at index ${i}: ${v}`);
    }
    typedArray[i] = v;
  }

  return typedArray;
}

/**
 * Filters out NaN and null values from an array, returning a compact Float64Array
 *
 * @param {Array<number|null>|Float64Array} values - Array that may contain NaN/null values
 * @returns {Float64Array} - Compact array with only valid numeric values
 * @throws {Error} - If no valid values are found
 */
export function filterValidToTyped(values) {
  if (!values || values.length === 0) {
    throw new Error('Cannot filter empty array');
  }

  // First count valid values to allocate exact size
  let validCount = 0;
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (v !== null && typeof v === 'number' && !Number.isNaN(v)) {
      validCount++;
    }
  }

  if (validCount === 0) {
    throw new Error('Array contains no valid numeric values');
  }

  // Allocate typed array of exact size needed
  const result = new Float64Array(validCount);

  // Fill with valid values
  let index = 0;
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (v !== null && typeof v === 'number' && !Number.isNaN(v)) {
      result[index++] = v;
    }
  }

  return result;
}

/**
 * Calculates mean of a numeric array (optimized version)
 *
 * @param {number[]|Float64Array} values - Array of numeric values
 * @returns {number} - Mean value
 * @throws {Error} - If array is empty
 */
export function calculateMean(values) {
  if (!values || values.length === 0) {
    throw new Error('Cannot calculate mean of empty array');
  }

  const n = values.length;
  let sum = 0;

  // Optimized summation
  for (let i = 0; i < n; i++) {
    sum += values[i];
  }

  return sum / n;
}
