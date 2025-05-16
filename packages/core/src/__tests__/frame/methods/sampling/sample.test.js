/**
 * Tests for sample.js
 */

import { createFrame } from '../../../../frame/createFrame.js';
import { sample } from '../../../../frame/methods/sampling/sample.js';

describe('sample', () => {
  test('должен создавать выборку указанного размера', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      b: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    });

    const result = sample(frame, 5);

    expect(result.rowCount).toBe(5);
    expect(Object.keys(result.columns)).toEqual(['a', 'b']);
  });

  test('должен выбрасывать ошибку, если n больше, чем количество строк и replace=false', () => {
    const frame = createFrame({
      a: [1, 2, 3],
      b: [10, 20, 30],
    });

    expect(() => sample(frame, 5, false)).toThrow();
  });

  test('должен позволять выборку с заменой', () => {
    const frame = createFrame({
      a: [1, 2, 3],
      b: [10, 20, 30],
    });

    const result = sample(frame, 5, true);

    expect(result.rowCount).toBe(5);
    expect(Object.keys(result.columns)).toEqual(['a', 'b']);
  });

  test('должен возвращать воспроизводимые результаты с заданным seed', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      b: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    });

    const result1 = sample(frame, 5, false, 42);
    const result2 = sample(frame, 5, false, 42);

    // Проверяем, что результаты идентичны
    expect(Array.from(result1.columns.a)).toEqual(
      Array.from(result2.columns.a),
    );
    expect(Array.from(result1.columns.b)).toEqual(
      Array.from(result2.columns.b),
    );
  });

  test('должен возвращать разные результаты с разными seed', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      b: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    });

    const result1 = sample(frame, 5, false, 42);
    const result2 = sample(frame, 5, false, 43);

    // Проверяем, что результаты различаются (с очень высокой вероятностью)
    // Примечание: в редких случаях этот тест может не пройти, если случайно выбраны одинаковые строки
    const arrays1 = Array.from(result1.columns.a);
    const arrays2 = Array.from(result2.columns.a);

    // Проверяем, что хотя бы один элемент отличается
    const hasDifference = arrays1.some((val, idx) => val !== arrays2[idx]);
    expect(hasDifference).toBe(true);
  });

  test('должен обрабатывать пустой фрейм', () => {
    const frame = createFrame({
      a: [],
      b: [],
    });

    const result = sample(frame, 0);

    expect(result.rowCount).toBe(0);
    expect(result.columns.a.length).toBe(0);
    expect(result.columns.b.length).toBe(0);
  });

  test('должен выбрасывать ошибку для некорректного фрейма', () => {
    expect(() => sample(null, 5)).toThrow();
    expect(() => sample({}, 5)).toThrow();
    expect(() => sample({ columns: {} }, 5)).toThrow();
  });

  test('должен выбрасывать ошибку для некорректного n', () => {
    const frame = createFrame({
      a: [1, 2, 3],
      b: [10, 20, 30],
    });

    expect(() => sample(frame, -1)).toThrow();
    expect(() => sample(frame, 'string')).toThrow();
  });
});
