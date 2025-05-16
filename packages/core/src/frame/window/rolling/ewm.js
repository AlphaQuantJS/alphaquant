/**
 * ewm.js - Calculation of exponentially weighted moving average (EWMA)
 */

import { validateColumn } from '../../createFrame.js';

/**
 * Calculates exponentially weighted moving average (EWMA)
 *
 * @param {import('../../createFrame.js').TinyFrame} frame - Input TinyFrame
 * @param {string} column - Column for EWMA calculation
 * @param {number} span - Span parameter (equivalent to span in pandas)
 * @returns {import('../../createFrame.js').TinyFrame} - TinyFrame with EWMA column
 */
export function ewm(frame, column, span) {
  // Check input data
  validateColumn(frame, column);

  if (!Number.isInteger(span) || span <= 0) {
    throw new Error('Span must be a positive integer');
  }

  // Special case for empty frame
  if (frame.rowCount === 0) {
    return {
      columns: {
        ...frame.columns,
        [`${column}_ewm`]: [],
      },
      rowCount: 0,
    };
  }

  // Get column values
  const values = frame.columns[column];
  const n = values.length;

  // Create array for results
  const result = new Float64Array(n);

  // Calculate alpha from span
  // In pandas: alpha = 2 / (span + 1)
  const alpha = 2 / (span + 1);

  // Initialize first value
  let firstValid = -1;
  for (let i = 0; i < n; i++) {
    const val = values[i];
    if (val === val && val !== null && val !== undefined) {
      firstValid = i;
      result[i] = val;
      break;
    } else {
      result[i] = NaN;
    }
  }

  // If all values are NaN, return NaN array
  if (firstValid === -1) {
    return {
      columns: {
        ...frame.columns,
        [`${column}_ewm`]: result,
      },
      rowCount: frame.rowCount,
    };
  }

  // Calculate EWMA for remaining values
  for (let i = firstValid + 1; i < n; i++) {
    const val = values[i];

    // Skip NaN, null, undefined
    if (val === val && val !== null && val !== undefined) {
      result[i] = alpha * val + (1 - alpha) * result[i - 1];
    } else {
      result[i] = NaN;
    }
  }

  // Create new frame with results
  return {
    columns: {
      ...frame.columns,
      [`${column}_ewm`]: result,
    },
    rowCount: frame.rowCount,
  };
}
