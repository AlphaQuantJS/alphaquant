/**
 * Tests for agg/count.js
 */

import { createFrame } from '../../../../frame/createFrame.js';
import { count } from '../../../../frame/methods/aggregation/count.js';

describe('count', () => {
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

  test('должен подсчитывать количество элементов в колонке', () => {
    expect(count(frame, 'a')).toBe(5);
    expect(count(frame, 'b')).toBe(5);
    expect(count(frame, 'c')).toBe(5);
  });

  test('должен включать NaN, null и undefined при подсчете', () => {
    expect(count(frameWithNaN, 'a')).toBe(6);
    expect(count(frameWithNaN, 'b')).toBe(6);
  });

  test('должен возвращать 0 для пустого фрейма', () => {
    const emptyFrame = createFrame({
      a: [],
    });

    expect(count(emptyFrame, 'a')).toBe(0);
  });

  test('должен выбрасывать ошибку для несуществующей колонки', () => {
    expect(() => count(frame, 'd')).toThrow("Column 'd' not found");
  });

  test('должен выбрасывать ошибку для некорректного фрейма', () => {
    expect(() => count(null, 'a')).toThrow();
    expect(() => count({}, 'a')).toThrow();
    expect(() => count({ columns: {} }, 'a')).toThrow();
  });
});
