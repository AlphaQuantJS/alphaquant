/**
 * pivot_table.js - Transforms data from "long" format to "wide" format
 */

import { createFrame } from '../../createFrame.js';
import { getUniqueValues } from '../../methods/transform/getUniqueValues.js';

/**
 * @typedef {import('../../createFrame.js').TinyFrame} TinyFrame
 * @typedef {Record<string, any[]>} ColumnData
 */

/**
 * Transforms data from "long" format to "wide" format
 *
 * @param {TinyFrame} frame - Input TinyFrame
 * @param {string} index - Column to use as index
 * @param {string} columns - Column containing names of new columns
 * @param {string} values - Column containing values
 * @returns {TinyFrame} - Transformed TinyFrame
 */
export function pivot_table(frame, index, columns, values) {
  // Check input data
  if (!frame || !frame.columns || typeof frame.rowCount !== 'number') {
    throw new Error('Invalid TinyFrame');
  }

  // Check existence of specified columns
  for (const col of [index, columns, values]) {
    if (!frame.columns[col]) {
      throw new Error(`Column '${col}' not found`);
    }
  }

  // If frame is empty, return empty frame
  if (frame.rowCount === 0) {
    return createFrame({}, 0);
  }

  // Get unique values for index and columns
  const uniqueIndices = getUniqueValues(frame.columns[index]);
  const uniqueColumns = getUniqueValues(frame.columns[columns]);

  // Create new columns for result
  /** @type {ColumnData} */
  const newColumns = {};

  // Create column for index
  newColumns[index] = uniqueIndices;

  // Create columns for unique values from columns
  for (const col of uniqueColumns) {
    // Use string representation for column name
    const colName = String(col);

    // Create array for column with NaN as default
    const colValues = new Array(uniqueIndices.length).fill(NaN);

    // Fill column with values
    for (let i = 0; i < frame.rowCount; i++) {
      const indexValue = frame.columns[index][i];
      const columnValue = frame.columns[columns][i];
      const value = frame.columns[values][i];

      // Skip if any value is NaN, null or undefined
      if (
        indexValue !== indexValue ||
        columnValue !== columnValue ||
        value !== value
      ) {
        continue;
      }

      // Find index for indexValue in uniqueIndices
      const indexIndex = uniqueIndices.findIndex((v) => v === indexValue);

      // If columnValue matches current column, save the value
      if (columnValue === col) {
        colValues[indexIndex] = value;
      }
    }

    newColumns[colName] = colValues;
  }

  return createFrame(newColumns, uniqueIndices.length);
}
