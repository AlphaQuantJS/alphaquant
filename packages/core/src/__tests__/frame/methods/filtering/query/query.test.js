/**
 * Tests for filter/query.js
 */

import { createFrame } from '../../../../../frame/createFrame.js';
import { query } from '../../../../../frame/methods/filtering/query/query.js';

describe('query', () => {
  test('должен фильтровать строки по условию для одной колонки', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
      b: [10, 20, 30, 40, 50],
    });

    // Фильтрация строк, где a > 3
    const result = query(frame, (row) => row.a > 3);

    expect(result.rowCount).toBe(2);
    expect(Array.from(result.columns.a)).toEqual([4, 5]);
    expect(Array.from(result.columns.b)).toEqual([40, 50]);
  });

  test('должен фильтровать строки по условию для нескольких колонок', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
      b: [10, 20, 30, 40, 50],
      c: ['x', 'y', 'z', 'w', 'v'],
    });

    // Фильтрация строк, где a > 2 и b < 40
    const result = query(frame, (row) => row.a > 2 && row.b < 40);

    expect(result.rowCount).toBe(1);
    expect(Array.from(result.columns.a)).toEqual([3]);
    expect(Array.from(result.columns.b)).toEqual([30]);
    expect(Array.from(result.columns.c)).toEqual(['z']);
  });

  test('должен фильтровать строки по условию для строковых колонок', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
      b: ['apple', 'banana', 'cherry', 'date', 'elderberry'],
    });

    // Фильтрация строк, где b начинается с 'c' или 'd'
    const result = query(
      frame,
      (row) => row.b.startsWith('c') || row.b.startsWith('d'),
    );

    expect(result.rowCount).toBe(2);
    expect(Array.from(result.columns.a)).toEqual([3, 4]);
    expect(Array.from(result.columns.b)).toEqual(['cherry', 'date']);
  });

  test('должен обрабатывать NaN, null и undefined', () => {
    const frame = createFrame({
      a: [1, NaN, 3, null, 5, undefined],
      b: [10, 20, 30, 40, 50, 60],
    });

    // Фильтрация строк, где a > 2
    const result = query(frame, (row) => row.a > 2);

    expect(result.rowCount).toBe(2);
    expect(Array.from(result.columns.a)).toEqual([3, 5]);
    expect(Array.from(result.columns.b)).toEqual([30, 50]);
  });

  test('должен возвращать пустой фрейм, если нет соответствующих строк', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
      b: [10, 20, 30, 40, 50],
    });

    // Фильтрация строк, где a > 10 (нет таких строк)
    const result = query(frame, (row) => row.a > 10);

    expect(result.rowCount).toBe(0);
    expect(Object.keys(result.columns)).toEqual(['a', 'b']);
    expect(result.columns.a.length).toBe(0);
    expect(result.columns.b.length).toBe(0);
  });

  test('должен обрабатывать пустой фрейм', () => {
    const frame = createFrame({
      a: [],
      b: [],
    });

    const result = query(frame, (row) => row.a > 3);

    expect(result.rowCount).toBe(0);
    expect(Object.keys(result.columns)).toEqual(['a', 'b']);
    expect(result.columns.a.length).toBe(0);
    expect(result.columns.b.length).toBe(0);
  });

  test('должен выбрасывать ошибку для некорректного фрейма', () => {
    expect(() => query(null, (row) => row.a > 3)).toThrow();
    expect(() => query({}, (row) => row.a > 3)).toThrow();
    expect(() => query({ columns: {} }, (row) => row.a > 3)).toThrow();
  });

  test('должен выбрасывать ошибку для некорректной функции фильтрации', () => {
    const frame = createFrame({
      a: [1, 2, 3],
      b: [10, 20, 30],
    });

    expect(() => query(frame, null)).toThrow();
    expect(() => query(frame, undefined)).toThrow();
    expect(() => query(frame, 'not a function')).toThrow();
  });
});
