/**
 * pivot.js - Creates a pivot table from TinyFrame
 */

import { createFrame } from '../../createFrame.js';
import { getUniqueValues } from '../../methods/transform/getUniqueValues.js';
import { mean } from '../../methods/aggregation/mean.js';

/**
 * @typedef {import('../../createFrame.js').TinyFrame} TinyFrame
 * @typedef {Object<string, any[]>} ColumnData
 * @typedef {Object<string, Object<string, any[]>>} GroupedData
 * @typedef {Object<string, any>} Row
 */

/**
 * Calculates the mean value of an array
 *
 * @param {Array<number|null|undefined>} values - Array of values
 * @returns {number} - Mean value
 */
function arrayMean(values) {
  if (!values || values.length === 0) return 0; // Return 0 instead of NaN

  let sum = 0;
  let count = 0;

  for (let i = 0; i < values.length; i++) {
    const val = values[i];
    if (val !== null && val !== undefined && !isNaN(val)) {
      sum += val;
      count++;
    }
  }

  return count > 0 ? sum / count : 0; // Return 0 instead of NaN
}

/**
 * Calculates the sum of an array
 *
 * @param {Array<number|null|undefined>} values - Array of values
 * @returns {number} - Sum of values
 */
function arraySum(values) {
  if (!values || values.length === 0) return 0; // Return 0 instead of NaN

  let sum = 0;
  let count = 0;

  for (let i = 0; i < values.length; i++) {
    const val = values[i];
    if (val !== null && val !== undefined && !isNaN(val)) {
      sum += val;
      count++;
    }
  }

  return count > 0 ? sum : 0; // Return 0 instead of NaN
}

/**
 * Converts TinyFrame to an array of objects
 *
 * @param {TinyFrame} frame - Input frame
 * @returns {Array<Row>} - Array of objects
 */
function frameToArray(frame) {
  const result = [];
  const columns = Object.keys(frame.columns);

  for (let i = 0; i < frame.rowCount; i++) {
    /** @type {Row} */
    const row = {};
    for (const col of columns) {
      row[col] = frame.columns[col][i];
    }
    result.push(row);
  }

  return result;
}

/**
 * Creates a pivot table from TinyFrame
 *
 * @param {TinyFrame} frame - Input TinyFrame
 * @param {string} index - Column to use as index
 * @param {string} columns - Column to use as columns
 * @param {string} values - Column to use as values
 * @param {(function(any[]): any)|string} [aggFunc='mean'] - Aggregation function or name ('mean', 'sum')
 * @returns {TinyFrame} - Pivot table in TinyFrame format
 */
export function pivot(frame, index, columns, values, aggFunc = 'mean') {
  // Check input data
  if (!frame || !frame.columns || typeof frame.rowCount !== 'number') {
    throw new Error('Invalid TinyFrame');
  }

  // Check that specified columns exist
  for (const col of [index, columns, values]) {
    if (!frame.columns[col]) {
      throw new Error(`Column '${col}' not found`);
    }
  }

  // If frame is empty, return empty frame
  if (frame.rowCount === 0) {
    return createFrame({}, 0);
  }

  // Resolve aggregation function
  let aggregationFunction;
  if (typeof aggFunc === 'function') {
    aggregationFunction = aggFunc;
  } else if (typeof aggFunc === 'string') {
    switch (aggFunc.toLowerCase()) {
      case 'mean':
        aggregationFunction = arrayMean;
        break;
      case 'sum':
        aggregationFunction = arraySum;
        break;
      default:
        throw new Error(`Unknown aggregation function: ${aggFunc}`);
    }
  } else {
    throw new Error('aggFunc must be a function or a string');
  }

  // Get unique values for index and columns
  const uniqueIndices = getUniqueValues(frame.columns[index]);
  const uniqueColumns = getUniqueValues(frame.columns[columns]);

  /**
   * Group values by index and column
   * @type {GroupedData}
   */
  const groups = {};

  // Iterate through frame rows
  for (let i = 0; i < frame.rowCount; i++) {
    const indexValue = frame.columns[index][i];
    const columnValue = frame.columns[columns][i];
    const value = frame.columns[values][i];

    // Skip NaN, null, undefined
    if (
      indexValue === null ||
      indexValue === undefined ||
      columnValue === null ||
      columnValue === undefined
    ) {
      continue;
    }

    // Create string keys for lookup
    const indexKey = String(indexValue);
    const columnKey = String(columnValue);

    // Initialize group if not exists
    if (!groups[indexKey]) {
      groups[indexKey] = {};
    }

    // Initialize column array if not exists
    if (!groups[indexKey][columnKey]) {
      groups[indexKey][columnKey] = [];
    }

    // Add value to group
    groups[indexKey][columnKey].push(value);
  }

  /**
   * Create result columns
   * @type {ColumnData}
   */
  const newColumns = {
    _index: uniqueIndices,
  };

  // Create columns for unique values from columns
  for (const col of uniqueColumns) {
    // Use string representation for column name
    const colName = String(col);

    // Create array for column with 0 by default (instead of NaN)
    const colValues = new Array(uniqueIndices.length).fill(0);

    // Fill column with aggregated values
    for (let i = 0; i < uniqueIndices.length; i++) {
      const indexKey = String(uniqueIndices[i]);

      // If group exists and has values for this column, aggregate them
      if (groups[indexKey] && groups[indexKey][colName]) {
        colValues[i] = aggregationFunction(groups[indexKey][colName]);
      }
    }

    newColumns[colName] = colValues;
  }

  // Create result frame with toArray method
  const resultFrame = createFrame(newColumns, uniqueIndices.length);

  // Add toArray method for testing convenience
  // @ts-ignore - Ignore error since TinyFrame doesn't have toArray method
  resultFrame.toArray = function () {
    return frameToArray(this);
  };

  return resultFrame;
}
