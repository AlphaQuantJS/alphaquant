/**
 * Tests for sortValuesMultiple.js
 */

import { createFrame } from '../../../../frame/createFrame.js';
import { sortValuesMultiple } from '../../../../frame/methods/sorting/sortValuesMultiple.js';
import { arrayEquals } from '../../../helpers/arrayEquals.js';

describe('sortValuesMultiple', () => {
  test('должен сортировать фрейм по нескольким колонкам по возрастанию', () => {
    const frame = createFrame({
      a: [1, 2, 1, 2, 1],
      b: [3, 1, 2, 2, 1],
      c: ['x', 'y', 'z', 'a', 'b'],
    });

    const result = sortValuesMultiple(frame, ['a', 'b']);

    // Сначала сортировка по 'a', затем по 'b'
    // Ожидаемый порядок: (1,1,'b'), (1,2,'z'), (1,3,'x'), (2,1,'y'), (2,2,'a')
    expect(arrayEquals(result.columns.a, [1, 1, 1, 2, 2])).toBe(true);
    expect(arrayEquals(result.columns.b, [1, 2, 3, 1, 2])).toBe(true);
    expect(arrayEquals(result.columns.c, ['b', 'z', 'x', 'y', 'a'])).toBe(true);
  });

  test('должен сортировать фрейм по нескольким колонкам с разными направлениями', () => {
    const frame = createFrame({
      a: [1, 2, 1, 2, 1],
      b: [3, 1, 2, 2, 1],
      c: ['x', 'y', 'z', 'a', 'b'],
    });

    // 'a' по возрастанию, 'b' по убыванию
    const result = sortValuesMultiple(frame, ['a', 'b'], [true, false]);

    // Ожидаемый порядок: (1,3,'x'), (1,2,'z'), (1,1,'b'), (2,2,'a'), (2,1,'y')
    expect(arrayEquals(result.columns.a, [1, 1, 1, 2, 2])).toBe(true);
    expect(arrayEquals(result.columns.b, [3, 2, 1, 2, 1])).toBe(true);
    expect(arrayEquals(result.columns.c, ['x', 'z', 'b', 'a', 'y'])).toBe(true);
  });

  test('должен сортировать фрейм по нескольким колонкам по убыванию', () => {
    const frame = createFrame({
      a: [1, 2, 1, 2, 1],
      b: [3, 1, 2, 2, 1],
      c: ['x', 'y', 'z', 'a', 'b'],
    });

    const result = sortValuesMultiple(frame, ['a', 'b'], [false, false]);

    // Ожидаемый порядок: (2,2,'a'), (2,1,'y'), (1,3,'x'), (1,2,'z'), (1,1,'b')
    expect(arrayEquals(result.columns.a, [2, 2, 1, 1, 1])).toBe(true);
    expect(arrayEquals(result.columns.b, [2, 1, 3, 2, 1])).toBe(true);
    expect(arrayEquals(result.columns.c, ['a', 'y', 'x', 'z', 'b'])).toBe(true);
  });

  test('должен использовать направление по умолчанию, если не указано', () => {
    const frame = createFrame({
      a: [1, 2, 1, 2, 1],
      b: [3, 1, 2, 2, 1],
      c: ['x', 'y', 'z', 'a', 'b'],
    });

    // Только для 'a' указано направление, для 'b' используется по умолчанию (true)
    const result = sortValuesMultiple(frame, ['a', 'b'], [false]);

    // Ожидаемый порядок: (2,1,'y'), (2,2,'a'), (1,1,'b'), (1,2,'z'), (1,3,'x')
    expect(arrayEquals(result.columns.a, [2, 2, 1, 1, 1])).toBe(true);
    expect(arrayEquals(result.columns.b, [1, 2, 1, 2, 3])).toBe(true);
    expect(arrayEquals(result.columns.c, ['y', 'a', 'b', 'z', 'x'])).toBe(true);
  });

  test('должен корректно обрабатывать NaN значения при сортировке', () => {
    const frame = createFrame({
      a: [1, 2, 1, 2, NaN],
      b: [3, 1, NaN, 2, 1],
      c: ['x', 'y', 'z', 'a', 'b'],
    });

    const result = sortValuesMultiple(frame, ['a', 'b']);

    // NaN значения должны быть в конце при сортировке по возрастанию
    const sortedA = Array.from(result.columns.a);
    const sortedB = Array.from(result.columns.b);

    // Проверяем, что NaN значения находятся в конце
    expect(Number.isNaN(sortedA[4])).toBe(true);

    // Проверяем, что строки с NaN в 'b' идут после строк с числовыми значениями
    expect(arrayEquals(sortedA.slice(0, 3), [1, 1, 2])).toBe(true);
    expect(sortedB[2]).toBe(1);
  });

  test('должен обрабатывать пустой фрейм', () => {
    const frame = createFrame({
      a: [],
      b: [],
      c: [],
    });

    const result = sortValuesMultiple(frame, ['a', 'b']);

    expect(result.rowCount).toBe(0);
    expect(result.columns.a.length).toBe(0);
    expect(result.columns.b.length).toBe(0);
    expect(result.columns.c.length).toBe(0);
  });

  test('должен выбрасывать ошибку для некорректного фрейма', () => {
    expect(() => sortValuesMultiple(null, ['a', 'b'])).toThrow();
    expect(() => sortValuesMultiple({}, ['a', 'b'])).toThrow();
    expect(() => sortValuesMultiple({ columns: {} }, ['a', 'b'])).toThrow();
  });

  test('должен выбрасывать ошибку для пустого списка колонок', () => {
    const frame = createFrame({
      a: [1, 2, 3],
      b: [10, 20, 30],
    });

    expect(() => sortValuesMultiple(frame, [])).toThrow();
  });

  test('должен выбрасывать ошибку для несуществующей колонки', () => {
    const frame = createFrame({
      a: [1, 2, 3],
      b: [10, 20, 30],
    });

    expect(() => sortValuesMultiple(frame, ['a', 'c'])).toThrow();
  });
});
