/**
 * Tests for methods/transform/transformSeries.js
 */

import { createFrame } from '../../../../frame/createFrame.js';
import { transformSeries } from '../../../../frame/methods/transform/transformSeries.js';
import { arrayEquals } from '../../../helpers/arrayEquals.js';

describe('transformSeries', () => {
  test('должен применять функцию трансформации к колонке', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
      b: [10, 20, 30, 40, 50],
    });

    // Функция трансформации: умножение на 2
    const result = transformSeries(frame, 'a', (x) => x * 2);

    expect(arrayEquals(result.columns.a, [2, 4, 6, 8, 10])).toBe(true);

    // Другие колонки должны остаться без изменений
    expect(arrayEquals(result.columns.b, [10, 20, 30, 40, 50])).toBe(true);
  });

  test('должен применять функцию трансформации с доступом к индексу', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
      b: [10, 20, 30, 40, 50],
    });

    // Функция трансформации: умножение на индекс
    const result = transformSeries(frame, 'a', (x, i) => x * i);

    expect(arrayEquals(result.columns.a, [0, 2, 6, 12, 20])).toBe(true);
  });

  test('должен применять функцию трансформации с доступом к массиву значений', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
      b: [10, 20, 30, 40, 50],
    });

    // Функция трансформации: сумма текущего значения и первого значения в массиве
    const result = transformSeries(frame, 'a', (x, i, values) => x + values[0]);

    expect(arrayEquals(result.columns.a, [2, 3, 4, 5, 6])).toBe(true);
  });

  test('должен корректно обрабатывать NaN значения', () => {
    const frame = createFrame({
      a: [1, NaN, 3, 4, NaN],
      b: [10, 20, 30, 40, 50],
    });

    // Функция трансформации: умножение на 2
    const result = transformSeries(frame, 'a', (x) => x * 2);

    const transformedValues = Array.from(result.columns.a);
    expect(transformedValues[0]).toBe(2);
    expect(Number.isNaN(transformedValues[1])).toBe(true);
    expect(transformedValues[2]).toBe(6);
    expect(transformedValues[3]).toBe(8);
    expect(Number.isNaN(transformedValues[4])).toBe(true);
  });

  test('должен обрабатывать пустой фрейм', () => {
    const frame = createFrame({
      a: [],
      b: [],
    });

    const result = transformSeries(frame, 'a', (x) => x * 2);

    expect(result.rowCount).toBe(0);
    expect(result.columns.a.length).toBe(0);
    expect(result.columns.b.length).toBe(0);
  });

  test('должен выбрасывать ошибку для некорректного фрейма', () => {
    expect(() => transformSeries(null, 'a', (x) => x * 2)).toThrow();
    expect(() => transformSeries({}, 'a', (x) => x * 2)).toThrow();
    expect(() => transformSeries({ columns: {} }, 'a', (x) => x * 2)).toThrow();
  });

  test('должен выбрасывать ошибку для несуществующей колонки', () => {
    const frame = createFrame({
      a: [1, 2, 3],
      b: [10, 20, 30],
    });

    expect(() => transformSeries(frame, 'c', (x) => x * 2)).toThrow();
  });

  test('должен выбрасывать ошибку для некорректной функции трансформации', () => {
    const frame = createFrame({
      a: [1, 2, 3],
      b: [10, 20, 30],
    });

    expect(() => transformSeries(frame, 'a', null)).toThrow();
    expect(() => transformSeries(frame, 'a', undefined)).toThrow();
    expect(() => transformSeries(frame, 'a', 'not a function')).toThrow();
  });
});
