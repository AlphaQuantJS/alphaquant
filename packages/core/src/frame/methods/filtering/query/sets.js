/**
 * sets.js - Functions for filtering TinyFrame by sets of values
 */

import { filterByColumn } from './filterByColumn.js';

/**
 * Filters TinyFrame, keeping only rows where column value is in the specified set of values
 *
 * @param {import('../../../createFrame.js').TinyFrame} frame - Input TinyFrame
 * @param {string} column - Column to filter
 * @param {any[]} values - Array of values to check
 * @returns {import('../../../createFrame.js').TinyFrame} - Filtered TinyFrame
 */
export function filterIn(frame, column, values) {
  // Check input data
  if (!Array.isArray(values)) {
    throw new Error('Values must be an array');
  }

  // Use Set for performance optimization
  const valueSet = new Set(values);

  // Filter the frame
  return filterByColumn(frame, column, (val) => valueSet.has(val));
}

/**
 * Filters TinyFrame, keeping only rows where column value is not in the specified set of values
 *
 * @param {import('../../../createFrame.js').TinyFrame} frame - Input TinyFrame
 * @param {string} column - Column to filter
 * @param {any[]} values - Array of values to check
 * @returns {import('../../../createFrame.js').TinyFrame} - Filtered TinyFrame
 */
export function filterNotIn(frame, column, values) {
  // Check input data
  if (!Array.isArray(values)) {
    throw new Error('Values must be an array');
  }

  // Use Set for performance optimization
  const valueSet = new Set(values);

  // Filter the frame
  return filterByColumn(frame, column, (val) => !valueSet.has(val));
}
