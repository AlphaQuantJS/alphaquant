/**
 * Tests for agg/sum.js
 */

import { createFrame } from '../../../../frame/createFrame.js';
import { sum } from '../../../../frame/methods/aggregation/sum.js';

describe('sum', () => {
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

  test('должен вычислять сумму числовой колонки', () => {
    expect(sum(frame, 'a')).toBe(15); // 1 + 2 + 3 + 4 + 5 = 15
    expect(sum(frame, 'b')).toBe(150); // 10 + 20 + 30 + 40 + 50 = 150
  });

  test('должен обрабатывать NaN, null и undefined', () => {
    expect(sum(frameWithNaN, 'a')).toBe(9); // 1 + 3 + 0 + 5 = 9 (null = 0, NaN и undefined исключаются)
    expect(sum(frameWithNaN, 'b')).toBe(130); // 10 + 20 + 40 + 0 + 60 = 130
  });

  test('должен выбрасывать ошибку для нечисловой колонки', () => {
    expect(() => sum(frame, 'c')).toThrow();
  });

  test('должен выбрасывать ошибку для несуществующей колонки', () => {
    expect(() => sum(frame, 'd')).toThrow("Column 'd' not found");
  });

  test('должен возвращать 0 для пустого фрейма', () => {
    const emptyFrame = createFrame({
      a: [],
    });

    expect(sum(emptyFrame, 'a')).toBe(0);
  });

  test('должен выбрасывать ошибку для некорректного фрейма', () => {
    expect(() => sum(null, 'a')).toThrow();
    expect(() => sum({}, 'a')).toThrow();
    expect(() => sum({ columns: {} }, 'a')).toThrow();
  });
});
