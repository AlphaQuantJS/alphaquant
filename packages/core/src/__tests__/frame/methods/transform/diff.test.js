/**
 * Tests for methods/transform/diff.js
 */

import { createFrame } from '../../../../frame/createFrame.js';
import { diff, pctChange } from '../../../../frame/methods/transform/diff.js';
import { arrayEquals } from '../../../helpers/arrayEquals.js';

describe('diff', () => {
  test('должен вычислять разницу между соседними значениями в колонке', () => {
    const frame = createFrame({
      a: [10, 15, 20, 25, 30],
      b: [100, 200, 300, 400, 500],
    });

    const result = diff(frame, 'a');

    // Первое значение должно быть NaN, остальные - разница между текущим и предыдущим
    const diffValues = Array.from(result.columns.a);
    expect(Number.isNaN(diffValues[0])).toBe(true);
    expect(arrayEquals(diffValues.slice(1), [5, 5, 5, 5])).toBe(true);

    // Другие колонки должны остаться без изменений
    expect(arrayEquals(result.columns.b, [100, 200, 300, 400, 500])).toBe(true);
  });

  test('должен вычислять разницу с указанным периодом', () => {
    const frame = createFrame({
      a: [10, 15, 20, 25, 30, 35, 40],
      b: [100, 200, 300, 400, 500, 600, 700],
    });

    const result = diff(frame, 'a', 2);

    // Первые два значения должны быть NaN, остальные - разница между текущим и значением 2 периода назад
    const diffValues = Array.from(result.columns.a);
    expect(Number.isNaN(diffValues[0])).toBe(true);
    expect(Number.isNaN(diffValues[1])).toBe(true);
    expect(arrayEquals(diffValues.slice(2), [10, 10, 10, 10, 10])).toBe(true);
  });

  test('должен корректно обрабатывать NaN значения', () => {
    const frame = createFrame({
      a: [10, NaN, 20, 25, NaN],
      b: [100, 200, 300, 400, 500],
    });

    const result = diff(frame, 'a');

    // Если текущее или предыдущее значение - NaN, результат должен быть NaN
    const diffValues = Array.from(result.columns.a);
    expect(Number.isNaN(diffValues[0])).toBe(true);
    expect(Number.isNaN(diffValues[1])).toBe(true);
    expect(Number.isNaN(diffValues[2])).toBe(true);
    expect(diffValues[3]).toBe(5);
    expect(Number.isNaN(diffValues[4])).toBe(true);
  });

  test('должен обрабатывать пустой фрейм', () => {
    const frame = createFrame({
      a: [],
      b: [],
    });

    const result = diff(frame, 'a');

    expect(result.rowCount).toBe(0);
    expect(result.columns.a.length).toBe(0);
    expect(result.columns.b.length).toBe(0);
  });

  test('должен выбрасывать ошибку для некорректного фрейма', () => {
    expect(() => diff(null, 'a')).toThrow();
    expect(() => diff({}, 'a')).toThrow();
    expect(() => diff({ columns: {} }, 'a')).toThrow();
  });

  test('должен выбрасывать ошибку для несуществующей колонки', () => {
    const frame = createFrame({
      a: [1, 2, 3],
      b: [10, 20, 30],
    });

    expect(() => diff(frame, 'c')).toThrow();
  });

  test('должен выбрасывать ошибку для отрицательного или нулевого периода', () => {
    const frame = createFrame({
      a: [1, 2, 3],
      b: [10, 20, 30],
    });

    // Функция diff выбрасывает ошибку для периодов <= 0
    expect(() => diff(frame, 'a', 0)).toThrow();
    expect(() => diff(frame, 'a', -1)).toThrow();
  });

  test('должен выбрасывать ошибку для некорректных периодов', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
    });

    // Строковые значения, NaN и Infinity должны вызывать ошибку
    expect(() => diff(frame, 'a', 'string')).toThrow();
    expect(() => diff(frame, 'a', NaN)).toThrow();
    expect(() => diff(frame, 'a', Infinity)).toThrow();
  });
});

describe('pctChange', () => {
  test('должен вычислять процентное изменение между соседними значениями в колонке', () => {
    const frame = createFrame({
      a: [100, 120, 150, 180, 200],
      b: [100, 200, 300, 400, 500],
    });

    const result = pctChange(frame, 'a');

    // Первое значение должно быть NaN, остальные - процентное изменение
    const pctValues = Array.from(result.columns.a);
    expect(Number.isNaN(pctValues[0])).toBe(true);

    // Проверяем процентное изменение с точностью до 0.001
    expect(Math.abs(pctValues[1] - 0.2) < 0.001).toBe(true); // (120-100)/100 = 0.2
    expect(Math.abs(pctValues[2] - 0.25) < 0.001).toBe(true); // (150-120)/120 = 0.25
    expect(Math.abs(pctValues[3] - 0.2) < 0.001).toBe(true); // (180-150)/150 = 0.2
    expect(Math.abs(pctValues[4] - 0.111111) < 0.001).toBe(true); // (200-180)/180 = 0.111111

    // Другие колонки должны остаться без изменений
    expect(arrayEquals(result.columns.b, [100, 200, 300, 400, 500])).toBe(true);
  });

  test('должен вычислять процентное изменение с указанным периодом', () => {
    const frame = createFrame({
      a: [100, 110, 121, 133.1, 146.41, 161.051, 177.1561],
      b: [100, 200, 300, 400, 500, 600, 700],
    });

    const result = pctChange(frame, 'a', 2);

    // Первые два значения должны быть NaN, остальные - процентное изменение
    const pctValues = Array.from(result.columns.a);
    expect(Number.isNaN(pctValues[0])).toBe(true);
    expect(Number.isNaN(pctValues[1])).toBe(true);

    // Проверяем процентное изменение с точностью до 0.001
    expect(Math.abs(pctValues[2] - 0.21) < 0.001).toBe(true); // (121-100)/100 = 0.21
    expect(Math.abs(pctValues[3] - 0.21) < 0.001).toBe(true); // (133.1-110)/110 = 0.21
    expect(Math.abs(pctValues[4] - 0.21) < 0.001).toBe(true); // (146.41-121)/121 = 0.21
    expect(Math.abs(pctValues[5] - 0.21) < 0.001).toBe(true); // (161.051-133.1)/133.1 = 0.21
    expect(Math.abs(pctValues[6] - 0.21) < 0.001).toBe(true); // (177.1561-146.41)/146.41 = 0.21
  });

  test('должен корректно обрабатывать нулевые значения', () => {
    const frame = createFrame({
      a: [0, 10, 0, 20, 0],
      b: [100, 200, 300, 400, 500],
    });

    const result = pctChange(frame, 'a');

    // Если предыдущее значение 0, результат должен быть Infinity
    const pctValues = Array.from(result.columns.a);
    expect(Number.isNaN(pctValues[0])).toBe(true);
    expect(pctValues[1]).toBe(Infinity); // (10-0)/0 = Infinity
    expect(pctValues[2]).toBe(-1); // (0-10)/10 = -1
    expect(pctValues[3]).toBe(Infinity); // (20-0)/0 = Infinity
    expect(pctValues[4]).toBe(-1); // (0-20)/20 = -1
  });

  test('должен корректно обрабатывать NaN значения', () => {
    const frame = createFrame({
      a: [10, NaN, 20, 25, NaN],
      b: [100, 200, 300, 400, 500],
    });

    const result = pctChange(frame, 'a');

    // Если текущее или предыдущее значение - NaN, результат должен быть NaN
    const pctValues = Array.from(result.columns.a);
    expect(Number.isNaN(pctValues[0])).toBe(true);
    expect(Number.isNaN(pctValues[1])).toBe(true);
    expect(Number.isNaN(pctValues[2])).toBe(true);
    expect(Math.abs(pctValues[3] - 0.25) < 0.001).toBe(true); // (25-20)/20 = 0.25
    expect(Number.isNaN(pctValues[4])).toBe(true);
  });

  test('должен обрабатывать пустой фрейм', () => {
    const frame = createFrame({
      a: [],
      b: [],
    });

    const result = pctChange(frame, 'a');

    expect(result.rowCount).toBe(0);
    expect(result.columns.a.length).toBe(0);
    expect(result.columns.b.length).toBe(0);
  });

  test('должен выбрасывать ошибку для некорректного фрейма', () => {
    expect(() => pctChange(null, 'a')).toThrow();
    expect(() => pctChange({}, 'a')).toThrow();
    expect(() => pctChange({ columns: {} }, 'a')).toThrow();
  });

  test('должен выбрасывать ошибку для несуществующей колонки', () => {
    const frame = createFrame({
      a: [1, 2, 3],
      b: [10, 20, 30],
    });

    expect(() => pctChange(frame, 'c')).toThrow();
  });

  test('должен выбрасывать ошибку для отрицательного или нулевого периода', () => {
    const frame = createFrame({
      a: [1, 2, 3],
      b: [10, 20, 30],
    });

    // Функция pctChange выбрасывает ошибку для периодов <= 0
    expect(() => pctChange(frame, 'a', 0)).toThrow();
    expect(() => pctChange(frame, 'a', -1)).toThrow();
  });

  test('должен выбрасывать ошибку для некорректных периодов', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
    });

    // Строковые значения, NaN и Infinity должны вызывать ошибку
    expect(() => pctChange(frame, 'a', 'string')).toThrow();
    expect(() => pctChange(frame, 'a', NaN)).toThrow();
    expect(() => pctChange(frame, 'a', Infinity)).toThrow();
  });
});
