/**
 * diff.js - Functions for calculating differences and percentage changes
 *
 * This module provides optimized implementations for calculating
 * differences and percentage changes with minimal memory overhead.
 */

import { validateColumn } from '../../createFrame.js';

/**
 * @typedef {import('../../createFrame.js').TinyFrame} TinyFrame
 * @typedef {Record<string, any[]|Float64Array>} ColumnData
 */

/**
 * Calculates differences between sequential values
 *
 * @param {TinyFrame} frame - Input TinyFrame
 * @param {string} column - Column to calculate differences
 * @param {number} [periods=1] - Number of periods to shift
 * @returns {TinyFrame} - TinyFrame with difference column
 */
export function diff(frame, column, periods = 1) {
  validateColumn(frame, column);

  // Check for valid period
  if (
    periods <= 0 ||
    isNaN(periods) ||
    periods === Infinity ||
    typeof periods !== 'number'
  ) {
    throw new Error('Periods must be a positive integer');
  }

  // If frame is empty, return empty frame
  if (frame.rowCount === 0) {
    return {
      columns: Object.fromEntries(
        Object.keys(frame.columns).map((col) => [
          col,
          col === column ? [] : frame.columns[col],
        ]),
      ),
      rowCount: 0,
      columnNames: [...frame.columnNames],
      rawColumns: { ...frame.rawColumns },
    };
  }

  // Create new frame with same columns
  /** @type {ColumnData} */
  const newColumns = {};
  for (const col in frame.columns) {
    if (col !== column) {
      newColumns[col] = frame.columns[col];
    }
  }

  // For target column, create new column with differences
  const sourceColumn = frame.columns[column];
  const isNumeric = sourceColumn instanceof Float64Array;
  const diffColumn = isNumeric
    ? new Float64Array(frame.rowCount)
    : new Array(frame.rowCount);

  // Fill first periods elements with NaN, since they don't have previous values
  for (let i = 0; i < periods; i++) {
    diffColumn[i] = NaN;
  }

  // Calculate differences for remaining elements
  for (let i = periods; i < frame.rowCount; i++) {
    const currentValue = sourceColumn[i];
    const previousValue = sourceColumn[i - periods];

    // If any value is invalid, result is NaN
    if (
      currentValue === null ||
      currentValue === undefined ||
      (typeof currentValue === 'number' && isNaN(currentValue)) ||
      previousValue === null ||
      previousValue === undefined ||
      (typeof previousValue === 'number' && isNaN(previousValue))
    ) {
      diffColumn[i] = NaN;
    } else {
      // Calculate difference
      diffColumn[i] = currentValue - previousValue;
    }
  }

  // Replace original column with differences column
  newColumns[column] = diffColumn;

  return {
    columns: newColumns,
    rowCount: frame.rowCount,
    columnNames: [...frame.columnNames],
    rawColumns: { ...frame.rawColumns },
  };
}

/**
 * Calculates percentage change between sequential values
 *
 * @param {TinyFrame} frame - Input TinyFrame
 * @param {string} column - Column to calculate percentage change
 * @param {number} [periods=1] - Number of periods to shift
 * @returns {TinyFrame} - TinyFrame with percentage change column
 */
export function pctChange(frame, column, periods = 1) {
  validateColumn(frame, column);

  // Check for valid period
  if (
    periods <= 0 ||
    isNaN(periods) ||
    periods === Infinity ||
    typeof periods !== 'number'
  ) {
    throw new Error('Periods must be a positive integer');
  }

  // If frame is empty, return empty frame
  if (frame.rowCount === 0) {
    return {
      columns: Object.fromEntries(
        Object.keys(frame.columns).map((col) => [
          col,
          col === column ? [] : frame.columns[col],
        ]),
      ),
      rowCount: 0,
      columnNames: [...frame.columnNames],
      rawColumns: { ...frame.rawColumns },
    };
  }

  // Create new frame with same columns
  /** @type {ColumnData} */
  const newColumns = {};
  for (const col in frame.columns) {
    if (col !== column) {
      newColumns[col] = frame.columns[col];
    }
  }

  // For target column, create new column with percentage changes
  const sourceColumn = frame.columns[column];
  const isNumeric = sourceColumn instanceof Float64Array;
  const pctChangeColumn = isNumeric
    ? new Float64Array(frame.rowCount)
    : new Array(frame.rowCount);

  // Fill first periods elements with NaN, since they don't have previous values
  for (let i = 0; i < periods; i++) {
    pctChangeColumn[i] = NaN;
  }

  // Calculate percentage changes for remaining elements
  for (let i = periods; i < frame.rowCount; i++) {
    const currentValue = sourceColumn[i];
    const previousValue = sourceColumn[i - periods];

    // If any value is invalid, result is NaN
    if (
      currentValue === null ||
      currentValue === undefined ||
      (typeof currentValue === 'number' && isNaN(currentValue)) ||
      previousValue === null ||
      previousValue === undefined ||
      (typeof previousValue === 'number' && isNaN(previousValue))
    ) {
      pctChangeColumn[i] = NaN;
    } else if (previousValue === 0) {
      // If previous value is 0, result is Infinity
      pctChangeColumn[i] =
        currentValue > 0 ? Infinity : currentValue < 0 ? -Infinity : NaN;
    } else {
      // Calculate percentage change
      pctChangeColumn[i] = (currentValue - previousValue) / previousValue;
    }
  }

  // Replace original column with percentage changes column
  newColumns[column] = pctChangeColumn;

  return {
    columns: newColumns,
    rowCount: frame.rowCount,
    columnNames: [...frame.columnNames],
    rawColumns: { ...frame.rawColumns },
  };
}
