/**
 * shift.js - Functions for shifting values
 *
 * This module provides optimized implementation for shifting
 * values with minimal memory overhead.
 */

import { validateColumn } from '../../createFrame.js';

/**
 * @typedef {import('../../createFrame.js').TinyFrame} TinyFrame
 * @typedef {Record<string, any[]|Float64Array>} ColumnData
 */

/**
 * Shifts values by a specified number of periods
 *
 * @param {TinyFrame} frame - Input TinyFrame
 * @param {string} column - Column to shift
 * @param {number} periods - Number of periods to shift (positive for forward, negative for backward)
 * @returns {TinyFrame} - TinyFrame with shifted column
 */
export function shift(frame, column, periods) {
  validateColumn(frame, column);

  // Check for invalid periods
  if (
    periods === 0 ||
    typeof periods !== 'number' ||
    isNaN(periods) ||
    periods === Infinity
  ) {
    // If period is invalid, just return the original frame
    return { ...frame };
  }

  // Create new frame with same columns
  /** @type {ColumnData} */
  const newColumns = {};
  for (const col in frame.columns) {
    if (col !== column) {
      newColumns[col] = frame.columns[col];
    }
  }

  // For target column, create new column with shifted values
  const sourceColumn = frame.columns[column];
  const isNumeric = sourceColumn instanceof Float64Array;
  const shiftedColumn = isNumeric
    ? new Float64Array(frame.rowCount)
    : new Array(frame.rowCount);

  // Fill all elements with NaN
  for (let i = 0; i < frame.rowCount; i++) {
    shiftedColumn[i] = NaN;
  }

  // Check for shift exceeding column length
  if (Math.abs(periods) >= frame.rowCount) {
    // All values remain NaN
  } else {
    // Shift values
    if (periods > 0) {
      // Positive shift (forward)
      for (let i = 0; i < frame.rowCount - periods; i++) {
        const value = sourceColumn[i];
        // Check for NaN, null, undefined
        if (
          value === null ||
          value === undefined ||
          (typeof value === 'number' && isNaN(value))
        ) {
          shiftedColumn[i + periods] = NaN;
        } else {
          shiftedColumn[i + periods] = value;
        }
      }
    } else {
      // Negative shift (backward)
      const absPeriods = Math.abs(periods);
      for (let i = absPeriods; i < frame.rowCount; i++) {
        const value = sourceColumn[i];
        // Check for NaN, null, undefined
        if (
          value === null ||
          value === undefined ||
          (typeof value === 'number' && isNaN(value))
        ) {
          shiftedColumn[i - absPeriods] = NaN;
        } else {
          shiftedColumn[i - absPeriods] = value;
        }
      }
    }
  }

  // Replace original column with shifted one
  newColumns[column] = shiftedColumn;

  return {
    columns: newColumns,
    rowCount: frame.rowCount,
    columnNames: [...frame.columnNames],
    rawColumns: { ...frame.rawColumns },
  };
}
