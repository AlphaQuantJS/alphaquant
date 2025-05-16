/**
 * Tests for fillNaN.js
 */

import { createFrame } from '../../../../../frame/createFrame.js';
import { fillNaN } from '../../../../../frame/methods/filtering/nan/fillNaN.js';

describe('fillNaN', () => {
  test('should fill NaN values with a constant', () => {
    const frame = createFrame({
      a: [1, 2, NaN, 4, 5],
      b: [10, 20, 30, 40, 50],
    });

    const result = fillNaN(frame, 'a', 0);

    expect(result.rowCount).toBe(5);
    expect(Array.from(result.columns.a)).toEqual([1, 2, 0, 4, 5]);
    expect(Array.from(result.columns.b)).toEqual([10, 20, 30, 40, 50]);
  });

  test('should fill null values with a constant', () => {
    const frame = createFrame({
      a: [1, 2, null, 4, 5],
      b: [10, 20, 30, 40, 50],
    });

    const result = fillNaN(frame, 'a', 0);

    expect(result.rowCount).toBe(5);
    expect(Array.from(result.columns.a)).toEqual([1, 2, 0, 4, 5]);
    expect(Array.from(result.columns.b)).toEqual([10, 20, 30, 40, 50]);
  });

  test('should fill undefined values with a constant', () => {
    const frame = createFrame({
      a: [1, 2, undefined, 4, 5],
      b: [10, 20, 30, 40, 50],
    });

    const result = fillNaN(frame, 'a', 0);

    expect(result.rowCount).toBe(5);
    expect(Array.from(result.columns.a)).toEqual([1, 2, 0, 4, 5]);
    expect(Array.from(result.columns.b)).toEqual([10, 20, 30, 40, 50]);
  });

  test('should fill with a function result', () => {
    const frame = createFrame({
      a: [1, 2, NaN, 4, 5],
      b: [10, 20, 30, 40, 50],
    });

    const result = fillNaN(frame, 'a', (i, frame) => 20);

    expect(result.rowCount).toBe(5);
    expect(Array.from(result.columns.a)).toEqual([1, 2, 20, 4, 5]);
    expect(Array.from(result.columns.b)).toEqual([10, 20, 30, 40, 50]);
  });

  test('should fill with mean value when no value is provided', () => {
    const frame = createFrame({
      a: [1, 2, NaN, 4, 5],
      b: [10, 20, 30, 40, 50],
    });

    const result = fillNaN(frame, 'a');

    expect(result.rowCount).toBe(5);
    expect(Array.from(result.columns.a)).toEqual([1, 2, 0, 4, 5]);
    expect(Array.from(result.columns.b)).toEqual([10, 20, 30, 40, 50]);
  });

  test('should throw error for invalid frame', () => {
    expect(() => fillNaN(null, 'a')).toThrow();
    expect(() => fillNaN({}, 'a')).toThrow();
    expect(() => fillNaN({ columns: {} }, 'a')).toThrow();
  });

  test('should throw error for non-existent column', () => {
    const frame = createFrame({
      a: [1, 2, 3],
      b: [10, 20, 30],
    });

    expect(() => fillNaN(frame, 'c')).toThrow();
  });
});
