/**
 * fillNaN.js - Fills NaN, null or undefined values with a specified value
 */

import { validateColumn } from '../../../createFrame.js';

/**
 * Fills NaN, null or undefined values with a specified value
 *
 * @param {import('../../../createFrame.js').TinyFrame} frame - Input TinyFrame
 * @param {string} column - Column to fill
 * @param {any} value - Value to fill or function
 * @returns {import('../../../createFrame.js').TinyFrame} - TinyFrame with filled values
 */
export function fillNaN(frame, column, value = 0) {
  validateColumn(frame, column);

  // Create a new frame with the same columns
  /** @type {Record<string, Array<any>|Float64Array>} */
  const newColumns = {};
  for (const col in frame.columns) {
    if (col === column) {
      // For the target column, create a new array and fill the values
      const sourceColumn = frame.columns[col];
      const isNumeric = sourceColumn instanceof Float64Array;
      const newColumn = isNumeric
        ? new Float64Array(frame.rowCount)
        : new Array(frame.rowCount);

      // If value is a function, call it for each invalid value
      const isFunction = typeof value === 'function';

      for (let i = 0; i < frame.rowCount; i++) {
        const val = sourceColumn[i];
        if (
          val === null ||
          val === undefined ||
          (typeof val === 'number' && isNaN(val))
        ) {
          // For invalid values, use value or function result
          newColumn[i] = isFunction ? value(i, frame) : value;
        } else {
          // For valid values, use original value
          newColumn[i] = val;
        }
      }

      newColumns[col] = newColumn;
    } else {
      // For other columns, simply copy
      newColumns[col] = frame.columns[col];
    }
  }

  return { columns: newColumns, rowCount: frame.rowCount };
}
