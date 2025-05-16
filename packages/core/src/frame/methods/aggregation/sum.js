/**
 * sum.js - Calculates sum of values in column
 */

import { validateColumn } from '../../createFrame.js';

/**
 * Calculates sum of values in column
 *
 * @param {import('../../createFrame.js').TinyFrame} frame - Input frame
 * @param {string} column - Column name
 * @returns {number} - Sum of values
 */
export function sum(frame, column) {
  validateColumn(frame, column);

  // Check for empty frame
  if (frame.rowCount === 0) {
    return 0; // For empty frame return 0, not NaN
  }

  const values = frame.columns[column];

  // Check for non-numeric column
  if (typeof values[0] === 'string') {
    throw new Error(`Column '${column}' contains non-numeric values`);
  }

  let result = 0;
  let count = 0;

  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (value !== null && value !== undefined && !isNaN(value)) {
      result += value;
      count++;
    }
  }

  return count > 0 ? result : NaN;
}
