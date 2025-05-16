/**
 * isNumericArray.test.js - Tests for isNumericArray function
 */

import { isNumericArray } from '../../../../frame/methods/aggregation/isNumericArray';

describe('isNumericArray', () => {
  test('should return true for array with only numbers', () => {
    expect(isNumericArray([1, 2, 3, 4, 5])).toBe(true);
  });

  test('should return true for Float64Array', () => {
    expect(isNumericArray(new Float64Array([1, 2, 3, 4, 5]))).toBe(true);
  });

  test('should return true for array with numbers and NaN values', () => {
    expect(isNumericArray([1, NaN, 3, NaN, 5])).toBe(true);
  });

  test('should return true for array with numbers and null/undefined values', () => {
    expect(isNumericArray([1, null, 3, undefined, 5])).toBe(true);
  });

  test('should return false for array with non-numeric values', () => {
    expect(isNumericArray([1, '2', 3, 4, 5])).toBe(false);
  });

  test('should return false for array with mixed numeric and non-numeric values', () => {
    expect(isNumericArray([1, 2, 'three', 4, 5])).toBe(false);
  });

  test('should return false for array with objects', () => {
    expect(isNumericArray([1, 2, {}, 4, 5])).toBe(false);
  });

  test('should return false for array with arrays', () => {
    expect(isNumericArray([1, 2, [], 4, 5])).toBe(false);
  });

  test('should return false for array with boolean values', () => {
    expect(isNumericArray([1, 2, true, 4, 5])).toBe(false);
  });

  test('should handle empty array', () => {
    expect(isNumericArray([])).toBe(true);
  });
});
