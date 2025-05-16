/**
 * calculateQuantile.test.js - Tests for calculateQuantile function
 */

import { calculateQuantile } from '../../../../frame/computation/describe/calculateQuantile';

describe('calculateQuantile', () => {
  test('should calculate quantiles correctly for odd-length array', () => {
    const values = [1, 2, 3, 4, 5];

    // 0th quantile (min)
    expect(calculateQuantile(values, 0)).toBe(1);

    // 25th percentile (Q1)
    expect(calculateQuantile(values, 0.25)).toBe(2);

    // 50th percentile (median)
    expect(calculateQuantile(values, 0.5)).toBe(3);

    // 75th percentile (Q3)
    expect(calculateQuantile(values, 0.75)).toBe(4);

    // 100th percentile (max)
    expect(calculateQuantile(values, 1)).toBe(5);
  });

  test('should calculate quantiles correctly for even-length array', () => {
    const values = [1, 2, 3, 4, 5, 6];

    // 0th quantile (min)
    expect(calculateQuantile(values, 0)).toBe(1);

    // 25th percentile (Q1)
    expect(calculateQuantile(values, 0.25)).toBe(2.25);

    // 50th percentile (median)
    expect(calculateQuantile(values, 0.5)).toBe(3.5);

    // 75th percentile (Q3)
    expect(calculateQuantile(values, 0.75)).toBe(4.75);

    // 100th percentile (max)
    expect(calculateQuantile(values, 1)).toBe(6);
  });

  test('should handle single-element array', () => {
    const values = [42];

    // All quantiles should return the single value
    expect(calculateQuantile(values, 0)).toBe(42);
    expect(calculateQuantile(values, 0.25)).toBe(42);
    expect(calculateQuantile(values, 0.5)).toBe(42);
    expect(calculateQuantile(values, 0.75)).toBe(42);
    expect(calculateQuantile(values, 1)).toBe(42);
  });

  test('should handle empty array', () => {
    const values = [];

    // All quantiles should return NaN for empty array
    expect(isNaN(calculateQuantile(values, 0))).toBe(true);
    expect(isNaN(calculateQuantile(values, 0.5))).toBe(true);
    expect(isNaN(calculateQuantile(values, 1))).toBe(true);
  });

  test('should handle intermediate quantiles', () => {
    const values = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

    // 10th percentile
    expect(calculateQuantile(values, 0.1)).toBe(19);

    // 33rd percentile
    expect(calculateQuantile(values, 0.33)).toBe(39.7);

    // 66th percentile
    expect(calculateQuantile(values, 0.66)).toBe(69.4);

    // 90th percentile
    expect(calculateQuantile(values, 0.9)).toBe(91);
  });
});
