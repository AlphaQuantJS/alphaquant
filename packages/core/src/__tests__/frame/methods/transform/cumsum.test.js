/**
 * Tests for methods/transform/cumsum.js
 */

import { createFrame } from '../../../../frame/createFrame.js';
import { cumsum } from '../../../../frame/methods/transform/cumsum.js';

describe('cumsum', () => {
  test('должен вычислять кумулятивную сумму для колонки', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
      b: [10, 20, 30, 40, 50],
    });

    const result = cumsum(frame, 'a');

    expect(Array.from(result.columns.a_cumsum)).toEqual([1, 3, 6, 10, 15]);

    // Другие колонки должны остаться без изменений
    expect(Array.from(result.columns.a)).toEqual([1, 2, 3, 4, 5]);
    expect(Array.from(result.columns.b)).toEqual([10, 20, 30, 40, 50]);
  });

  test('должен корректно обрабатывать NaN значения', () => {
    const frame = createFrame({
      a: [1, NaN, 3, NaN, 5],
      b: [10, 20, 30, 40, 50],
    });

    const result = cumsum(frame, 'a');

    // NaN + любое число = NaN
    const expected = [1, NaN, NaN, NaN, NaN];
    const actual = Array.from(result.columns.a_cumsum);

    expect(actual.length).toBe(expected.length);
    for (let i = 0; i < expected.length; i++) {
      if (Number.isNaN(expected[i])) {
        expect(Number.isNaN(actual[i])).toBe(true);
      } else {
        expect(actual[i]).toBe(expected[i]);
      }
    }

    // Исходная колонка должна остаться без изменений
    const originalValues = Array.from(result.columns.a);
    expect(originalValues.length).toBe(5);
    expect(originalValues[0]).toBe(1);
    expect(Number.isNaN(originalValues[1])).toBe(true);
    expect(originalValues[2]).toBe(3);
    expect(Number.isNaN(originalValues[3])).toBe(true);
    expect(originalValues[4]).toBe(5);

    // Другие колонки должны остаться без изменений
    expect(Array.from(result.columns.b)).toEqual([10, 20, 30, 40, 50]);
  });

  test('должен обрабатывать пустой фрейм', () => {
    const frame = createFrame({
      a: [],
      b: [],
    });

    const result = cumsum(frame, 'a');

    expect(result.rowCount).toBe(0);
    expect(Array.from(result.columns.a_cumsum)).toEqual([]);
    expect(Array.from(result.columns.a)).toEqual([]);
    expect(Array.from(result.columns.b)).toEqual([]);
  });

  test('должен выбрасывать ошибку для некорректных входных данных', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
      b: [10, 20, 30, 40, 50],
    });

    // Некорректная колонка
    expect(() => cumsum(frame, 'nonexistent')).toThrow();

    // Создаем некорректные фреймы для тестирования
    const invalidFrame1 = createFrame({ a: [] });
    expect(() => cumsum(invalidFrame1, 'nonexistent')).toThrow();

    // Проверяем, что функция не выбрасывает ошибку для корректного фрейма
    expect(() => cumsum(frame, 'a')).not.toThrow();
  });
});
