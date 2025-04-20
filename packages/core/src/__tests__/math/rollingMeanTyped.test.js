// alphaquant-core/src/__tests__/math/rollingMeanTyped.test.js
import { jest, describe, it, expect } from '@jest/globals';
import { rollingMeanTyped } from '../../math/rollingMeanTyped.js';

describe('rollingMeanTyped module', () => {
  it('calculates rolling mean with window size 3', () => {
    const arr = [1, 2, 3, 4, 5];
    const windowSize = 3;
    const result = rollingMeanTyped(arr, windowSize);

    expect(result).toBeInstanceOf(Float64Array);
    expect(result.length).toBe(arr.length);

    // Проверяем значения скользящего среднего
    // Первое окно: [1,2,3] -> среднее = 2, записывается в индекс 2
    // Второе окно: [2,3,4] -> среднее = 3, записывается в индекс 3
    // Третье окно: [3,4,5] -> среднее = 4, записывается в индекс 4
    expect(result[2]).toBeCloseTo(2, 6);
    expect(result[3]).toBeCloseTo(3, 6);
    expect(result[4]).toBeCloseTo(4, 6);
  });

  it('calculates rolling mean with window size 2', () => {
    const arr = [10, 20, 30, 40];
    const windowSize = 2;
    const result = rollingMeanTyped(arr, windowSize);

    expect(result.length).toBe(arr.length);
    expect(result[1]).toBeCloseTo(15, 6); // (10+20)/2
    expect(result[2]).toBeCloseTo(25, 6); // (20+30)/2
    expect(result[3]).toBeCloseTo(35, 6); // (30+40)/2
  });

  it('handles window size equal to array length', () => {
    const arr = [1, 2, 3, 4, 5];
    const windowSize = 5;
    const result = rollingMeanTyped(arr, windowSize);

    expect(result.length).toBe(arr.length);
    expect(result[4]).toBeCloseTo(3, 6); // (1+2+3+4+5)/5
  });

  it('throws error for invalid window size', () => {
    const arr = [1, 2, 3, 4, 5];

    expect(() => rollingMeanTyped(arr, 0)).toThrow(
      'Window size must be a positive integer',
    );
    expect(() => rollingMeanTyped(arr, -1)).toThrow(
      'Window size must be a positive integer',
    );
    expect(() => rollingMeanTyped(arr, 6)).toThrow(
      'Input array length (5) must be at least window size (6)',
    );
  });

  it('throws error for empty array', () => {
    expect(() => rollingMeanTyped([], 3)).toThrow('Cannot filter empty array');
  });
});
