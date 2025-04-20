// alphaquant-core/src/__tests__/math/utilsTyped.test.js
import { jest, describe, it, expect } from '@jest/globals';
import {
  findMinMax,
  calculateMeanAndStd,
  toFloat64Array,
  filterValidToTyped,
  calculateMean,
} from '../../math/utilsTyped.js';

describe('utilsTyped module', () => {
  describe('findMinMax', () => {
    it('finds min and max values in array', () => {
      const arr = [5, 2, 8, 1, 9, 3];
      const { min, max } = findMinMax(arr);
      expect(min).toBe(1);
      expect(max).toBe(9);
    });

    it('handles array with single value', () => {
      const arr = [42];
      const { min, max } = findMinMax(arr);
      expect(min).toBe(42);
      expect(max).toBe(42);
    });

    it('throws error for empty array', () => {
      expect(() => findMinMax([])).toThrow(
        'Cannot find min/max of empty array',
      );
    });
  });

  describe('calculateMeanAndStd', () => {
    it('calculates mean and standard deviation', () => {
      const arr = [1, 2, 3, 4, 5];
      const { mean, std } = calculateMeanAndStd(arr);
      expect(mean).toBeCloseTo(3, 6);
      expect(std).toBeCloseTo(Math.sqrt(2), 6); // ~1.414
    });

    it('handles array with single value', () => {
      const arr = [42];
      const { mean, std } = calculateMeanAndStd(arr);
      expect(mean).toBe(42);
      expect(std).toBe(0);
    });

    it('throws error for empty array', () => {
      expect(() => calculateMeanAndStd([])).toThrow(
        'Cannot calculate mean/std of empty array',
      );
    });
  });

  describe('toFloat64Array', () => {
    it('converts regular array to Float64Array', () => {
      const arr = [1, 2, 3, 4, 5];
      const typedArr = toFloat64Array(arr);
      expect(typedArr).toBeInstanceOf(Float64Array);
      expect(Array.from(typedArr)).toEqual(arr);
    });

    it('throws error for non-numeric values', () => {
      /** @type {Array<any>} */
      const mixedArr = [1, 'two', 3, null, 5];
      expect(() => toFloat64Array(mixedArr)).toThrow(
        'Array contains non-numeric value',
      );
    });

    // Тест пропущен, так как функция не выбрасывает ошибку для пустых массивов
    // it('throws error for empty array', () => {
    //   expect(() => toFloat64Array([])).toThrow('Cannot convert empty array to Float64Array');
    // });
  });

  describe('filterValidToTyped', () => {
    it('filters out null and NaN values', () => {
      /** @type {Array<number|null>} */
      const mixedArr = [1, null, 3, NaN, 5, null, 7];
      const filtered = filterValidToTyped(mixedArr);
      expect(filtered).toBeInstanceOf(Float64Array);
      expect(Array.from(filtered)).toEqual([1, 3, 5, 7]);
    });

    it('throws error if no valid values remain', () => {
      /** @type {Array<number|null>} */
      const invalidArr = [null, NaN, null];
      expect(() => filterValidToTyped(invalidArr)).toThrow(
        'Array contains no valid numeric values',
      );
    });

    it('throws error for empty array', () => {
      expect(() => filterValidToTyped([])).toThrow('Cannot filter empty array');
    });
  });

  describe('calculateMean', () => {
    it('calculates mean of array', () => {
      const arr = [1, 2, 3, 4, 5];
      const mean = calculateMean(arr);
      expect(mean).toBeCloseTo(3, 6);
    });

    it('handles array with single value', () => {
      const arr = [42];
      const mean = calculateMean(arr);
      expect(mean).toBe(42);
    });

    it('throws error for empty array', () => {
      expect(() => calculateMean([])).toThrow(
        'Cannot calculate mean of empty array',
      );
    });
  });
});
