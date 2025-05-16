/**
 * pivot_table.test.js - Tests for pivot_table function
 */

import { pivot_table } from '../../../../frame/reshape/pivot/pivot_table.js';
import { createFrame } from '../../../../frame/createFrame.js';

describe('pivot_table', () => {
  test('должен преобразовывать данные из "длинного" формата в "широкий"', () => {
    const frame = createFrame({
      id: ['A', 'A', 'B', 'B', 'C'],
      variable: ['x', 'y', 'x', 'y', 'x'],
      value: [1, 2, 3, 4, 5],
    });

    const result = pivot_table(frame, 'id', 'variable', 'value');

    // Проверяем количество строк: 3 уникальных id
    expect(result.rowCount).toBe(3);

    // Проверяем структуру результата
    expect(result.columns.id).toEqual(['A', 'B', 'C']);

    // Для Float64Array используем Array.from для сравнения
    expect(Array.from(result.columns.x)).toEqual([1, 3, 5]);
    expect(Array.from(result.columns.y)).toEqual([2, 4, NaN]);
  });

  test('должен обрабатывать пустой фрейм', () => {
    const frame = createFrame({
      id: [],
      variable: [],
      value: [],
    });

    const result = pivot_table(frame, 'id', 'variable', 'value');

    expect(result.rowCount).toBe(0);
  });

  test('должен обрабатывать фрейм с одной строкой', () => {
    const frame = createFrame({
      id: ['A'],
      variable: ['x'],
      value: [1],
    });

    const result = pivot_table(frame, 'id', 'variable', 'value');

    expect(result.rowCount).toBe(1);
    expect(result.columns.id).toEqual(['A']);
    expect(Array.from(result.columns.x)).toEqual([1]);
  });

  test('должен обрабатывать числовые значения в колонках', () => {
    const frame = createFrame({
      id: ['A', 'A', 'B', 'B'],
      variable: [10, 20, 10, 20],
      value: [1, 2, 3, 4],
    });

    const result = pivot_table(frame, 'id', 'variable', 'value');

    expect(result.rowCount).toBe(2);
    expect(result.columns.id).toEqual(['A', 'B']);
    expect(Array.from(result.columns['10'])).toEqual([1, 3]);
    expect(Array.from(result.columns['20'])).toEqual([2, 4]);
  });

  test('должен пропускать строки с NaN, null или undefined', () => {
    const frame = createFrame({
      id: ['A', 'A', 'B', 'B', 'C', 'C'],
      variable: ['x', 'y', 'x', null, NaN, 'y'],
      value: [1, 2, 3, 4, 5, undefined],
    });

    const result = pivot_table(frame, 'id', 'variable', 'value');

    expect(result.rowCount).toBe(3);
    expect(result.columns.id).toEqual(['A', 'B', 'C']);
    expect(Array.from(result.columns.x)).toEqual([1, 3, NaN]);
    expect(Array.from(result.columns.y)).toEqual([2, NaN, NaN]);
  });

  test('должен выбрасывать ошибку при неверном входном фрейме', () => {
    // @ts-ignore - Игнорируем ошибку типа, так как мы намеренно тестируем неверные входные данные
    expect(() => pivot_table(null, 'id', 'variable', 'value')).toThrow();
    // @ts-ignore - Игнорируем ошибку типа, так как мы намеренно тестируем неверные входные данные
    expect(() => pivot_table({}, 'id', 'variable', 'value')).toThrow();
    // @ts-ignore - Игнорируем ошибку типа, так как мы намеренно тестируем неверные входные данные
    expect(() =>
      pivot_table({ columns: {} }, 'id', 'variable', 'value'),
    ).toThrow();
  });

  test('должен выбрасывать ошибку при несуществующих колонках', () => {
    const frame = createFrame({
      id: ['A'],
      variable: ['x'],
      value: [1],
    });

    expect(() =>
      pivot_table(frame, 'nonexistent', 'variable', 'value'),
    ).toThrow();
    expect(() => pivot_table(frame, 'id', 'nonexistent', 'value')).toThrow();
    expect(() => pivot_table(frame, 'id', 'variable', 'nonexistent')).toThrow();
  });
});
