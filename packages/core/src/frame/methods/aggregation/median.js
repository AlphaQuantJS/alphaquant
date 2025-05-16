/**
 * median.js - Calculates median of values in column
 */

import { validateColumn } from '../../createFrame.js';

/**
 * Calculates median of values in column
 *
 * @param {import('../../createFrame.js').TinyFrame} frame - Input frame
 * @param {string} column - Column name
 * @returns {number} - Median value
 */
export function median(frame, column) {
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

  const validValues = [];

  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (value !== null && value !== undefined && !isNaN(value)) {
      validValues.push(value);
    }
  }

  if (validValues.length === 0) {
    return NaN;
  }

  // Sort values
  validValues.sort((a, b) => a - b);

  const mid = Math.floor(validValues.length / 2);

  if (validValues.length % 2 === 0) {
    // If even number of elements, take average of two middle
    return (validValues[mid - 1] + validValues[mid]) / 2;
  } else {
    // If odd, take middle element
    return validValues[mid];
  }
}
