/**
 * Tests for methods/aggregation/mode.js
 */

import { createFrame } from '../../../../frame/createFrame.js';
import { mode } from '../../../../frame/methods/aggregation/mode.js';

describe('mode', () => {
  // Общий тестовый фрейм для всех тестов
  const frame = createFrame({
    a: [1, 2, 3, 4, 5],
    b: [10, 20, 30, 40, 50],
    c: ['x', 'y', 'z', 'w', 'v'],
  });

  test('должен находить моду числовой колонки', () => {
    const modeFrame = createFrame({
      a: [1, 2, 2, 3, 3, 3, 4, 4, 5],
    });

    expect(mode(modeFrame, 'a')).toBe(3); // мода [1, 2, 2, 3, 3, 3, 4, 4, 5] = 3
  });

  test('должен возвращать первое встретившееся значение при нескольких модах', () => {
    const multiModeFrame = createFrame({
      a: [1, 1, 2, 2, 3, 3],
    });

    expect(mode(multiModeFrame, 'a')).toBe(1); // первая из мод [1, 2, 3]
  });

  test('должен обрабатывать NaN, null и undefined', () => {
    const nanModeFrame = createFrame({
      a: [1, NaN, 1, null, 3, null, NaN, undefined],
    });

    expect(mode(nanModeFrame, 'a')).toBe(1); // мода [1, NaN, 1, 0, 3, 0, NaN, NaN] = 1
  });

  test('должен корректно обрабатывать неотсортированные данные', () => {
    const unsortedFrame = createFrame({
      a: [5, 3, 1, 3, 2, 3, 4],
    });

    expect(mode(unsortedFrame, 'a')).toBe(3); // мода [5, 3, 1, 3, 2, 3, 4] = 3
  });

  test('должен выбрасывать ошибку для нечисловой колонки', () => {
    expect(() => mode(frame, 'c')).toThrow();
  });

  test('должен выбрасывать ошибку для несуществующей колонки', () => {
    expect(() => mode(frame, 'd')).toThrow("Column 'd' not found");
  });

  test('должен возвращать NaN для пустого фрейма', () => {
    const emptyFrame = createFrame({
      a: [],
    });

    expect(isNaN(mode(emptyFrame, 'a'))).toBe(true);
  });

  test('должен возвращать NaN, если все значения NaN', () => {
    const nanFrame = createFrame({
      a: [NaN, NaN, NaN],
    });

    expect(isNaN(mode(nanFrame, 'a'))).toBe(true);
  });

  test('должен выбрасывать ошибку для некорректного фрейма', () => {
    expect(() => mode(null, 'a')).toThrow();
    expect(() => mode({}, 'a')).toThrow();
    expect(() => mode({ columns: {} }, 'a')).toThrow();
  });
});
