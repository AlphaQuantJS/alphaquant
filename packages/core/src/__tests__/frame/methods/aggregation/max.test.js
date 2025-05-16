/**
 * Tests for methods/aggregation/max.js
 */

import { createFrame } from '../../../../frame/createFrame.js';
import { max } from '../../../../frame/methods/aggregation/max.js';

describe('max', () => {
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

  test('должен находить максимальное значение числовой колонки', () => {
    expect(max(frame, 'a')).toBe(5);
    expect(max(frame, 'b')).toBe(50);
  });

  test('должен обрабатывать NaN, null и undefined', () => {
    expect(max(frameWithNaN, 'a')).toBe(5); // NaN и undefined исключаются
    expect(max(frameWithNaN, 'b')).toBe(60);
  });

  test('должен выбрасывать ошибку для нечисловой колонки', () => {
    expect(() => max(frame, 'c')).toThrow();
  });

  test('должен выбрасывать ошибку для несуществующей колонки', () => {
    expect(() => max(frame, 'd')).toThrow("Column 'd' not found");
  });

  test('должен возвращать -Infinity для пустого фрейма', () => {
    const emptyFrame = createFrame({
      a: [],
    });

    expect(max(emptyFrame, 'a')).toBe(-Infinity);
  });

  test('должен возвращать NaN, если все значения NaN', () => {
    const nanFrame = createFrame({
      a: [NaN, NaN, NaN],
    });

    expect(isNaN(max(nanFrame, 'a'))).toBe(true);
  });

  test('должен выбрасывать ошибку для некорректного фрейма', () => {
    expect(() => max(null, 'a')).toThrow();
    expect(() => max({}, 'a')).toThrow();
    expect(() => max({ columns: {} }, 'a')).toThrow();
  });
});
