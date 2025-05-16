/**
 * dropDuplicates.js - Removes duplicate rows from TinyFrame
 */

/**
 * @typedef {import('../../../createFrame.js').TinyFrame} TinyFrame
 * @typedef {Record<string, any[]|Float64Array>} ColumnData
 */

import { duplicated } from './duplicated.js';

/**
 * Removes duplicate rows from TinyFrame
 *
 * @param {import('../../../createFrame.js').TinyFrame} frame - Input TinyFrame
 * @param {string[]} [subset] - Subset of columns to check (default: all)
 * @param {boolean} [keepFirst=true] - Keep first occurrence (false = all duplicates)
 * @returns {import('../../../createFrame.js').TinyFrame} - TinyFrame without duplicates
 */
export function dropDuplicates(frame, subset, keepFirst = true) {
  // Check input data
  if (!frame || !frame.columns || typeof frame.rowCount !== 'number') {
    throw new Error('Invalid TinyFrame');
  }

  // If frame is empty, return its copy
  if (frame.rowCount === 0) {
    return {
      columns: { ...frame.columns },
      rowCount: 0,
    };
  }

  // Get duplicate mask
  const isDuplicate = duplicated(frame, subset, keepFirst);

  // Count rows after removing duplicates
  let newRowCount = 0;
  for (let i = 0; i < frame.rowCount; i++) {
    if (!isDuplicate[i]) {
      newRowCount++;
    }
  }

  // Create new columns without duplicates
  /** @type {ColumnData} */
  const newColumns = {};
  const columnNames = Object.keys(frame.columns);

  for (const colName of columnNames) {
    const oldValues = frame.columns[colName];
    const isTyped = oldValues instanceof Float64Array;

    // Create new array for column
    const newValues = isTyped
      ? new Float64Array(newRowCount)
      : new Array(newRowCount);

    // Fill only non-duplicate values
    let newIdx = 0;
    for (let i = 0; i < frame.rowCount; i++) {
      if (!isDuplicate[i]) {
        newValues[newIdx++] = oldValues[i];
      }
    }

    newColumns[colName] = newValues;
  }

  return {
    columns: newColumns,
    rowCount: newRowCount,
  };
}
