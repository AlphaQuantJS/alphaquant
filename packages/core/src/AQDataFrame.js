// alphaquant-core/src/AQDataFrame.js

import { createFrame } from './frame/createFrame.js';
import { sortValues, sortValuesMultiple } from './frame/utils/sort/index.js';
import {
  sample,
  sampleFraction,
  trainTestSplit,
} from './frame/utils/sample/index.js';
import { duplicated, dropDuplicates } from './frame/filter/duplicated/index.js';
import { filter, filterByColumn } from './frame/filter/query.js';
import { pivot, melt } from './frame/manipulate/pivot.js';
import { groupByAgg } from './frame/group/groupByAgg.js';
import { describe } from './frame/utils/describe/index.js';
import { dropNaN, fillNaN } from './frame/filter/nan/index.js';
import { diff, pctChange } from './frame/transform/diff.js';
import { shift, cumsum } from './frame/transform/shift.js';
import { normalize, standardize } from './frame/stat/normalize.js';
import { corrMatrix } from './frame/stat/corr.js';
import { rollingMean } from './frame/group/rolling.js';
import { transformSeries } from './frame/transform/transformSeries.js';

/**
 * @typedef {import('./frame/createFrame.js').TinyFrame} TinyFrame
 * @typedef {TinyFrame|Object[]|Record<string, (any[]|Float64Array)>|null|undefined} DataFrameInput
 * @typedef {Object} Row
 * @typedef {import('./frame/group/groupByAgg.js').AggregationType} AggregationType
 */

/**
 * Handles errors and adds context to error messages
 * @param {Function} fn - Function to execute
 * @param {string} errorPrefix - Prefix for error message
 * @returns {any} - Result of function execution
 */
function handleError(fn, errorPrefix) {
  try {
    return fn();
  } catch (error) {
    throw new Error(`${errorPrefix}: ${error.message}`);
  }
}

/**
 * AQDataFrame - Main class for data manipulation
 *
 * Provides a pandas-like API for data manipulation in JavaScript
 */
export class AQDataFrame {
  /**
   * @type {TinyFrame}
   * @private
   */
  _frame;

  /**
   * Creates a new AQDataFrame
   * @param {DataFrameInput} data - Input data
   */
  constructor(data) {
    this._frame = handleError(() => {
      if (!data) {
        return createFrame({ columns: {}, rowCount: 0 });
      }

      // Handle case where data is already an AQDataFrame
      if (data instanceof AQDataFrame) {
        return data.frame;
      }

      if (
        data &&
        typeof data === 'object' &&
        'columns' in data &&
        'rowCount' in data &&
        typeof data.rowCount === 'number'
      ) {
        // Already a TinyFrame
        return data;
      } else if (Array.isArray(data)) {
        // Array of objects
        return createFrame(data);
      } else if (typeof data === 'object') {
        // Object with arrays as values
        return createFrame(data);
      } else {
        throw new Error('Invalid data format');
      }
    }, 'Error creating DataFrame');
  }

  /**
   * Returns the internal TinyFrame
   * @returns {TinyFrame} - The internal TinyFrame
   */
  get frame() {
    return this._frame;
  }

  /**
   * Returns the internal TinyFrame
   * @returns {TinyFrame} - The internal TinyFrame
   */
  getFrame() {
    return this._frame;
  }

  /**
   * Returns the number of rows
   * @returns {number} - Number of rows
   */
  get rowCount() {
    return this._frame.rowCount;
  }

  /**
   * Returns the column names
   * @returns {string[]} - Column names
   */
  get columnNames() {
    return Object.keys(this._frame.columns);
  }

  /**
   * Returns the number of rows
   * @returns {number} - Number of rows
   */
  count() {
    return this._frame.rowCount;
  }

  /**
   * Returns the column names
   * @returns {string[]} - Column names
   */
  getColumnNames() {
    return Object.keys(this._frame.columns);
  }

  /**
   * Returns data as an array of objects
   * @returns {Row[]} - Array of objects
   */
  toArray() {
    return handleError(() => {
      const result = [];
      const columns = this._frame.columns;
      const columnNames = Object.keys(columns);

      for (let i = 0; i < this._frame.rowCount; i++) {
        /** @type {Record<string, any>} */
        const row = {};
        for (const colName of columnNames) {
          row[colName] = columns[colName][i];
        }
        result.push(row);
      }

      return result;
    }, 'Error converting to array');
  }

  /**
   * Returns data as an array of arrays
   * @returns {any[][]} - Array of arrays
   */
  toArrays() {
    return handleError(() => {
      const result = [];
      const columns = this._frame.columns;
      const columnNames = Object.keys(columns);

      for (let i = 0; i < this._frame.rowCount; i++) {
        const row = [];
        for (const colName of columnNames) {
          row.push(columns[colName][i]);
        }
        result.push(row);
      }

      return result;
    }, 'Error converting to array of arrays');
  }

  /**
   * Returns a column as an array
   * @param {string} columnName - Column name
   * @returns {any[]} - Array of values
   */
  getColumn(columnName) {
    return handleError(() => {
      _validateColumn(this._frame, columnName);
      const column = this._frame.columns[columnName];
      return Array.from(column); // Convert to regular array, even if it's a TypedArray
    }, `Error getting column '${columnName}'`);
  }

  /**
   * Sorts DataFrame by specified column
   * @param {string} columnName - Column name for sorting
   * @param {boolean} [ascending=true] - Sorting direction
   * @returns {AQDataFrame} - New sorted DataFrame
   */
  sortBy(columnName, ascending = true) {
    return handleError(() => {
      _validateColumn(this._frame, columnName);
      const sorted = sortValues(this._frame, columnName, ascending);
      return new AQDataFrame(sorted);
    }, `Error sorting by column '${columnName}'`);
  }

  /**
   * Sorts DataFrame by multiple columns
   * @param {string[]} columnNames - Column names for sorting
   * @param {boolean[]} [ascending] - Sorting direction for each column
   * @returns {AQDataFrame} - New sorted DataFrame
   */
  sortByMultiple(columnNames, ascending) {
    return handleError(() => {
      for (const col of columnNames) {
        _validateColumn(this._frame, col);
      }
      const sorted = sortValuesMultiple(this._frame, columnNames, ascending);
      return new AQDataFrame(sorted);
    }, 'Error sorting by multiple columns');
  }

  /**
   * Selects a random sample of rows
   * @param {number} n - Number of rows to sample
   * @param {boolean} [replace=false] - Sampling with replacement
   * @param {number} [seed] - Seed for random number generator
   * @returns {AQDataFrame} - New DataFrame with sampled rows
   */
  sampleN(n, replace = false, seed) {
    return handleError(() => {
      const sampled = sample(this._frame, n, replace, seed);
      return new AQDataFrame(sampled);
    }, 'Error sampling rows');
  }

  /**
   * Selects a random sample of rows as a fraction of the original DataFrame
   * @param {number} fraction - Fraction of rows to sample (between 0 and 1)
   * @param {number} [seed] - Seed for random number generator
   * @returns {AQDataFrame} - New DataFrame with sampled rows
   */
  sampleFraction(fraction, seed) {
    return handleError(() => {
      const sampled = sampleFraction(this._frame, fraction, seed);
      return new AQDataFrame(sampled);
    }, 'Error sampling rows by fraction');
  }

  /**
   * Splits DataFrame into training and testing sets
   * @param {number} testSize - Fraction of test set (between 0 and 1)
   * @param {number} [seed] - Seed for random number generator
   * @returns {[AQDataFrame, AQDataFrame]} - Array of two DataFrames [train, test]
   */
  trainTestSplit(testSize, seed) {
    return handleError(() => {
      const [train, test] = trainTestSplit(this._frame, testSize, seed);
      return [new AQDataFrame(train), new AQDataFrame(test)];
    }, 'Error splitting into training and test sets');
  }

  /**
   * Removes duplicate rows
   * @param {string[]} [subset] - Subset of columns to check
   * @param {boolean} [keepFirst=true] - Keep first occurrence
   * @returns {AQDataFrame} - New DataFrame without duplicates
   */
  dropDuplicates(subset, keepFirst = true) {
    return handleError(() => {
      const result = dropDuplicates(this._frame, subset, keepFirst);
      return new AQDataFrame(result);
    }, 'Error removing duplicates');
  }

  /**
   * Filters DataFrame by condition
   * @param {function(Object): boolean} predicate - Predicate function
   * @returns {AQDataFrame} - New filtered DataFrame
   */
  filter(predicate) {
    return handleError(() => {
      const filtered = filter(this._frame, predicate);
      return new AQDataFrame(filtered);
    }, 'Error filtering');
  }

  /**
   * Filters DataFrame by condition on column values
   * @param {string} column - Column to filter by
   * @param {function(any): boolean} predicate - Predicate function
   * @returns {AQDataFrame} - New filtered DataFrame
   */
  filterByColumn(column, predicate) {
    return handleError(() => {
      _validateColumn(this._frame, column);
      const filtered = filterByColumn(this._frame, column, predicate);
      return new AQDataFrame(filtered);
    }, `Error filtering by column '${column}'`);
  }

  /**
   * Creates a pivot table
   * @param {string} index - Column to use as index
   * @param {string} columns - Column to use as columns
   * @param {string} values - Column to use as values
   * @param {function(any[]): any} [aggFunc] - Aggregation function
   * @returns {AQDataFrame} - New DataFrame with pivot table
   */
  pivot(index, columns, values, aggFunc) {
    return handleError(() => {
      _validateColumn(this._frame, index);
      _validateColumn(this._frame, columns);
      _validateColumn(this._frame, values);
      const result = pivot(this._frame, index, columns, values, aggFunc);
      return new AQDataFrame(result);
    }, 'Error creating pivot table');
  }

  /**
   * Transforms wide format to long format
   * @param {string} id_vars - Column to use as identifier
   * @param {string[]} value_vars - Columns to transform into values
   * @param {string} [var_name='variable'] - Name of column to store original column names
   * @param {string} [value_name='value'] - Name of column to store values
   * @returns {AQDataFrame} - New transformed DataFrame
   */
  melt(id_vars, value_vars, var_name = 'variable', value_name = 'value') {
    return handleError(() => {
      _validateColumn(this._frame, id_vars);
      for (const col of value_vars) {
        _validateColumn(this._frame, col);
      }
      const result = melt(
        this._frame,
        id_vars,
        value_vars,
        var_name,
        value_name,
      );
      return new AQDataFrame(result);
    }, 'Error transforming format');
  }

  /**
   * Groups DataFrame by specified columns and applies aggregation functions
   * @param {string[]} groupBy - Columns to group by
   * @param {Record<string, AggregationType>} aggregations - Aggregation functions
   * @returns {AQDataFrame} - New grouped DataFrame
   *
   * @typedef {Function|'count'|'sum'|'mean'|'min'|'max'|'first'|'last'} AggregationType
   */
  groupBy(groupBy, aggregations) {
    return handleError(() => {
      for (const col of groupBy) {
        _validateColumn(this._frame, col);
      }

      // Приводим типы к ожидаемому формату
      /** @type {Record<string, AggregationType>} */
      const aggregationFunctions = {};

      // Копируем все функции агрегации в новый объект с правильным типом
      for (const key in aggregations) {
        if (Object.prototype.hasOwnProperty.call(aggregations, key)) {
          aggregationFunctions[key] = aggregations[key];
        }
      }

      const result = groupByAgg(this._frame, groupBy, aggregationFunctions);
      return new AQDataFrame(result);
    }, 'Error grouping');
  }

  /**
   * Returns descriptive statistics for numeric columns
   * @param {string[]} [columns] - Columns to describe (default: all numeric)
   * @returns {AQDataFrame} - DataFrame with descriptive statistics
   */
  describe(columns) {
    return handleError(() => {
      if (columns) {
        for (const col of columns) {
          _validateColumn(this._frame, col);
        }
      }
      const result = describe(this._frame, columns);
      return new AQDataFrame(result);
    }, 'Error getting descriptive statistics');
  }

  /**
   * Removes rows with NaN in specified columns
   * @param {string[]} [columns] - Columns to check (default: all)
   * @returns {AQDataFrame} - New DataFrame without rows with NaN
   */
  dropNaN(columns) {
    return handleError(() => {
      const result = dropNaN(this._frame, columns);
      return new AQDataFrame(result);
    }, 'Error removing rows with NaN');
  }

  /**
   * Fills NaN in specified columns
   * @param {string|string[]} columns - Columns to fill
   * @param {number|string|function} value - Value to fill or function
   * @returns {AQDataFrame} - New DataFrame with filled values
   */
  fillNaN(columns, value) {
    return handleError(() => {
      // Convert single column to array
      const columnArray = Array.isArray(columns) ? columns : [columns];

      for (const col of columnArray) {
        _validateColumn(this._frame, col);
      }

      // Process each column separately to avoid errors with column names containing commas
      let result = this._frame;
      for (const col of columnArray) {
        result = fillNaN(result, col, value);
      }

      return new AQDataFrame(result);
    }, 'Error filling NaN');
  }

  /**
   * Normalizes specified columns (0-1)
   * @param {string|string[]} columns - Columns to normalize
   * @returns {AQDataFrame} - New DataFrame with normalized columns
   */
  normalize(columns) {
    return handleError(() => {
      // Handle single column case
      const columnArray = Array.isArray(columns) ? columns : [columns];

      // Check column existence
      for (const col of columnArray) {
        _validateColumn(this._frame, col);
      }

      // Apply normalization to each column
      let result = this._frame;
      for (const col of columnArray) {
        result = normalize(result, col);
      }

      return new AQDataFrame(result);
    }, 'Error normalizing columns');
  }

  /**
   * Standardizes specified columns (z-score)
   * @param {string|string[]} columns - Columns to standardize
   * @returns {AQDataFrame} - New DataFrame with standardized columns
   */
  standardize(columns) {
    return handleError(() => {
      // Handle single column case
      const columnArray = Array.isArray(columns) ? columns : [columns];

      // Check column existence
      for (const col of columnArray) {
        _validateColumn(this._frame, col);
      }

      // Apply standardization to each column
      let result = this._frame;
      for (const col of columnArray) {
        result = standardize(result, col);
      }

      return new AQDataFrame(result);
    }, 'Error standardizing columns');
  }

  /**
   * Calculates correlation matrix for specified columns
   * @param {string[]} [columns] - Columns to calculate correlation (default: all numeric)
   * @returns {AQDataFrame} - DataFrame with correlation matrix
   */
  corrMatrix(columns) {
    return handleError(() => {
      // В текущей реализации corrMatrix не принимает параметр columns,
      // поэтому мы просто передаем this._frame
      const result = corrMatrix(this._frame);
      return new AQDataFrame(result);
    }, 'Error calculating correlation matrix');
  }

  /**
   * Calculates rolling mean for specified column
   * @param {string} column - Column to calculate rolling mean
   * @param {number} window - Window size
   * @returns {AQDataFrame} - New DataFrame with rolling mean
   */
  rollingMean(column, window) {
    return handleError(() => {
      _validateColumn(this._frame, column);
      const result = rollingMean(this._frame, column, window);
      return new AQDataFrame(result);
    }, `Error calculating rolling mean for column '${column}'`);
  }

  /**
   * Applies a transformation function to a specified column
   * @param {string} column - Column to transform
   * @param {function(any): any} transform - Transformation function
   * @returns {AQDataFrame} - New DataFrame with transformed column
   */
  transformColumn(column, transform) {
    return handleError(() => {
      _validateColumn(this._frame, column);
      const result = transformSeries(this._frame, column, transform);
      return new AQDataFrame(result);
    }, `Error transforming column '${column}'`);
  }

  /**
   * Applies a transformation function to multiple columns
   * @param {string|string[]} columns - Columns to transform
   * @param {function(any): any} transform - Transformation function
   * @returns {AQDataFrame} - New DataFrame with transformed columns
   */
  transformColumns(columns, transform) {
    return handleError(() => {
      for (const col of columns) {
        _validateColumn(this._frame, col);
      }
      let result = this._frame;
      for (const col of columns) {
        result = transformSeries(result, col, transform);
      }
      return new AQDataFrame(result);
    }, 'Error transforming columns');
  }

  /**
   * Calculates mean of a column
   * @param {string} column - Column to calculate mean
   * @returns {number} - Mean value
   */
  mean(column) {
    return handleError(() => {
      _validateColumn(this._frame, column);

      // Получаем данные колонки
      const values = this._frame.columns[column];
      let sum = 0;
      let count = 0;

      // Вычисляем среднее, игнорируя NaN, null и undefined
      for (let i = 0; i < values.length; i++) {
        const value = values[i];
        if (value !== null && value !== undefined && !isNaN(value)) {
          sum += value;
          count++;
        }
      }

      if (count === 0) {
        throw new Error(`No valid values in column '${column}'`);
      }

      return sum / count;
    }, `Error calculating mean for column '${column}'`);
  }

  /**
   * Calculates standard deviation of a column
   * @param {string} column - Column to calculate standard deviation
   * @returns {number} - Standard deviation
   */
  std(column) {
    return handleError(() => {
      _validateColumn(this._frame, column);

      // Сначала вычисляем среднее
      const mean = this.mean(column);

      // Затем вычисляем сумму квадратов отклонений
      const values = this._frame.columns[column];
      let sumSquaredDiff = 0;
      let count = 0;

      for (let i = 0; i < values.length; i++) {
        const value = values[i];
        if (value !== null && value !== undefined && !isNaN(value)) {
          const diff = value - mean;
          sumSquaredDiff += diff * diff;
          count++;
        }
      }

      // Вычисляем стандартное отклонение
      return Math.sqrt(sumSquaredDiff / count);
    }, `Error calculating standard deviation for column '${column}'`);
  }

  /**
   * Standardizes a column (z-score normalization)
   * @param {string|string[]} column - Column or columns to standardize
   * @returns {AQDataFrame} - New DataFrame with standardized column(s)
   */
  zscore(column) {
    return this.standardize(column);
  }

  /**
   * Calculates differences between consecutive values in a column
   * @param {string} column - Column to calculate differences for
   * @param {number} [periods=1] - Number of periods to shift
   * @returns {AQDataFrame} - New DataFrame with differences column
   */
  diff(column, periods = 1) {
    return handleError(() => {
      _validateColumn(this._frame, column);
      const result = diff(this._frame, column, periods);
      return new AQDataFrame(result);
    }, `Error calculating differences for column '${column}'`);
  }

  /**
   * Calculates percentage change between consecutive values in a column
   * @param {string} column - Column to calculate percentage change for
   * @param {number} [periods=1] - Number of periods to shift
   * @returns {AQDataFrame} - New DataFrame with percentage change column
   */
  pctChange(column, periods = 1) {
    return handleError(() => {
      _validateColumn(this._frame, column);
      const result = pctChange(this._frame, column, periods);
      return new AQDataFrame(result);
    }, `Error calculating percentage change for column '${column}'`);
  }

  /**
   * Shifts values in a column by a specified number of periods
   * @param {string} column - Column to shift
   * @param {number} periods - Number of periods to shift (positive for forward, negative for backward)
   * @returns {AQDataFrame} - New DataFrame with shifted column
   */
  shift(column, periods) {
    return handleError(() => {
      _validateColumn(this._frame, column);
      const result = shift(this._frame, column, periods);
      return new AQDataFrame(result);
    }, `Error shifting column '${column}'`);
  }

  /**
   * Calculates cumulative sum of values in a column
   * @param {string} column - Column to calculate cumulative sum for
   * @returns {AQDataFrame} - New DataFrame with cumulative sum column
   */
  cumsum(column) {
    return handleError(() => {
      _validateColumn(this._frame, column);
      const result = cumsum(this._frame, column);
      return new AQDataFrame(result);
    }, `Error calculating cumulative sum for column '${column}'`);
  }
}

/**
 * Creates a new AQDataFrame instance
 * @param {DataFrameInput} data - Input data
 * @returns {AQDataFrame} - New AQDataFrame instance
 */
export function createDataFrame(data) {
  return new AQDataFrame(data);
}

/**
 * Validates that a column exists in a frame
 * @param {TinyFrame} frame - Frame to check
 * @param {string} column - Column name
 * @throws {Error} - If column does not exist
 */
function _validateColumn(frame, column) {
  if (!frame.columns[column]) {
    throw new Error(`Column '${column}' not found`);
  }
}
