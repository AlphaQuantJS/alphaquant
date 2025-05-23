/**
 * count.js - Counts all values in column, including NaN, null and undefined
 */

import { validateColumn } from '../../createFrame.js';

/**
 * Counts all values in column, including NaN, null and undefined
 *
 * @param {import('../../createFrame.js').TinyFrame} frame - Input frame
 * @param {string} column - Column name
 * @returns {number} - Count of all values
 */
export function count(frame, column) {
  validateColumn(frame, column);

  // Simply return the length of the column, since we need to count all values
  return frame.columns[column].length;
}
