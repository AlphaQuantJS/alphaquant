/**
 * getNumericColumns.js - Determines numeric columns in TinyFrame
 */

/**
 * @typedef {import('../../createFrame.js').TinyFrame} TinyFrame
 */

/**
 * Determines numeric columns in TinyFrame
 *
 * @param {TinyFrame} frame - Input TinyFrame
 * @returns {string[]} - Array of numeric column names
 */
export function getNumericColumns(frame) {
  const columnNames = Object.keys(frame.columns);
  const numericColumns = [];

  // Check each column
  for (const col of columnNames) {
    const values = frame.columns[col];

    // TypedArray is always numeric
    if (values instanceof Float64Array) {
      numericColumns.push(col);
      continue;
    }

    // For regular arrays, check if they contain numeric values
    if (Array.isArray(values)) {
      // Check up to 10 values
      const sampleSize = Math.min(10, values.length);
      let hasNumeric = false;

      for (let i = 0; i < sampleSize; i++) {
        const val = values[i];
        if (typeof val === 'number' && !isNaN(val)) {
          hasNumeric = true;
          break;
        }
      }

      if (hasNumeric) {
        numericColumns.push(col);
      }
    }
  }

  return numericColumns;
}
