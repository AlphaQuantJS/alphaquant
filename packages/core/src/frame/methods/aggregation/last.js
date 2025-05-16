/**
 * last.js - Gets last value in column
 */

import { validateColumn } from '../../createFrame.js';

/**
 * Type for last value retrieval strategy
 * @callback LastValueStrategy
 * @param {Array<any>|Float64Array} values - Array of values to search
 * @returns {any} - Last value
 */

// Object to store last value retrieval strategies
// Allows replacing the algorithm for testing
export const lastStrategies = {
  // Standard strategy (used by default)
  /**
   * @param {Array<any>|Float64Array} values
   * @returns {any}
   */
  default: function (values) {
    // Simply return the last element of the array
    if (values.length === 0) {
      return undefined;
    }

    const lastValue = values[values.length - 1];

    // If the last value is undefined, return undefined
    if (lastValue === undefined) {
      return undefined;
    }

    return lastValue;
  },

  // Strategy for tests (will be replaced in tests)
  /** @type {null|function(Array<any>|Float64Array): any} */
  test: null,
};

// Current strategy
let currentStrategy = 'default';

/**
 * Sets the last value retrieval strategy
 * Used only for testing
 *
 * @param {string} strategyName - Strategy name ('default' or 'test')
 * @param {function(Array<any>|Float64Array): any|null} [testStrategy] - Function for value retrieval (only for 'test')
 * @returns {void}
 */
export function setLastStrategy(strategyName, testStrategy) {
  if (strategyName === 'test' && testStrategy) {
    lastStrategies.test = testStrategy;
  }
  currentStrategy = strategyName;
}

/**
 * Resets strategy to standard
 * Used only for testing
 * @returns {void}
 */
export function resetLastStrategy() {
  currentStrategy = 'default';
  lastStrategies.test = null;
}

/**
 * Gets last value in column
 *
 * @param {import('../../createFrame.js').TinyFrame} frame - Input frame
 * @param {string} column - Column name
 * @returns {any} - Last value
 * @example
 * // Returns the last value in column 'price'
 * const lastPrice = last(frame, 'price');
 */
export function last(frame, column) {
  // Check if column exists
  if (!frame.columns[column]) {
    throw new Error(`Column '${column}' not found`);
  }

  // Check for empty frame
  if (frame.rowCount === 0) {
    return undefined; // For empty frame return undefined
  }

  // 1) If there are "raw" data - use them
  // This allows preserving original values (undefined, null)
  if (frame.rawColumns && frame.rawColumns[column]) {
    const rawValues = frame.rawColumns[column];
    return rawValues[rawValues.length - 1];
  }

  // 2) Otherwise use optimized data
  const values = frame.columns[column];

  if (values.length === 0) {
    return undefined;
  }

  return values[values.length - 1];
}
