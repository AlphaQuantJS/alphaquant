/**
 * utils.js - Basic statistical utilities for TinyFrame
 *
 * This module provides optimized implementations of common
 * statistical functions used across the library.
 */

/**
 * Calculates mean of an array of numbers
 *
 * @param {number[]|Float64Array} values - Array of numeric values
 * @returns {number} - Mean value
 */
export function calculateMean(values) {
  if (!values || values.length === 0) {
    return NaN;
  }

  let sum = 0;
  let count = 0;

  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (value !== null && value !== undefined && !isNaN(value)) {
      sum += value;
      count++;
    }
  }

  return count > 0 ? sum / count : NaN;
}

/**
 * Calculates mean and standard deviation in a single pass (more efficient)
 * Uses Welford's online algorithm for numerical stability
 *
 * @param {number[]|Float64Array} values - Array of numeric values
 * @returns {{mean: number, std: number}} - Object with mean and standard deviation
 */
export function calculateMeanAndStd(values) {
  if (!values || values.length === 0) {
    return { mean: NaN, std: NaN };
  }

  let count = 0;
  let mean = 0;
  let M2 = 0;

  // One-pass algorithm for mean and variance
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (value !== null && value !== undefined && !isNaN(value)) {
      count++;
      const delta = value - mean;
      mean += delta / count;
      const delta2 = value - mean;
      M2 += delta * delta2;
    }
  }

  if (count < 1) {
    return { mean: NaN, std: NaN };
  }

  // Handle edge case where all values are the same
  const variance = count > 1 ? M2 / count : 0;
  return {
    mean,
    std: Math.sqrt(variance),
  };
}

/**
 * Filters out invalid values (null, undefined, NaN) and returns a typed array
 *
 * @param {any[]} values - Array of values to filter
 * @returns {Float64Array} - Typed array with valid numeric values
 */
export function filterValidToTyped(values) {
  if (!values || values.length === 0) {
    throw new Error('Input array is empty or undefined');
  }

  // First pass: count valid values
  let validCount = 0;
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (
      value !== null &&
      value !== undefined &&
      typeof value === 'number' &&
      !isNaN(value)
    ) {
      validCount++;
    }
  }

  if (validCount === 0) {
    throw new Error('No valid numeric values found in array');
  }

  // Second pass: fill typed array
  const result = new Float64Array(validCount);
  let idx = 0;
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (
      value !== null &&
      value !== undefined &&
      typeof value === 'number' &&
      !isNaN(value)
    ) {
      result[idx++] = value;
    }
  }

  return result;
}

/**
 * Formats a flat matrix into a 2D array
 *
 * @param {Float64Array} flatMatrix - Flat matrix (row-major order)
 * @param {number} size - Matrix dimension (size x size)
 * @returns {number[][]} - 2D array representation of the matrix
 */
export function formatMatrixAs2D(flatMatrix, size) {
  const result = new Array(size);

  for (let i = 0; i < size; i++) {
    result[i] = new Array(size);
    for (let j = 0; j < size; j++) {
      result[i][j] = flatMatrix[i * size + j];
    }
  }

  return result;
}
