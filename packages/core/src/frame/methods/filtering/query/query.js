/**
 * query.js - Main function for complex TinyFrame filtering
 */

import { filter } from './filter.js';

/**
 * Filters TinyFrame by a complex condition using a predicate function
 *
 * @param {import('../../../createFrame.js').TinyFrame} frame - Input TinyFrame
 * @param {function(Object): boolean} predicate - Function predicate, accepting an object with current row
 * @returns {import('../../../createFrame.js').TinyFrame} - Filtered TinyFrame
 */
export function query(frame, predicate) {
  // Check input data
  if (!frame || !frame.columns || typeof frame.rowCount !== 'number') {
    throw new Error('Invalid TinyFrame');
  }

  if (typeof predicate !== 'function') {
    throw new Error('Predicate must be a function');
  }

  // If frame is empty, return a copy
  if (frame.rowCount === 0) {
    return {
      columns: { ...frame.columns },
      rowCount: 0,
    };
  }

  // Get column names
  const columnNames = Object.keys(frame.columns);

  // Create row cache
  const rowCache = new Array(frame.rowCount);

  // Filter the frame
  return filter(frame, (i) => {
    // Get or create row object
    let row = rowCache[i];

    if (!row) {
      // Create row object
      row = {};

      // Fill row object with column values
      for (const col of columnNames) {
        row[col] = frame.columns[col][i];
      }

      // Save row object in cache
      rowCache[i] = row;
    }

    // Check row against predicate
    return predicate(row);
  });
}
