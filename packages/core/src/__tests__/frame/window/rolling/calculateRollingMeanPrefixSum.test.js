/**
 * calculateRollingMeanPrefixSum.test.js - Tests for calculating rolling mean using prefix sums algorithm
 */

import { calculateRollingMeanPrefixSum } from '../../../../frame/window/rolling/calculateRollingMeanPrefixSum';

describe('calculateRollingMeanPrefixSum', () => {
  test('should correctly calculate rolling mean for simple values', () => {
    const values = [1, 2, 3, 4, 5];
    const windowSize = 3;
    const result = new Float64Array(values.length);

    calculateRollingMeanPrefixSum(values, windowSize, result);

    // First two values should be NaN (window not filled)
    expect(isNaN(result[0])).toBe(true);
    expect(isNaN(result[1])).toBe(true);

    // The rest should be calculated
    expect(result[2]).toBe(2); // (1+2+3)/3
    expect(result[3]).toBe(3); // (2+3+4)/3
    expect(result[4]).toBe(4); // (3+4+5)/3
  });

  test('should handle NaN values', () => {
    const values = [1, NaN, 3, 4, 5];
    const windowSize = 3;
    const result = new Float64Array(values.length);

    calculateRollingMeanPrefixSum(values, windowSize, result);

    // First two values should be NaN (window not filled)
    expect(isNaN(result[0])).toBe(true);
    expect(isNaN(result[1])).toBe(true);

    // Windows with NaN should result in NaN
    expect(isNaN(result[2])).toBe(true); // (1+NaN+3)/3
    expect(isNaN(result[3])).toBe(true); // (NaN+3+4)/3
    expect(result[4]).toBe(4); // (3+4+5)/3
  });

  test('should handle null and undefined values', () => {
    const values = [1, null, 3, undefined, 5];
    const windowSize = 3;
    const result = new Float64Array(values.length);

    calculateRollingMeanPrefixSum(values, windowSize, result);

    // First two values should be NaN (window not filled)
    expect(isNaN(result[0])).toBe(true);
    expect(isNaN(result[1])).toBe(true);

    // Windows with null/undefined should result in NaN
    expect(isNaN(result[2])).toBe(true); // (1+null+3)/3
    expect(isNaN(result[3])).toBe(true); // (null+3+undefined)/3
    expect(isNaN(result[4])).toBe(true); // (3+undefined+5)/3
  });

  test('should handle window size of 1', () => {
    const values = [1, 2, 3, 4, 5];
    const windowSize = 1;
    const result = new Float64Array(values.length);

    calculateRollingMeanPrefixSum(values, windowSize, result);

    // All values should be the same as the original ones
    expect(result[0]).toBe(1);
    expect(result[1]).toBe(2);
    expect(result[2]).toBe(3);
    expect(result[3]).toBe(4);
    expect(result[4]).toBe(5);
  });

  test('should handle window size larger than array', () => {
    const values = [1, 2, 3];
    const windowSize = 5;
    const result = new Float64Array(values.length);

    calculateRollingMeanPrefixSum(values, windowSize, result);

    // All values should be NaN (window never gets filled)
    expect(isNaN(result[0])).toBe(true);
    expect(isNaN(result[1])).toBe(true);
    expect(isNaN(result[2])).toBe(true);
  });

  test('should efficiently handle large arrays', () => {
    // Create an array of 10000 elements [1, 2, 3, ..., 10000]
    const values = Array.from({ length: 10000 }, (_, i) => i + 1);
    const windowSize = 1000;
    const result = new Float64Array(values.length);

    calculateRollingMeanPrefixSum(values, windowSize, result);

    // First 999 values should be NaN (window not filled)
    for (let i = 0; i < windowSize - 1; i++) {
      expect(isNaN(result[i])).toBe(true);
    }

    // Check several values
    // For window [1, 2, ..., 1000], average = 500.5
    expect(result[999]).toBe(500.5);

    // For window [2, 3, ..., 1001], average = 501.5
    expect(result[1000]).toBe(501.5);

    // For window [9001, 9002, ..., 10000], average = 9500.5
    expect(result[9999]).toBe(9500.5);
  });

  test('should correctly handle prefix sums for sparse data', () => {
    // Array with sparse data (alternating numbers and NaN)
    const values = [];
    for (let i = 0; i < 100; i++) {
      values.push(i % 2 === 0 ? i : NaN);
    }

    const windowSize = 10;
    const result = new Float64Array(values.length);

    calculateRollingMeanPrefixSum(values, windowSize, result);

    // All windows should result in NaN since each window has at least one NaN
    for (let i = 0; i < values.length; i++) {
      expect(isNaN(result[i])).toBe(true);
    }
  });
});
