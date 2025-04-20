/**
 * @fileoverview Optimized correlation matrix calculation using TypedArrays
 *
 * This module provides a high-performance implementation of correlation matrix
 * calculations using TypedArrays to minimize memory usage and maximize execution speed.
 */

import {
  calculateMeanAndStd,
  toFloat64Array,
  filterValidToTyped,
} from './utilsTyped.js';

/**
 * Calculates covariance between two arrays in a single pass
 *
 * @param {Float64Array} x - First array of values
 * @param {Float64Array} y - Second array of values
 * @param {number} [meanX] - Pre-calculated mean of x (optional)
 * @param {number} [meanY] - Pre-calculated mean of y (optional)
 * @returns {number} - Covariance between x and y
 * @throws {Error} - If arrays have different lengths or are empty
 */
export function covarianceTyped(x, y, meanX, meanY) {
  if (x.length !== y.length) {
    throw new Error('Arrays must have the same length');
  }

  if (x.length === 0) {
    throw new Error('Cannot calculate covariance of empty arrays');
  }

  // Calculate means if not provided
  const xMean = meanX !== undefined ? meanX : calculateMeanAndStd(x).mean;
  const yMean = meanY !== undefined ? meanY : calculateMeanAndStd(y).mean;

  let sum = 0;
  const n = x.length;

  // Calculate covariance in a single pass
  for (let i = 0; i < n; i++) {
    sum += (x[i] - xMean) * (y[i] - yMean);
  }

  return sum / n;
}

/**
 * Calculates Pearson correlation coefficient between two arrays
 *
 * @param {Float64Array} x - First array of values
 * @param {Float64Array} y - Second array of values
 * @returns {number} - Correlation coefficient (-1 to 1)
 * @throws {Error} - If arrays have different lengths or constant values
 */
export function correlationTyped(x, y) {
  if (x.length !== y.length) {
    throw new Error('Arrays must have the same length');
  }

  if (x.length === 0) {
    throw new Error('Cannot calculate correlation of empty arrays');
  }

  // Calculate statistics for both arrays
  const statsX = calculateMeanAndStd(x);
  const statsY = calculateMeanAndStd(y);

  // Check for constant values
  if (statsX.std === 0 || statsY.std === 0) {
    throw new Error(
      'Cannot calculate correlation when one or both arrays have constant values',
    );
  }

  // Calculate covariance
  const cov = covarianceTyped(x, y, statsX.mean, statsY.mean);

  // Calculate correlation coefficient
  return cov / (statsX.std * statsY.std);
}

/**
 * Calculates correlation matrix for multiple arrays
 *
 * @param {Array<Float64Array|number[]>} arrays - Array of TypedArrays or regular arrays
 * @param {string[]} [labels] - Optional labels for each array
 * @returns {{matrix: Float64Array, labels: string[]}} - Correlation matrix and labels
 * @throws {Error} - If arrays have different lengths or are empty
 */
export function corrMatrixTyped(arrays, labels = []) {
  if (!arrays || !Array.isArray(arrays) || arrays.length === 0) {
    throw new Error('Input must be a non-empty array of arrays');
  }

  const numArrays = arrays.length;

  // Validate arrays and convert to Float64Array if needed
  const typedArrays = new Array(numArrays);
  const means = new Float64Array(numArrays);
  const stds = new Float64Array(numArrays);

  // Ensure all arrays have the same length
  const firstLength = arrays[0].length;

  for (let i = 0; i < numArrays; i++) {
    // Convert to Float64Array if needed
    typedArrays[i] =
      arrays[i] instanceof Float64Array ? arrays[i] : toFloat64Array(arrays[i]);

    if (typedArrays[i].length !== firstLength) {
      throw new Error(
        `All arrays must have the same length. Array ${i} has length ${typedArrays[i].length}, expected ${firstLength}`,
      );
    }

    // Pre-calculate statistics
    const stats = calculateMeanAndStd(typedArrays[i]);
    means[i] = stats.mean;
    stds[i] = stats.std;

    // Check for constant values
    if (stds[i] === 0) {
      throw new Error(
        `Array ${i} has constant values, correlation not possible`,
      );
    }
  }

  // Create labels if not provided
  const resultLabels =
    labels.length === numArrays
      ? labels
      : Array.from({ length: numArrays }, (_, i) => `Series_${i}`);

  // Allocate correlation matrix
  const matrix = new Float64Array(numArrays * numArrays);

  // Calculate correlation matrix (symmetric)
  for (let i = 0; i < numArrays; i++) {
    // Diagonal is always 1
    matrix[i * numArrays + i] = 1;

    for (let j = i + 1; j < numArrays; j++) {
      // Calculate covariance
      const cov = covarianceTyped(
        typedArrays[i],
        typedArrays[j],
        means[i],
        means[j],
      );

      // Calculate correlation
      const corr = cov / (stds[i] * stds[j]);

      // Set both symmetric positions
      matrix[i * numArrays + j] = corr;
      matrix[j * numArrays + i] = corr;
    }
  }

  return { matrix, labels: resultLabels };
}

/**
 * Formats correlation matrix as a 2D array for easier consumption
 *
 * @param {Float64Array} matrix - Flat correlation matrix
 * @param {number} size - Size of the matrix (number of rows/columns)
 * @returns {number[][]} - 2D array representation of the matrix
 */
export function formatMatrixAs2D(matrix, size) {
  const result = new Array(size);

  for (let i = 0; i < size; i++) {
    result[i] = new Array(size);
    for (let j = 0; j < size; j++) {
      result[i][j] = matrix[i * size + j];
    }
  }

  return result;
}
