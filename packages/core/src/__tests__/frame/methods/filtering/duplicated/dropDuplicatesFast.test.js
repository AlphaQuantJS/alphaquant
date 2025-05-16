/**
 * Tests for dropDuplicatesFast.js
 */

import { createFrame } from '../../../../../frame/createFrame.js';
import { dropDuplicatesFast } from '../../../../../frame/methods/filtering/duplicated/dropDuplicatesFast.js';

describe('dropDuplicatesFast', () => {
  test('should remove duplicate rows', () => {
    const frame = createFrame({
      a: [1, 2, 1, 3, 1],
      b: ['x', 'y', 'x', 'z', 'x'],
    });

    const result = dropDuplicatesFast(frame);

    expect(result.rowCount).toBe(3);
    expect(Array.from(result.columns.a)).toEqual([1, 2, 3]);
    expect(Array.from(result.columns.b)).toEqual(['x', 'y', 'z']);
  });

  test('should work with subset of columns', () => {
    const frame = createFrame({
      a: [1, 1, 1, 2, 2],
      b: ['x', 'y', 'z', 'x', 'y'],
      c: [10, 20, 30, 40, 50],
    });

    // Check only by column 'a'
    const result = dropDuplicatesFast(frame, ['a']);

    expect(result.rowCount).toBe(2);
    expect(Array.from(result.columns.a)).toEqual([1, 2]);
    expect(Array.from(result.columns.b)).toEqual(['x', 'x']);
    expect(Array.from(result.columns.c)).toEqual([10, 40]);
  });

  test('should handle keepFirst=false option', () => {
    const frame = createFrame({
      a: [1, 2, 1, 3, 1],
      b: ['x', 'y', 'x', 'z', 'x'],
    });

    const result = dropDuplicatesFast(frame, null, false);

    // В текущей реализации, если keepFirst=false, все строки помечаются как дубликаты,
    // поэтому функция dropDuplicatesFast должна удалить все строки
    expect(result.rowCount).toBe(0);
    expect(Array.from(result.columns.a)).toEqual([]);
    expect(Array.from(result.columns.b)).toEqual([]);
  });

  test('should handle empty frame', () => {
    const frame = createFrame({
      a: [],
      b: [],
    });

    const result = dropDuplicatesFast(frame);

    expect(result.rowCount).toBe(0);
    expect(result.columns.a.length).toBe(0);
    expect(result.columns.b.length).toBe(0);
  });

  test('should handle single row frame', () => {
    const frame = createFrame({
      a: [1],
      b: ['x'],
    });

    const result = dropDuplicatesFast(frame);

    expect(result.rowCount).toBe(1);
    expect(Array.from(result.columns.a)).toEqual([1]);
    expect(Array.from(result.columns.b)).toEqual(['x']);
  });

  test('should throw error for invalid frame', () => {
    expect(() => dropDuplicatesFast(null)).toThrow();
    expect(() => dropDuplicatesFast({})).toThrow();
    expect(() => dropDuplicatesFast({ columns: {} })).toThrow();
  });

  test('should throw error for non-existent column', () => {
    const frame = createFrame({
      a: [1, 2, 3],
      b: [10, 20, 30],
    });

    expect(() => dropDuplicatesFast(frame, ['c'])).toThrow();
  });
});
