/**
 * Tests for methods/aggregation/min.js
 */

import { createFrame } from '../../../../frame/createFrame.js';
import { min } from '../../../../frame/methods/aggregation/min.js';

describe('min', () => {
  // Общий тестовый фрейм для всех тестов
  const frame = createFrame({
    a: [1, 2, 3, 4, 5],
    b: [10, 20, 30, 40, 50],
    c: ['x', 'y', 'z', 'w', 'v'],
  });

  // Фрейм с NaN, null и undefined значениями
  const frameWithNaN = createFrame({
    a: [1, NaN, 3, null, 5, undefined],
    b: [10, 20, NaN, 40, null, 60],
  });

  test('должен находить минимальное значение числовой колонки', () => {
    expect(min(frame, 'a')).toBe(1);
    expect(min(frame, 'b')).toBe(10);
  });

  test('должен обрабатывать NaN, null и undefined', () => {
    expect(min(frameWithNaN, 'a')).toBe(0); // null = 0, NaN и undefined исключаются
    expect(min(frameWithNaN, 'b')).toBe(0); // null = 0
  });

  test('должен выбрасывать ошибку для нечисловой колонки', () => {
    expect(() => min(frame, 'c')).toThrow();
  });

  test('должен выбрасывать ошибку для несуществующей колонки', () => {
    expect(() => min(frame, 'd')).toThrow("Column 'd' not found");
  });

  test('должен возвращать Infinity для пустого фрейма', () => {
    const emptyFrame = createFrame({
      a: [],
    });

    expect(min(emptyFrame, 'a')).toBe(Infinity);
  });

  test('должен возвращать NaN, если все значения NaN', () => {
    const nanFrame = createFrame({
      a: [NaN, NaN, NaN],
    });

    expect(isNaN(min(nanFrame, 'a'))).toBe(true);
  });

  test('должен выбрасывать ошибку для некорректного фрейма', () => {
    expect(() => min(null, 'a')).toThrow();
    expect(() => min({}, 'a')).toThrow();
    expect(() => min({ columns: {} }, 'a')).toThrow();
  });
});
