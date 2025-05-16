/**
 * calculateRollingMeanDirect.js - Direct calculation of rolling mean (better for small windows)
 */

/**
 * Direct calculation of rolling mean (better for small windows)
 * Optimized using a sliding window instead of a double loop
 *
 * @param {number[]|Float64Array} values - Input values
 * @param {number} windowSize - Size of the sliding window
 * @param {Float64Array} result - Array for storing results
 * @returns {Float64Array} - Array of rolling means
 */
export function calculateRollingMeanDirect(values, windowSize, result) {
  const n = values.length;

  // If the array is empty or the window is larger than the array, return NaN
  if (n === 0 || windowSize > n) {
    result.fill(NaN);
    return result;
  }

  // Fill initial values with NaN
  for (let i = 0; i < windowSize - 1; i++) {
    result[i] = NaN;
  }

  // Create a validity mask for the entire array
  const isValid = new Array(n);
  for (let i = 0; i < n; i++) {
    const val = values[i];
    isValid[i] = val !== null && val !== undefined && !Number.isNaN(val);
  }

  // Initialize the first window
  let sum = 0;
  let validCount = 0;

  for (let i = 0; i < windowSize; i++) {
    if (isValid[i]) {
      sum += values[i];
      validCount++;
    }
  }

  // Set the result for the first complete window
  result[windowSize - 1] = validCount === windowSize ? sum / windowSize : NaN;

  // Use a sliding window for the remaining positions
  for (let i = windowSize; i < n; i++) {
    // Remove the value leaving the window
    if (isValid[i - windowSize]) {
      sum -= values[i - windowSize];
      validCount--;
    }

    // Add the value entering the window
    if (isValid[i]) {
      sum += values[i];
      validCount++;
    }

    // Calculate the mean
    result[i] = validCount === windowSize ? sum / windowSize : NaN;
  }

  return result;
}
