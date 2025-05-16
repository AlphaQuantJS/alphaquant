/**
 * corr.js - Correlation matrix calculation for TinyFrame
 *
 * This module provides optimized implementation for computing
 * correlation matrices with minimal memory overhead.
 */

import { createFrame } from '../createFrame.js';
import { filterValidToTyped, formatMatrixAs2D } from './utils.js';

/**
 * @typedef {import('../createFrame.js').TinyFrame} TinyFrame
 */

/**
 * Computes correlation matrix for numeric columns
 *
 * @param {TinyFrame} frame - Input TinyFrame
 * @returns {TinyFrame} - Correlation matrix as TinyFrame
 */
export function corrMatrix(frame) {
  if (!frame || !frame.columns || typeof frame.rowCount !== 'number') {
    throw new Error('Invalid TinyFrame');
  }

  try {
    // Get numeric columns
    const numericCols = getNumericColumns(frame);

    if (numericCols.length === 0) {
      throw new Error('No numeric columns found in frame');
    }

    // Extract data for each column
    const arrays = numericCols.map((col) => {
      const values = frame.columns[col];
      return values instanceof Float64Array
        ? values
        : filterValidToTyped(values);
    });

    // Calculate correlation matrix
    const { matrix, labels } = corrMatrixTyped(arrays, numericCols);

    // Format as TinyFrame
    const matrixArray = formatMatrixAs2D(matrix, numericCols.length);

    // Create result columns
    /** @type {Record<string, any[] | Float64Array>} */
    const resultColumns = {};

    // Add index column (optional)
    resultColumns['_index'] = numericCols;

    // Add correlation columns
    for (let i = 0; i < numericCols.length; i++) {
      resultColumns[numericCols[i]] = new Float64Array(numericCols.length);

      for (let j = 0; j < numericCols.length; j++) {
        resultColumns[numericCols[i]][j] = matrixArray[j][i];
      }
    }

    // Use createFrame directly with column data and row count
    return createFrame(resultColumns, numericCols.length);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to compute correlation matrix: ${errorMessage}`);
  }
}

/**
 * Calculates correlation matrix for array of typed arrays
 *
 * @param {Float64Array[]} arrays - Array of typed arrays
 * @param {string[]} labels - Column labels
 * @returns {{matrix: Float64Array, labels: string[]}} - Correlation matrix and labels
 */
export function corrMatrixTyped(arrays, labels) {
  if (!arrays || !Array.isArray(arrays) || arrays.length === 0) {
    throw new Error('Input arrays are empty or invalid');
  }

  const n = arrays.length;
  const matrix = new Float64Array(n * n);
  const rowCount = arrays[0].length;

  // Create valid value mask for each column
  const validMasks = new Array(n);
  for (let i = 0; i < n; i++) {
    validMasks[i] = new Uint8Array(rowCount);
  }

  // Calculate means and fill valid value masks in one pass
  const means = new Float64Array(n);
  const counts = new Uint32Array(n);
  const stdDevs = new Float64Array(n);

  // Step 1: Calculate means and fill valid value masks
  for (let i = 0; i < n; i++) {
    const arr = arrays[i];
    const mask = validMasks[i];
    let sum = 0;
    let count = 0;

    for (let j = 0; j < arr.length; j++) {
      const val = arr[j];
      if (val !== null && val !== undefined && !isNaN(val)) {
        sum += val;
        count++;
        mask[j] = 1; // Mark as valid value
      } else {
        mask[j] = 0; // Mark as invalid value
      }
    }

    means[i] = count > 0 ? sum / count : 0;
    counts[i] = count;
  }

  // Step 2: Calculate standard deviations
  for (let i = 0; i < n; i++) {
    const arr = arrays[i];
    const mask = validMasks[i];
    const mean = means[i];
    let sumSquaredDiff = 0;

    for (let j = 0; j < arr.length; j++) {
      if (mask[j] === 1) {
        const diff = arr[j] - mean;
        sumSquaredDiff += diff * diff;
      }
    }

    stdDevs[i] = counts[i] > 0 ? Math.sqrt(sumSquaredDiff / counts[i]) : 0;

    // Check for zero standard deviation
    if (stdDevs[i] === 0) {
      throw new Error(
        'Cannot compute correlation: standard deviation is zero for one or more columns',
      );
    }
  }

  // Step 3: Calculate correlations in blocks for better vectorization
  const BLOCK_SIZE = 8; // Optimal block size for SSE-friendly calculations

  for (let i = 0; i < n; i++) {
    // Diagonal elements are always 1
    matrix[i * n + i] = 1;

    for (let j = i + 1; j < n; j++) {
      const arrI = arrays[i];
      const arrJ = arrays[j];
      const maskI = validMasks[i];
      const maskJ = validMasks[j];
      const meanI = means[i];
      const meanJ = means[j];

      let covar = 0;
      let validPairs = 0;

      // Process data blocks for better vectorization
      const blockCount = Math.floor(rowCount / BLOCK_SIZE);

      // Process full blocks
      for (let block = 0; block < blockCount; block++) {
        const startIdx = block * BLOCK_SIZE;
        let blockCovar = 0;
        let blockValidPairs = 0;

        for (let k = 0; k < BLOCK_SIZE; k++) {
          const idx = startIdx + k;
          if (maskI[idx] === 1 && maskJ[idx] === 1) {
            blockCovar += (arrI[idx] - meanI) * (arrJ[idx] - meanJ);
            blockValidPairs++;
          }
        }

        covar += blockCovar;
        validPairs += blockValidPairs;
      }

      // Process remaining elements
      const remainingStart = blockCount * BLOCK_SIZE;
      for (let k = remainingStart; k < rowCount; k++) {
        if (maskI[k] === 1 && maskJ[k] === 1) {
          covar += (arrI[k] - meanI) * (arrJ[k] - meanJ);
          validPairs++;
        }
      }

      // Calculate correlation
      const correlation =
        validPairs > 0 ? covar / (validPairs * stdDevs[i] * stdDevs[j]) : 0;

      // Fill matrix (it is symmetric)
      matrix[i * n + j] = correlation;
      matrix[j * n + i] = correlation;
    }
  }

  return { matrix, labels: labels || [] };
}

/**
 * Gets numeric columns from a TinyFrame
 *
 * @param {TinyFrame} frame - TinyFrame to analyze
 * @returns {string[]} - Array of numeric column names
 */
function getNumericColumns(frame) {
  if (frame.rowCount === 0) {
    throw new Error('Frame is empty');
  }

  const columnNames = Object.keys(frame.columns);
  const numericColumns = [];

  // Check each column
  for (const col of columnNames) {
    const values = frame.columns[col];

    // TypedArray is always numeric
    if (values instanceof Float64Array) {
      numericColumns.push(col);
      continue;
    }

    // For regular arrays, check if they contain numeric values
    if (Array.isArray(values)) {
      // Sample up to 10 values
      const sampleSize = Math.min(10, values.length);
      let hasNumeric = false;

      for (let i = 0; i < sampleSize; i++) {
        const val = values[i];
        if (typeof val === 'number' && !isNaN(val)) {
          hasNumeric = true;
          break;
        }
      }

      if (hasNumeric) {
        numericColumns.push(col);
      }
    }
  }

  if (numericColumns.length === 0) {
    throw new Error('No numeric columns found in frame');
  }

  return numericColumns;
}
