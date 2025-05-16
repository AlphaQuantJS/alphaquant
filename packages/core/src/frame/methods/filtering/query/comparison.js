/**
 * comparison.js - Functions for filtering TinyFrame by comparison values
 */

import { filterByColumn } from './filterByColumn.js';

/**
 * Filters TinyFrame, keeping only rows where the column value equals the specified value
 *
 * @param {import('../../../createFrame.js').TinyFrame} frame - Input TinyFrame
 * @param {string} column - Column to filter
 * @param {any} value - Value to compare
 * @returns {import('../../../createFrame.js').TinyFrame} - Filtered TinyFrame
 */
export function filterEqual(frame, column, value) {
  return filterByColumn(frame, column, (val) => val === value);
}

/**
 * Filters TinyFrame, keeping only rows where the column value does not equal the specified value
 *
 * @param {import('../../../createFrame.js').TinyFrame} frame - Input TinyFrame
 * @param {string} column - Column to filter
 * @param {any} value - Value to compare
 * @returns {import('../../../createFrame.js').TinyFrame} - Filtered TinyFrame
 */
export function filterNotEqual(frame, column, value) {
  return filterByColumn(frame, column, (val) => val !== value);
}

/**
 * Filters TinyFrame, keeping only rows where the column value is greater than the specified value
 *
 * @param {import('../../../createFrame.js').TinyFrame} frame - Input TinyFrame
 * @param {string} column - Column to filter
 * @param {number|string|Date} value - Value to compare
 * @returns {import('../../../createFrame.js').TinyFrame} - Filtered TinyFrame
 */
export function filterGreater(frame, column, value) {
  return filterByColumn(frame, column, (val) => val > value);
}

/**
 * Filters TinyFrame, keeping only rows where the column value is greater than or equal to the specified value
 *
 * @param {import('../../../createFrame.js').TinyFrame} frame - Input TinyFrame
 * @param {string} column - Column to filter
 * @param {number|string|Date} value - Value to compare
 * @returns {import('../../../createFrame.js').TinyFrame} - Filtered TinyFrame
 */
export function filterGreaterEqual(frame, column, value) {
  return filterByColumn(frame, column, (val) => val >= value);
}

/**
 * Filters TinyFrame, keeping only rows where the column value is less than the specified value
 *
 * @param {import('../../../createFrame.js').TinyFrame} frame - Input TinyFrame
 * @param {string} column - Column to filter
 * @param {number|string|Date} value - Value to compare
 * @returns {import('../../../createFrame.js').TinyFrame} - Filtered TinyFrame
 */
export function filterLess(frame, column, value) {
  return filterByColumn(frame, column, (val) => val < value);
}

/**
 * Filters TinyFrame, keeping only rows where the column value is less than or equal to the specified value
 *
 * @param {import('../../../createFrame.js').TinyFrame} frame - Input TinyFrame
 * @param {string} column - Column to filter
 * @param {number|string|Date} value - Value to compare
 * @returns {import('../../../createFrame.js').TinyFrame} - Filtered TinyFrame
 */
export function filterLessEqual(frame, column, value) {
  return filterByColumn(frame, column, (val) => val <= value);
}

/**
 * Filters TinyFrame, keeping only rows where the column value is within the specified range
 *
 * @param {import('../../../createFrame.js').TinyFrame} frame - Input TinyFrame
 * @param {string} column - Column to filter
 * @param {number|string|Date} lower - Lower bound of the range (inclusive)
 * @param {number|string|Date} upper - Upper bound of the range (inclusive)
 * @returns {import('../../../createFrame.js').TinyFrame} - Filtered TinyFrame
 */
export function filterBetween(frame, column, lower, upper) {
  return filterByColumn(frame, column, (val) => val >= lower && val <= upper);
}
