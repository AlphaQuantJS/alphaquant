/**
 * utils.test.js - Tests for statistical utility functions
 */

import {
  calculateMean,
  calculateMeanAndStd,
  filterValidToTyped,
  formatMatrixAs2D,
} from '../../../frame/computation/utils';

describe('calculateMean', () => {
  test('should calculate mean correctly for simple values', () => {
    const values = [1, 2, 3, 4, 5];
    expect(calculateMean(values)).toBe(3);
  });

  test('should handle typed arrays', () => {
    const values = new Float64Array([1, 2, 3, 4, 5]);
    expect(calculateMean(values)).toBe(3);
  });

  test('should handle NaN values', () => {
    const values = [1, NaN, 3, 4, 5];
    expect(calculateMean(values)).toBe((1 + 3 + 4 + 5) / 4);
  });

  test('should handle null and undefined values', () => {
    const values = [1, null, 3, undefined, 5];
    expect(calculateMean(values)).toBe(3);
  });

  test('should return NaN for empty array', () => {
    expect(isNaN(calculateMean([]))).toBe(true);
  });

  test('should return NaN for array with no valid values', () => {
    const values = [null, undefined, NaN];
    expect(isNaN(calculateMean(values))).toBe(true);
  });

  test('should return NaN for null or undefined input', () => {
    expect(isNaN(calculateMean(null))).toBe(true);
    expect(isNaN(calculateMean(undefined))).toBe(true);
  });
});

describe('calculateMeanAndStd', () => {
  test('should calculate mean and std correctly for simple values', () => {
    const values = [1, 2, 3, 4, 5];
    const result = calculateMeanAndStd(values);

    expect(result.mean).toBe(3);
    expect(result.std).toBeCloseTo(Math.sqrt(2), 10);
  });

  test('should handle typed arrays', () => {
    const values = new Float64Array([1, 2, 3, 4, 5]);
    const result = calculateMeanAndStd(values);

    expect(result.mean).toBe(3);
    expect(result.std).toBeCloseTo(Math.sqrt(2), 10);
  });

  test('should handle NaN values', () => {
    const values = [1, NaN, 3, 4, 5];
    const result = calculateMeanAndStd(values);

    expect(result.mean).toBeCloseTo((1 + 3 + 4 + 5) / 4, 10);

    // Calculate expected std manually
    const validValues = [1, 3, 4, 5];
    const mean = validValues.reduce((a, b) => a + b, 0) / validValues.length;
    const variance =
      validValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
      validValues.length;
    const expectedStd = Math.sqrt(variance);

    expect(result.std).toBeCloseTo(expectedStd, 10);
  });

  test('should handle null and undefined values', () => {
    const values = [1, null, 3, undefined, 5];
    const result = calculateMeanAndStd(values);

    expect(result.mean).toBe(3);

    // Calculate expected std manually
    const validValues = [1, 3, 5];
    const mean = validValues.reduce((a, b) => a + b, 0) / validValues.length;
    const variance =
      validValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
      validValues.length;
    const expectedStd = Math.sqrt(variance);

    expect(result.std).toBeCloseTo(expectedStd, 10);
  });

  test('should handle constant values', () => {
    const values = [5, 5, 5, 5, 5];
    const result = calculateMeanAndStd(values);

    expect(result.mean).toBe(5);
    expect(result.std).toBe(0);
  });

  test('should return NaN for empty array', () => {
    const result = calculateMeanAndStd([]);

    expect(isNaN(result.mean)).toBe(true);
    expect(isNaN(result.std)).toBe(true);
  });

  test('should return NaN for array with no valid values', () => {
    const values = [null, undefined, NaN];
    const result = calculateMeanAndStd(values);

    expect(isNaN(result.mean)).toBe(true);
    expect(isNaN(result.std)).toBe(true);
  });

  test('should return NaN for null or undefined input', () => {
    expect(isNaN(calculateMeanAndStd(null).mean)).toBe(true);
    expect(isNaN(calculateMeanAndStd(undefined).mean)).toBe(true);
    expect(isNaN(calculateMeanAndStd(null).std)).toBe(true);
    expect(isNaN(calculateMeanAndStd(undefined).std)).toBe(true);
  });
});

describe('filterValidToTyped', () => {
  test('should filter out invalid values and return typed array', () => {
    const values = [1, null, 3, NaN, 5, undefined, 7];
    const result = filterValidToTyped(values);

    expect(result instanceof Float64Array).toBe(true);
    expect(result.length).toBe(4);
    expect(Array.from(result)).toEqual([1, 3, 5, 7]);
  });

  test('should handle already valid arrays', () => {
    const values = [1, 2, 3, 4, 5];
    const result = filterValidToTyped(values);

    expect(result instanceof Float64Array).toBe(true);
    expect(result.length).toBe(5);
    expect(Array.from(result)).toEqual([1, 2, 3, 4, 5]);
  });

  test('should handle typed arrays', () => {
    const values = new Float64Array([1, 2, 3, 4, 5]);
    const result = filterValidToTyped(values);

    expect(result instanceof Float64Array).toBe(true);
    expect(result.length).toBe(5);
    expect(Array.from(result)).toEqual([1, 2, 3, 4, 5]);
  });

  test('should throw error for empty array', () => {
    expect(() => filterValidToTyped([])).toThrow('Input array is empty');
  });

  test('should throw error for null or undefined input', () => {
    expect(() => filterValidToTyped(null)).toThrow('Input array is empty');
    expect(() => filterValidToTyped(undefined)).toThrow('Input array is empty');
  });

  test('should throw error for array with no valid values', () => {
    const values = [null, undefined, NaN, 'string', true];
    expect(() => filterValidToTyped(values)).toThrow('No valid numeric values');
  });

  test('should filter out non-numeric values', () => {
    const values = [1, 'string', 3, true, 5];
    const result = filterValidToTyped(values);

    expect(result instanceof Float64Array).toBe(true);
    expect(result.length).toBe(3);
    expect(Array.from(result)).toEqual([1, 3, 5]);
  });
});

describe('formatMatrixAs2D', () => {
  test('should format 2x2 flat matrix correctly', () => {
    const flatMatrix = new Float64Array([1, 2, 3, 4]);
    const result = formatMatrixAs2D(flatMatrix, 2);

    expect(result).toHaveLength(2);
    expect(result[0]).toHaveLength(2);
    expect(result[1]).toHaveLength(2);

    expect(result[0][0]).toBe(1);
    expect(result[0][1]).toBe(2);
    expect(result[1][0]).toBe(3);
    expect(result[1][1]).toBe(4);
  });

  test('should format 3x3 flat matrix correctly', () => {
    const flatMatrix = new Float64Array([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const result = formatMatrixAs2D(flatMatrix, 3);

    expect(result).toHaveLength(3);
    expect(result[0]).toHaveLength(3);
    expect(result[1]).toHaveLength(3);
    expect(result[2]).toHaveLength(3);

    expect(result[0][0]).toBe(1);
    expect(result[0][1]).toBe(2);
    expect(result[0][2]).toBe(3);
    expect(result[1][0]).toBe(4);
    expect(result[1][1]).toBe(5);
    expect(result[1][2]).toBe(6);
    expect(result[2][0]).toBe(7);
    expect(result[2][1]).toBe(8);
    expect(result[2][2]).toBe(9);
  });

  test('should handle 1x1 matrix', () => {
    const flatMatrix = new Float64Array([42]);
    const result = formatMatrixAs2D(flatMatrix, 1);

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(1);
    expect(result[0][0]).toBe(42);
  });
});
