/**
 * filter.test.js - Tests for filter function
 */

import { filter } from '../../../../../frame/methods/filtering/query/filter.js';
import { createFrame } from '../../../../../frame/createFrame.js';
import { arrayEquals } from '../../../../helpers/arrayEquals.js';

describe('filter', () => {
  // Setup test frame
  const testFrame = createFrame({
    id: [1, 2, 3, 4, 5],
    value: [10, 20, 30, 40, 50],
    name: ['a', 'b', 'c', 'd', 'e'],
  });

  test('should filter rows based on predicate function', () => {
    // Используем индекс i для доступа к данным
    const result = filter(testFrame, (i) => testFrame.columns.value[i] > 30);

    expect(result.rowCount).toBe(2);

    // Используем arrayEquals для сравнения типизированных массивов
    expect(arrayEquals(result.columns.id, [4, 5])).toBe(true);
    expect(arrayEquals(result.columns.value, [40, 50])).toBe(true);
    expect(arrayEquals(result.columns.name, ['d', 'e'])).toBe(true);
  });

  test('should handle complex predicates', () => {
    // Используем индекс i для доступа к данным
    const result = filter(testFrame, (i) => {
      return (
        testFrame.columns.value[i] % 20 === 0 && testFrame.columns.name[i] < 'd'
      );
    });

    expect(result.rowCount).toBe(1);

    // Используем arrayEquals для сравнения типизированных массивов
    expect(arrayEquals(result.columns.id, [2])).toBe(true);
    expect(arrayEquals(result.columns.value, [20])).toBe(true);
    expect(arrayEquals(result.columns.name, ['b'])).toBe(true);
  });

  test('should return empty frame when no rows match', () => {
    const result = filter(testFrame, () => false);

    expect(result.rowCount).toBe(0);

    // Используем arrayEquals для сравнения типизированных массивов
    expect(arrayEquals(result.columns.id, [])).toBe(true);
    expect(arrayEquals(result.columns.value, [])).toBe(true);
    expect(arrayEquals(result.columns.name, [])).toBe(true);
  });

  test('should return all rows when all match', () => {
    const result = filter(testFrame, () => true);

    expect(result.rowCount).toBe(5);

    // Используем arrayEquals для сравнения типизированных массивов
    expect(arrayEquals(result.columns.id, [1, 2, 3, 4, 5])).toBe(true);
    expect(arrayEquals(result.columns.value, [10, 20, 30, 40, 50])).toBe(true);
    expect(arrayEquals(result.columns.name, ['a', 'b', 'c', 'd', 'e'])).toBe(
      true,
    );
  });

  test('should handle row indices', () => {
    const result = filter(testFrame, (i) => i % 2 === 0);

    expect(result.rowCount).toBe(3);

    // Используем arrayEquals для сравнения типизированных массивов
    expect(arrayEquals(result.columns.id, [1, 3, 5])).toBe(true);
    expect(arrayEquals(result.columns.value, [10, 30, 50])).toBe(true);
    expect(arrayEquals(result.columns.name, ['a', 'c', 'e'])).toBe(true);
  });

  test('should preserve typed arrays', () => {
    const typedFrame = createFrame({
      id: [1, 2, 3, 4, 5],
      value: new Float64Array([10, 20, 30, 40, 50]),
    });

    const result = filter(typedFrame, (i) => {
      return (
        typedFrame.columns.value[i] >= 20 && typedFrame.columns.value[i] <= 30
      );
    });

    expect(result.rowCount).toBe(2);

    // Используем arrayEquals для сравнения типизированных массивов
    expect(arrayEquals(result.columns.id, [2, 3])).toBe(true);
    expect(result.columns.value instanceof Float64Array).toBe(true);
    expect(Array.from(result.columns.value)).toEqual([20, 30]);
  });

  test('should throw error for invalid predicate', () => {
    // Проверяем, что функция выбрасывает ошибку при передаче некорректного предиката
    expect(() => {
      // @ts-ignore - Игнорируем ошибку типизации, так как мы намеренно передаем некорректный предикат
      filter(testFrame, 'not a function');
    }).toThrow();
  });
});
