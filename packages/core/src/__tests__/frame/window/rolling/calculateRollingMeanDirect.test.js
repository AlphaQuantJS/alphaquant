/**
 * calculateRollingMeanDirect.test.js - Tests for direct calculation of rolling mean function
 */

import { calculateRollingMeanDirect } from '../../../../frame/window/rolling/calculateRollingMeanDirect';

describe('calculateRollingMeanDirect', () => {
  test('should correctly calculate rolling mean for simple values', () => {
    const values = [1, 2, 3, 4, 5];
    const windowSize = 3;
    const result = new Float64Array(values.length);

    calculateRollingMeanDirect(values, windowSize, result);

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

    calculateRollingMeanDirect(values, windowSize, result);

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

    calculateRollingMeanDirect(values, windowSize, result);

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

    calculateRollingMeanDirect(values, windowSize, result);

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

    calculateRollingMeanDirect(values, windowSize, result);

    // All values should be NaN (window never gets filled)
    expect(isNaN(result[0])).toBe(true);
    expect(isNaN(result[1])).toBe(true);
    expect(isNaN(result[2])).toBe(true);
  });

  test('should correctly handle arrays with negative values', () => {
    const values = [-1, -2, -3, -4, -5];
    const windowSize = 3;
    const result = new Float64Array(values.length);

    calculateRollingMeanDirect(values, windowSize, result);

    // First two values should be NaN (window not filled)
    expect(isNaN(result[0])).toBe(true);
    expect(isNaN(result[1])).toBe(true);

    // The rest should be calculated
    expect(result[2]).toBe(-2); // (-1+-2+-3)/3
    expect(result[3]).toBe(-3); // (-2+-3+-4)/3
    expect(result[4]).toBe(-4); // (-3+-4+-5)/3
  });
});
