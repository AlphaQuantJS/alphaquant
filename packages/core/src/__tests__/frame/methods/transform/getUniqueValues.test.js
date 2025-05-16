/**
 * getUniqueValues.test.js - Tests for getUniqueValues function
 */

import { getUniqueValues } from '../../../../frame/methods/transform/getUniqueValues';

describe('getUniqueValues', () => {
  test('should return unique values from regular array', () => {
    const array = [1, 2, 3, 1, 2, 3, 4, 5];
    const result = getUniqueValues(array);
    expect(result).toEqual([1, 2, 3, 4, 5]);
  });

  test('should return unique values from Float64Array', () => {
    const array = new Float64Array([1, 2, 3, 1, 2, 3, 4, 5]);
    const result = getUniqueValues(array);
    expect(result).toEqual([1, 2, 3, 4, 5]);
  });

  test('should handle NaN values in Float64Array', () => {
    const array = new Float64Array([1, 2, NaN, 3, NaN, 4]);
    const result = getUniqueValues(array);
    expect(result).toEqual([1, 2, 3, 4]);
  });

  test('should handle empty arrays', () => {
    const array = [];
    const result = getUniqueValues(array);
    expect(result).toEqual([]);
  });

  test('should handle arrays with all same values', () => {
    const array = [5, 5, 5, 5, 5];
    const result = getUniqueValues(array);
    expect(result).toEqual([5]);
  });

  test('should handle arrays with string values', () => {
    const array = ['a', 'b', 'a', 'c', 'b', 'd'];
    const result = getUniqueValues(array);
    expect(result).toEqual(['a', 'b', 'c', 'd']);
  });

  test('should handle arrays with mixed types', () => {
    const array = [1, 'a', 1, 'a', true, false, true];
    const result = getUniqueValues(array);
    expect(result).toEqual([1, 'a', true, false]);
  });
});
