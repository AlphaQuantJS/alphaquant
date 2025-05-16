/**
 * Tests for sampleFraction.js
 */

import { createFrame } from '../../../../frame/createFrame.js';
import { sampleFraction } from '../../../../frame/methods/sampling/sampleFraction.js';

describe('sampleFraction', () => {
  test('должен создавать выборку указанной доли', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      b: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    });

    const result = sampleFraction(frame, 0.5);

    expect(result.rowCount).toBe(5); // 50% от 10 строк = 5 строк
    expect(Object.keys(result.columns)).toEqual(['a', 'b']);
  });

  test('должен округлять количество строк', () => {
    const frame = createFrame({
      a: [1, 2, 3],
      b: [10, 20, 30],
    });

    const result = sampleFraction(frame, 0.4);

    // 40% от 3 строк = 1.2, округляем до 1 (Math.round)
    expect(result.rowCount).toBe(1);
  });

  test('должен возвращать воспроизводимые результаты с заданным seed', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      b: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    });

    const result1 = sampleFraction(frame, 0.5, 42);
    const result2 = sampleFraction(frame, 0.5, 42);

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

    const result1 = sampleFraction(frame, 0.5, 42);
    const result2 = sampleFraction(frame, 0.5, 43);

    // Проверяем, что результаты различаются (с очень высокой вероятностью)
    // Примечание: в редких случаях этот тест может не пройти, если случайно выбраны одинаковые строки
    const arrays1 = Array.from(result1.columns.a);
    const arrays2 = Array.from(result2.columns.a);

    // Проверяем, что хотя бы один элемент отличается
    const hasDifference = arrays1.some((val, idx) => val !== arrays2[idx]);
    expect(hasDifference).toBe(true);
  });

  test('должен возвращать весь фрейм при fraction=1', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
      b: [10, 20, 30, 40, 50],
    });

    const result = sampleFraction(frame, 1);

    expect(result.rowCount).toBe(5);
    // Порядок строк может отличаться, поэтому проверяем только наличие всех значений
    expect(Array.from(result.columns.a).sort()).toEqual([1, 2, 3, 4, 5]);
    expect(Array.from(result.columns.b).sort()).toEqual([10, 20, 30, 40, 50]);
  });

  test('должен выбрасывать ошибку при fraction=0', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
      b: [10, 20, 30, 40, 50],
    });

    expect(() => sampleFraction(frame, 0)).toThrow(
      'Fraction must be a number between 0 and 1',
    );
  });

  test('должен обрабатывать пустой фрейм', () => {
    const frame = createFrame({
      a: [],
      b: [],
    });

    const result = sampleFraction(frame, 0.5);

    expect(result.rowCount).toBe(0);
    expect(result.columns.a.length).toBe(0);
    expect(result.columns.b.length).toBe(0);
  });

  test('должен выбрасывать ошибку для некорректного фрейма', () => {
    expect(() => sampleFraction(null, 0.5)).toThrow();
    expect(() => sampleFraction({}, 0.5)).toThrow();
    expect(() => sampleFraction({ columns: {} }, 0.5)).toThrow();
  });

  test('должен выбрасывать ошибку для некорректной доли', () => {
    const frame = createFrame({
      a: [1, 2, 3],
      b: [10, 20, 30],
    });

    expect(() => sampleFraction(frame, -0.1)).toThrow();
    expect(() => sampleFraction(frame, 1.1)).toThrow();
    expect(() => sampleFraction(frame, 'string')).toThrow();
  });
});
