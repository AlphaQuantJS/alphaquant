/**
 * mean.js - Calculates mean of values in column
 */

import { validateColumn } from '../../createFrame.js';

/**
 * Calculates mean of values in column
 *
 * @param {import('../../createFrame.js').TinyFrame} frame - Input frame
 * @param {string} column - Column name
 * @returns {number} - Mean value
 */
export function mean(frame, column) {
  validateColumn(frame, column);

  // Check for empty frame
  if (frame.rowCount === 0) {
    return NaN;
  }

  const values = frame.columns[column];

  // Check for non-numeric column
  if (typeof values[0] === 'string') {
    throw new Error(`Column '${column}' contains non-numeric values`);
  }

  // Optimized algorithm for calculating mean value
  let sum = 0;
  let validCount = 0;

  // One pass through the data to calculate sum
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (value !== null && value !== undefined && !isNaN(value)) {
      sum += value;
      validCount++;
    }
  }

  // If no valid values, return NaN
  return validCount > 0 ? sum / validCount : NaN;
}
