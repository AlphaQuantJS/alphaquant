/**
 * cumsum.js - Functions for calculating cumulative sum
 *
 * This module provides optimized implementation for calculating
 * cumulative sum with minimal memory overhead.
 */

import { validateColumn } from '../../createFrame.js';

/**
 * @typedef {import('../../createFrame.js').TinyFrame} TinyFrame
 * @typedef {Record<string, any[]|Float64Array>} ColumnData
 */

/**
 * Calculates cumulative sum of values
 *
 * @param {TinyFrame} frame - Input TinyFrame
 * @param {string} column - Column to calculate cumulative sum for
 * @returns {TinyFrame} - TinyFrame with cumulative sum column
 */
export function cumsum(frame, column) {
  validateColumn(frame, column);

  // If the frame is empty, return an empty frame with an added empty column
  if (frame.rowCount === 0) {
    /** @type {ColumnData} */
    const newColumns = {};
    for (const col in frame.columns) {
      newColumns[col] = frame.columns[col];
    }
    // Add an empty column for cumulative sum
    newColumns[`${column}_cumsum`] = [];
    return { columns: newColumns, rowCount: 0 };
  }

  // Create new frame with same columns
  /** @type {ColumnData} */
  const newColumns = {};
  for (const col in frame.columns) {
    newColumns[col] = frame.columns[col];
  }

  // For target column, create new column with cumulative sum
  const sourceColumn = frame.columns[column];
  const isNumeric = sourceColumn instanceof Float64Array;
  const cumsumColumn = isNumeric
    ? new Float64Array(frame.rowCount)
    : new Array(frame.rowCount);

  // Calculate cumulative sum
  let sum = 0;
  let hasValidValue = false;
  let firstNaNIndex = -1;

  for (let i = 0; i < frame.rowCount; i++) {
    const value = sourceColumn[i];

    // If the value is invalid, the result is NaN and all subsequent values are also NaN
    if (
      value === null ||
      value === undefined ||
      (typeof value === 'number' && isNaN(value))
    ) {
      cumsumColumn[i] = NaN;

      // Remember the index of the first NaN to make all subsequent values NaN
      if (firstNaNIndex === -1) {
        firstNaNIndex = i;
      }
    } else {
      // If there was already a NaN, then all subsequent values are also NaN
      if (firstNaNIndex !== -1) {
        cumsumColumn[i] = NaN;
      } else {
        // Add the value to the sum
        sum += value;
        cumsumColumn[i] = sum;
      }
      hasValidValue = true;
    }
  }

  // For an empty frame or a frame with only NaN values, just return a column with NaN
  if (!hasValidValue && frame.rowCount > 0) {
    // Fill the column with NaN values
    for (let i = 0; i < frame.rowCount; i++) {
      cumsumColumn[i] = NaN;
    }
  }

  // Add new column with suffix "_cumsum"
  const cumsumColumnName = `${column}_cumsum`;
  newColumns[cumsumColumnName] = cumsumColumn;

  return { columns: newColumns, rowCount: frame.rowCount };
}
