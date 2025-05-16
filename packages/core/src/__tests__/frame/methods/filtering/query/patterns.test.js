/**
 * patterns.test.js - Tests for pattern filtering functions
 */

import {
  filterMatch,
  filterNull,
  filterNotNull,
} from '../../../../../frame/methods/filtering/query/patterns.js';
import { createFrame } from '../../../../../frame/createFrame.js';
import { arrayEquals } from '../../../../helpers/arrayEquals.js';

describe('Pattern Filters', () => {
  // Setup test frame
  const testFrame = createFrame({
    id: [1, 2, 3, 4, 5],
    value: [10, NaN, 30, 40, 50],
    name: ['apple', 'banana', 'cherry', 'date', undefined],
  });

  describe('filterMatch', () => {
    test('should filter rows where column value matches the pattern', () => {
      const result = filterMatch(testFrame, 'name', /^a/);

      expect(result.rowCount).toBe(1);
      expect(arrayEquals(result.columns.id, [1])).toBe(true);
      expect(arrayEquals(result.columns.name, ['apple'])).toBe(true);
    });

    test('should handle case sensitivity', () => {
      // Создаем фрейм с разными регистрами
      const caseFrame = createFrame({
        id: [1, 2, 3],
        name: ['Apple', 'apple', 'APPLE'],
      });

      // Регистрозависимый поиск
      const result1 = filterMatch(caseFrame, 'name', /^a/);
      expect(result1.rowCount).toBe(1);
      expect(arrayEquals(result1.columns.id, [2])).toBe(true);

      // Регистронезависимый поиск
      const result2 = filterMatch(caseFrame, 'name', /^a/i);
      expect(result2.rowCount).toBe(3);
      expect(arrayEquals(result2.columns.id, [1, 2, 3])).toBe(true);
    });

    test('should return empty frame when no matches', () => {
      const result = filterMatch(testFrame, 'name', /^z/);

      expect(result.rowCount).toBe(0);
      expect(arrayEquals(result.columns.id, [])).toBe(true);
    });

    test('should handle non-string values', () => {
      // Числовые значения будут преобразованы в строки
      const result = filterMatch(testFrame, 'value', /^1/);

      expect(result.rowCount).toBe(1);
      expect(arrayEquals(result.columns.id, [1])).toBe(true);
    });

    // Обновляем тест для проверки ошибки
    test('should accept string patterns', () => {
      // В реализации функции filterMatch строки должны быть автоматически преобразованы в RegExp
      const result = filterMatch(testFrame, 'name', 'apple');

      expect(result.rowCount).toBe(1);
      expect(arrayEquals(result.columns.id, [1])).toBe(true);
    });
  });

  describe('filterNull', () => {
    test('should filter rows where column value is null, undefined, or NaN', () => {
      const result = filterNull(testFrame, 'value');

      expect(result.rowCount).toBe(1);
      // Check indices of rows with null/NaN values
      expect(arrayEquals(result.columns.id, [2])).toBe(true);
    });

    test('should handle columns with no null values', () => {
      const noNullFrame = createFrame({
        id: [1, 2, 3],
        value: [10, 20, 30],
      });

      const result = filterNull(noNullFrame, 'value');

      expect(result.rowCount).toBe(0);
      expect(arrayEquals(result.columns.id, [])).toBe(true);
    });

    test('should handle columns with undefined values', () => {
      const result = filterNull(testFrame, 'name');

      expect(result.rowCount).toBe(1);
      expect(arrayEquals(result.columns.id, [5])).toBe(true);
      expect(result.columns.name[0]).toBeUndefined();
    });
  });

  describe('filterNotNull', () => {
    test('should filter rows where column value is not null, undefined, or NaN', () => {
      const result = filterNotNull(testFrame, 'value');

      expect(result.rowCount).toBe(4);
      expect(arrayEquals(result.columns.id, [1, 3, 4, 5])).toBe(true);
    });

    test('should handle columns with all null values', () => {
      const allNullFrame = createFrame({
        id: [1, 2, 3],
        value: [NaN, null, undefined],
      });

      const result = filterNotNull(allNullFrame, 'value');

      expect(result.rowCount).toBe(0);
      expect(arrayEquals(result.columns.id, [])).toBe(true);
    });
  });
});
