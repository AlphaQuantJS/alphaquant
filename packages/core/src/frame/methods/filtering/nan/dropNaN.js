/**
 * dropNaN.js - Removes rows with NaN, null or undefined values
 */

/**
 * Checks if an object is a valid TinyFrame
 * @param {import('../../../createFrame.js').TinyFrame} frame - Frame to check
 * @throws {Error} - If the frame is invalid
 */
function validateFrame(frame) {
  if (!frame || !frame.columns || typeof frame.rowCount !== 'number') {
    throw new Error('Invalid TinyFrame');
  }
}

/**
 * Removes rows with NaN, null or undefined values in specified columns
 *
 * @param {import('../../../createFrame.js').TinyFrame} frame - Input TinyFrame
 * @param {string[]} [columns] - Columns to check (default: all columns)
 * @returns {import('../../../createFrame.js').TinyFrame} - TinyFrame with removed rows
 */
export function dropNaN(frame, columns) {
  validateFrame(frame);

  // If columns are not specified, use all
  if (!columns) {
    columns = Object.keys(frame.columns);
  }

  // Check for column existence
  columns.forEach((column) => {
    if (!frame.columns[column]) {
      throw new Error(`Column '${column}' not found`);
    }
  });

  // Filter rows where NaN, null or undefined values exist in specified columns
  const indices = [];

  // Check each row
  for (let i = 0; i < frame.rowCount; i++) {
    let keepRow = true;

    // Check each specified column
    for (const column of columns) {
      const value = frame.columns[column][i];

      // If the value is invalid (null, undefined or NaN), do not keep the row
      if (
        value === null ||
        value === undefined ||
        (typeof value === 'number' && isNaN(value))
      ) {
        keepRow = false;
        break;
      }
    }

    // If all values in the row are valid, add the index to the list to keep
    if (keepRow) {
      indices.push(i);
    }
  }

  // If no rows match the condition, return an empty frame
  if (indices.length === 0) {
    /** @type {Record<string, Array<any>|Float64Array>} */
    const emptyColumns = {};
    for (const column in frame.columns) {
      emptyColumns[column] = new Float64Array(0);
    }
    return { columns: emptyColumns, rowCount: 0 };
  }

  // Create a new frame with only valid rows
  /** @type {Record<string, Array<any>|Float64Array>} */
  const newColumns = {};
  for (const column in frame.columns) {
    // Use TypedArray for numeric columns for performance optimization
    const sourceColumn = frame.columns[column];
    const isNumeric = sourceColumn instanceof Float64Array;

    // Create a new column of the corresponding type
    const newColumn = isNumeric
      ? new Float64Array(indices.length)
      : new Array(indices.length);

    // Copy only valid rows
    for (let i = 0; i < indices.length; i++) {
      newColumn[i] = sourceColumn[indices[i]];
    }

    newColumns[column] = newColumn;
  }

  return { columns: newColumns, rowCount: indices.length };
}
