/**
 * Tests for methods/transform/transformMultipleSeries.js
 */

import { createFrame } from '../../../../frame/createFrame.js';
import { transformMultipleSeries } from '../../../../frame/methods/transform/transformMultipleSeries.js';

describe('transformMultipleSeries', () => {
  test('should apply transformation function to multiple columns', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
      b: [10, 20, 30, 40, 50],
      c: [100, 200, 300, 400, 500],
    });

    // Transformation function: multiply by 2
    const result = transformMultipleSeries(frame, ['a', 'b'], (x) => x * 2);

    // Check that columns are transformed correctly
    expect(Array.from(result.columns.a)).toEqual([2, 4, 6, 8, 10]);
    expect(Array.from(result.columns.b)).toEqual([20, 40, 60, 80, 100]);

    // Other columns should remain unchanged
    expect(Array.from(result.columns.c)).toEqual([100, 200, 300, 400, 500]);
  });

  test('should apply transformation function with custom column names', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
      b: [10, 20, 30, 40, 50],
    });

    // Transformation function: multiply by 2 with new column names
    const result = transformMultipleSeries(frame, ['a', 'b'], (x) => x * 2, [
      'a_doubled',
      'b_doubled',
    ]);

    // Check that new columns are created correctly
    expect(Array.from(result.columns.a_doubled)).toEqual([2, 4, 6, 8, 10]);
    expect(Array.from(result.columns.b_doubled)).toEqual([20, 40, 60, 80, 100]);

    // Original columns should remain unchanged
    expect(Array.from(result.columns.a)).toEqual([1, 2, 3, 4, 5]);
    expect(Array.from(result.columns.b)).toEqual([10, 20, 30, 40, 50]);
  });

  test('should apply transformation function with access to index', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
      b: [10, 20, 30, 40, 50],
    });

    // Transformation function: multiply by index
    const result = transformMultipleSeries(frame, ['a', 'b'], (x, i) => x * i);

    // Check the result
    expect(Array.from(result.columns.a)).toEqual([0, 2, 6, 12, 20]);
    expect(Array.from(result.columns.b)).toEqual([0, 20, 60, 120, 200]);
  });

  test('should apply transformation function with access to array', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
    });

    // Transformation function: difference with previous element
    const result = transformMultipleSeries(frame, ['a'], (x, i, arr) => {
      if (i === 0) return x;
      return x - arr[i - 1];
    });

    // Check the result
    expect(Array.from(result.columns.a)).toEqual([1, 1, 1, 1, 1]);
  });

  test('should correctly handle NaN values', () => {
    const frame = createFrame({
      a: [1, NaN, 3, 4, NaN],
      b: [10, 20, NaN, 40, 50],
    });

    // Transformation function: replace NaN with 0
    const result = transformMultipleSeries(frame, ['a', 'b'], (x) =>
      isNaN(x) ? 0 : x,
    );

    // Check the result
    expect(Array.from(result.columns.a)).toEqual([1, 0, 3, 4, 0]);
    expect(Array.from(result.columns.b)).toEqual([10, 20, 0, 40, 50]);
  });

  test('should throw an error for invalid input data', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
      b: [10, 20, 30, 40, 50],
    });

    // Invalid columns
    expect(() => transformMultipleSeries(frame, [], (x) => x * 2)).toThrow();
    expect(() => transformMultipleSeries(frame, 'a', (x) => x * 2)).toThrow();
    expect(() =>
      transformMultipleSeries(frame, ['nonexistent'], (x) => x * 2),
    ).toThrow();

    // Invalid transformation function
    expect(() => transformMultipleSeries(frame, ['a', 'b'], null)).toThrow();
    expect(() =>
      transformMultipleSeries(frame, ['a', 'b'], 'invalid'),
    ).toThrow();

    // Invalid output columns
    expect(() =>
      transformMultipleSeries(frame, ['a', 'b'], (x) => x * 2, ['a_doubled']),
    ).toThrow();

    // Invalid frame
    expect(() =>
      transformMultipleSeries(null, ['a', 'b'], (x) => x * 2),
    ).toThrow();
    expect(() =>
      transformMultipleSeries({}, ['a', 'b'], (x) => x * 2),
    ).toThrow();
    expect(() =>
      transformMultipleSeries({ columns: {} }, ['a', 'b'], (x) => x * 2),
    ).toThrow();
  });
});
