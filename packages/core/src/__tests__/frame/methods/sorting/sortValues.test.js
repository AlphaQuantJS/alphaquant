/**
 * Tests for sortValues.js
 */

import { createFrame } from '../../../../frame/createFrame.js';
import { sortValues } from '../../../../frame/methods/sorting/sortValues.js';
import { arrayEquals } from '../../../helpers/arrayEquals.js';

describe('sortValues', () => {
  test('должен сортировать фрейм по числовой колонке по возрастанию', () => {
    const frame = createFrame({
      a: [3, 1, 5, 2, 4],
      b: ['c', 'a', 'e', 'b', 'd'],
    });

    const result = sortValues(frame, 'a');

    expect(arrayEquals(result.columns.a, [1, 2, 3, 4, 5])).toBe(true);
    expect(arrayEquals(result.columns.b, ['a', 'b', 'c', 'd', 'e'])).toBe(true);
  });

  test('должен сортировать фрейм по числовой колонке по убыванию', () => {
    const frame = createFrame({
      a: [3, 1, 5, 2, 4],
      b: ['c', 'a', 'e', 'b', 'd'],
    });

    const result = sortValues(frame, 'a', false);

    expect(arrayEquals(result.columns.a, [5, 4, 3, 2, 1])).toBe(true);
    expect(arrayEquals(result.columns.b, ['e', 'd', 'c', 'b', 'a'])).toBe(true);
  });

  test('должен сортировать фрейм по строковой колонке по возрастанию', () => {
    const frame = createFrame({
      a: [3, 1, 5, 2, 4],
      b: ['c', 'a', 'e', 'b', 'd'],
    });

    const result = sortValues(frame, 'b');

    expect(arrayEquals(result.columns.a, [1, 2, 3, 4, 5])).toBe(true);
    expect(arrayEquals(result.columns.b, ['a', 'b', 'c', 'd', 'e'])).toBe(true);
  });

  test('должен сортировать фрейм по строковой колонке по убыванию', () => {
    const frame = createFrame({
      a: [3, 1, 5, 2, 4],
      b: ['c', 'a', 'e', 'b', 'd'],
    });

    const result = sortValues(frame, 'b', false);

    expect(arrayEquals(result.columns.a, [5, 4, 3, 2, 1])).toBe(true);
    expect(arrayEquals(result.columns.b, ['e', 'd', 'c', 'b', 'a'])).toBe(true);
  });

  test('должен корректно обрабатывать NaN значения при сортировке', () => {
    const frame = createFrame({
      a: [3, NaN, 5, 2, NaN],
      b: ['c', 'a', 'e', 'b', 'd'],
    });

    const result = sortValues(frame, 'a');

    // NaN значения должны быть в конце при сортировке по возрастанию
    const sortedA = Array.from(result.columns.a);
    expect(arrayEquals(sortedA.slice(0, 3), [2, 3, 5])).toBe(true);
    expect(Number.isNaN(sortedA[3])).toBe(true);
    expect(Number.isNaN(sortedA[4])).toBe(true);
  });

  test('должен обрабатывать пустой фрейм', () => {
    const frame = createFrame({
      a: [],
      b: [],
    });

    const result = sortValues(frame, 'a');

    expect(result.rowCount).toBe(0);
    expect(result.columns.a.length).toBe(0);
    expect(result.columns.b.length).toBe(0);
  });

  test('должен выбрасывать ошибку для некорректного фрейма', () => {
    expect(() => sortValues(null, 'a')).toThrow();
    expect(() => sortValues({}, 'a')).toThrow();
    expect(() => sortValues({ columns: {} }, 'a')).toThrow();
  });

  test('должен выбрасывать ошибку для несуществующей колонки', () => {
    const frame = createFrame({
      a: [1, 2, 3],
      b: ['x', 'y', 'z'],
    });

    expect(() => sortValues(frame, 'c')).toThrow();
  });
});
