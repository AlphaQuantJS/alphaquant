/**
 * rollingMeanTyped.test.js - Тесты для функции rollingMeanTyped
 */

import { rollingMeanTyped } from '../../../../frame/window/rolling/rollingMeanTyped';

describe('rollingMeanTyped', () => {
  test('должен правильно вычислять скользящее среднее для маленьких окон (<=16)', () => {
    const values = [1, 2, 3, 4, 5];
    const windowSize = 3;
    const result = new Float64Array(values.length);

    rollingMeanTyped(values, windowSize, result);

    // Первые два значения должны быть NaN (окно не заполнено)
    expect(isNaN(result[0])).toBe(true);
    expect(isNaN(result[1])).toBe(true);

    // Остальные должны быть рассчитаны
    expect(result[2]).toBe(2); // (1+2+3)/3
    expect(result[3]).toBe(3); // (2+3+4)/3
    expect(result[4]).toBe(4); // (3+4+5)/3
  });

  test('должен правильно вычислять скользящее среднее для средних окон (>16 и <=128)', () => {
    // Создаем массив из 50 элементов [1, 2, 3, ..., 50]
    const values = Array.from({ length: 50 }, (_, i) => i + 1);
    const windowSize = 20;
    const result = new Float64Array(values.length);

    rollingMeanTyped(values, windowSize, result);

    // Первые 19 значений должны быть NaN (окно не заполнено)
    for (let i = 0; i < windowSize - 1; i++) {
      expect(isNaN(result[i])).toBe(true);
    }

    // Проверяем несколько значений
    // Среднее для окна [1, 2, 3, ..., 20] = 10.5
    expect(result[19]).toBe(10.5);

    // Среднее для окна [2, 3, 4, ..., 21] = 11.5
    expect(result[20]).toBe(11.5);

    // Среднее для окна [31, 32, 33, ..., 50] = 40.5
    expect(result[49]).toBe(40.5);
  });

  test('должен правильно вычислять скользящее среднее для больших окон (>128)', () => {
    // Создаем массив из 200 элементов [1, 2, 3, ..., 200]
    const values = Array.from({ length: 200 }, (_, i) => i + 1);
    const windowSize = 150;
    const result = new Float64Array(values.length);

    rollingMeanTyped(values, windowSize, result);

    // Первые 149 значений должны быть NaN (окно не заполнено)
    for (let i = 0; i < windowSize - 1; i++) {
      expect(isNaN(result[i])).toBe(true);
    }

    // Проверяем несколько значений
    // Среднее для окна [1, 2, 3, ..., 150] = 75.5
    expect(result[149]).toBe(75.5);

    // Среднее для окна [2, 3, 4, ..., 151] = 76.5
    expect(result[150]).toBe(76.5);

    // Среднее для окна [51, 52, 53, ..., 200] = 125.5
    expect(result[199]).toBe(125.5);
  });

  test('должен создавать массив результатов, если он не предоставлен', () => {
    const values = [1, 2, 3, 4, 5];
    const windowSize = 3;

    const result = rollingMeanTyped(values, windowSize);

    expect(result instanceof Float64Array).toBe(true);
    expect(result.length).toBe(values.length);

    // Проверяем результаты
    expect(isNaN(result[0])).toBe(true);
    expect(isNaN(result[1])).toBe(true);
    expect(result[2]).toBe(2);
    expect(result[3]).toBe(3);
    expect(result[4]).toBe(4);
  });

  test('должен обрабатывать значения NaN', () => {
    const values = [1, NaN, 3, 4, 5];
    const windowSize = 3;
    const result = new Float64Array(values.length);

    rollingMeanTyped(values, windowSize, result);

    // Первые два значения должны быть NaN (окно не заполнено)
    expect(isNaN(result[0])).toBe(true);
    expect(isNaN(result[1])).toBe(true);

    // Окна с NaN должны давать NaN
    expect(isNaN(result[2])).toBe(true); // (1+NaN+3)/3
    expect(isNaN(result[3])).toBe(true); // (NaN+3+4)/3
    expect(result[4]).toBe(4); // (3+4+5)/3
  });
});
