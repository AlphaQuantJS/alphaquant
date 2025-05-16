/**
 * rollingMean.js - Calculation of rolling mean for a column in a frame
 */

import { validateColumn } from '../../createFrame.js';
import { rollingMeanTyped } from './rollingMeanTyped.js';

/**
 * Calculates rolling mean for a column in a frame
 *
 * @param {import('../../createFrame.js').TinyFrame} frame - Input frame
 * @param {string} column - Column name
 * @param {number} windowSize - Size of the rolling window
 * @returns {import('../../createFrame.js').TinyFrame} - New frame with rolling mean
 */
export function rollingMean(frame, column, windowSize) {
  // Check input data
  validateColumn(frame, column);

  if (!Number.isInteger(windowSize) || windowSize <= 0) {
    throw new Error('Window size must be a positive integer');
  }

  // Special case for empty frame
  if (frame.rowCount === 0) {
    return {
      columns: {
        ...frame.columns,
        [`${column}_rolling_mean`]: [],
      },
      rowCount: 0,
    };
  }

  // Get column values
  const values = frame.columns[column];

  // Create array for results
  const result = new Float64Array(frame.rowCount);

  // Calculate rolling mean
  rollingMeanTyped(values, windowSize, result);

  // Create new frame with results
  return {
    columns: {
      ...frame.columns,
      [`${column}_rolling_mean`]: result,
    },
    rowCount: frame.rowCount,
  };
}
