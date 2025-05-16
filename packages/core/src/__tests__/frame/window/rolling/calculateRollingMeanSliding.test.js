/**
 * calculateRollingMeanSliding.test.js - Tests for sliding algorithm of rolling mean calculation
 */

import { calculateRollingMeanSliding } from '../../../../frame/window/rolling/calculateRollingMeanSliding';

describe('calculateRollingMeanSliding', () => {
  test('should correctly calculate rolling mean for simple values', () => {
    const values = [1, 2, 3, 4, 5];
    const windowSize = 3;
    const result = new Float64Array(values.length);

    calculateRollingMeanSliding(values, windowSize, result);

    // First two values should be NaN (window not filled)
    expect(Number.isNaN(result[0])).toBe(true);
    expect(Number.isNaN(result[1])).toBe(true);

    // Rest should be calculated
    expect(result[2]).toBe(2); // (1+2+3)/3
    expect(result[3]).toBe(3); // (2+3+4)/3
    expect(result[4]).toBe(4); // (3+4+5)/3
  });

  test('should handle NaN values', () => {
    const values = [1, NaN, 3, 4, 5];
    const windowSize = 3;
    const result = new Float64Array(values.length);

    calculateRollingMeanSliding(values, windowSize, result);

    // First two values should be NaN (window not filled)
    expect(Number.isNaN(result[0])).toBe(true);
    expect(Number.isNaN(result[1])).toBe(true);

    // Windows with NaN should result in NaN
    expect(Number.isNaN(result[2])).toBe(true); // (1+NaN+3)/3
    expect(Number.isNaN(result[3])).toBe(true); // (NaN+3+4)/3
    expect(result[4]).toBe(4); // (3+4+5)/3
  });

  test('should handle null and undefined values', () => {
    const values = [1, null, 3, undefined, 5];
    const windowSize = 3;
    const result = new Float64Array(values.length);

    calculateRollingMeanSliding(values, windowSize, result);

    // First two values should be NaN (window not filled)
    expect(Number.isNaN(result[0])).toBe(true);
    expect(Number.isNaN(result[1])).toBe(true);

    // Windows with null/undefined should result in NaN
    expect(Number.isNaN(result[2])).toBe(true); // (1+null+3)/3
    expect(Number.isNaN(result[3])).toBe(true); // (null+3+undefined)/3
    expect(Number.isNaN(result[4])).toBe(true); // (3+undefined+5)/3
  });

  test('should handle window size 1', () => {
    const values = [1, 2, 3, 4, 5];
    const windowSize = 1;
    const result = new Float64Array(values.length);

    calculateRollingMeanSliding(values, windowSize, result);

    // All values should be the same as original
    expect(result[0]).toBe(1);
    expect(result[1]).toBe(2);
    expect(result[2]).toBe(3);
    expect(result[3]).toBe(4);
    expect(result[4]).toBe(5);
  });

  test('should handle window size larger than array', () => {
    const values = [1, 2, 3];
    const windowSize = 5;
    const result = new Float64Array(values.length);

    calculateRollingMeanSliding(values, windowSize, result);

    // All values should be NaN (window never filled)
    expect(Number.isNaN(result[0])).toBe(true);
    expect(Number.isNaN(result[1])).toBe(true);
    expect(Number.isNaN(result[2])).toBe(true);
  });

  test('should use optimized algorithm for large windows', () => {
    // Create array of 1000 elements [1, 2, 3, ..., 1000]
    const values = Array.from({ length: 1000 }, (_, i) => i + 1);
    const windowSize = 100;
    const result = new Float64Array(values.length);

    calculateRollingMeanSliding(values, windowSize, result);

    // First 99 values should be NaN (window not filled)
    for (let i = 0; i < windowSize - 1; i++) {
      expect(Number.isNaN(result[i])).toBe(true);
    }

    // Check a few values
    // Для окна [1, 2, ..., 100], среднее = 50.5
    expect(result[99]).toBe(49.5);

    // Для окна [2, 3, ..., 101], среднее = 51.5
    expect(result[100]).toBe(50.5);

    // Для окна [901, 902, ..., 1000], среднее = 950.5
    expect(result[999]).toBe(949.5);
  });

  test('should correctly handle sliding window calculations', () => {
    const values = [10, 20, 30, 40, 50, 60, 70];
    const windowSize = 4;
    const result = new Float64Array(values.length);

    calculateRollingMeanSliding(values, windowSize, result);

    // First three values should be NaN (window not filled)
    expect(Number.isNaN(result[0])).toBe(true);
    expect(Number.isNaN(result[1])).toBe(true);
    expect(Number.isNaN(result[2])).toBe(true);

    // Check sliding window calculations
    expect(result[3]).toBe(25); // (10+20+30+40)/4
    expect(result[4]).toBe(35); // (20+30+40+50)/4
    expect(result[5]).toBe(45); // (30+40+50+60)/4
    expect(result[6]).toBe(55); // (40+50+60+70)/4
  });
});
