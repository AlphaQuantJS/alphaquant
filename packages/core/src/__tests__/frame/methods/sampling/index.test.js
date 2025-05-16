/**
 * Tests for methods/sampling/index.js
 */

import * as sampleUtils from '../../../../frame/methods/sampling/index.js';

describe('methods/sampling/index.js', () => {
  test('должен экспортировать все функции выборки данных', () => {
    // Проверяем наличие функций
    expect(sampleUtils.sample).toBeDefined();
    expect(sampleUtils.sampleFraction).toBeDefined();
    expect(sampleUtils.trainTestSplit).toBeDefined();
    expect(sampleUtils.createSeededRandom).toBeDefined();
  });

  test('функции должны быть корректного типа', () => {
    // Проверяем, что экспортированные объекты - это функции
    expect(typeof sampleUtils.sample).toBe('function');
    expect(typeof sampleUtils.sampleFraction).toBe('function');
    expect(typeof sampleUtils.trainTestSplit).toBe('function');
    expect(typeof sampleUtils.createSeededRandom).toBe('function');
  });
});
