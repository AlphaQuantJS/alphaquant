/**
 * filter.js - Base function for filtering data in TinyFrame
 */

/**
 * @typedef {import('../../../createFrame.js').TinyFrame} TinyFrame
 * @typedef {Record<string, any[]|Float64Array>} ColumnData
 */

/**
 * Filters TinyFrame by condition
 *
 * @param {TinyFrame} frame - Input TinyFrame
 * @param {function(number, TinyFrame): boolean} predicate - Predicate function, accepting row index and frame
 * @returns {TinyFrame} - Filtered TinyFrame
 */
export function filter(frame, predicate) {
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

  // Create arrays for row indices that satisfy the condition
  const indices = [];

  // Check each row
  for (let i = 0; i < frame.rowCount; i++) {
    if (predicate(i, frame)) {
      indices.push(i);
    }
  }

  // If no rows satisfy the condition, return an empty frame
  if (indices.length === 0) {
    // Create empty arrays for all columns
    /** @type {ColumnData} */
    const newColumns = {};
    for (const col in frame.columns) {
      newColumns[col] =
        frame.columns[col] instanceof Float64Array ? new Float64Array(0) : [];
    }

    return {
      columns: newColumns,
      rowCount: 0,
    };
  }

  // Create new columns with filtered data
  /** @type {ColumnData} */
  const newColumns = {};

  for (const col in frame.columns) {
    const oldArray = frame.columns[col];

    // Create new array of the correct type
    const isTyped = oldArray instanceof Float64Array;
    const newArray = isTyped
      ? new Float64Array(indices.length)
      : new Array(indices.length);

    // Copy values from old array
    for (let i = 0; i < indices.length; i++) {
      newArray[i] = oldArray[indices[i]];
    }

    newColumns[col] = newArray;
  }

  return {
    columns: newColumns,
    rowCount: indices.length,
  };
}
