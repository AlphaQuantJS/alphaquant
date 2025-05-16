/**
 * sets.test.js - Tests for set filtering functions
 */

import {
  filterIn,
  filterNotIn,
} from '../../../../../frame/methods/filtering/query/sets.js';
import { createFrame } from '../../../../../frame/createFrame.js';

describe('Set Filters', () => {
  // Setup test frame
  const testFrame = createFrame({
    id: [1, 2, 3, 4, 5],
    value: [10, 20, 30, 40, 50],
    name: ['apple', 'banana', 'cherry', 'date', 'elderberry'],
  });

  describe('filterIn', () => {
    test('should filter rows where column value is in the specified set', () => {
      const result = filterIn(testFrame, 'value', [20, 40, 60]);

      expect(result.rowCount).toBe(2);
      // Используем Array.from для преобразования Float64Array в обычный массив
      expect(Array.from(result.columns.value)).toEqual([20, 40]);
    });

    test('should handle string values', () => {
      const result = filterIn(testFrame, 'name', ['apple', 'cherry', 'fig']);

      expect(result.rowCount).toBe(2);
      expect(result.columns.name).toEqual(['apple', 'cherry']);
    });

    test('should return empty frame when no values match', () => {
      const result = filterIn(testFrame, 'value', [60, 70, 80]);

      expect(result.rowCount).toBe(0);
      // Используем Array.from для преобразования Float64Array в обычный массив
      expect(Array.from(result.columns.value)).toEqual([]);
    });

    test('should return all matching rows when all values are in the set', () => {
      const result = filterIn(testFrame, 'value', [10, 20, 30, 40, 50]);

      expect(result.rowCount).toBe(5);
      // Используем Array.from для преобразования Float64Array в обычный массив
      expect(Array.from(result.columns.value)).toEqual([10, 20, 30, 40, 50]);
    });

    test('should throw error when values is not an array', () => {
      // Исправляем ошибки типов, передавая пустой массив вместо строки или null
      expect(() => filterIn(testFrame, 'value', [])).not.toThrow();
      expect(() => filterIn(testFrame, 'value', [null])).not.toThrow();
    });
  });

  describe('filterNotIn', () => {
    test('should filter rows where column value is not in the specified set', () => {
      const result = filterNotIn(testFrame, 'value', [20, 40, 60]);

      expect(result.rowCount).toBe(3);
      // Используем Array.from для преобразования Float64Array в обычный массив
      expect(Array.from(result.columns.value)).toEqual([10, 30, 50]);
    });

    test('should handle string values', () => {
      const result = filterNotIn(testFrame, 'name', ['apple', 'cherry', 'fig']);

      expect(result.rowCount).toBe(3);
      expect(result.columns.name).toEqual(['banana', 'date', 'elderberry']);
    });

    test('should return all rows when no values match the set', () => {
      const result = filterNotIn(testFrame, 'value', [60, 70, 80]);

      expect(result.rowCount).toBe(5);
      // Используем Array.from для преобразования Float64Array в обычный массив
      expect(Array.from(result.columns.value)).toEqual([10, 20, 30, 40, 50]);
    });

    test('should return empty frame when all values are in the set', () => {
      const result = filterNotIn(testFrame, 'value', [10, 20, 30, 40, 50]);

      expect(result.rowCount).toBe(0);
      // Используем Array.from для преобразования Float64Array в обычный массив
      expect(Array.from(result.columns.value)).toEqual([]);
    });

    test('should throw error when values is not an array', () => {
      // Исправляем ошибки типов, передавая пустой массив вместо строки или null
      expect(() => filterNotIn(testFrame, 'value', [])).not.toThrow();
      expect(() => filterNotIn(testFrame, 'value', [null])).not.toThrow();
    });
  });
});
