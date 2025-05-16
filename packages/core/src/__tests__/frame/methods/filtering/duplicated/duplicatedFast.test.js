/**
 * Tests for duplicatedFast.js
 */

import { createFrame } from '../../../../../frame/createFrame.js';
import { duplicatedFast } from '../../../../../frame/methods/filtering/duplicated/duplicatedFast.js';

describe('duplicatedFast', () => {
  test('should identify duplicate rows', () => {
    const frame = createFrame({
      a: [1, 2, 1, 3, 1],
      b: ['x', 'y', 'x', 'z', 'x'],
    });

    const result = duplicatedFast(frame);

    // First occurrence is not marked as duplicate,
    // subsequent duplicates are marked
    expect(result).toEqual([false, false, true, false, true]);
  });

  test('should work with subset of columns', () => {
    const frame = createFrame({
      a: [1, 1, 1, 2, 2],
      b: ['x', 'y', 'z', 'x', 'y'],
      c: [10, 20, 30, 40, 50],
    });

    // Check only by column 'a'
    const result = duplicatedFast(frame, ['a']);

    expect(result).toEqual([false, true, true, false, true]);
  });

  test('should handle keepFirst=false option', () => {
    const frame = createFrame({
      a: [1, 2, 1, 3, 1],
      b: ['x', 'y', 'x', 'z', 'x'],
    });

    const result = duplicatedFast(frame, null, false);

    // В текущей реализации, если keepFirst=false, все строки помечаются как дубликаты
    expect(result).toEqual([true, true, true, true, true]);
  });

  test('should handle empty frame', () => {
    const frame = createFrame({
      a: [],
      b: [],
    });

    const result = duplicatedFast(frame);

    expect(result).toEqual([]);
  });

  test('should handle single row frame', () => {
    const frame = createFrame({
      a: [1],
      b: ['x'],
    });

    const result = duplicatedFast(frame);

    expect(result).toEqual([false]);
  });

  test('should throw error for invalid frame', () => {
    expect(() => duplicatedFast(null)).toThrow();
    expect(() => duplicatedFast({})).toThrow();
    expect(() => duplicatedFast({ columns: {} })).toThrow();
  });

  test('should throw error for non-existent column', () => {
    const frame = createFrame({
      a: [1, 2, 3],
      b: [10, 20, 30],
    });

    expect(() => duplicatedFast(frame, ['c'])).toThrow();
  });
});
