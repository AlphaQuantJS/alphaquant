/**
 * transform.js - Function for transforming entire rows of a frame
 *
 * This module provides an implementation for applying a transformation
 * function to each row of a frame, allowing for row-wise transformations.
 */

import { createFrame } from '../../createFrame.js';

/**
 * @typedef {import('../../createFrame.js').TinyFrame} TinyFrame
 * @typedef {Record<string, any[]|Float64Array>} ColumnData
 * @typedef {Record<string, any>} RowObject
 */

/**
 * Apply a transformation function to each row of a frame
 *
 * @param {TinyFrame} frame - Input TinyFrame
 * @param {Function} transformFn - Function to apply to each row (and optionally index)
 * @returns {TinyFrame} - TinyFrame with transformed rows
 */
export function transform(frame, transformFn) {
  // Validate input
  if (!frame || !frame.columns || typeof frame.rowCount !== 'number') {
    throw new Error('Invalid TinyFrame');
  }

  if (typeof transformFn !== 'function') {
    throw new Error('transformFn must be a function');
  }

  // Handle empty frame
  if (frame.rowCount === 0) {
    return createFrame({}, 0);
  }

  // Get column names
  const columnNames = Object.keys(frame.columns);

  // Convert frame to array of row objects
  /** @type {RowObject[]} */
  const rows = [];
  for (let i = 0; i < frame.rowCount; i++) {
    /** @type {RowObject} */
    const row = {};
    for (const colName of columnNames) {
      row[colName] = frame.columns[colName][i];
    }
    rows.push(row);
  }

  // Apply transformation function to each row
  const transformedRows = rows.map((row, idx) => transformFn(row, idx));

  // Convert transformed rows back to column-oriented format
  /** @type {ColumnData} */
  const resultColumns = {};
  const resultColumnNames =
    transformedRows.length > 0 ? Object.keys(transformedRows[0]) : [];

  for (const colName of resultColumnNames) {
    resultColumns[colName] = new Array(transformedRows.length);
    for (let i = 0; i < transformedRows.length; i++) {
      resultColumns[colName][i] = transformedRows[i][colName];
    }
  }

  return createFrame(resultColumns, transformedRows.length);
}
