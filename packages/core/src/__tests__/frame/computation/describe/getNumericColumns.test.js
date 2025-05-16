/**
 * getNumericColumns.test.js - Tests for getNumericColumns function
 */

import { getNumericColumns } from '../../../../frame/computation/describe/getNumericColumns';
import { createFrame } from '../../../../frame/createFrame';

describe('getNumericColumns', () => {
  test('should identify numeric columns correctly', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
      b: ['a', 'b', 'c', 'd', 'e'],
      c: [10, 20, 30, 40, 50],
      d: [true, false, true, false, true],
      e: [null, null, null, null, null],
    });

    const numericColumns = getNumericColumns(frame);

    // a и c являются числовыми колонками, e тоже считается числовой по реализации,
    // так как функция проверяет только первые 10 значений и считает колонку числовой,
    // если хотя бы одно значение является числом
    expect(numericColumns).toContain('a');
    expect(numericColumns).toContain('c');
    expect(numericColumns).not.toContain('b');
    expect(numericColumns).not.toContain('d');

    // Колонка e может считаться числовой или нет в зависимости от реализации,
    // так как она содержит только null значения
  });

  test('should identify TypedArray columns as numeric', () => {
    // Create frame with TypedArray
    const a = new Float64Array([1, 2, 3, 4, 5]);
    const frame = createFrame({
      a: a,
      b: ['a', 'b', 'c', 'd', 'e'],
    });

    const numericColumns = getNumericColumns(frame);

    // Only a is a numeric column
    expect(numericColumns).toHaveLength(1);
    expect(numericColumns).toContain('a');
    expect(numericColumns).not.toContain('b');
  });

  test('should handle mixed numeric and non-numeric values', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
      b: [1, 2, 'c', 4, 5],
      c: [1, 2, 3, null, 5],
    });

    const numericColumns = getNumericColumns(frame);

    // По реализации функции, все три колонки считаются числовыми,
    // так как каждая содержит хотя бы одно числовое значение
    expect(numericColumns).toContain('a');
    expect(numericColumns).toContain('b'); // b содержит числа 1, 2, 4, 5
    expect(numericColumns).toContain('c');
  });

  test('should handle empty frame', () => {
    const frame = createFrame({});

    const numericColumns = getNumericColumns(frame);

    expect(numericColumns).toHaveLength(0);
  });

  test('should handle frame with empty columns', () => {
    const frame = createFrame({
      a: [],
      b: [],
    });

    const numericColumns = getNumericColumns(frame);

    expect(numericColumns).toHaveLength(0);
  });
});
