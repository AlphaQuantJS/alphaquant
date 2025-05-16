/**
 * first.js - Gets first value in column
 */

import { validateColumn } from '../../createFrame.js';

/**
 * Type for first value retrieval strategy
 * @callback FirstValueStrategy
 * @param {Array<any>|Float64Array} values - Array of values to search
 * @returns {any} - First value
 */

// Object to store first value retrieval strategies
// Allows replacing the algorithm for testing
export const firstStrategies = {
  // Standard strategy (used by default)
  /**
   * @param {Array<any>|Float64Array} values
   * @returns {any}
   */
  default: function (values) {
    // Simply return the first element of the array
    if (values.length === 0) {
      return undefined;
    }

    const firstValue = values[0];

    // If the first value is undefined, return undefined
    if (firstValue === undefined) {
      return undefined;
    }

    return firstValue;
  },

  // Strategy for tests (will be replaced in tests)
  /** @type {null|function(Array<any>|Float64Array): any} */
  test: null,
};

// Current strategy
let currentStrategy = 'default';

/**
 * Sets the first value retrieval strategy
 * Used only for testing
 *
 * @param {string} strategyName - Strategy name ('default' or 'test')
 * @param {function(Array<any>|Float64Array): any|null} [testStrategy] - Function for value retrieval (only for 'test')
 * @returns {void}
 */
export function setFirstStrategy(strategyName, testStrategy) {
  if (strategyName === 'test' && testStrategy) {
    firstStrategies.test = testStrategy;
  }
  currentStrategy = strategyName;
}

/**
 * Resets strategy to standard
 * Used only for testing
 * @returns {void}
 */
export function resetFirstStrategy() {
  currentStrategy = 'default';
  firstStrategies.test = null;
}

/**
 * Gets first value in column
 *
 * @param {import('../../createFrame.js').TinyFrame} frame - Input frame
 * @param {string} column - Column name
 * @returns {any} - First value
 */
export function first(frame, column) {
  validateColumn(frame, column);

  // Check for empty frame
  if (frame.rowCount === 0) {
    return undefined; // For empty frame return undefined
  }

  const values = frame.columns[column];

  // Use the selected strategy
  const strategy =
    currentStrategy === 'default'
      ? firstStrategies.default
      : firstStrategies.test;
  if (!strategy) {
    // If test strategy is not set, use the standard one
    return firstStrategies.default(values);
  }
  return strategy(values);
}
