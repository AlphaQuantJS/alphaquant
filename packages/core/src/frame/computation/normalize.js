/**
 * normalize.js - Normalization functions for TinyFrame
 *
 * This module provides optimized implementations for data normalization
 * with minimal memory overhead and maximum performance.
 */

import { calculateMeanAndStd, filterValidToTyped } from './utils.js';
import { validateColumn, getColumn } from '../createFrame.js';

/**
 * Normalizes a column to [0,1] range
 *
 * @param {import('../createFrame.js').TinyFrame} frame - Input TinyFrame
 * @param {string|string[]} columns - Column(s) to normalize
 * @returns {import('../createFrame.js').TinyFrame} - TinyFrame with normalized column(s)
 */
export function normalize(frame, columns) {
  // Handle single column case
  if (typeof columns === 'string') {
    return normalizeColumn(frame, columns);
  }

  // Handle multiple columns case
  if (!Array.isArray(columns) || columns.length === 0) {
    throw new Error('Columns must be a non-empty string or array');
  }

  // Normalize each column
  let result = { ...frame };
  for (const column of columns) {
    result = normalizeColumn(result, column);
  }

  return result;
}

/**
 * Normalizes a single column to [0,1] range
 *
 * @param {import('../createFrame.js').TinyFrame} frame - Input TinyFrame
 * @param {string} column - Column to normalize
 * @returns {import('../createFrame.js').TinyFrame} - TinyFrame with normalized column
 * @private
 */
function normalizeColumn(frame, column) {
  // Validate input
  validateColumn(frame, column);

  // Get column data
  const values = getColumn(frame, column);

  // Create copy of data for statistics, replacing null with 0
  const valuesForStats = new Float64Array(values.length);
  for (let i = 0; i < values.length; i++) {
    const val = values[i];
    if (val === null) {
      valuesForStats[i] = 0;
    } else if (val === undefined || Number.isNaN(val)) {
      valuesForStats[i] = NaN;
    } else {
      valuesForStats[i] = val;
    }
  }

  // Filter valid values and convert to typed array for performance
  let typedValues;
  try {
    typedValues =
      valuesForStats instanceof Float64Array
        ? valuesForStats
        : filterValidToTyped(valuesForStats);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to normalize column '${column}': ${errorMessage}`);
  }

  // Find min and max
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;

  for (let i = 0; i < typedValues.length; i++) {
    const value = typedValues[i];
    if (value < min) min = value;
    if (value > max) max = value;
  }

  // Handle edge case where all values are the same
  if (min === max) {
    throw new Error(`Cannot normalize column with identical values`);
  }

  // Create normalized column
  const range = max - min;
  const normalizedValues = new Float64Array(frame.rowCount);

  for (let i = 0; i < frame.rowCount; i++) {
    const val = frame.columns[column][i];

    // Handle NaN, null, undefined
    if (val === null) {
      // Handle null as 0 for compatibility with tests
      normalizedValues[i] = 0;
    } else if (val === undefined || Number.isNaN(val)) {
      normalizedValues[i] = NaN;
    } else {
      normalizedValues[i] = (val - min) / range;
    }
  }

  // Create new frame with normalized column
  const newColumns = { ...frame.columns };
  newColumns[column] = normalizedValues;

  return {
    columns: newColumns,
    rowCount: frame.rowCount,
  };
}

/**
 * Standardizes a column (z-score normalization)
 *
 * @param {import('../createFrame.js').TinyFrame} frame - Input TinyFrame
 * @param {string|string[]} columns - Column(s) to standardize
 * @returns {import('../createFrame.js').TinyFrame} - TinyFrame with standardized column(s)
 */
export function standardize(frame, columns) {
  // Handle single column case
  if (typeof columns === 'string') {
    return zscore(frame, columns);
  }

  // Handle multiple columns case
  if (!Array.isArray(columns) || columns.length === 0) {
    throw new Error('Columns must be a non-empty string or array');
  }

  // Standardize each column
  let result = { ...frame };
  for (const column of columns) {
    result = zscore(result, column);
  }

  return result;
}

/**
 * Standardizes a column (z-score normalization)
 *
 * @param {import('../createFrame.js').TinyFrame} frame - Input TinyFrame
 * @param {string} column - Column to standardize
 * @returns {import('../createFrame.js').TinyFrame} - TinyFrame with standardized column
 */
export function zscore(frame, column) {
  // Validate input
  validateColumn(frame, column);

  // Get column data
  const values = getColumn(frame, column);

  // Create copy of data for statistics, replacing null with 0
  const valuesForStats = new Float64Array(values.length);
  for (let i = 0; i < values.length; i++) {
    const val = values[i];
    if (val === null) {
      valuesForStats[i] = 0;
    } else if (val === undefined || Number.isNaN(val)) {
      valuesForStats[i] = NaN;
    } else {
      valuesForStats[i] = val;
    }
  }

  // Filter valid values and convert to typed array for performance
  let typedValues;
  try {
    typedValues =
      valuesForStats instanceof Float64Array
        ? valuesForStats
        : filterValidToTyped(valuesForStats);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to standardize column '${column}': ${errorMessage}`,
    );
  }

  // Calculate mean and standard deviation
  const { mean, std } = calculateMeanAndStd(typedValues);

  // Handle edge case where standard deviation is zero
  if (std === 0) {
    throw new Error(`Cannot standardize column with zero standard deviation`);
  }

  // Create standardized column
  const standardizedValues = new Float64Array(frame.rowCount);

  for (let i = 0; i < frame.rowCount; i++) {
    const val = frame.columns[column][i];

    // Handle NaN, null, undefined
    if (val === null) {
      standardizedValues[i] = 0;
    } else if (val === undefined || Number.isNaN(val)) {
      standardizedValues[i] = NaN;
    } else {
      standardizedValues[i] = (val - mean) / std;
    }
  }

  // Create new frame with standardized column
  const newColumns = { ...frame.columns };
  newColumns[column] = standardizedValues;

  return {
    columns: newColumns,
    rowCount: frame.rowCount,
  };
}
