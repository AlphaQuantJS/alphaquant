/**
 * groupByAgg.js - Main function for grouping and aggregating data
 */

import { validateColumn } from '../../createFrame.js';
import { fastNumericGroupBy } from './fastNumericGroupBy.js';
import { genericGroupBy } from './genericGroupBy.js';
import { isNumericArray } from './isNumericArray.js';

/**
 * @typedef {'sum'|'mean'|'count'|'min'|'max'|'first'|'last'} BuiltInAggregation
 * @typedef {(values: any[]) => any} CustomAggregationFunction
 * @typedef {BuiltInAggregation|CustomAggregationFunction} AggregationType
 */

/**
 * @typedef {Object} GroupByOptions
 * @property {boolean} [typedArrays=true] - Use TypedArrays for numeric results
 * @property {number} [expectedGroups=1024] - Expected number of groups (for memory allocation)
 * @property {boolean} [collectValues=false] - Collect all values for each group (for custom aggregations)
 */

/**
 * Groups data by specified columns and applies aggregation functions
 *
 * @param {import('../../createFrame.js').TinyFrame} frame - Input TinyFrame
 * @param {string|string[]} groupBy - Column(s) to group by
 * @param {Record<string, AggregationType|{column: string, aggType: AggregationType}>} aggregations - Column aggregations
 * @param {GroupByOptions} [options] - Configuration options
 * @returns {import('../../createFrame.js').TinyFrame} - Grouped TinyFrame
 */
export function groupByAgg(frame, groupBy, aggregations, options = {}) {
  // Validate input data
  if (!frame || !frame.columns || typeof frame.rowCount !== 'number') {
    throw new Error('Invalid TinyFrame');
  }

  if (!groupBy || (Array.isArray(groupBy) && groupBy.length === 0)) {
    throw new Error('groupBy must be a non-empty string or array');
  }

  if (!aggregations || Object.keys(aggregations).length === 0) {
    throw new Error('aggregations must be a non-empty object');
  }

  // Normalize options
  const opts = {
    typedArrays: true,
    expectedGroups: 1024,
    collectValues: false,
    ...options,
  };

  // Normalize groupBy to an array
  const groupByCols = Array.isArray(groupBy) ? groupBy : [groupBy];

  // Check if all groupBy columns exist
  for (const col of groupByCols) {
    validateColumn(frame, col);
  }

  // Normalize aggregations to format { column: string, aggType: string|function }
  /** @type {Record<string, { column: string, aggType: AggregationType|AggregationType[] }>} */
  const normalizedAggs = {};

  for (const [key, value] of Object.entries(aggregations)) {
    if (
      typeof value === 'string' ||
      typeof value === 'function' ||
      Array.isArray(value)
    ) {
      // Check if the key contains column name and aggregation type (e.g., value_sum)
      const parts = key.split('_');
      if (parts.length > 1 && !frame.columns[key]) {
        // This is a custom name for the result, use the last part as aggregation type
        const column = parts.slice(0, -1).join('_');

        // Check if the column exists
        if (frame.columns[column]) {
          validateColumn(frame, column);

          // Check if the aggregation type is valid
          if (typeof value === 'string' && !isValidAggregationType(value)) {
            throw new Error(`Invalid aggregation type: ${value}`);
          }

          normalizedAggs[key] = { column, aggType: value };
        } else {
          // If the column doesn't exist, but the key matches aggregation type (count, min, max, first, last)
          // or it's a custom function, use the first numeric column
          if (
            (typeof value === 'string' && isValidAggregationType(value)) ||
            typeof value === 'function'
          ) {
            // Find the first numeric column
            const numericCols = Object.keys(frame.columns).filter((col) => {
              const array = frame.columns[col];
              return (
                !groupByCols.includes(col) &&
                (array instanceof Float64Array || isNumericArray(array))
              );
            });

            if (numericCols.length > 0) {
              normalizedAggs[key] = { column: numericCols[0], aggType: value };
            } else {
              throw new Error(
                `No numeric columns found for aggregation: ${key}`,
              );
            }
          } else {
            throw new Error(`Invalid aggregation specification for ${key}`);
          }
        }
      } else {
        // This is a column name, check if it exists
        validateColumn(frame, key);

        // Check if the aggregation type is valid
        if (typeof value === 'string' && !isValidAggregationType(value)) {
          throw new Error(`Invalid aggregation type: ${value}`);
        }

        normalizedAggs[key] = { column: key, aggType: value };
      }
    } else if (
      typeof value === 'object' &&
      value !== null &&
      'column' in value &&
      'aggType' in value
    ) {
      // This is an object with explicit column and aggregation type
      validateColumn(frame, value.column);

      // Check if the aggregation type is valid
      if (
        typeof value.aggType === 'string' &&
        !isValidAggregationType(value.aggType)
      ) {
        throw new Error(`Invalid aggregation type: ${value.aggType}`);
      }

      normalizedAggs[key] = { column: value.column, aggType: value.aggType };
    } else {
      throw new Error(`Invalid aggregation specification for ${key}`);
    }
  }

  // Get unique columns for aggregation
  const aggCols = [
    ...new Set(Object.values(normalizedAggs).map((agg) => agg.column)),
  ];

  // Check if custom aggregation functions are used
  const hasCustomAggregations = Object.values(normalizedAggs).some(
    (agg) => typeof agg.aggType === 'function',
  );

  // If custom aggregations are used, use the generic implementation
  if (hasCustomAggregations || opts.collectValues) {
    return genericGroupBy(frame, groupByCols, normalizedAggs, opts);
  }

  // Check if all aggregation columns are numeric
  const allNumeric = aggCols.every((col) => {
    const array = frame.columns[col];
    return array instanceof Float64Array || isNumericArray(array);
  });

  // If all aggregation columns are numeric and no custom aggregations are used, use the fast implementation
  if (allNumeric) {
    return fastNumericGroupBy(frame, groupByCols, normalizedAggs, opts);
  }

  // Otherwise, use the generic implementation
  return genericGroupBy(frame, groupByCols, normalizedAggs, opts);
}

/**
 * Checks if the string is a valid aggregation type
 *
 * @param {string} aggType - Aggregation type
 * @returns {boolean} - true if the aggregation type is valid
 */
function isValidAggregationType(aggType) {
  const validTypes = ['sum', 'mean', 'count', 'min', 'max', 'first', 'last'];
  return validTypes.includes(aggType);
}
