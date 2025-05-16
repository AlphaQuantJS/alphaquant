/**
 * ewm.test.js - Tests for exponentially weighted moving average function
 */

import { ewm } from '../../../../frame/window/rolling/ewm.js';
import { createFrame } from '../../../../frame/createFrame.js';
import { arrayEquals } from '../../../helpers/arrayEquals.js';

describe('ewm', () => {
  test('should correctly calculate EWMA for simple values', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
    });

    const result = ewm(frame, 'a', 2);

    // Calculate alpha = 2/(span+1) = 2/3
    const alpha = 2 / 3;

    // First value equals the original
    expect(result.columns.a_ewm[0]).toBe(1);

    // The rest are calculated using formula: alpha * val + (1 - alpha) * prev
    expect(result.columns.a_ewm[1]).toBeCloseTo(alpha * 2 + (1 - alpha) * 1); // 1.67
    expect(result.columns.a_ewm[2]).toBeCloseTo(
      alpha * 3 + (1 - alpha) * result.columns.a_ewm[1],
    ); // 2.56
    expect(result.columns.a_ewm[3]).toBeCloseTo(
      alpha * 4 + (1 - alpha) * result.columns.a_ewm[2],
    ); // 3.52
    expect(result.columns.a_ewm[4]).toBeCloseTo(
      alpha * 5 + (1 - alpha) * result.columns.a_ewm[3],
    ); // 4.51
  });

  test('should handle NaN values', () => {
    const frame = createFrame({
      a: [1, NaN, 3, 4, 5],
    });

    const result = ewm(frame, 'a', 2);

    // First value equals the original
    expect(result.columns.a_ewm[0]).toBe(1);

    // After NaN all subsequent values also become NaN
    expect(isNaN(result.columns.a_ewm[1])).toBe(true);
    expect(isNaN(result.columns.a_ewm[2])).toBe(true);
    expect(isNaN(result.columns.a_ewm[3])).toBe(true);
    expect(isNaN(result.columns.a_ewm[4])).toBe(true);
  });

  test('should handle null and undefined values', () => {
    const frame = createFrame({
      a: [1, null, 3, undefined, 5],
    });

    const result = ewm(frame, 'a', 2);

    // Calculate alpha = 2/(span+1) = 2/3
    const alpha = 2 / 3;

    // First value equals the original
    expect(result.columns.a_ewm[0]).toBe(1);

    // null is converted to 0, undefined - to NaN
    expect(result.columns.a_ewm[1]).toBeCloseTo(alpha * 0 + (1 - alpha) * 1); // 0.33
    expect(result.columns.a_ewm[2]).toBeCloseTo(
      alpha * 3 + (1 - alpha) * result.columns.a_ewm[1],
    ); // 2.11

    // After undefined all subsequent values become NaN
    expect(isNaN(result.columns.a_ewm[3])).toBe(true);
    expect(isNaN(result.columns.a_ewm[4])).toBe(true);
  });

  test('should handle empty frame', () => {
    const frame = createFrame({
      a: [],
    });

    const result = ewm(frame, 'a', 2);

    expect(arrayEquals(result.columns.a_ewm, [])).toBe(true);
    expect(result.rowCount).toBe(0);
  });

  test('should handle frame with one value', () => {
    const frame = createFrame({
      a: [10],
    });

    const result = ewm(frame, 'a', 2);

    expect(result.columns.a_ewm[0]).toBe(10);
    expect(result.rowCount).toBe(1);
  });

  test('should handle frame where all values are NaN', () => {
    const frame = createFrame({
      a: [NaN, NaN, NaN],
    });

    const result = ewm(frame, 'a', 2);

    // All values should be NaN
    expect(Array.from(result.columns.a_ewm).every((v) => isNaN(v))).toBe(true);
    expect(result.rowCount).toBe(3);
  });

  test('should throw an error for invalid input data', () => {
    expect(() => ewm(null, 'a', 2)).toThrow();
    expect(() => ewm({}, 'a', 2)).toThrow();
    expect(() => ewm({ columns: {} }, 'a', 2)).toThrow();
  });

  test('should throw an error for invalid span', () => {
    const frame = createFrame({
      a: [1, 2, 3],
    });

    expect(() => ewm(frame, 'a', 0)).toThrow();
    expect(() => ewm(frame, 'a', -1)).toThrow();
    expect(() => ewm(frame, 'a', NaN)).toThrow();
    expect(() => ewm(frame, 'a', Infinity)).toThrow();
  });

  test('should throw an error for invalid column', () => {
    const frame = createFrame({
      a: [1, 2, 3],
    });

    expect(() => ewm(frame, 'nonexistent', 2)).toThrow();
  });
});
