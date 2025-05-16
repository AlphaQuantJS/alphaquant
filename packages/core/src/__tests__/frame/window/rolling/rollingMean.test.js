/**
 * rollingMean.test.js - Tests for rollingMean function
 */

import { rollingMean } from '../../../../frame/window/rolling/rollingMean.js';
import { createFrame } from '../../../../frame/createFrame.js';

describe('rollingMean', () => {
  test('should calculate rolling mean for simple values', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
    });

    const result = rollingMean(frame, 'a', 3);

    // First two values should be NaN (window not filled)
    expect(result.columns.a_rolling_mean[0]).toBeNaN();
    expect(result.columns.a_rolling_mean[1]).toBeNaN();

    // Rest should be calculated
    expect(result.columns.a_rolling_mean[2]).toBe(2); // (1+2+3)/3
    expect(result.columns.a_rolling_mean[3]).toBe(3); // (2+3+4)/3
    expect(result.columns.a_rolling_mean[4]).toBe(4); // (3+4+5)/3
  });

  test('should handle NaN values', () => {
    const frame = createFrame({
      a: [1, NaN, 3, 4, 5],
    });

    const result = rollingMean(frame, 'a', 3);

    // First two values should be NaN (window not filled)
    expect(result.columns.a_rolling_mean[0]).toBeNaN();
    expect(result.columns.a_rolling_mean[1]).toBeNaN();

    // Windows with NaN should result in NaN
    expect(result.columns.a_rolling_mean[2]).toBeNaN(); // (1+NaN+3)/3
    expect(result.columns.a_rolling_mean[3]).toBeNaN(); // (NaN+3+4)/3
    expect(result.columns.a_rolling_mean[4]).toBe(4); // (3+4+5)/3
  });

  test('should handle window size 1', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
    });

    const result = rollingMean(frame, 'a', 1);

    // All values should be the same as original
    expect(result.columns.a_rolling_mean[0]).toBe(1);
    expect(result.columns.a_rolling_mean[1]).toBe(2);
    expect(result.columns.a_rolling_mean[2]).toBe(3);
    expect(result.columns.a_rolling_mean[3]).toBe(4);
    expect(result.columns.a_rolling_mean[4]).toBe(5);
  });

  test('should handle window size larger than array', () => {
    const frame = createFrame({
      a: [1, 2, 3],
    });

    const result = rollingMean(frame, 'a', 5);

    // All values should be NaN (window never filled)
    expect(result.columns.a_rolling_mean[0]).toBeNaN();
    expect(result.columns.a_rolling_mean[1]).toBeNaN();
    expect(result.columns.a_rolling_mean[2]).toBeNaN();
  });

  test('should handle empty frame', () => {
    const frame = createFrame({
      a: [],
    });

    const result = rollingMean(frame, 'a', 3);

    expect(result.columns.a_rolling_mean).toEqual([]);
    expect(result.rowCount).toBe(0);
  });

  test('should throw error for invalid window size', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
    });

    expect(() => rollingMean(frame, 'a', 0)).toThrow();
    expect(() => rollingMean(frame, 'a', -1)).toThrow();
    expect(() => rollingMean(frame, 'a', 1.5)).toThrow();
  });

  test('should throw error for non-existent column', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
    });

    expect(() => rollingMean(frame, 'b', 3)).toThrow();
  });
});
