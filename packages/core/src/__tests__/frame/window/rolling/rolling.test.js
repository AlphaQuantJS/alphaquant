/**
 * Unit tests for rolling.js
 */

import { createFrame } from '../../../../frame/createFrame.js';
import { rollingMean } from '../../../../frame/computation/rolling.js';

describe('rollingMean', () => {
  test('should calculate rolling mean with the specified window', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      b: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    });

    const result = rollingMean(frame, 'a', 3);

    expect(result.rowCount).toBe(10);
    expect(Object.keys(result.columns)).toEqual(['a', 'b', 'a_rolling_mean']);

    // First (window-1) values should be NaN
    expect(isNaN(result.columns.a_rolling_mean[0])).toBe(true);
    expect(isNaN(result.columns.a_rolling_mean[1])).toBe(true);

    // Check calculated values
    expect(result.columns.a_rolling_mean[2]).toBeCloseTo((1 + 2 + 3) / 3);
    expect(result.columns.a_rolling_mean[3]).toBeCloseTo((2 + 3 + 4) / 3);
    expect(result.columns.a_rolling_mean[4]).toBeCloseTo((3 + 4 + 5) / 3);
    expect(result.columns.a_rolling_mean[9]).toBeCloseTo((8 + 9 + 10) / 3);

    // Check that original columns are unchanged
    expect(Array.from(result.columns.a)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    ]);
    expect(Array.from(result.columns.b)).toEqual([
      10, 20, 30, 40, 50, 60, 70, 80, 90, 100,
    ]);
  });

  test('should handle window size of 1', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
    });

    const result = rollingMean(frame, 'a', 1);

    expect(result.rowCount).toBe(5);
    expect(Object.keys(result.columns)).toEqual(['a', 'a_rolling_mean']);

    // With window size of 1, rolling mean equals the values themselves
    expect(result.columns.a_rolling_mean[0]).toBeCloseTo(1);
    expect(result.columns.a_rolling_mean[1]).toBeCloseTo(2);
    expect(result.columns.a_rolling_mean[2]).toBeCloseTo(3);
    expect(result.columns.a_rolling_mean[3]).toBeCloseTo(4);
    expect(result.columns.a_rolling_mean[4]).toBeCloseTo(5);
  });

  test('should handle window size larger than frame length', () => {
    const frame = createFrame({
      a: [1, 2, 3],
    });

    const result = rollingMean(frame, 'a', 5);

    expect(result.rowCount).toBe(3);
    expect(Object.keys(result.columns)).toEqual(['a', 'a_rolling_mean']);

    // All values should be NaN since window is larger than frame length
    expect(isNaN(result.columns.a_rolling_mean[0])).toBe(true);
    expect(isNaN(result.columns.a_rolling_mean[1])).toBe(true);
    expect(isNaN(result.columns.a_rolling_mean[2])).toBe(true);
  });

  test('should correctly handle NaN, null and undefined', () => {
    const frame = createFrame({
      a: [1, null, 3, NaN, 5, undefined, 7],
    });

    const result = rollingMean(frame, 'a', 3);

    expect(result.rowCount).toBe(7);

    // First two values should be NaN
    expect(isNaN(result.columns.a_rolling_mean[0])).toBe(true);
    expect(isNaN(result.columns.a_rolling_mean[1])).toBe(true);

    // Check that values containing NaN or undefined result in NaN
    // But null is treated as 0
    const expected = [
      NaN, // First two values are always NaN (not enough data for window)
      NaN,
      (1 + 0 + 3) / 3, // [1, null(0), 3]
      NaN, // [null(0), 3, NaN] -> NaN because of NaN
      NaN, // [3, NaN, 5] -> NaN because of NaN
      NaN, // [NaN, 5, undefined] -> NaN because of NaN and undefined
      NaN, // [5, undefined, 7] -> NaN because of undefined
    ];

    for (let i = 2; i < 7; i++) {
      if (isNaN(expected[i])) {
        expect(isNaN(result.columns.a_rolling_mean[i])).toBe(true);
      } else {
        expect(result.columns.a_rolling_mean[i]).toBeCloseTo(expected[i]);
      }
    }
  });

  test('should throw an error for invalid window size', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
    });

    expect(() => rollingMean(frame, 'a', 0)).toThrow(
      'Window size must be a positive integer',
    );
    expect(() => rollingMean(frame, 'a', -1)).toThrow(
      'Window size must be a positive integer',
    );
    expect(() => rollingMean(frame, 'a', 1.5)).toThrow(
      'Window size must be a positive integer',
    );
  });

  test('should throw an error for non-existent column', () => {
    const frame = createFrame({
      a: [1, 2, 3],
    });

    expect(() => rollingMean(frame, 'b', 2)).toThrow("Column 'b' not found");
  });

  test('should handle empty frame', () => {
    const frame = createFrame({
      a: [],
    });

    const result = rollingMean(frame, 'a', 3);

    expect(result.rowCount).toBe(0);
    expect(Object.keys(result.columns)).toEqual(['a', 'a_rolling_mean']);
  });

  test('should use optimized algorithm for large windows', () => {
    // Create a frame with a large amount of data
    const a = new Array(1000).fill(0).map((_, i) => i + 1);
    const frame = createFrame({ a });

    const result = rollingMean(frame, 'a', 100);

    expect(result.rowCount).toBe(1000);
    expect(Object.keys(result.columns)).toEqual(['a', 'a_rolling_mean']);

    // First 99 values should be NaN
    for (let i = 0; i < 99; i++) {
      expect(isNaN(result.columns.a_rolling_mean[i])).toBe(true);
    }

    // Check several values
    expect(result.columns.a_rolling_mean[99]).toBeCloseTo(50); // Average from 1 to 100
    expect(result.columns.a_rolling_mean[199]).toBeCloseTo(150); // Average from 101 to 200
    expect(result.columns.a_rolling_mean[999]).toBeCloseTo(950.5); // Average from 901 to 1000
  });
});
