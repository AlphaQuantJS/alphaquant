/**
 * Tests for methods/transform/shift.js
 */

import { createFrame } from '../../../../frame/createFrame.js';
import { shift } from '../../../../frame/methods/transform/shift.js';
import { arrayEquals } from '../../../helpers/arrayEquals.js';

describe('shift', () => {
  test('должен сдвигать значения в колонке вперед на указанное количество периодов', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
      b: [10, 20, 30, 40, 50],
    });

    const result = shift(frame, 'a', 2);

    // Первые два значения должны быть NaN (сдвиг на 2 позиции)
    const shiftedValues = Array.from(result.columns.a);
    expect(Number.isNaN(shiftedValues[0])).toBe(true);
    expect(Number.isNaN(shiftedValues[1])).toBe(true);
    expect(arrayEquals(shiftedValues.slice(2), [1, 2, 3])).toBe(true);

    // Другие колонки должны остаться без изменений
    expect(arrayEquals(result.columns.b, [10, 20, 30, 40, 50])).toBe(true);
  });

  test('должен сдвигать значения в колонке назад на указанное количество периодов', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
      b: [10, 20, 30, 40, 50],
    });

    const result = shift(frame, 'a', -2);

    // Последние два значения должны быть NaN (сдвиг на -2 позиции)
    const shiftedValues = Array.from(result.columns.a);
    expect(arrayEquals(shiftedValues.slice(0, 3), [3, 4, 5])).toBe(true);
    expect(Number.isNaN(shiftedValues[3])).toBe(true);
    expect(Number.isNaN(shiftedValues[4])).toBe(true);

    // Другие колонки должны остаться без изменений
    expect(arrayEquals(result.columns.b, [10, 20, 30, 40, 50])).toBe(true);
  });

  test('должен корректно обрабатывать нулевой сдвиг', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
      b: [10, 20, 30, 40, 50],
    });

    const result = shift(frame, 'a', 0);

    // При нулевом сдвиге значения должны остаться без изменений
    expect(arrayEquals(result.columns.a, [1, 2, 3, 4, 5])).toBe(true);

    // Другие колонки также должны остаться без изменений
    expect(arrayEquals(result.columns.b, [10, 20, 30, 40, 50])).toBe(true);
  });

  test('должен корректно обрабатывать сдвиг больше длины колонки', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
      b: [10, 20, 30, 40, 50],
    });

    const result = shift(frame, 'a', 10);

    // Все значения должны быть NaN (сдвиг больше длины колонки)
    const shiftedValues = Array.from(result.columns.a);
    expect(shiftedValues.every((v) => Number.isNaN(v))).toBe(true);

    // Другие колонки должны остаться без изменений
    expect(arrayEquals(result.columns.b, [10, 20, 30, 40, 50])).toBe(true);
  });

  test('должен корректно обрабатывать отрицательный сдвиг больше длины колонки', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
      b: [10, 20, 30, 40, 50],
    });

    const result = shift(frame, 'a', -10);

    // Все значения должны быть NaN (отрицательный сдвиг больше длины колонки)
    const shiftedValues = Array.from(result.columns.a);
    expect(shiftedValues.every((v) => Number.isNaN(v))).toBe(true);

    // Другие колонки должны остаться без изменений
    expect(arrayEquals(result.columns.b, [10, 20, 30, 40, 50])).toBe(true);
  });

  test('должен корректно обрабатывать NaN значения', () => {
    const frame = createFrame({
      a: [1, NaN, 3, 4, NaN],
      b: [10, 20, 30, 40, 50],
    });

    const result = shift(frame, 'a', 2);

    // Первые два значения должны быть NaN (сдвиг на 2 позиции)
    // Значения NaN должны остаться NaN после сдвига
    const shiftedValues = Array.from(result.columns.a);
    expect(Number.isNaN(shiftedValues[0])).toBe(true);
    expect(Number.isNaN(shiftedValues[1])).toBe(true);
    expect(shiftedValues[2]).toBe(1);
    expect(Number.isNaN(shiftedValues[3])).toBe(true);
    expect(shiftedValues[4]).toBe(3);

    // Другие колонки должны остаться без изменений
    expect(arrayEquals(result.columns.b, [10, 20, 30, 40, 50])).toBe(true);
  });

  test('должен выбрасывать ошибку при неверных входных данных', () => {
    expect(() => shift(null, 'a', 1)).toThrow();
    expect(() => shift({}, 'a', 1)).toThrow();
    expect(() => shift({ columns: {} }, 'a', 1)).toThrow();
  });

  test('должен обрабатывать строковые периоды', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
    });

    // Строка '2' обрабатывается как 0, поэтому значения не сдвигаются
    const result = shift(frame, 'a', '2');

    expect(arrayEquals(result.columns.a, [1, 2, 3, 4, 5])).toBe(true);
  });

  test('должен обрабатывать некорректные периоды', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
    });

    // Строка 'not a number' обрабатывается как 0, поэтому значения не сдвигаются
    const result1 = shift(frame, 'a', 'not a number');
    expect(arrayEquals(result1.columns.a, [1, 2, 3, 4, 5])).toBe(true);

    // NaN обрабатывается как 0, поэтому значения не сдвигаются
    const result2 = shift(frame, 'a', NaN);
    expect(arrayEquals(result2.columns.a, [1, 2, 3, 4, 5])).toBe(true);

    // Infinity обрабатывается как 0, поэтому значения не сдвигаются
    const result3 = shift(frame, 'a', Infinity);
    expect(arrayEquals(result3.columns.a, [1, 2, 3, 4, 5])).toBe(true);
  });
});
