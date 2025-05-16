/**
 * filterByColumn.test.js - Tests for filterByColumn function
 */

import { filterByColumn } from '../../../../../frame/methods/filtering/query/filterByColumn.js';
import { createFrame } from '../../../../../frame/createFrame.js';
import { arrayEquals } from '../../../../helpers/arrayEquals.js';

describe('filterByColumn', () => {
  // Setup test frame
  const testFrame = createFrame({
    id: [1, 2, 3, 4, 5],
    value: [10, 20, 30, 40, 50],
    name: ['apple', 'banana', 'cherry', 'date', 'elderberry'],
  });

  test('should filter rows based on predicate function', () => {
    // Используем индекс i для доступа к данным
    const result = filterByColumn(testFrame, 'value', (value) => value > 30);

    expect(result.rowCount).toBe(2);

    // Используем arrayEquals для сравнения типизированных массивов
    expect(arrayEquals(result.columns.id, [4, 5])).toBe(true);
    expect(arrayEquals(result.columns.value, [40, 50])).toBe(true);
    expect(arrayEquals(result.columns.name, ['date', 'elderberry'])).toBe(true);
  });

  test('should filter rows with custom predicate', () => {
    const result = filterByColumn(
      testFrame,
      'value',
      (value) => value % 20 === 0,
    );

    expect(result.rowCount).toBe(2);

    // Используем arrayEquals для сравнения типизированных массивов
    expect(arrayEquals(result.columns.value, [20, 40])).toBe(true);
    expect(arrayEquals(result.columns.id, [2, 4])).toBe(true);
    expect(arrayEquals(result.columns.name, ['banana', 'date'])).toBe(true);
  });

  test('should return empty frame when no rows match', () => {
    const result = filterByColumn(testFrame, 'value', (value) => value > 100);

    expect(result.rowCount).toBe(0);

    // Используем arrayEquals для сравнения типизированных массивов
    // Используем пустые массивы напрямую
    expect(arrayEquals(result.columns.id, [])).toBe(true);
    expect(arrayEquals(result.columns.value, [])).toBe(true);
    expect(arrayEquals(result.columns.name, [])).toBe(true);
  });

  test('should return all rows when all match', () => {
    const result = filterByColumn(testFrame, 'value', (value) => value > 0);

    expect(result.rowCount).toBe(5);

    // Используем arrayEquals для сравнения типизированных массивов
    expect(arrayEquals(result.columns.id, [1, 2, 3, 4, 5])).toBe(true);
    expect(arrayEquals(result.columns.value, [10, 20, 30, 40, 50])).toBe(true);
    expect(
      arrayEquals(result.columns.name, [
        'apple',
        'banana',
        'cherry',
        'date',
        'elderberry',
      ]),
    ).toBe(true);
  });

  test('should handle string columns', () => {
    const result = filterByColumn(testFrame, 'name', (name) =>
      name.startsWith('a'),
    );

    expect(result.rowCount).toBe(1);

    // Используем arrayEquals для сравнения типизированных массивов
    expect(arrayEquals(result.columns.name, ['apple'])).toBe(true);
    expect(arrayEquals(result.columns.id, [1])).toBe(true);
    expect(arrayEquals(result.columns.value, [10])).toBe(true);
  });

  test('should throw error for non-existent column', () => {
    expect(() =>
      filterByColumn(testFrame, 'nonexistent', (value) => value > 0),
    ).toThrow();
  });

  // Проверяем, что функция корректно обрабатывает предикаты, возвращающие не булевы значения
  test('should handle non-boolean predicate results', () => {
    // Предикат возвращает числовое значение, которое будет приведено к булеву
    const result = filterByColumn(testFrame, 'value', (value) => value);

    // Все значения, кроме 0, NaN, null и undefined, будут приведены к true
    expect(result.rowCount).toBe(5);
    expect(arrayEquals(result.columns.value, [10, 20, 30, 40, 50])).toBe(true);
  });
});
