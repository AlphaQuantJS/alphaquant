/**
 * Tests for methods/transform/applyWindowFunction.js
 */

import { createFrame } from '../../../../frame/createFrame.js';
import { applyWindowFunction } from '../../../../frame/methods/transform/applyWindowFunction.js';

describe('applyWindowFunction', () => {
  test('should apply window function to a column', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
      b: [10, 20, 30, 40, 50],
    });

    // Window function: mean value
    const result = applyWindowFunction(frame, 'a', 3, (window) => {
      const sum = window.reduce((acc, val) => acc + val, 0);
      return sum / window.length;
    });

    // Check that the new column is created correctly
    // For window size 3:
    // First window: [1] -> 1
    // Second window: [1, 2] -> 1.5
    // Third window: [1, 2, 3] -> 2
    // Fourth window: [2, 3, 4] -> 3
    // Fifth window: [3, 4, 5] -> 4
    expect(Array.from(result.columns.a_window)).toEqual([1, 1.5, 2, 3, 4]);

    // Other columns should remain unchanged
    expect(Array.from(result.columns.a)).toEqual([1, 2, 3, 4, 5]);
    expect(Array.from(result.columns.b)).toEqual([10, 20, 30, 40, 50]);
  });

  test('should apply window function with custom column name', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
    });

    // Window function: sum
    const result = applyWindowFunction(
      frame,
      'a',
      2,
      (window) => {
        return window.reduce((acc, val) => acc + val, 0);
      },
      'a_sum',
    );

    // Check that the new column is created with the right name
    expect(Array.from(result.columns.a_sum)).toEqual([1, 3, 5, 7, 9]);
  });

  test('should correctly handle NaN values', () => {
    const frame = createFrame({
      a: [1, NaN, 3, 4, NaN],
    });

    // Window function: mean value excluding NaN
    const result = applyWindowFunction(frame, 'a', 3, (window) => {
      const validValues = window.filter((val) => !isNaN(val));
      if (validValues.length === 0) return NaN;
      const sum = validValues.reduce((acc, val) => acc + val, 0);
      return sum / validValues.length;
    });

    // Check the result
    const resultArray = Array.from(result.columns.a_window);
    expect(resultArray[0]).toBe(1);
    expect(isNaN(resultArray[1])).toBe(false); // 1 / 1 = 1
    expect(resultArray[2]).toBe(2); // (1 + 3) / 2 = 2
    expect(resultArray[3]).toBe(3.5); // (3 + 4) / 2 = 3.5
    expect(resultArray[4]).toBe(4); // 4 / 1 = 4
  });

  test('should throw an error for invalid input data', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
    });

    // Invalid column
    expect(() =>
      applyWindowFunction(frame, 'nonexistent', 3, (window) => window[0]),
    ).toThrow();

    // Invalid window size
    expect(() =>
      applyWindowFunction(frame, 'a', 0, (window) => window[0]),
    ).toThrow();
    expect(() =>
      applyWindowFunction(frame, 'a', -1, (window) => window[0]),
    ).toThrow();
    expect(() =>
      applyWindowFunction(frame, 'a', 'invalid', (window) => window[0]),
    ).toThrow();

    // Invalid window function
    expect(() => applyWindowFunction(frame, 'a', 3, null)).toThrow();
    expect(() => applyWindowFunction(frame, 'a', 3, 'invalid')).toThrow();
  });
});
