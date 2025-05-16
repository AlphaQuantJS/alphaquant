/**
 * Tests for pivot.js
 */

import { createFrame } from '../../../../frame/createFrame.js';
import { pivot } from '../../../../frame/reshape/pivot/pivot.js';

describe('pivot', () => {
  test('должен создавать сводную таблицу с агрегацией sum', () => {
    const frame = createFrame({
      category: ['A', 'B', 'A', 'B', 'A', 'C'],
      subcategory: ['X', 'X', 'Y', 'Y', 'X', 'Z'],
      value: [10, 20, 30, 40, 50, 60],
    });

    const result = pivot(frame, 'category', 'subcategory', 'value', 'sum');

    // Проверяем структуру результата
    expect(result.rowCount).toBe(3); // A, B, C
    expect(Object.keys(result.columns)).toContain('_index');
    expect(Object.keys(result.columns)).toContain('X');
    expect(Object.keys(result.columns)).toContain('Y');
    expect(Object.keys(result.columns)).toContain('Z');

    // Проверяем значения
    const rows = result.toArray();

    // Находим строки для каждой категории
    const rowA = rows.find((row) => row._index === 'A');
    const rowB = rows.find((row) => row._index === 'B');
    const rowC = rows.find((row) => row._index === 'C');

    // Проверяем агрегированные значения
    expect(rowA.X).toBe(60); // 10 + 50 = 60
    expect(rowA.Y).toBe(30);
    expect(rowA.Z).toBe(0); // Нет данных, должен быть 0

    expect(rowB.X).toBe(20);
    expect(rowB.Y).toBe(40);
    expect(rowB.Z).toBe(0); // Нет данных, должен быть 0

    expect(rowC.X).toBe(0); // Нет данных, должен быть 0
    expect(rowC.Y).toBe(0); // Нет данных, должен быть 0
    expect(rowC.Z).toBe(60);
  });

  test('должен создавать сводную таблицу с агрегацией mean', () => {
    const frame = createFrame({
      category: ['A', 'B', 'A', 'B', 'A', 'A'],
      subcategory: ['X', 'X', 'Y', 'Y', 'X', 'X'],
      value: [10, 20, 30, 40, 50, 60],
    });

    const result = pivot(frame, 'category', 'subcategory', 'value', 'mean');

    // Проверяем значения
    const rows = result.toArray();

    // Находим строки для каждой категории
    const rowA = rows.find((row) => row._index === 'A');
    const rowB = rows.find((row) => row._index === 'B');

    // Проверяем агрегированные значения
    expect(rowA.X).toBe(40); // (10 + 50 + 60) / 3 = 40
    expect(rowA.Y).toBe(30); // 30 / 1 = 30

    expect(rowB.X).toBe(20); // 20 / 1 = 20
    expect(rowB.Y).toBe(40); // 40 / 1 = 40
  });

  test('должен создавать сводную таблицу с пользовательской функцией агрегации', () => {
    const frame = createFrame({
      category: ['A', 'B', 'A', 'B', 'A', 'C'],
      subcategory: ['X', 'X', 'Y', 'Y', 'X', 'Z'],
      value: [10, 20, 30, 40, 50, 60],
    });

    // Пользовательская функция агрегации: произведение всех значений
    const product = (values) => values.reduce((acc, val) => acc * val, 1);

    const result = pivot(frame, 'category', 'subcategory', 'value', product);

    // Проверяем значения
    const rows = result.toArray();

    // Находим строки для каждой категории
    const rowA = rows.find((row) => row._index === 'A');
    const rowB = rows.find((row) => row._index === 'B');
    const rowC = rows.find((row) => row._index === 'C');

    // Проверяем агрегированные значения
    expect(rowA.X).toBe(10 * 50); // 500
    expect(rowA.Y).toBe(30);

    expect(rowB.X).toBe(20);
    expect(rowB.Y).toBe(40);

    expect(rowC.Z).toBe(60);
  });

  test('должен корректно обрабатывать NaN, null и undefined', () => {
    const frame = createFrame({
      category: ['A', 'B', 'A', 'B', 'A'],
      subcategory: ['X', 'X', 'Y', 'Y', 'X'],
      value: [10, NaN, 30, null, undefined],
    });

    const result = pivot(frame, 'category', 'subcategory', 'value', 'sum');

    // Проверяем значения
    const rows = result.toArray();

    // Находим строки для каждой категории
    const rowA = rows.find((row) => row._index === 'A');
    const rowB = rows.find((row) => row._index === 'B');

    // Проверяем агрегированные значения (NaN и undefined исключаются, null = 0)
    expect(rowA.X).toBe(10); // 10 + undefined -> 10
    expect(rowA.Y).toBe(30);

    expect(rowB.X).toBe(0); // NaN -> 0
    expect(rowB.Y).toBe(0); // null -> 0
  });

  test('должен выбрасывать ошибку для несуществующих колонок', () => {
    const frame = createFrame({
      category: ['A', 'B', 'A'],
      subcategory: ['X', 'X', 'Y'],
      value: [10, 20, 30],
    });

    expect(() =>
      pivot(frame, 'nonexistent', 'subcategory', 'value', 'sum'),
    ).toThrow("Column 'nonexistent' not found");
    expect(() =>
      pivot(frame, 'category', 'nonexistent', 'value', 'sum'),
    ).toThrow("Column 'nonexistent' not found");
    expect(() =>
      pivot(frame, 'category', 'subcategory', 'nonexistent', 'sum'),
    ).toThrow("Column 'nonexistent' not found");
  });

  test('должен выбрасывать ошибку для некорректной функции агрегации', () => {
    const frame = createFrame({
      category: ['A', 'B', 'A'],
      subcategory: ['X', 'X', 'Y'],
      value: [10, 20, 30],
    });

    expect(() =>
      pivot(frame, 'category', 'subcategory', 'value', 'invalid_agg'),
    ).toThrow('Unknown aggregation function: invalid_agg');
  });

  test('должен обрабатывать пустой фрейм', () => {
    const frame = createFrame({
      category: [],
      subcategory: [],
      value: [],
    });

    const result = pivot(frame, 'category', 'subcategory', 'value', 'sum');

    expect(result.rowCount).toBe(0);
  });
});
