/**
 * sortByIndex.js - Sorts TinyFrame by index
 */

import { sortValues } from './sortValues.js';

/**
 * @typedef {import('../../createFrame.js').TinyFrame} TinyFrame
 * @typedef {Record<string, any[]|Float64Array>} ColumnData
 */

/**
 * Sorts TinyFrame by provided indices
 *
 * @param {TinyFrame} frame - Input TinyFrame
 * @param {number[]} indices - Array of indices to sort by
 * @returns {TinyFrame} - Sorted TinyFrame
 */
export function sortByIndex(frame, indices) {
  // Check for invalid frame
  if (!frame || !frame.columns || typeof frame.rowCount !== 'number') {
    throw new Error('Invalid TinyFrame');
  }

  // Check for invalid indices
  if (!Array.isArray(indices)) {
    throw new Error('Indices must be an array');
  }

  // Check for invalid index values
  for (let i = 0; i < indices.length; i++) {
    const idx = indices[i];
    if (
      typeof idx !== 'number' ||
      idx < 0 ||
      idx >= frame.rowCount ||
      !Number.isInteger(idx)
    ) {
      throw new Error(`Invalid index: ${idx}`);
    }
  }

  // Check for empty frame
  if (frame.rowCount === 0) {
    return {
      columns: { ...frame.columns },
      rowCount: 0,
      columnNames: [...frame.columnNames],
      rawColumns: { ...frame.rawColumns },
    };
  }

  // Check for empty indices array
  if (indices.length === 0) {
    // Create empty arrays for each column, preserving their type
    /** @type {ColumnData} */
    const emptyColumns = {};
    for (const colName in frame.columns) {
      const oldValues = frame.columns[colName];
      emptyColumns[colName] =
        oldValues instanceof Float64Array ? new Float64Array(0) : [];
    }

    return {
      columns: emptyColumns,
      rowCount: 0,
      columnNames: [...frame.columnNames],
      rawColumns: { ...frame.rawColumns },
    };
  }

  // Create new columns with sorted values
  /** @type {ColumnData} */
  const newColumns = {};
  const columnNames = Object.keys(frame.columns);

  for (const colName of columnNames) {
    const oldValues = frame.columns[colName];

    // Determine column type and create appropriate array
    if (oldValues instanceof Float64Array) {
      // For Float64Array create a new Float64Array
      const newValues = new Float64Array(indices.length);

      // Fill with values in the order of specified indices
      for (let i = 0; i < indices.length; i++) {
        const idx = indices[i];
        newValues[i] = oldValues[idx];
      }

      newColumns[colName] = newValues;
    } else {
      // For regular arrays create a new array using map
      const newValues = indices.map((idx) => oldValues[idx]);

      newColumns[colName] = newValues;
    }
  }

  return {
    columns: newColumns,
    rowCount: indices.length,
    columnNames: [...frame.columnNames],
    rawColumns: { ...frame.rawColumns },
  };
}
