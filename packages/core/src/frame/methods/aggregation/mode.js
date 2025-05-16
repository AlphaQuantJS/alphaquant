/**
 * mode.js - Calculates mode (most frequent value) in column
 */

import { validateColumn } from '../../createFrame.js';

/**
 * Calculates mode (most frequent value) in column
 *
 * @param {import('../../createFrame.js').TinyFrame} frame - Input frame
 * @param {string} column - Column name
 * @returns {any} - Mode value
 */
export function mode(frame, column) {
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

  // Optimized algorithm for finding mode
  // Using Map to count frequency of values
  const frequency = new Map();
  let maxFreq = 0;
  let modeValue = NaN;
  let validCount = 0;

  // One pass through the data to count frequency
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (value !== null && value !== undefined && !isNaN(value)) {
      const count = (frequency.get(value) || 0) + 1;
      frequency.set(value, count);
      validCount++;

      if (count > maxFreq) {
        maxFreq = count;
        modeValue = value;
      }
    }
  }

  // If no valid values, return NaN
  return validCount > 0 ? modeValue : NaN;
}
