// alphaquant-core/src/__tests__/math/normalizeTyped.test.js
import { jest, describe, it, expect } from '@jest/globals';
import { normalizeTyped } from '../../math/normalizeTyped.js';

describe('normalizeTyped module', () => {
  it('normalizes values to range [0, 1]', () => {
    const arr = [10, 20, 30, 40, 50];
    const normalized = normalizeTyped(arr);

    expect(normalized).toBeInstanceOf(Float64Array);
    expect(normalized.length).toBe(5);

    // Проверяем, что значения нормализованы правильно
    expect(normalized[0]).toBeCloseTo(0, 6);
    expect(normalized[1]).toBeCloseTo(0.25, 6);
    expect(normalized[2]).toBeCloseTo(0.5, 6);
    expect(normalized[3]).toBeCloseTo(0.75, 6);
    expect(normalized[4]).toBeCloseTo(1, 6);
  });

  it('handles array with single value', () => {
    const arr = [42];

    // При одном значении должен выбрасывать ошибку (нельзя нормализовать)
    expect(() => normalizeTyped(arr)).toThrow(
      'Cannot normalize array with constant values',
    );
  });

  it('handles array with constant values', () => {
    const arr = [10, 10, 10];

    // При константных значениях должен выбрасывать ошибку
    expect(() => normalizeTyped(arr)).toThrow(
      'Cannot normalize array with constant values',
    );
  });

  it('throws error for empty array', () => {
    expect(() => normalizeTyped([])).toThrow('Cannot filter empty array');
  });

  it('handles array with negative values', () => {
    const arr = [-10, 0, 10];
    const normalized = normalizeTyped(arr);

    expect(normalized[0]).toBeCloseTo(0, 6);
    expect(normalized[1]).toBeCloseTo(0.5, 6);
    expect(normalized[2]).toBeCloseTo(1, 6);
  });
});
