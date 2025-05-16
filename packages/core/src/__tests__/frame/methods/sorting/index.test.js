/**
 * Tests for methods/sorting/index.js
 */

import * as sortUtils from '../../../../frame/methods/sorting/index.js';

describe('methods/sorting/index.js', () => {
  test('должен экспортировать все функции сортировки', () => {
    // Проверяем наличие функций
    expect(sortUtils.sortValues).toBeDefined();
    expect(sortUtils.sortValuesMultiple).toBeDefined();
    expect(sortUtils.sortByIndex).toBeDefined();
    expect(sortUtils.argsort).toBeDefined();
  });

  test('функции должны быть корректного типа', () => {
    // Проверяем, что экспортированные объекты - это функции
    expect(typeof sortUtils.sortValues).toBe('function');
    expect(typeof sortUtils.sortValuesMultiple).toBe('function');
    expect(typeof sortUtils.sortByIndex).toBe('function');
    expect(typeof sortUtils.argsort).toBe('function');
  });
});
