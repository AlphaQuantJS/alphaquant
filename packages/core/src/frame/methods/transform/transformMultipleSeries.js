/**
 * transformMultipleSeries.js - Function for transforming multiple columns
 *
 * This module provides an optimized implementation for applying
 * a transformation function to multiple columns with minimal memory overhead.
 */

import { validateColumn } from '../../createFrame.js';

/**
 * @typedef {import('../../createFrame.js').TinyFrame} TinyFrame
 * @typedef {Record<string, any[]|Float64Array>} ColumnData
 */

/**
 * Apply a transformation function to multiple columns
 *
 * @param {TinyFrame} frame - Input TinyFrame
 * @param {string[]} columns - Columns to transform
 * @param {Function} transformFn - Function to apply to each value
 * @param {string[]} [outputColumns] - Output column names (defaults to original columns)
 * @returns {TinyFrame} - TinyFrame with transformed columns
 */
export function transformMultipleSeries(
  frame,
  columns,
  transformFn,
  outputColumns,
) {
  // Validate input
  if (!frame || !frame.columns || typeof frame.rowCount !== 'number') {
    throw new Error('Invalid TinyFrame');
  }

  if (!Array.isArray(columns) || columns.length === 0) {
    throw new Error('columns must be a non-empty array');
  }

  if (typeof transformFn !== 'function') {
    throw new Error('transformFn must be a function');
  }

  // Validate all columns exist
  for (const col of columns) {
    validateColumn(frame, col);
  }

  // Default output columns to input columns
  const outCols = outputColumns || columns;

  if (outCols.length !== columns.length) {
    throw new Error('outputColumns must have the same length as columns');
  }

  // Create new frame with transformed columns
  /** @type {ColumnData} */
  const newColumns = { ...frame.columns };

  // Transform each column
  for (let i = 0; i < columns.length; i++) {
    const inCol = columns[i];
    const outCol = outCols[i];
    const values = frame.columns[inCol];

    // Create new array for transformed values
    const transformedValues = new Array(frame.rowCount);

    // Apply transformation
    for (let j = 0; j < frame.rowCount; j++) {
      transformedValues[j] = transformFn(values[j], j, values);
    }

    // Add transformed column
    newColumns[outCol] = transformedValues;
  }

  return {
    columns: newColumns,
    rowCount: frame.rowCount,
  };
}
