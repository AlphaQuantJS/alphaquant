/**
 * Tests for sortByIndex.js
 */

import { createFrame } from '../../../../frame/createFrame.js';
import { sortByIndex } from '../../../../frame/methods/sorting/sortByIndex.js';

describe('sortByIndex', () => {
  test('should sort the frame by specified indices', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
      b: [10, 20, 30, 40, 50],
    });

    // Change the order of rows
    const indices = [4, 3, 2, 1, 0];
    const result = sortByIndex(frame, indices);

    expect(Array.from(result.columns.a)).toEqual([5, 4, 3, 2, 1]);
    expect(Array.from(result.columns.b)).toEqual([50, 40, 30, 20, 10]);
  });

  test('should sort the frame with a partial set of indices', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
      b: [10, 20, 30, 40, 50],
    });

    // Select only some rows
    const indices = [2, 0, 4];
    const result = sortByIndex(frame, indices);

    expect(result.rowCount).toBe(3);
    expect(Array.from(result.columns.a)).toEqual([3, 1, 5]);
    expect(Array.from(result.columns.b)).toEqual([30, 10, 50]);
  });

  test('should preserve column types when sorting', () => {
    // Create a test frame with different column types
    const frame = {
      columns: {
        a: new Float64Array([1, 2, 3, 4, 5]),
        b: [10, 20, 30, 40, 50],
      },
      rowCount: 5,
      columnNames: ['a', 'b'],
      rawColumns: {
        a: new Float64Array([1, 2, 3, 4, 5]),
        b: [10, 20, 30, 40, 50],
      },
    };

    const indices = [4, 3, 2, 1, 0];
    const result = sortByIndex(frame, indices);

    // Check that column types are preserved
    expect(result.columns.a instanceof Float64Array).toBe(true);
    expect(Array.isArray(result.columns.b)).toBe(true);
  });

  test('should handle empty frame', () => {
    const frame = createFrame({
      a: [],
      b: [],
    });

    const indices = [];
    const result = sortByIndex(frame, indices);

    expect(result.rowCount).toBe(0);
    expect(result.columns.a).toEqual([]);
    expect(result.columns.b).toEqual([]);
  });

  test('should handle empty list of indices', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
      b: [10, 20, 30, 40, 50],
    });

    const result = sortByIndex(frame, []);

    expect(result.rowCount).toBe(0);
    expect(result.columns.a.length).toBe(0);
    expect(result.columns.b.length).toBe(0);
  });

  test('should throw an error for invalid frame', () => {
    expect(() => sortByIndex(null, [0, 1, 2])).toThrow();
    expect(() => sortByIndex({}, [0, 1, 2])).toThrow();
    expect(() => sortByIndex({ columns: {} }, [0, 1, 2])).toThrow();
  });

  test('should throw an error for invalid indices', () => {
    const frame = createFrame({
      a: [1, 2, 3],
      b: [10, 20, 30],
    });

    expect(() => sortByIndex(frame, [0, 1, 3])).toThrow(); // Index 3 is out of bounds
    expect(() => sortByIndex(frame, [0, -1, 2])).toThrow(); // Negative index
    expect(() => sortByIndex(frame, [0, 'string', 2])).toThrow(); // Invalid index type
  });
});
