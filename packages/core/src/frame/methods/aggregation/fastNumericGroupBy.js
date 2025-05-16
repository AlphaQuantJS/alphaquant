/**
 * fastNumericGroupBy.js - Fast implementation for numeric columns with built-in aggregations
 */

import { createFrame } from '../../createFrame.js';

/**
 * Fast implementation for numeric columns with built-in aggregations
 *
 * @param {import('../../createFrame.js').TinyFrame} frame - Input TinyFrame
 * @param {string[]} groupByCols - Columns to group by
 * @param {Record<string, { column: string, aggType: string|Function }>} aggregations - Aggregation specifications
 * @param {import('./groupByAgg.js').GroupByOptions} opts - Options
 * @returns {import('../../createFrame.js').TinyFrame} - Grouped TinyFrame
 */
export function fastNumericGroupBy(
  frame,
  groupByCols,
  aggregations,
  opts = {},
) {
  // Default options
  const options = {
    typedArrays: true,
    expectedGroups: 1000,
    ...opts,
  };

  // Check if the frame is empty
  if (frame.rowCount === 0) {
    // Create an empty frame with required columns
    /** @type {Record<string, any[]|Float64Array>} */
    const columns = {};

    // Add grouping columns
    for (const col of groupByCols) {
      columns[col] = [];
    }

    // Add aggregation columns
    for (const resultCol of Object.keys(aggregations)) {
      columns[resultCol] = [];
    }

    return createFrame(columns);
  }

  // Get unique columns for aggregation
  const aggCols = [
    ...new Set(Object.values(aggregations).map((agg) => agg.column)),
  ];

  // Create a map to store groups
  // Key: string representation of group values, Value: group index
  const groupMap = new Map();

  // Array to store unique group values
  const uniqueGroups = [];

  // Process each row
  for (let rowIdx = 0; rowIdx < frame.rowCount; rowIdx++) {
    // Create group key
    const groupKey = groupByCols
      .map((col) => String(frame.columns[col][rowIdx]))
      .join('|');

    // Get or create group
    let groupIdx = groupMap.get(groupKey);
    if (groupIdx === undefined) {
      // Save group key values
      const keyParts = groupByCols.map((col) => frame.columns[col][rowIdx]);

      // Create new group
      uniqueGroups.push(keyParts);

      // Add to map
      groupIdx = uniqueGroups.length - 1;
      groupMap.set(groupKey, groupIdx);
    }
  }

  // Number of unique groups
  const groupCount = uniqueGroups.length;

  // Create result columns
  /** @type {Record<string, any[]|Float64Array>} */
  const resultColumns = {};

  // Add grouping columns
  for (let i = 0; i < groupByCols.length; i++) {
    const col = groupByCols[i];
    resultColumns[col] = new Array(groupCount);

    // Fill group values
    for (let groupIdx = 0; groupIdx < groupCount; groupIdx++) {
      resultColumns[col][groupIdx] = uniqueGroups[groupIdx][i];
    }
  }

  // Initialize result columns
  for (const resultCol of Object.keys(aggregations)) {
    resultColumns[resultCol] = options.typedArrays
      ? new Float64Array(groupCount)
      : new Array(groupCount);
  }

  // Create arrays for aggregations
  /** @type {Record<string, Record<string, Float64Array|Uint8Array>>} */
  const aggregationArrays = {};

  // Initialize aggregation arrays
  for (const col of aggCols) {
    // Initialize object for column if it doesn't exist
    aggregationArrays[col] = {};

    // Get all aggregation types for this column
    const aggTypes = new Set();
    for (const [_, aggSpec] of Object.entries(aggregations)) {
      if (aggSpec.column === col) {
        if (typeof aggSpec.aggType === 'string') {
          aggTypes.add(aggSpec.aggType);
        } else if (typeof aggSpec.aggType === 'function') {
          aggTypes.add('custom');
        }
      }
    }

    // Initialize arrays for each aggregation type
    for (const aggType of aggTypes) {
      switch (aggType) {
        case 'sum':
        case 'mean':
          aggregationArrays[col].sum = new Float64Array(groupCount);
          aggregationArrays[col].count = new Float64Array(groupCount);
          break;
        case 'count':
          aggregationArrays[col].count = new Float64Array(groupCount);
          break;
        case 'min':
          aggregationArrays[col].min = new Float64Array(groupCount).fill(
            Infinity,
          );
          break;
        case 'max':
          aggregationArrays[col].max = new Float64Array(groupCount).fill(
            -Infinity,
          );
          break;
        case 'first':
          aggregationArrays[col].first = new Float64Array(groupCount).fill(NaN);
          aggregationArrays[col].firstSet = new Uint8Array(groupCount);
          break;
        case 'last':
          aggregationArrays[col].last = new Float64Array(groupCount);
          break;
        case 'custom':
          aggregationArrays[col].custom = new Float64Array(groupCount);
          break;
      }
    }
  }

  // Process each row and aggregate data
  for (let rowIdx = 0; rowIdx < frame.rowCount; rowIdx++) {
    // Create group key
    const groupKey = groupByCols
      .map((col) => String(frame.columns[col][rowIdx]))
      .join('|');

    // Get group index
    const groupIdx = groupMap.get(groupKey);

    // Aggregate data for each column
    for (const col of aggCols) {
      // Check if column exists
      if (!frame.columns[col]) {
        continue;
      }

      const value = frame.columns[col][rowIdx];

      // Skip NaN, null, undefined
      if (value === null || value === undefined || Number.isNaN(value)) {
        continue;
      }

      // Apply aggregations
      if (aggregationArrays[col].sum !== undefined) {
        aggregationArrays[col].sum[groupIdx] += value;
        aggregationArrays[col].count[groupIdx]++;
      } else if (aggregationArrays[col].count !== undefined) {
        aggregationArrays[col].count[groupIdx]++;
      }

      if (aggregationArrays[col].min !== undefined) {
        aggregationArrays[col].min[groupIdx] = Math.min(
          aggregationArrays[col].min[groupIdx],
          value,
        );
      }

      if (aggregationArrays[col].max !== undefined) {
        aggregationArrays[col].max[groupIdx] = Math.max(
          aggregationArrays[col].max[groupIdx],
          value,
        );
      }

      if (
        aggregationArrays[col].first !== undefined &&
        !aggregationArrays[col].firstSet[groupIdx]
      ) {
        aggregationArrays[col].first[groupIdx] = value;
        aggregationArrays[col].firstSet[groupIdx] = 1;
      }

      if (aggregationArrays[col].last !== undefined) {
        aggregationArrays[col].last[groupIdx] = value;
      }

      if (aggregationArrays[col].custom !== undefined) {
        // Find aggregation key for this column
        const aggKey = Object.keys(aggregations).find(
          (key) =>
            aggregations[key].column === col &&
            typeof aggregations[key].aggType === 'function',
        );

        if (aggKey && typeof aggregations[aggKey].aggType === 'function') {
          aggregationArrays[col].custom[groupIdx] = aggregations[
            aggKey
          ].aggType(value, rowIdx, frame);
        }
      }
    }
  }

  // Apply aggregations for each result column
  for (const [resultCol, aggSpec] of Object.entries(aggregations)) {
    const { column, aggType } = aggSpec;

    // Check if column exists
    if (!aggregationArrays[column]) {
      continue;
    }

    if (typeof aggType === 'string') {
      // Single aggregation
      for (let groupIdx = 0; groupIdx < groupCount; groupIdx++) {
        const aggValue = calculateAggregation(
          aggregationArrays[column],
          aggType,
          groupIdx,
        );
        resultColumns[resultCol][groupIdx] = aggValue;
      }
    } else if (typeof aggType === 'function') {
      // Custom aggregation
      for (let groupIdx = 0; groupIdx < groupCount; groupIdx++) {
        resultColumns[resultCol][groupIdx] =
          aggregationArrays[column].custom[groupIdx];
      }
    }
  }

  // Convert string columns to regular arrays
  for (const col of groupByCols) {
    // Check if all values in column are of the same type
    const allSameType = resultColumns[col].every(
      (val, _, arr) => typeof val === typeof arr[0],
    );

    // If all values are strings, leave as is
    if (allSameType && typeof resultColumns[col][0] === 'string') {
      continue;
    }

    // If all values are numbers, convert to TypedArray
    if (
      allSameType &&
      typeof resultColumns[col][0] === 'number' &&
      options.typedArrays
    ) {
      const typedArray = new Float64Array(groupCount);
      for (let i = 0; i < groupCount; i++) {
        typedArray[i] = resultColumns[col][i];
      }
      resultColumns[col] = typedArray;
    }
  }

  return createFrame(resultColumns);
}

/**
 * Calculates the aggregation value for a group
 *
 * @param {Record<string, Float64Array|Uint8Array>} aggregationArrays - Aggregation arrays
 * @param {string} aggType - Aggregation type
 * @param {number} groupIdx - Group index
 * @returns {number} - Aggregation result
 */
function calculateAggregation(aggregationArrays, aggType, groupIdx) {
  switch (aggType) {
    case 'mean':
      const count = aggregationArrays.count[groupIdx];
      return count > 0 ? aggregationArrays.sum[groupIdx] / count : NaN;
    case 'sum':
      return aggregationArrays.sum[groupIdx];
    case 'count':
      return aggregationArrays.count[groupIdx];
    case 'min':
      const min = aggregationArrays.min[groupIdx];
      return min === Infinity ? NaN : min;
    case 'max':
      const max = aggregationArrays.max[groupIdx];
      return max === -Infinity ? NaN : max;
    case 'first':
      return aggregationArrays.first[groupIdx];
    case 'last':
      return aggregationArrays.last[groupIdx];
    default:
      return NaN;
  }
}
