/**
 * Tests for methods/aggregation/median.js
 */

import { createFrame } from '../../../../frame/createFrame.js';
import { median } from '../../../../frame/methods/aggregation/median.js';

describe('median', () => {
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

  test('должен находить медиану числовой колонки с нечетным количеством элементов', () => {
    expect(median(frame, 'a')).toBe(3); // медиана [1, 2, 3, 4, 5] = 3
    expect(median(frame, 'b')).toBe(30); // медиана [10, 20, 30, 40, 50] = 30
  });

  test('должен находить медиану числовой колонки с четным количеством элементов', () => {
    const evenFrame = createFrame({
      a: [1, 2, 3, 4, 5, 6],
    });

    expect(median(evenFrame, 'a')).toBe(3.5); // медиана [1, 2, 3, 4, 5, 6] = (3 + 4) / 2 = 3.5
  });

  test('должен обрабатывать NaN, null и undefined', () => {
    // Для колонки a: [1, NaN, 3, 0, 5, NaN] -> [0, 1, 3, 5] -> медиана = 2
    expect(median(frameWithNaN, 'a')).toBe(2);
  });

  test('должен корректно обрабатывать неотсортированные данные', () => {
    const unsortedFrame = createFrame({
      a: [5, 3, 1, 4, 2],
    });

    expect(median(unsortedFrame, 'a')).toBe(3); // медиана [1, 2, 3, 4, 5] = 3
  });

  test('должен выбрасывать ошибку для нечисловой колонки', () => {
    expect(() => median(frame, 'c')).toThrow();
  });

  test('должен выбрасывать ошибку для несуществующей колонки', () => {
    expect(() => median(frame, 'd')).toThrow("Column 'd' not found");
  });

  test('должен возвращать NaN для пустого фрейма', () => {
    const emptyFrame = createFrame({
      a: [],
    });

    expect(isNaN(median(emptyFrame, 'a'))).toBe(true);
  });

  test('должен возвращать NaN, если все значения NaN', () => {
    const nanFrame = createFrame({
      a: [NaN, NaN, NaN],
    });

    expect(isNaN(median(nanFrame, 'a'))).toBe(true);
  });

  test('должен выбрасывать ошибку для некорректного фрейма', () => {
    expect(() => median(null, 'a')).toThrow();
    expect(() => median({}, 'a')).toThrow();
    expect(() => median({ columns: {} }, 'a')).toThrow();
  });
});
