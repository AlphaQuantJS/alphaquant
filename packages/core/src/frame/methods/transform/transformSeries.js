/**
 * transformSeries.js - Function for transforming a single column
 *
 * This module provides an optimized implementation for applying
 * a transformation function to a column with minimal memory overhead.
 */

import { validateColumn } from '../../createFrame.js';

/**
 * @typedef {import('../../createFrame.js').TinyFrame} TinyFrame
 * @typedef {Record<string, any[]|Float64Array>} ColumnData
 */

/**
 * Apply a transformation function to a column
 *
 * @param {TinyFrame} frame - Input TinyFrame
 * @param {string} column - Column to transform
 * @param {Function} transformFn - Function to apply to each value
 * @param {string} [outputColumn] - Output column name (defaults to original column)
 * @returns {TinyFrame} - TinyFrame with transformed column
 */
export function transformSeries(frame, column, transformFn, outputColumn) {
  // Validate input
  if (!frame || !frame.columns || typeof frame.rowCount !== 'number') {
    throw new Error('Invalid TinyFrame');
  }

  validateColumn(frame, column);

  if (typeof transformFn !== 'function') {
    throw new Error('transformFn must be a function');
  }

  // Default output column to input column
  const outCol = outputColumn || column;

  // Get column data
  const values = frame.columns[column];

  // Create new array for transformed values
  // We use regular array since we don't know the output type
  const transformedValues = new Array(frame.rowCount);

  // Apply transformation
  for (let i = 0; i < frame.rowCount; i++) {
    transformedValues[i] = transformFn(values[i], i, values);
  }

  // Create new frame with transformed column
  /** @type {ColumnData} */
  const newColumns = { ...frame.columns };

  // Add transformed column
  newColumns[outCol] = transformedValues;

  return {
    columns: newColumns,
    rowCount: frame.rowCount,
  };
}
