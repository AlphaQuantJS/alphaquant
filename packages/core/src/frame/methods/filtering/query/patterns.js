/**
 * patterns.js - Functions for filtering TinyFrame by patterns and null checks
 */

import { validateColumn } from '../../../createFrame.js';
import { filterByColumn } from './filterByColumn.js';

/**
 * @typedef {import('../../../createFrame.js').TinyFrame} TinyFrame
 */

/**
 * Filters TinyFrame, keeping only rows where column value matches the specified pattern
 *
 * @param {TinyFrame} frame - Input TinyFrame
 * @param {string} column - Column to filter
 * @param {RegExp|string} pattern - Regular expression or string
 * @returns {TinyFrame} - Filtered TinyFrame
 */
export function filterMatch(frame, column, pattern) {
  // Check input data
  validateColumn(frame, column);

  if (!pattern) {
    throw new Error('Pattern must be a non-empty string or RegExp');
  }

  // If frame is empty, return its copy
  if (frame.rowCount === 0) {
    return {
      columns: { ...frame.columns },
      rowCount: 0,
      rawColumns: frame.rawColumns ? { ...frame.rawColumns } : {},
      columnNames: frame.columnNames
        ? [...frame.columnNames]
        : Object.keys(frame.columns),
    };
  }

  // Convert string to regular expression
  const regex =
    pattern instanceof RegExp ? pattern : new RegExp(String(pattern));

  // Get column values
  const values = frame.columns[column];
  const rawValues = frame.rawColumns && frame.rawColumns[column];

  // Create match mask (true for values matching the pattern)
  /** @type {boolean[]} */
  const matchMask = new Array(frame.rowCount);
  let matchCount = 0;

  // Fill mask and count matching values
  for (let i = 0; i < frame.rowCount; i++) {
    let val;

    // If raw values are available, use them
    if (rawValues) {
      val = rawValues[i];
    } else {
      val = values[i];
    }

    // Skip null, undefined, NaN
    if (val === null || val === undefined || val !== val) {
      matchMask[i] = false;
      continue;
    }

    // Check pattern match
    const isMatch = regex.test(String(val));
    matchMask[i] = isMatch;
    if (isMatch) matchCount++;
  }

  // If no matches, return empty frame
  if (matchCount === 0) {
    /** @type {Record<string, any[]|Float64Array>} */
    const newColumns = {};
    /** @type {Record<string, any[]>} */
    const newRawColumns = {};

    // Copy column structure from source frame
    for (const col in frame.columns) {
      newColumns[col] =
        frame.columns[col] instanceof Float64Array ? new Float64Array(0) : [];

      // If rawColumns exist, copy them too
      if (frame.rawColumns && frame.rawColumns[col]) {
        newRawColumns[col] = [];
      }
    }

    return {
      columns: newColumns,
      rowCount: 0,
      rawColumns: Object.keys(newRawColumns).length > 0 ? newRawColumns : {},
      columnNames: frame.columnNames
        ? [...frame.columnNames]
        : Object.keys(newColumns),
    };
  }

  // Create new arrays for result
  /** @type {Record<string, any[]|Float64Array>} */
  const newColumns = {};
  /** @type {Record<string, any[]>} */
  const newRawColumns = {};

  // For each column create a new array with matching values
  for (const col in frame.columns) {
    const oldArray = frame.columns[col];
    const isTyped = oldArray instanceof Float64Array;

    // Create array of needed type and size
    const newArray = isTyped
      ? new Float64Array(matchCount)
      : new Array(matchCount);

    // Copy only matching values
    let newIndex = 0;
    for (let i = 0; i < frame.rowCount; i++) {
      if (matchMask[i]) {
        newArray[newIndex++] = oldArray[i];
      }
    }

    newColumns[col] = newArray;

    // If rawColumns exist, copy them too
    if (frame.rawColumns && frame.rawColumns[col]) {
      const oldRawArray = frame.rawColumns[col];
      const newRawArray = new Array(matchCount);

      // Copy only matching values
      newIndex = 0;
      for (let i = 0; i < frame.rowCount; i++) {
        if (matchMask[i]) {
          newRawArray[newIndex++] = oldRawArray[i];
        }
      }

      newRawColumns[col] = newRawArray;
    }
  }

  return {
    columns: newColumns,
    rowCount: matchCount,
    rawColumns: Object.keys(newRawColumns).length > 0 ? newRawColumns : {},
    columnNames: frame.columnNames
      ? [...frame.columnNames]
      : Object.keys(newColumns),
  };
}

/**
 * Filters TinyFrame, keeping only rows where column value is not null, undefined or NaN
 *
 * @param {TinyFrame} frame - Input TinyFrame
 * @param {string} column - Column to filter
 * @returns {TinyFrame} - Filtered TinyFrame
 */
export function filterNotNull(frame, column) {
  // Check input data
  validateColumn(frame, column);

  // If frame is empty, return its copy
  if (frame.rowCount === 0) {
    return {
      columns: { ...frame.columns },
      rowCount: 0,
      rawColumns: frame.rawColumns ? { ...frame.rawColumns } : {},
      columnNames: frame.columnNames
        ? [...frame.columnNames]
        : Object.keys(frame.columns),
    };
  }

  // Get column values
  const values = frame.columns[column];
  const rawValues = frame.rawColumns && frame.rawColumns[column];

  // Create validity mask (true for non-null values)
  /** @type {boolean[]} */
  const validMask = new Array(frame.rowCount);
  let validCount = 0;

  // Fill mask and count valid values
  for (let i = 0; i < frame.rowCount; i++) {
    let isValid;

    // If raw values are available, check them
    if (rawValues) {
      const rawVal = rawValues[i];
      isValid = rawVal !== null && rawVal !== undefined && rawVal === rawVal;
    } else {
      // Otherwise check optimized values
      const val = values[i];
      isValid = val !== null && val !== undefined && val === val;
    }

    validMask[i] = isValid;
    if (isValid) validCount++;
  }

  // If no valid values, return empty frame
  if (validCount === 0) {
    /** @type {Record<string, any[]|Float64Array>} */
    const newColumns = {};
    /** @type {Record<string, any[]>} */
    const newRawColumns = {};

    // Copy column structure from source frame
    for (const col in frame.columns) {
      newColumns[col] =
        frame.columns[col] instanceof Float64Array ? new Float64Array(0) : [];

      // If rawColumns exist, copy them too
      if (frame.rawColumns && frame.rawColumns[col]) {
        newRawColumns[col] = [];
      }
    }

    return {
      columns: newColumns,
      rowCount: 0,
      rawColumns: Object.keys(newRawColumns).length > 0 ? newRawColumns : {},
      columnNames: frame.columnNames
        ? [...frame.columnNames]
        : Object.keys(newColumns),
    };
  }

  // Create new arrays for result
  /** @type {Record<string, any[]|Float64Array>} */
  const newColumns = {};
  /** @type {Record<string, any[]>} */
  const newRawColumns = {};

  // For each column create a new array with valid values
  for (const col in frame.columns) {
    const oldArray = frame.columns[col];
    const isTyped = oldArray instanceof Float64Array;

    // Create array of needed type and size
    const newArray = isTyped
      ? new Float64Array(validCount)
      : new Array(validCount);

    // Copy only valid values
    let newIndex = 0;
    for (let i = 0; i < frame.rowCount; i++) {
      if (validMask[i]) {
        newArray[newIndex++] = oldArray[i];
      }
    }

    newColumns[col] = newArray;

    // If rawColumns exist, copy them too
    if (frame.rawColumns && frame.rawColumns[col]) {
      const oldRawArray = frame.rawColumns[col];
      const newRawArray = new Array(validCount);

      // Copy only valid values
      newIndex = 0;
      for (let i = 0; i < frame.rowCount; i++) {
        if (validMask[i]) {
          newRawArray[newIndex++] = oldRawArray[i];
        }
      }

      newRawColumns[col] = newRawArray;
    }
  }

  return {
    columns: newColumns,
    rowCount: validCount,
    rawColumns: Object.keys(newRawColumns).length > 0 ? newRawColumns : {},
    columnNames: frame.columnNames
      ? [...frame.columnNames]
      : Object.keys(newColumns),
  };
}

/**
 * Filters TinyFrame, keeping only rows where column value is null, undefined or NaN
 *
 * @param {TinyFrame} frame - Input TinyFrame
 * @param {string} column - Column to filter
 * @returns {TinyFrame} - Filtered TinyFrame
 */
export function filterNull(frame, column) {
  // Check input data
  validateColumn(frame, column);

  // If frame is empty, return its copy
  if (frame.rowCount === 0) {
    return {
      columns: { ...frame.columns },
      rowCount: 0,
      rawColumns: frame.rawColumns ? { ...frame.rawColumns } : {},
      columnNames: frame.columnNames
        ? [...frame.columnNames]
        : Object.keys(frame.columns),
    };
  }

  // Get column values
  const values = frame.columns[column];
  const rawValues = frame.rawColumns && frame.rawColumns[column];

  // Create null mask (true for null, undefined, NaN values)
  /** @type {boolean[]} */
  const nullMask = new Array(frame.rowCount);
  let nullCount = 0;

  // Fill mask and count null values
  for (let i = 0; i < frame.rowCount; i++) {
    let val;

    // If raw values are available, use them
    if (rawValues) {
      val = rawValues[i];
    } else {
      val = values[i];
    }

    // Check for null, undefined, NaN
    const isNull = val === null || val === undefined || val !== val;
    nullMask[i] = isNull;
    if (isNull) nullCount++;
  }

  // If no null values, return empty frame
  if (nullCount === 0) {
    /** @type {Record<string, any[]|Float64Array>} */
    const newColumns = {};
    /** @type {Record<string, any[]>} */
    const newRawColumns = {};

    // Copy column structure from source frame
    for (const col in frame.columns) {
      newColumns[col] =
        frame.columns[col] instanceof Float64Array ? new Float64Array(0) : [];

      // If rawColumns exist, copy them too
      if (frame.rawColumns && frame.rawColumns[col]) {
        newRawColumns[col] = [];
      }
    }

    return {
      columns: newColumns,
      rowCount: 0,
      rawColumns: Object.keys(newRawColumns).length > 0 ? newRawColumns : {},
      columnNames: frame.columnNames
        ? [...frame.columnNames]
        : Object.keys(newColumns),
    };
  }

  // Create new arrays for result
  /** @type {Record<string, any[]|Float64Array>} */
  const newColumns = {};
  /** @type {Record<string, any[]>} */
  const newRawColumns = {};

  // For each column create a new array with null values
  for (const col in frame.columns) {
    const oldArray = frame.columns[col];
    const isTyped = oldArray instanceof Float64Array;

    // Create array of needed type and size
    const newArray = isTyped
      ? new Float64Array(nullCount)
      : new Array(nullCount);

    // Copy only null values
    let newIndex = 0;
    for (let i = 0; i < frame.rowCount; i++) {
      if (nullMask[i]) {
        newArray[newIndex++] = oldArray[i];
      }
    }

    newColumns[col] = newArray;

    // If rawColumns exist, copy them too
    if (frame.rawColumns && frame.rawColumns[col]) {
      const oldRawArray = frame.rawColumns[col];
      const newRawArray = new Array(nullCount);

      // Copy only null values
      newIndex = 0;
      for (let i = 0; i < frame.rowCount; i++) {
        if (nullMask[i]) {
          newRawArray[newIndex++] = oldRawArray[i];
        }
      }

      newRawColumns[col] = newRawArray;
    }
  }

  return {
    columns: newColumns,
    rowCount: nullCount,
    rawColumns: Object.keys(newRawColumns).length > 0 ? newRawColumns : {},
    columnNames: frame.columnNames
      ? [...frame.columnNames]
      : Object.keys(newColumns),
  };
}
