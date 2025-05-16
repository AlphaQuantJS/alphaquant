/**
 * describe.test.js - Tests for describe function
 */

import { describe as describeFrame } from '../../../../frame/computation/describe/describe';
import { createFrame } from '../../../../frame/createFrame';

describe('describe', () => {
  test('should calculate basic statistics for all numeric columns', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
      b: [10, 20, 30, 40, 50],
      c: ['a', 'b', 'c', 'd', 'e'],
    });

    const result = describeFrame(frame);

    // Should only include numeric columns
    expect(result.columns).toHaveProperty('a');
    expect(result.columns).toHaveProperty('b');
    expect(result.columns).not.toHaveProperty('c');

    // Should have stats index column
    expect(result.columns).toHaveProperty('_stat');
    expect(result.columns._stat).toEqual([
      'count',
      'mean',
      'std',
      'min',
      '25%',
      '50%',
      '75%',
      'max',
    ]);

    // Check statistics for column 'a'
    expect(result.columns.a[0]).toBe(5); // count
    expect(result.columns.a[1]).toBe(3); // mean
    expect(result.columns.a[2]).toBeCloseTo(Math.sqrt(2), 10); // std
    expect(result.columns.a[3]).toBe(1); // min
    expect(result.columns.a[4]).toBe(2); // 25%
    expect(result.columns.a[5]).toBe(3); // 50%
    expect(result.columns.a[6]).toBe(4); // 75%
    expect(result.columns.a[7]).toBe(5); // max

    // Check statistics for column 'b'
    expect(result.columns.b[0]).toBe(5); // count
    expect(result.columns.b[1]).toBe(30); // mean
    expect(result.columns.b[2]).toBeCloseTo(Math.sqrt(200), 10); // std
    expect(result.columns.b[3]).toBe(10); // min
    expect(result.columns.b[4]).toBe(20); // 25%
    expect(result.columns.b[5]).toBe(30); // 50%
    expect(result.columns.b[6]).toBe(40); // 75%
    expect(result.columns.b[7]).toBe(50); // max
  });

  test('should calculate statistics for specified columns only', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
      b: [10, 20, 30, 40, 50],
      c: [100, 200, 300, 400, 500],
    });

    const result = describeFrame(frame, ['a', 'c']);

    // Should only include specified columns
    expect(result.columns).toHaveProperty('a');
    expect(result.columns).not.toHaveProperty('b');
    expect(result.columns).toHaveProperty('c');
  });

  test('should handle NaN values', () => {
    const frame = createFrame({
      a: [1, NaN, 3, 4, 5],
    });

    const result = describeFrame(frame);

    // Count should be 4 (excluding NaN)
    expect(result.columns.a[0]).toBe(4);

    // Mean should be calculated without NaN
    expect(result.columns.a[1]).toBeCloseTo((1 + 3 + 4 + 5) / 4, 10);

    // Min should be 1
    expect(result.columns.a[3]).toBe(1);

    // Max should be 5
    expect(result.columns.a[7]).toBe(5);
  });

  test('should handle empty frame', () => {
    const frame = createFrame({
      a: [],
      b: [],
    });

    expect(() => describeFrame(frame)).toThrow();
  });

  test('should throw error for frame with no numeric columns', () => {
    const frame = createFrame({
      a: ['a', 'b', 'c'],
      b: ['d', 'e', 'f'],
    });

    expect(() => describeFrame(frame)).toThrow('No numeric columns found');
  });

  test('should throw error for invalid frame', () => {
    expect(() => describeFrame(null)).toThrow('Invalid TinyFrame');
    expect(() => describeFrame({})).toThrow('Invalid TinyFrame');
    expect(() => describeFrame({ columns: {} })).toThrow('Invalid TinyFrame');
  });
});
