/**
 * min.js - Calculates minimum value in column
 */

import { validateColumn } from '../../createFrame.js';

/**
 * Calculates minimum value in column
 *
 * @param {import('../../createFrame.js').TinyFrame} frame - Input frame
 * @param {string} column - Column name
 * @returns {number} - Minimum value
 */
export function min(frame, column) {
  validateColumn(frame, column);

  // Check for empty frame
  if (frame.rowCount === 0) {
    return Infinity; // For empty frame return Infinity
  }

  const values = frame.columns[column];

  // Check for non-numeric column
  if (typeof values[0] === 'string') {
    throw new Error(`Column '${column}' contains non-numeric values`);
  }

  // Optimized algorithm for finding minimum
  let minValue = Infinity;
  let validCount = 0;

  // One pass through the data to find minimum
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (value !== null && value !== undefined && !isNaN(value)) {
      if (value < minValue) {
        minValue = value;
      }
      validCount++;
    }
  }

  // If no valid values, return NaN
  return validCount > 0 ? minValue : NaN;
}
