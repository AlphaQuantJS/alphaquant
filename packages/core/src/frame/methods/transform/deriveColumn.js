/**
 * deriveColumn.js - Function for creating a new column based on multiple input columns
 *
 * This module provides an optimized implementation for deriving
 * a new column from multiple input columns with minimal memory overhead.
 */

import { validateColumn } from '../../createFrame.js';

/**
 * @typedef {import('../../createFrame.js').TinyFrame} TinyFrame
 * @typedef {Record<string, any[]|Float64Array>} ColumnData
 * @typedef {Record<string, any>} RowValues
 */

/**
 * Apply a transformation function that depends on multiple columns
 *
 * @param {TinyFrame} frame - Input TinyFrame
 * @param {string[]} inputColumns - Input columns
 * @param {string} outputColumn - Output column name
 * @param {Function} transformFn - Function to apply (receives values from all input columns)
 * @returns {TinyFrame} - TinyFrame with new column
 */
export function deriveColumn(frame, inputColumns, outputColumn, transformFn) {
  // Validate input
  if (!frame || !frame.columns || typeof frame.rowCount !== 'number') {
    throw new Error('Invalid TinyFrame');
  }

  if (!Array.isArray(inputColumns) || inputColumns.length === 0) {
    throw new Error('inputColumns must be a non-empty array');
  }

  if (!outputColumn || typeof outputColumn !== 'string') {
    throw new Error('outputColumn must be a non-empty string');
  }

  if (typeof transformFn !== 'function') {
    throw new Error('transformFn must be a function');
  }

  // Validate all input columns exist
  for (const col of inputColumns) {
    validateColumn(frame, col);
  }

  // Create new frame with derived column
  /** @type {ColumnData} */
  const newColumns = { ...frame.columns };

  // Create new array for derived values
  const derivedValues = new Array(frame.rowCount);

  // Apply transformation
  for (let i = 0; i < frame.rowCount; i++) {
    // Get values from all input columns for this row
    /** @type {RowValues} */
    const rowValues = {};
    for (const col of inputColumns) {
      rowValues[col] = frame.columns[col][i];
    }

    // Apply transformation
    derivedValues[i] = transformFn(rowValues, i);
  }

  // Add derived column
  newColumns[outputColumn] = derivedValues;

  return {
    columns: newColumns,
    rowCount: frame.rowCount,
  };
}
