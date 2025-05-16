/**
 * duplicated.js - Creates a mask of duplicate rows in TinyFrame
 */

/**
 * @typedef {import('../../../createFrame.js').TinyFrame} TinyFrame
 */

/**
 * Creates a mask of duplicate rows in TinyFrame
 *
 * @param {import('../../../createFrame.js').TinyFrame} frame - Input TinyFrame
 * @param {string[]} [subset] - Subset of columns to check (default: all)
 * @param {boolean} [keepFirst=true] - Keep first occurrence (false = all duplicates)
 * @returns {boolean[]} - Array of flags, where true means duplicate
 */
export function duplicated(frame, subset, keepFirst = true) {
  // Check input data
  if (!frame || !frame.columns || typeof frame.rowCount !== 'number') {
    throw new Error('Invalid TinyFrame');
  }

  // If frame is empty, return empty array
  if (frame.rowCount === 0) {
    return [];
  }

  // Determine columns to check
  const columnsToCheck = subset || Object.keys(frame.columns);

  // Check that all specified columns exist
  for (const col of columnsToCheck) {
    if (!frame.columns[col]) {
      throw new Error(`Column '${col}' not found`);
    }
  }

  // Create array for results
  const isDuplicate = new Array(frame.rowCount).fill(false);

  // Use Map to track unique combinations of values
  const seen = new Map();

  // Check each row
  for (let i = 0; i < frame.rowCount; i++) {
    // Create key for current row (JSON string of values in specified columns)
    const rowValues = columnsToCheck.map((col) => {
      const val = frame.columns[col][i];
      // Special handling for NaN, undefined and null
      if (val === undefined) return 'undefined';
      if (val === null) return 'null';
      if (typeof val === 'number' && isNaN(val)) return 'NaN';
      return val;
    });

    const key = JSON.stringify(rowValues);

    // Check if we have seen this combination of values before
    if (seen.has(key)) {
      // This is a duplicate
      isDuplicate[i] = true;
    } else {
      // This is the first occurrence
      seen.set(key, i);

      // If keepFirst=false, mark the first occurrence as a duplicate
      if (!keepFirst) {
        isDuplicate[i] = true;
      }
    }
  }

  return isDuplicate;
}
