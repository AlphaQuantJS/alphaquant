// alphaquant-core/src/__tests__/math/zscoreTyped.test.js
import { jest, describe, it, expect } from '@jest/globals';
import { zscoreTyped } from '../../math/zscoreTyped.js';

describe('zscoreTyped module', () => {
  it('standardizes values (mean=0, std=1)', () => {
    const arr = [1, 2, 3, 4, 5];
    const standardized = zscoreTyped(arr);

    expect(standardized).toBeInstanceOf(Float64Array);
    expect(standardized.length).toBe(5);

    // Проверяем, что среднее близко к 0
    const mean =
      Array.from(standardized).reduce((a, b) => a + b, 0) / standardized.length;
    expect(mean).toBeCloseTo(0, 6);

    // Проверяем, что стандартное отклонение близко к 1
    const variance =
      Array.from(standardized).reduce((a, b) => a + b * b, 0) /
      standardized.length;
    const std = Math.sqrt(variance);
    expect(std).toBeCloseTo(1, 6);

    // Проверяем конкретные значения
    expect(standardized[0]).toBeCloseTo(-1.414, 3); // (1-3)/sqrt(2)
    expect(standardized[2]).toBeCloseTo(0, 6); // (3-3)/sqrt(2)
    expect(standardized[4]).toBeCloseTo(1.414, 3); // (5-3)/sqrt(2)
  });

  it('throws error for array with single value', () => {
    const arr = [42];

    // При одном значении должен выбрасывать ошибку (нулевое стандартное отклонение)
    expect(() => zscoreTyped(arr)).toThrow(
      'Cannot calculate z-score when standard deviation is zero',
    );
  });

  it('throws error for array with constant values', () => {
    const arr = [10, 10, 10];

    // При константных значениях должен выбрасывать ошибку
    expect(() => zscoreTyped(arr)).toThrow(
      'Cannot calculate z-score when standard deviation is zero',
    );
  });

  it('throws error for empty array', () => {
    expect(() => zscoreTyped([])).toThrow('Cannot filter empty array');
  });
});
