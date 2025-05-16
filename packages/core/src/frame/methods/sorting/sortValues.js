/**
 * sortValues.js - Sorts TinyFrame by values in a specified column
 */

import { validateColumn } from '../../createFrame.js';

/**
 * @typedef {import('../../createFrame.js').TinyFrame} TinyFrame
 * @typedef {Record<string, Array<any> | Float64Array>} ColumnData
 */

/**
 * Sorts TinyFrame by values in a specified column
 *
 * @param {TinyFrame} frame - Input TinyFrame
 * @param {string} column - Column to sort by
 * @param {boolean} [ascending=true] - Sorting direction (ascending/descending)
 * @returns {TinyFrame} - Sorted TinyFrame
 */
export function sortValues(frame, column, ascending = true) {
  // Check input data
  if (!frame || !frame.columns || typeof frame.rowCount !== 'number') {
    throw new Error('Invalid TinyFrame');
  }

  validateColumn(frame, column);

  // If frame is empty, return copy
  if (frame.rowCount === 0) {
    return {
      columns: { ...frame.columns },
      rowCount: 0,
    };
  }

  // Create indices for sorting
  const indices = new Array(frame.rowCount);
  for (let i = 0; i < frame.rowCount; i++) {
    indices[i] = i;
  }

  // Get column values for sorting
  const values = frame.columns[column];

  // Sort indices by values
  indices.sort((a, b) => {
    const valA = values[a];
    const valB = values[b];

    // Handle null/undefined/NaN
    if (
      valA === null ||
      valA === undefined ||
      (typeof valA === 'number' && isNaN(valA))
    ) {
      return ascending ? 1 : -1; // Null/undefined/NaN always at the end when ascending=true
    }
    if (
      valB === null ||
      valB === undefined ||
      (typeof valB === 'number' && isNaN(valB))
    ) {
      return ascending ? -1 : 1;
    }

    // Compare values
    if (valA < valB) return ascending ? -1 : 1;
    if (valA > valB) return ascending ? 1 : -1;
    return 0;
  });

  // Create new columns with sorted values
  /** @type {ColumnData} */
  const newColumns = {};
  const columnNames = Object.keys(frame.columns);

  for (const colName of columnNames) {
    const oldValues = frame.columns[colName];
    const isTyped = oldValues instanceof Float64Array;

    // Create new array for column
    const newValues = isTyped
      ? new Float64Array(frame.rowCount)
      : new Array(frame.rowCount);

    // Fill with sorted values
    for (let i = 0; i < frame.rowCount; i++) {
      newValues[i] = oldValues[indices[i]];
    }

    newColumns[colName] = newValues;
  }

  return {
    columns: newColumns,
    rowCount: frame.rowCount,
  };
}
