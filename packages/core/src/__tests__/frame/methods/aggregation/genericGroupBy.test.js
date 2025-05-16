/**
 * genericGroupBy.test.js - Tests for genericGroupBy function
 */

import { createFrame } from '../../../../frame/createFrame.js';
import { genericGroupBy } from '../../../../frame/methods/aggregation/genericGroupBy.js';

describe('genericGroupBy', () => {
  test('should correctly group and aggregate data with built-in aggregations', () => {
    const frame = createFrame({
      group: ['A', 'A', 'B', 'B', 'C'],
      value: [1, 2, 3, 4, 5],
    });

    const result = genericGroupBy(frame, ['group'], {
      value_mean: { column: 'value', aggType: 'mean' },
    });

    // Check row count
    expect(result.rowCount).toBe(3); // 3 unique groups: A, B, C

    // Check group column
    expect(result.columns.group).toEqual(['A', 'B', 'C']);

    // Check aggregated column
    expect(result.columns.value_mean[0]).toBe(1.5); // (1+2)/2 for group A
    expect(result.columns.value_mean[1]).toBe(3.5); // (3+4)/2 for group B
    expect(result.columns.value_mean[2]).toBe(5); // 5 for group C
  });

  test('should handle custom aggregation functions', () => {
    const frame = createFrame({
      group: ['A', 'A', 'B', 'B', 'C'],
      value: [1, 2, 3, 4, 5],
    });

    const result = genericGroupBy(frame, ['group'], {
      value_custom: {
        column: 'value',
        aggType: (/** @type {number[]} */ values) =>
          values.reduce(
            (/** @type {number} */ a, /** @type {number} */ b) => a + b,
            0,
          ) / values.length, // Custom mean
      },
    });

    // Check row count
    expect(result.rowCount).toBe(3); // 3 unique groups: A, B, C

    // Check group column
    expect(result.columns.group).toEqual(['A', 'B', 'C']);

    // Check aggregated column
    expect(result.columns.value_custom[0]).toBe(1.5); // (1+2)/2 for group A
    expect(result.columns.value_custom[1]).toBe(3.5); // (3+4)/2 for group B
    expect(result.columns.value_custom[2]).toBe(5); // 5 for group C
  });

  test('should handle non-numeric data', () => {
    const frame = createFrame({
      group: ['A', 'A', 'B', 'B', 'C'],
      value: ['foo', 'bar', 'baz', 'qux', 'quux'],
    });

    const result = genericGroupBy(frame, ['group'], {
      value_custom: {
        column: 'value',
        aggType: (/** @type {string[]} */ values) => values.join(','),
      },
    });

    // Check row count
    expect(result.rowCount).toBe(3); // 3 unique groups: A, B, C

    // Check group column
    expect(result.columns.group).toEqual(['A', 'B', 'C']);

    // Check aggregated columns
    expect(result.columns.value_custom[0]).toBe('foo,bar');
    expect(result.columns.value_custom[1]).toBe('baz,qux');
    expect(result.columns.value_custom[2]).toBe('quux');
  });

  test('should handle empty frame', () => {
    const emptyFrame = createFrame({
      group: [],
      value: [],
    });

    const result = genericGroupBy(emptyFrame, ['group'], {
      value_mean: { column: 'value', aggType: 'mean' },
    });

    // Check row count
    expect(result.rowCount).toBe(0);
    expect(result.columns.group).toEqual([]);
    expect(result.columns.value_mean).toEqual([]);
  });

  test('should handle multiple group by columns', () => {
    const frame = createFrame({
      group1: ['A', 'A', 'A', 'B', 'B'],
      group2: ['X', 'X', 'Y', 'X', 'Y'],
      value: [1, 2, 3, 4, 5],
    });

    const result = genericGroupBy(frame, ['group1', 'group2'], {
      value_sum: { column: 'value', aggType: 'sum' },
    });

    // Check row count
    expect(result.rowCount).toBe(4); // 4 unique combinations: A-X, A-Y, B-X, B-Y

    // Find indices for each combination
    let indexAX = -1;
    let indexAY = -1;
    let indexBX = -1;
    let indexBY = -1;

    for (let i = 0; i < result.rowCount; i++) {
      const group1 = result.columns.group1[i];
      const group2 = result.columns.group2[i];

      if (group1 === 'A' && group2 === 'X') indexAX = i;
      if (group1 === 'A' && group2 === 'Y') indexAY = i;
      if (group1 === 'B' && group2 === 'X') indexBX = i;
      if (group1 === 'B' && group2 === 'Y') indexBY = i;
    }

    // Check that all combinations are found
    expect(indexAX).not.toBe(-1);
    expect(indexAY).not.toBe(-1);
    expect(indexBX).not.toBe(-1);
    expect(indexBY).not.toBe(-1);

    // Check aggregated values
    expect(result.columns.value_sum[indexAX]).toBe(3); // 1+2 for A-X
    expect(result.columns.value_sum[indexAY]).toBe(3); // 3 for A-Y
    expect(result.columns.value_sum[indexBX]).toBe(4); // 4 for B-X
    expect(result.columns.value_sum[indexBY]).toBe(5); // 5 for B-Y
  });
});
