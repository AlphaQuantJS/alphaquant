/**
 * @fileoverview Optimized rolling mean calculations using TypedArrays
 *
 * This module provides high-performance implementations of rolling window
 * calculations using TypedArrays to minimize memory usage and maximize execution speed.
 */

import { filterValidToTyped } from './utilsTyped.js';

/**
 * Calculates rolling mean (moving average) using optimized TypedArray implementation
 *
 * @param {number[]|Float64Array} values - Array of numeric values
 * @param {number} windowSize - Size of the rolling window
 * @returns {Float64Array} - Array of rolling means (same length as input)
 * @throws {Error} - If windowSize is invalid or array is too short
 */
export function rollingMeanTyped(values, windowSize) {
  // Validate inputs
  if (!Number.isInteger(windowSize) || windowSize <= 0) {
    throw new Error('Window size must be a positive integer');
  }

  // Filter out invalid values and convert to TypedArray
  const typedValues =
    values instanceof Float64Array ? values : filterValidToTyped(values);

  if (typedValues.length < windowSize) {
    throw new Error(
      `Input array length (${typedValues.length}) must be at least window size (${windowSize})`,
    );
  }

  const n = typedValues.length;
  const result = new Float64Array(n);

  // Calculate first window sum
  let sum = 0;
  for (let i = 0; i < windowSize; i++) {
    sum += typedValues[i];
  }

  // Set first result
  result[windowSize - 1] = sum / windowSize;

  // Use sliding window for remaining calculations
  // This is O(n) instead of O(n*windowSize)
  for (let i = windowSize; i < n; i++) {
    // Add new value and remove oldest value
    sum = sum + typedValues[i] - typedValues[i - windowSize];
    result[i] = sum / windowSize;
  }

  // Fill initial positions with NaN
  for (let i = 0; i < windowSize - 1; i++) {
    result[i] = NaN;
  }

  return result;
}

/**
 * Calculates rolling mean with handling for NaN/null values
 *
 * @param {Array<number|null>} values - Array that may contain NaN/null values
 * @param {number} windowSize - Size of the rolling window
 * @param {Object} [options] - Optional parameters
 * @param {number} [options.minObservations=1] - Minimum valid observations required in window
 * @returns {Float64Array} - Array of rolling means (same length as input)
 * @throws {Error} - If windowSize is invalid
 */
export function rollingMeanRobustTyped(values, windowSize, options = {}) {
  // Validate inputs
  if (!Number.isInteger(windowSize) || windowSize <= 0) {
    throw new Error('Window size must be a positive integer');
  }

  const { minObservations = 1 } = options;

  if (
    !Number.isInteger(minObservations) ||
    minObservations <= 0 ||
    minObservations > windowSize
  ) {
    throw new Error(
      `minObservations must be a positive integer not exceeding windowSize (${windowSize})`,
    );
  }

  if (!values || values.length === 0) {
    return new Float64Array(0);
  }

  const n = values.length;
  const result = new Float64Array(n);
  result.fill(NaN); // Initialize all with NaN

  // For each position, calculate mean of valid values in window
  for (let i = windowSize - 1; i < n; i++) {
    let sum = 0;
    let validCount = 0;

    // Process window
    for (let j = 0; j < windowSize; j++) {
      const value = values[i - windowSize + 1 + j];
      if (value !== null && typeof value === 'number' && !Number.isNaN(value)) {
        sum += value;
        validCount++;
      }
    }

    // Only set result if we have enough observations
    if (validCount >= minObservations) {
      result[i] = sum / validCount;
    }
  }

  return result;
}

/**
 * Calculates exponential weighted moving average (EWMA)
 *
 * @param {number[]|Float64Array} values - Array of numeric values
 * @param {number} alpha - Smoothing factor (0 < alpha <= 1)
 * @returns {Float64Array} - Array of EWMA values (same length as input)
 * @throws {Error} - If alpha is invalid or array is empty
 */
export function ewmaTyped(values, alpha) {
  // Validate inputs
  if (typeof alpha !== 'number' || alpha <= 0 || alpha > 1) {
    throw new Error(
      'Alpha must be a number between 0 (exclusive) and 1 (inclusive)',
    );
  }

  // Filter out invalid values and convert to TypedArray
  const typedValues =
    values instanceof Float64Array ? values : filterValidToTyped(values);

  if (typedValues.length === 0) {
    throw new Error('Cannot calculate EWMA of empty array');
  }

  const n = typedValues.length;
  const result = new Float64Array(n);

  // Initialize with first value
  result[0] = typedValues[0];

  // Calculate EWMA recursively
  for (let i = 1; i < n; i++) {
    result[i] = alpha * typedValues[i] + (1 - alpha) * result[i - 1];
  }

  return result;
}
