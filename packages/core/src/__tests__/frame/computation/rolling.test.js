/**
 * rolling.test.js - Tests for rolling window functions
 */

import { rollingMean, ewm } from '../../../frame/computation/rolling';
import { createFrame } from '../../../frame/createFrame';

describe('rollingMean', () => {
  test('should correctly calculate rolling mean for simple values', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
    });

    const result = rollingMean(frame, 'a', 3);

    // First two values should be NaN (window not filled)
    expect(isNaN(result.columns.a_rolling_mean[0])).toBe(true);
    expect(isNaN(result.columns.a_rolling_mean[1])).toBe(true);

    // The rest should be calculated
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
    expect(isNaN(result.columns.a_rolling_mean[0])).toBe(true);
    expect(isNaN(result.columns.a_rolling_mean[1])).toBe(true);

    // Windows with NaN should give NaN
    expect(isNaN(result.columns.a_rolling_mean[2])).toBe(true); // (1+NaN+3)/3
    expect(isNaN(result.columns.a_rolling_mean[3])).toBe(true); // (NaN+3+4)/3
    expect(result.columns.a_rolling_mean[4]).toBe(4); // (3+4+5)/3
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
});

describe('ewm', () => {
  test('should correctly calculate exponentially weighted mean', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
    });

    const result = ewm(frame, 'a', 2);

    // First value is the same as input
    expect(result.columns.a_ewm[0]).toBe(1);

    // Rest are calculated with alpha = 2/(span+1) = 2/3
    expect(result.columns.a_ewm[1]).toBeCloseTo((2 / 3) * 2 + (1 - 2 / 3) * 1); // 1.67
    expect(result.columns.a_ewm[2]).toBeCloseTo(
      (2 / 3) * 3 + (1 - 2 / 3) * result.columns.a_ewm[1],
    ); // 2.56
    expect(result.columns.a_ewm[3]).toBeCloseTo(
      (2 / 3) * 4 + (1 - 2 / 3) * result.columns.a_ewm[2],
    ); // 3.52
    expect(result.columns.a_ewm[4]).toBeCloseTo(
      (2 / 3) * 5 + (1 - 2 / 3) * result.columns.a_ewm[3],
    ); // 4.51
  });

  test('should handle NaN values', () => {
    const frame = createFrame({
      a: [1, NaN, 3, 4, 5],
    });

    const result = ewm(frame, 'a', 2);

    // First value is the same as input
    expect(result.columns.a_ewm[0]).toBe(1);

    // NaN values should remain NaN
    expect(isNaN(result.columns.a_ewm[1])).toBe(true);

    // Calculation continues after NaN, using the last valid value
    expect(result.columns.a_ewm[2]).toBeCloseTo(2.33); // (2/3) * 3 + (1/3) * 1
    expect(result.columns.a_ewm[3]).toBeCloseTo(3.44); // (2/3) * 4 + (1/3) * 2.33
    expect(result.columns.a_ewm[4]).toBeCloseTo(4.48); // (2/3) * 5 + (1/3) * 3.44
  });

  test('should handle empty frame', () => {
    const frame = createFrame({
      a: [],
    });

    const result = ewm(frame, 'a', 2);

    expect(result.columns.a_ewm).toEqual([]);
    expect(result.rowCount).toBe(0);
  });

  test('should throw error for invalid span', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
    });

    expect(() => ewm(frame, 'a', 0)).toThrow();
    expect(() => ewm(frame, 'a', -1)).toThrow();
    expect(() => ewm(frame, 'a', 1.5)).toThrow();
  });
});
