/**
 * Tests for argsort.js
 */

import { argsort } from '../../../../frame/methods/sorting/argsort.js';

describe('argsort', () => {
  test('should return indices for sorting array in ascending order', () => {
    const array = [3, 1, 4, 2, 5];

    const indices = argsort(array);

    expect(Array.from(indices)).toEqual([1, 3, 0, 2, 4]); // Indices for [1, 2, 3, 4, 5]
  });

  test('should return indices for sorting array in descending order', () => {
    const array = [3, 1, 4, 2, 5];

    const indices = argsort(array, false);

    expect(Array.from(indices)).toEqual([4, 2, 0, 3, 1]); // Indices for [5, 4, 3, 2, 1]
  });

  test('should correctly handle array with duplicate values', () => {
    const array = [3, 1, 3, 2, 1];

    const indices = argsort(array);

    // Indices for [1, 1, 2, 3, 3]
    // The order of indices for identical values may vary,
    // so we only check the correspondence of values
    const sortedValues = indices.map((i) => array[i]);
    expect(sortedValues).toEqual([1, 1, 2, 3, 3]);
  });

  test('should correctly handle array with strings', () => {
    const array = ['c', 'a', 'e', 'b', 'd'];

    const indices = argsort(array);

    expect(Array.from(indices)).toEqual([1, 3, 0, 4, 2]); // Indices for ['a', 'b', 'c', 'd', 'e']
  });

  test('should correctly handle TypedArray', () => {
    const array = new Float64Array([3, 1, 4, 2, 5]);

    const indices = argsort(array);

    expect(Array.from(indices)).toEqual([1, 3, 0, 2, 4]); // Indices for [1, 2, 3, 4, 5]
  });

  test('should correctly handle NaN values', () => {
    const array = [3, NaN, 4, 2, NaN];

    const indices = argsort(array);

    // NaN values should be at the end when sorting in ascending order
    const sortedValues = indices.map((i) => array[i]);
    expect(sortedValues.slice(0, 3)).toEqual([2, 3, 4]);
    expect(Number.isNaN(sortedValues[3])).toBe(true);
    expect(Number.isNaN(sortedValues[4])).toBe(true);
  });

  test('should handle empty array', () => {
    const array = [];

    const indices = argsort(array);

    expect(Array.from(indices)).toEqual([]);
  });

  test('should handle array with one element', () => {
    const array = [42];

    const indices = argsort(array);

    expect(Array.from(indices)).toEqual([0]);
  });

  test('should throw an error for incorrect input array', () => {
    expect(() => argsort(null)).toThrow();
    expect(() => argsort(undefined)).toThrow();
    expect(() => argsort(42)).toThrow();
    expect(() => argsort({})).toThrow();
  });
});
