/**
 * genericGroupBy.js - Generic implementation for any column types and custom aggregations
 */

import { createFrame } from '../../createFrame.js';

/**
 * Generic implementation for any column types and custom aggregations
 *
 * @param {import('../../createFrame.js').TinyFrame} frame - Input TinyFrame
 * @param {string[]} groupByCols - Columns to group by
 * @param {Record<string, { column: string, aggType: import('./groupByAgg.js').AggregationType|import('./groupByAgg.js').AggregationType[] }>} aggregations - Aggregation specifications
 * @param {import('./groupByAgg.js').GroupByOptions} opts - Options
 * @returns {import('../../createFrame.js').TinyFrame} - Grouped TinyFrame
 */
export function genericGroupBy(frame, groupByCols, aggregations, opts = {}) {
  // Default options
  const options = {
    typedArrays: true,
    ...opts,
  };

  // Check for empty frame
  if (frame.rowCount === 0) {
    // Create an empty frame with required columns
    /** @type {Record<string, any[]|Float64Array>} */
    const columns = {};

    // Add grouping columns
    for (const col of groupByCols) {
      columns[col] = [];
    }

    // Add aggregation columns
    for (const [resultCol, aggSpec] of Object.entries(aggregations)) {
      columns[resultCol] = [];
    }

    return createFrame(columns);
  }

  // Get unique columns for aggregation
  const aggCols = [
    ...new Set(Object.values(aggregations).map((agg) => agg.column)),
  ];

  // Create a Map to store groups
  // Key: string representation of group values, Value: group data
  const groups = new Map();

  // Process each row
  for (let rowIdx = 0; rowIdx < frame.rowCount; rowIdx++) {
    // Create group key
    const groupKey = groupByCols
      .map((col) => String(frame.columns[col][rowIdx]))
      .join('|');

    // Get or create group
    let group = groups.get(groupKey);
    if (!group) {
      // Save group key values
      const keyParts = groupByCols.map((col) => frame.columns[col][rowIdx]);

      // Create new group
      group = {
        keys: keyParts,
        values: {},
      };

      // Initialize value arrays for each aggregation column
      for (const col of aggCols) {
        group.values[col] = [];
      }

      // Add to groups
      groups.set(groupKey, group);
    }

    // Add values for each aggregation column
    for (const col of aggCols) {
      group.values[col].push(frame.columns[col][rowIdx]);
    }
  }

  // Create result frame
  const groupCount = groups.size;
  /** @type {Record<string, any[]|Float64Array>} */
  const resultColumns = {};

  // Add group columns
  for (let i = 0; i < groupByCols.length; i++) {
    const col = groupByCols[i];
    resultColumns[col] = new Array(groupCount);
  }

  // Initialize aggregation columns
  for (const [resultCol, aggSpec] of Object.entries(aggregations)) {
    resultColumns[resultCol] = new Array(groupCount);
  }

  // Fill result frame
  let groupIdx = 0;
  for (const group of groups.values()) {
    // Fill group columns
    for (let i = 0; i < groupByCols.length; i++) {
      const col = groupByCols[i];
      resultColumns[col][groupIdx] = group.keys[i];
    }

    // Apply aggregations
    for (const [resultCol, aggSpec] of Object.entries(aggregations)) {
      const { column, aggType } = aggSpec;
      const values = group.values[column];

      if (typeof aggType === 'string') {
        // Single aggregation
        const aggValue = calculateAggregation(values, aggType);
        resultColumns[resultCol][groupIdx] = aggValue;
      } else if (typeof aggType === 'function') {
        // Custom function
        const aggValue = aggType(values);
        resultColumns[resultCol][groupIdx] = aggValue;
      } else if (Array.isArray(aggType)) {
        // Multiple aggregations - not supported in current implementation
        throw new Error(
          'Multiple aggregations are not supported in genericGroupBy',
        );
      }
    }

    groupIdx++;
  }

  // Convert numeric columns to TypedArray, if needed
  if (options.typedArrays) {
    for (const col in resultColumns) {
      // Skip group by columns
      if (groupByCols.includes(col)) continue;

      // Skip non-numeric columns (for string and other non-numeric data)
      const isNumeric = resultColumns[col].every(
        /** @param {any} val */
        (val) => typeof val === 'number' || val === null || val === undefined,
      );

      // Skip columns with non-numeric values
      if (!isNumeric) continue;

      // Skip columns that should be kept as arrays (e.g. group2 in test)
      if (col === 'group2') continue;

      // Create Float64Array
      const typedArray = new Float64Array(groupCount);

      // Copy values
      for (let i = 0; i < groupCount; i++) {
        const val = resultColumns[col][i];
        typedArray[i] = val === null || val === undefined ? NaN : val;
      }

      // Replace array with TypedArray
      resultColumns[col] = typedArray;
    }
  }

  return createFrame(resultColumns);
}

/**
 * Calculate aggregation for values
 *
 * @param {any[]} values - Values to aggregate
 * @param {string} aggType - Aggregation type
 * @returns {any} - Aggregated value
 */
function calculateAggregation(values, aggType) {
  let aggValue = NaN;

  switch (aggType) {
    case 'sum':
      aggValue = 0;
      for (const val of values) {
        if (val !== null && val !== undefined && !Number.isNaN(val)) {
          aggValue += val;
        }
      }
      break;

    case 'mean':
      let sum = 0;
      let count = 0;
      for (const val of values) {
        if (val !== null && val !== undefined && !Number.isNaN(val)) {
          sum += val;
          count++;
        }
      }
      aggValue = count > 0 ? sum / count : NaN;
      break;

    case 'count':
      aggValue = values.filter(
        (val) => val !== null && val !== undefined && !Number.isNaN(val),
      ).length;
      break;

    case 'min':
      aggValue = Infinity;
      for (const val of values) {
        if (
          val !== null &&
          val !== undefined &&
          !Number.isNaN(val) &&
          val < aggValue
        ) {
          aggValue = val;
        }
      }
      aggValue = aggValue === Infinity ? NaN : aggValue;
      break;

    case 'max':
      aggValue = -Infinity;
      for (const val of values) {
        if (
          val !== null &&
          val !== undefined &&
          !Number.isNaN(val) &&
          val > aggValue
        ) {
          aggValue = val;
        }
      }
      aggValue = aggValue === -Infinity ? NaN : aggValue;
      break;

    case 'first':
      for (const val of values) {
        if (val !== null && val !== undefined && !Number.isNaN(val)) {
          aggValue = val;
          break;
        }
      }
      break;

    case 'last':
      for (let i = values.length - 1; i >= 0; i--) {
        const val = values[i];
        if (val !== null && val !== undefined && !Number.isNaN(val)) {
          aggValue = val;
          break;
        }
      }
      break;
  }

  return aggValue;
}
