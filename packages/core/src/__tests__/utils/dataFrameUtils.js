/**
 * Utility functions for working with data frames in tests
 */

import { createTestFrame } from './testUtils.js';
import { toArray } from './arrayUtils.js';

/**
 * Converts a TinyFrame to an array of objects
 * @param {Object} frame - TinyFrame to convert
 * @returns {Array<Object>} - Array of objects
 */
export function frameToArray(frame) {
  const result = [];
  const columns = Object.keys(frame.columns);

  for (let i = 0; i < frame.rowCount; i++) {
    const row = {};
    for (const col of columns) {
      row[col] = frame.columns[col][i];
    }
    result.push(row);
  }

  return result;
}

/**
 * Converts an array of objects to a TinyFrame
 * @param {Array<Object>} array - Array of objects to convert
 * @returns {Object} - TinyFrame
 */
export function arrayToFrame(array) {
  if (!array || array.length === 0) {
    return createTestFrame({}, 0);
  }

  const columns = {};
  const columnNames = Object.keys(array[0]);

  for (const col of columnNames) {
    columns[col] = array.map((row) => row[col]);
  }

  return createTestFrame(columns, array.length);
}

/**
 * Checks if two frames are equal
 * @param {Object} frame1 - First frame
 * @param {Object} frame2 - Second frame
 * @returns {boolean} - true if frames are equal
 */
export function framesEqual(frame1, frame2) {
  // Check row count
  if (frame1.rowCount !== frame2.rowCount) {
    return false;
  }

  // Check column names
  const cols1 = Object.keys(frame1.columns);
  const cols2 = Object.keys(frame2.columns);

  if (cols1.length !== cols2.length) {
    return false;
  }

  for (const col of cols1) {
    if (!frame2.columns[col]) {
      return false;
    }

    const arr1 = toArray(frame1.columns[col]);
    const arr2 = toArray(frame2.columns[col]);

    if (arr1.length !== arr2.length) {
      return false;
    }

    for (let i = 0; i < arr1.length; i++) {
      if (Number.isNaN(arr1[i]) && Number.isNaN(arr2[i])) {
        continue;
      }

      if (arr1[i] !== arr2[i]) {
        return false;
      }
    }
  }

  return true;
}
