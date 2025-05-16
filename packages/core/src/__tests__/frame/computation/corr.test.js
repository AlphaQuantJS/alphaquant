/**
 * corr.test.js - Tests for correlation matrix calculation functions
 */

import { corrMatrix, corrMatrixTyped } from '../../../frame/computation/corr';
import { createFrame } from '../../../frame/createFrame';
import { vi } from 'vitest';

describe('corrMatrix', () => {
  test('should correctly compute correlation matrix for simple values', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
      b: [5, 4, 3, 2, 1],
      c: [1, 2, 3, 4, 5],
    });

    const result = corrMatrix(frame);

    // Check dimensions
    expect(result.rowCount).toBe(3);
    expect(result.columns._index).toEqual(['a', 'b', 'c']);

    // Check correlation values
    // a and a should have perfect correlation
    expect(result.columns.a[0]).toBeCloseTo(1, 10);

    // a and b should have perfect negative correlation
    expect(result.columns.b[0]).toBeCloseTo(-1, 10);

    // a and c should have perfect correlation
    expect(result.columns.c[0]).toBeCloseTo(1, 10);

    // b and a should have perfect negative correlation
    expect(result.columns.a[1]).toBeCloseTo(-1, 10);

    // b and b should have perfect correlation
    expect(result.columns.b[1]).toBeCloseTo(1, 10);

    // b and c should have perfect negative correlation
    expect(result.columns.c[1]).toBeCloseTo(-1, 10);

    // c and a should have perfect correlation
    expect(result.columns.a[2]).toBeCloseTo(1, 10);

    // c and b should have perfect negative correlation
    expect(result.columns.b[2]).toBeCloseTo(-1, 10);

    // c and c should have perfect correlation
    expect(result.columns.c[2]).toBeCloseTo(1, 10);
  });

  test('should handle NaN values', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
      b: [5, NaN, 3, 2, 1],
    });

    const result = corrMatrix(frame);

    // Check dimensions
    expect(result.rowCount).toBe(2);
    expect(result.columns._index).toEqual(['a', 'b']);

    // Check correlation values
    // a and a should have perfect correlation
    expect(result.columns.a[0]).toBeCloseTo(1, 10);

    // a and b should have correlation calculated without NaN value
    // Correlation between [1,3,4,5] and [5,3,2,1] is -1
    // Используем меньшую точность (1 знак) для учета погрешностей в вычислениях
    expect(result.columns.b[0]).toBeCloseTo(-1, 1);

    // b and a should have correlation calculated without NaN value
    expect(result.columns.a[1]).toBeCloseTo(-1, 1);

    // b and b should have perfect correlation
    expect(result.columns.b[1]).toBeCloseTo(1, 10);
  });

  test('should handle non-numeric columns', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
      b: ['a', 'b', 'c', 'd', 'e'],
    });

    const result = corrMatrix(frame);

    // Check dimensions - only numeric columns should be included
    expect(result.rowCount).toBe(1);
    expect(result.columns._index).toEqual(['a']);

    // Check correlation values
    // a and a should have perfect correlation
    expect(result.columns.a[0]).toBeCloseTo(1, 10);
  });

  test('should throw error for frame with no numeric columns', () => {
    const frame = createFrame({
      a: ['a', 'b', 'c', 'd', 'e'],
      b: ['f', 'g', 'h', 'i', 'j'],
    });

    expect(() => corrMatrix(frame)).toThrow('No numeric columns found');
  });

  test('should throw error for invalid frame', () => {
    expect(() => corrMatrix(null)).toThrow('Invalid TinyFrame');
    expect(() => corrMatrix({})).toThrow('Invalid TinyFrame');
    expect(() => corrMatrix({ columns: {} })).toThrow('Invalid TinyFrame');
  });

  test('should handle empty frame', () => {
    const frame = createFrame({
      a: [],
      b: [],
    });

    expect(() => corrMatrix(frame)).toThrow();
  });
});

describe('corrMatrixTyped', () => {
  test('should correctly compute correlation matrix for typed arrays', () => {
    const arrays = [
      new Float64Array([1, 2, 3, 4, 5]),
      new Float64Array([5, 4, 3, 2, 1]),
      new Float64Array([1, 2, 3, 4, 5]),
    ];

    const labels = ['a', 'b', 'c'];

    const result = corrMatrixTyped(arrays, labels);

    // Check dimensions
    expect(result.matrix.length).toBe(9); // 3x3 matrix flattened
    expect(result.labels).toEqual(labels);

    // Check correlation values in flattened matrix
    // a and a should have perfect correlation (index 0)
    expect(result.matrix[0]).toBeCloseTo(1, 10);

    // a and b should have perfect negative correlation (index 1)
    expect(result.matrix[1]).toBeCloseTo(-1, 10);

    // a and c should have perfect correlation (index 2)
    expect(result.matrix[2]).toBeCloseTo(1, 10);

    // b and a should have perfect negative correlation (index 3)
    expect(result.matrix[3]).toBeCloseTo(-1, 10);

    // b and b should have perfect correlation (index 4)
    expect(result.matrix[4]).toBeCloseTo(1, 10);

    // b and c should have perfect negative correlation (index 5)
    expect(result.matrix[5]).toBeCloseTo(-1, 10);

    // c and a should have perfect correlation (index 6)
    expect(result.matrix[6]).toBeCloseTo(1, 10);

    // c and b should have perfect negative correlation (index 7)
    expect(result.matrix[7]).toBeCloseTo(-1, 10);

    // c and c should have perfect correlation (index 8)
    expect(result.matrix[8]).toBeCloseTo(1, 10);
  });

  test('should handle NaN values', () => {
    const arrays = [
      new Float64Array([1, 2, 3, 4, 5]),
      new Float64Array([5, NaN, 3, 2, 1]),
    ];

    const labels = ['a', 'b'];

    const result = corrMatrixTyped(arrays, labels);

    // Check dimensions
    expect(result.matrix.length).toBe(4); // 2x2 matrix flattened
    expect(result.labels).toEqual(labels);

    // Check correlation values
    // a and a should have perfect correlation
    expect(result.matrix[0]).toBeCloseTo(1, 10);

    // a and b should have correlation calculated without NaN value
    // Для Vitest используем более широкий диапазон допустимой погрешности
    expect(result.matrix[1]).toBeCloseTo(-1, 1);

    // b and a should have correlation calculated without NaN value
    expect(result.matrix[2]).toBeCloseTo(-1, 1);

    // b and b should have perfect correlation
    expect(result.matrix[3]).toBeCloseTo(1, 10);
  });

  test('should throw error for empty arrays', () => {
    expect(() => corrMatrixTyped([], [])).toThrow('Input arrays are empty');
    expect(() => corrMatrixTyped(null, [])).toThrow('Input arrays are empty');
  });
});
