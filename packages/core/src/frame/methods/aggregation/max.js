/**
 * max.js - Calculates maximum value in column
 */

import { validateColumn } from '../../createFrame.js';

/**
 * Calculates maximum value in column
 *
 * @param {import('../../createFrame.js').TinyFrame} frame - Input frame
 * @param {string} column - Column name
 * @returns {number} - Maximum value
 */
export function max(frame, column) {
  validateColumn(frame, column);

  // Check for empty frame
  if (frame.rowCount === 0) {
    return -Infinity; // For empty frame return -Infinity
  }

  const values = frame.columns[column];

  // Check for non-numeric column
  if (typeof values[0] === 'string') {
    throw new Error(`Column '${column}' contains non-numeric values`);
  }

  // Optimized algorithm for finding maximum
  let maxValue = -Infinity;
  let validCount = 0;

  // One pass through the data to find maximum
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (value !== null && value !== undefined && !isNaN(value)) {
      if (value > maxValue) {
        maxValue = value;
      }
      validCount++;
    }
  }

  // If no valid values, return NaN
  return validCount > 0 ? maxValue : NaN;
}
