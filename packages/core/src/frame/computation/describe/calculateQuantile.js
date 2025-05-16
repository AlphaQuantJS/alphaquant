/**
 * calculateQuantile.js - Calculates the quantile of a distribution
 */

/**
 * Calculates the quantile of a distribution
 *
 * @param {number[]} sortedValues - Sorted array of values
 * @param {number} q - Quantile (between 0 and 1)
 * @returns {number} - Quantile value
 */
export function calculateQuantile(sortedValues, q) {
  if (sortedValues.length === 0) {
    return NaN;
  }

  if (sortedValues.length === 1) {
    return sortedValues[0];
  }

  const pos = q * (sortedValues.length - 1);
  const base = Math.floor(pos);
  const rest = pos - base;

  if (base + 1 < sortedValues.length) {
    return (
      sortedValues[base] + rest * (sortedValues[base + 1] - sortedValues[base])
    );
  } else {
    return sortedValues[base];
  }
}
