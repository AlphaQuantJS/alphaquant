/**
 * sample.js - Creates a random sample of rows from TinyFrame
 */

/**
 * @typedef {import('../../createFrame.js').TinyFrame} TinyFrame
 * @typedef {Record<string, Array<any> | Float64Array>} ColumnData
 */

import { createSeededRandom } from './createSeededRandom.js';

/**
 * Creates a random sample of rows from TinyFrame
 *
 * @param {TinyFrame} frame - Input TinyFrame
 * @param {number|number[]} n - Number of rows to sample or array of indices
 * @param {boolean} [replace=false] - Sampling with replacement (can select the same row multiple times)
 * @param {number} [seed] - Seed for random number generator (for reproducibility)
 * @returns {TinyFrame} - TinyFrame with selected rows
 */
export function sample(frame, n, replace = false, seed) {
  // Check input data
  if (!frame || !frame.columns || typeof frame.rowCount !== 'number') {
    throw new Error('Invalid TinyFrame');
  }

  // If frame is empty, return copy
  if (frame.rowCount === 0) {
    return {
      columns: { ...frame.columns },
      rowCount: 0,
    };
  }

  // Get indices for sampling
  let indices;

  if (Array.isArray(n)) {
    // If n is an array of indices, use it directly
    indices = n;

    // Check that all indices are valid
    for (const idx of indices) {
      if (idx < 0 || idx >= frame.rowCount) {
        throw new Error(
          `Index ${idx} is out of range (0-${frame.rowCount - 1})`,
        );
      }
    }
  } else {
    // If n is a number, generate random indices
    if (typeof n !== 'number' || n <= 0) {
      throw new Error('Number of rows to sample must be a positive number');
    }

    // If n is greater than the number of rows and no replacement, this is impossible
    if (n > frame.rowCount && !replace) {
      throw new Error(
        `Cannot select ${n} unique rows from a frame with ${frame.rowCount} rows`,
      );
    }

    // Initialize random number generator with seed (if specified)
    const random = seed !== undefined ? createSeededRandom(seed) : Math.random;

    if (replace) {
      // Sampling with replacement
      indices = new Array(n);
      for (let i = 0; i < n; i++) {
        indices[i] = Math.floor(random() * frame.rowCount);
      }
    } else {
      // Sampling without replacement (using Fisher-Yates algorithm)
      // Create array of all indices
      const allIndices = new Array(frame.rowCount);
      for (let i = 0; i < frame.rowCount; i++) {
        allIndices[i] = i;
      }

      // Shuffle indices
      for (let i = frame.rowCount - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [allIndices[i], allIndices[j]] = [allIndices[j], allIndices[i]];
      }

      // Take first n indices
      indices = allIndices.slice(0, n);
    }
  }

  // Create new columns with selected rows
  /** @type {ColumnData} */
  const newColumns = {};
  const columnNames = Object.keys(frame.columns);

  for (const colName of columnNames) {
    const oldValues = frame.columns[colName];
    const isTyped = oldValues instanceof Float64Array;

    // Create new array for column
    const newValues = isTyped
      ? new Float64Array(indices.length)
      : new Array(indices.length);

    // Fill with selected values
    for (let i = 0; i < indices.length; i++) {
      newValues[i] = oldValues[indices[i]];
    }

    newColumns[colName] = newValues;
  }

  return {
    columns: newColumns,
    rowCount: indices.length,
  };
}
