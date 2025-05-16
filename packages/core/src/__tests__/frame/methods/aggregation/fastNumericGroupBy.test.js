/**
 * fastNumericGroupBy.test.js - Tests for fastNumericGroupBy function
 */

import { fastNumericGroupBy } from '../../../../frame/methods/aggregation/fastNumericGroupBy.js';
import { createFrame } from '../../../../frame/createFrame.js';

describe('fastNumericGroupBy', () => {
  test('should correctly group and aggregate numeric data', () => {
    const frame = createFrame({
      group: ['A', 'A', 'B', 'B', 'C'],
      value1: [1, 2, 3, 4, 5],
      value2: [10, 20, 30, 40, 50],
    });

    const result = fastNumericGroupBy(frame, ['group'], {
      value1_mean: { column: 'value1', aggType: 'mean' },
      value2_sum: { column: 'value2', aggType: 'sum' },
    });

    // Check row count
    expect(result.rowCount).toBe(3); // 3 unique groups: A, B, C

    // Check group column
    expect(result.columns.group).toEqual(['A', 'B', 'C']);

    // Check aggregated columns
    expect(result.columns.value1_mean[0]).toBe(1.5); // (1+2)/2 for group A
    expect(result.columns.value1_mean[1]).toBe(3.5); // (3+4)/2 for group B
    expect(result.columns.value1_mean[2]).toBe(5); // 5 for group C

    expect(result.columns.value2_sum[0]).toBe(30); // 10+20 for group A
    expect(result.columns.value2_sum[1]).toBe(70); // 30+40 for group B
    expect(result.columns.value2_sum[2]).toBe(50); // 50 for group C
  });

  test('should handle multiple aggregation types', () => {
    // Создаем тестовый фрейм с данными
    const frame = createFrame({
      group: ['A', 'A', 'B', 'B', 'C'],
      value: [1, 2, 3, 4, 5],
    });

    // Вызываем функцию с множественными типами агрегации
    const result = fastNumericGroupBy(frame, ['group'], {
      value_min: { column: 'value', aggType: 'min' },
      value_max: { column: 'value', aggType: 'max' },
      value_mean: { column: 'value', aggType: 'mean' },
      value_sum: { column: 'value', aggType: 'sum' },
      value_count: { column: 'value', aggType: 'count' },
    });

    // Проверяем результаты для группы A
    expect(result.columns.value_min[0]).toBe(1);
    expect(result.columns.value_max[0]).toBe(2);
    expect(result.columns.value_mean[0]).toBe(1.5);
    expect(result.columns.value_sum[0]).toBe(3);
    expect(result.columns.value_count[0]).toBe(2);

    // Проверяем результаты для группы B
    expect(result.columns.value_min[1]).toBe(3);
    expect(result.columns.value_max[1]).toBe(4);
    expect(result.columns.value_mean[1]).toBe(3.5);
    expect(result.columns.value_sum[1]).toBe(7);
    expect(result.columns.value_count[1]).toBe(2);

    // Проверяем результаты для группы C
    expect(result.columns.value_min[2]).toBe(5);
    expect(result.columns.value_max[2]).toBe(5);
    expect(result.columns.value_mean[2]).toBe(5);
    expect(result.columns.value_sum[2]).toBe(5);
    expect(result.columns.value_count[2]).toBe(1);
  });

  test('should handle empty frame', () => {
    const frame = createFrame({
      group: [],
      value: [],
    });

    const result = fastNumericGroupBy(frame, ['group'], {
      value_mean: { column: 'value', aggType: 'mean' },
    });

    expect(result.rowCount).toBe(0);
    expect(result.columns.group).toEqual([]);
    expect(result.columns.value_mean).toEqual([]);
  });

  test('should handle NaN values', () => {
    const frame = createFrame({
      group: ['A', 'A', 'B', 'B'],
      value: [1, NaN, 3, 4],
    });

    const result = fastNumericGroupBy(frame, ['group'], {
      value_mean: { column: 'value', aggType: 'mean' },
    });

    expect(result.columns.value_mean[0]).toBe(1); // Only 1 is valid for group A
    expect(result.columns.value_mean[1]).toBe(3.5); // (3+4)/2 for group B
  });

  test('should handle custom options', () => {
    // Создаем тестовый фрейм
    const frame = createFrame({
      group: ['A', 'B', 'C'],
      value: [1, 2, 3],
    });

    // Вызываем функцию с опцией typedArrays: false
    const result = fastNumericGroupBy(
      frame,
      ['group'],
      {
        value_mean: { column: 'value', aggType: 'mean' },
      },
      {
        typedArrays: false, // Отключаем преобразование в TypedArray
      },
    );

    // Проверяем, что результат содержит правильные значения, независимо от типа массива
    expect(result.columns.value_mean[0]).toBe(1);
    expect(result.columns.value_mean[1]).toBe(2);
    expect(result.columns.value_mean[2]).toBe(3);

    // Проверяем, что результат можно использовать как массив
    expect(Array.from(result.columns.value_mean)).toEqual([1, 2, 3]);
  });
});
