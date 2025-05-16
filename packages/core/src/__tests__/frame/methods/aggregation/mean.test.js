/**
 * Tests for methods/aggregation/mean.js
 */

import { createFrame } from '../../../../frame/createFrame.js';
import { mean } from '../../../../frame/methods/aggregation/mean.js';

describe('mean', () => {
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

  test('должен вычислять среднее значение числовой колонки', () => {
    expect(mean(frame, 'a')).toBe(3); // (1 + 2 + 3 + 4 + 5) / 5 = 3
    expect(mean(frame, 'b')).toBe(30); // (10 + 20 + 30 + 40 + 50) / 5 = 30
  });

  test('должен обрабатывать NaN, null и undefined', () => {
    expect(mean(frameWithNaN, 'a')).toBe(2.25); // (1 + 3 + 0 + 5) / 4 = 2.25
    expect(mean(frameWithNaN, 'b')).toBe(26); // (10 + 20 + 40 + 0 + 60) / 5 = 26
  });

  test('должен выбрасывать ошибку для нечисловой колонки', () => {
    expect(() => mean(frame, 'c')).toThrow();
  });

  test('должен выбрасывать ошибку для несуществующей колонки', () => {
    expect(() => mean(frame, 'd')).toThrow("Column 'd' not found");
  });

  test('должен возвращать NaN для пустого фрейма', () => {
    const emptyFrame = createFrame({
      a: [],
    });

    expect(isNaN(mean(emptyFrame, 'a'))).toBe(true);
  });

  test('должен выбрасывать ошибку для некорректного фрейма', () => {
    expect(() => mean(null, 'a')).toThrow();
    expect(() => mean({}, 'a')).toThrow();
    expect(() => mean({ columns: {} }, 'a')).toThrow();
  });
});
