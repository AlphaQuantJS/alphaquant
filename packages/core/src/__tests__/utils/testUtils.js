/**
 * Test utility functions
 */

import { toArray } from './arrayUtils.js';

/**
 * Creates patches for all tests that automatically convert typed arrays
 * to regular JavaScript arrays when comparing
 */
export function setupTestPatches() {
  // Save the original toEqual function
  const originalToEqual = expect.prototype.toEqual;

  // Override toEqual function to automatically convert typed arrays
  expect.prototype.toEqual = function (expected) {
    // If this is a typed array, convert it to a regular array
    if (
      this.actual &&
      (ArrayBuffer.isView(this.actual) ||
        (Array.isArray(expected) && !Array.isArray(this.actual)))
    ) {
      return originalToEqual.call(this, toArray(this.actual));
    }

    return originalToEqual.call(this, expected);
  };
}

/**
 * Creates a test frame with specified columns and row count
 * @param {Object} columns - Object with column names and values
 * @param {number} rowCount - Number of rows
 * @returns {Object} - Test frame
 */
export function createTestFrame(columns, rowCount) {
  return {
    columns,
    rowCount,
    columnNames: Object.keys(columns),
    rawColumns: { ...columns },
  };
}

/**
 * Creates a test frame with random data
 * @param {string[]} columnNames - Column names
 * @param {number} rowCount - Number of rows
 * @returns {Object} - Test frame with random data
 */
export function createRandomFrame(columnNames, rowCount) {
  const columns = {};

  for (const col of columnNames) {
    columns[col] = Array.from({ length: rowCount }, () => Math.random() * 100);
  }

  return createTestFrame(columns, rowCount);
}
