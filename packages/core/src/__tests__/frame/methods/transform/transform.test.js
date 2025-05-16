/**
 * Tests for methods/transform/transform.js
 */

import { createFrame } from '../../../../frame/createFrame.js';
import { transform } from '../../../../frame/methods/transform/transform.js';

/**
 * @typedef {import('../../../../frame/methods/transform/transform.js').RowObject} RowObject
 */

describe('transform', () => {
  test('должен применять функцию трансформации ко всему фрейму', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
      b: [10, 20, 30, 40, 50],
    });

    // Функция трансформации: создание новой колонки c = a + b
    const result = transform(
      frame,
      /** @param {RowObject} row */ (row) => ({
        ...row,
        c: row.a + row.b,
      }),
    );

    // Проверяем, что исходные колонки остались без изменений
    expect(Array.from(result.columns.a)).toEqual([1, 2, 3, 4, 5]);
    expect(Array.from(result.columns.b)).toEqual([10, 20, 30, 40, 50]);

    // Проверяем, что новая колонка создана правильно
    expect(Array.from(result.columns.c)).toEqual([11, 22, 33, 44, 55]);
  });

  test('должен передавать индекс строки в функцию трансформации', () => {
    const frame = createFrame({
      a: [1, 2, 3],
      b: [10, 20, 30],
    });

    // Функция трансформации: создание новой колонки idx = индекс строки
    const result = transform(
      frame,
      /** @param {RowObject} row @param {number} idx */ (row, idx) => ({
        ...row,
        idx: idx,
      }),
    );

    expect(Array.from(result.columns.idx)).toEqual([0, 1, 2]);
  });

  test('должен изменять существующие колонки', () => {
    const frame = createFrame({
      a: [1, 2, 3],
      b: [10, 20, 30],
    });

    // Функция трансформации: умножение колонки a на 2
    const result = transform(
      frame,
      /** @param {RowObject} row */ (row) => ({
        ...row,
        a: row.a * 2,
      }),
    );

    expect(Array.from(result.columns.a)).toEqual([2, 4, 6]);
    expect(Array.from(result.columns.b)).toEqual([10, 20, 30]);
  });

  test('должен удалять колонки', () => {
    const frame = createFrame({
      a: [1, 2, 3],
      b: [10, 20, 30],
      c: [100, 200, 300],
    });

    // Функция трансформации: удаление колонки c
    const result = transform(
      frame,
      /** @param {RowObject} row */ (row) => {
        const { c, ...rest } = row;
        return rest;
      },
    );

    expect(Array.from(result.columns.a)).toEqual([1, 2, 3]);
    expect(Array.from(result.columns.b)).toEqual([10, 20, 30]);
    expect(result.columns.c).toBeUndefined();
  });

  test('должен обрабатывать NaN, null и undefined', () => {
    const frame = createFrame({
      a: [1, NaN, null, undefined, 5],
      b: [10, 20, 30, 40, 50],
    });

    // Функция трансформации: создание новой колонки c = a + b
    const result = transform(
      frame,
      /** @param {RowObject} row */ (row) => ({
        ...row,
        c: row.a + row.b,
      }),
    );

    expect(result.columns.c[0]).toBe(11);
    expect(isNaN(result.columns.c[1])).toBe(true);
    expect(result.columns.c[2]).toBe(30); // null + 30 = 30
    expect(isNaN(result.columns.c[3])).toBe(true); // undefined + 40 = NaN
    expect(result.columns.c[4]).toBe(55);
  });

  test('должен обрабатывать пустой фрейм', () => {
    const frame = createFrame({
      a: [],
      b: [],
    });

    const result = transform(
      frame,
      /** @param {RowObject} row */ (row) => ({
        ...row,
        c: row.a + row.b,
      }),
    );

    expect(result.rowCount).toBe(0);
    expect(Object.keys(result.columns).length).toBe(0);
  });

  test('должен выбрасывать ошибку для некорректного фрейма', () => {
    // @ts-ignore - Игнорируем ошибку типа, так как мы намеренно тестируем неверные входные данные
    expect(() =>
      transform(null, /** @param {RowObject} row */ (row) => row),
    ).toThrow();
    // @ts-ignore - Игнорируем ошибку типа, так как мы намеренно тестируем неверные входные данные
    expect(() =>
      transform({}, /** @param {RowObject} row */ (row) => row),
    ).toThrow();
    // @ts-ignore - Игнорируем ошибку типа, так как мы намеренно тестируем неверные входные данные
    expect(() =>
      transform({ columns: {} }, /** @param {RowObject} row */ (row) => row),
    ).toThrow();
  });

  test('должен выбрасывать ошибку для некорректной функции трансформации', () => {
    const frame = createFrame({
      a: [1, 2, 3],
      b: [10, 20, 30],
    });

    // @ts-ignore - Игнорируем ошибку типа, так как мы намеренно тестируем неверные входные данные
    expect(() => transform(frame, null)).toThrow();
    // @ts-ignore - Игнорируем ошибку типа, так как мы намеренно тестируем неверные входные данные
    expect(() => transform(frame, undefined)).toThrow();
    // @ts-ignore - Игнорируем ошибку типа, так как мы намеренно тестируем неверные входные данные
    expect(() => transform(frame, 'not a function')).toThrow();
  });
});
