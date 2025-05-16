/**
 * sortValuesMultiple.js - Sorts TinyFrame by values in multiple columns
 */

import { validateColumn } from '../../createFrame.js';

/**
 * @typedef {import('../../createFrame.js').TinyFrame} TinyFrame
 * @typedef {Record<string, Array<any> | Float64Array>} ColumnData
 */

/**
 * Sorts TinyFrame by values in multiple columns
 *
 * @param {TinyFrame} frame - Input TinyFrame
 * @param {string[]} columns - Columns to sort by (in priority order)
 * @param {boolean[]} [ascending] - Sorting direction for each column
 * @returns {TinyFrame} - Sorted TinyFrame
 */
export function sortValuesMultiple(frame, columns, ascending) {
  // Check input data
  if (!frame || !frame.columns || typeof frame.rowCount !== 'number') {
    throw new Error('Invalid TinyFrame');
  }

  if (!Array.isArray(columns) || columns.length === 0) {
    throw new Error('At least one column must be specified for sorting');
  }

  // Check all columns
  for (const col of columns) {
    validateColumn(frame, col);
  }

  // If frame is empty, return copy
  if (frame.rowCount === 0) {
    return {
      columns: { ...frame.columns },
      rowCount: 0,
    };
  }

  // Set sorting direction for each column
  const ascValues = new Array(columns.length).fill(true);

  // If ascending array is provided, use its values
  if (Array.isArray(ascending)) {
    for (let i = 0; i < Math.min(ascending.length, columns.length); i++) {
      ascValues[i] = ascending[i];
    }
  }

  // Create indices for sorting
  const indices = new Array(frame.rowCount);
  for (let i = 0; i < frame.rowCount; i++) {
    indices[i] = i;
  }

  // Sort indices by values in specified columns
  indices.sort((a, b) => {
    // Compare by each column in priority order
    for (let i = 0; i < columns.length; i++) {
      const col = columns[i];
      const asc = ascValues[i];
      const values = frame.columns[col];

      const valA = values[a];
      const valB = values[b];

      // Handle null/undefined/NaN
      const aIsInvalid =
        valA === null ||
        valA === undefined ||
        (typeof valA === 'number' && isNaN(valA));
      const bIsInvalid =
        valB === null ||
        valB === undefined ||
        (typeof valB === 'number' && isNaN(valB));

      if (aIsInvalid && !bIsInvalid) return asc ? 1 : -1;
      if (!aIsInvalid && bIsInvalid) return asc ? -1 : 1;
      if (aIsInvalid && bIsInvalid) continue; // Both invalid, move to the next column

      // Compare values
      if (valA < valB) return asc ? -1 : 1;
      if (valA > valB) return asc ? 1 : -1;

      // If values are equal, move to the next column
    }

    // If all values are equal, keep original order
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
