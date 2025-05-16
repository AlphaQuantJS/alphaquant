/**
 * melt.test.js - Тесты для функции melt
 */

import { melt } from '../../../../frame/reshape/pivot/melt.js';
import { createFrame } from '../../../../frame/createFrame.js';
import { arrayEquals } from '../../../helpers/arrayEquals.js';

describe('melt', () => {
  test('должен преобразовывать данные из "широкого" формата в "длинный"', () => {
    const frame = createFrame({
      id: ['A', 'B', 'C'],
      val1: [1, 2, 3],
      val2: [4, 5, 6],
    });

    const result = melt(frame, 'id', ['val1', 'val2']);

    // Проверяем количество строк: 3 строки * 2 колонки = 6 строк
    expect(result.rowCount).toBe(6);

    // Проверяем структуру результата
    expect(arrayEquals(result.columns.id, ['A', 'A', 'B', 'B', 'C', 'C'])).toBe(
      true,
    );
    expect(
      arrayEquals(result.columns.variable, [
        'val1',
        'val2',
        'val1',
        'val2',
        'val1',
        'val2',
      ]),
    ).toBe(true);
    expect(arrayEquals(result.columns.value, [1, 4, 2, 5, 3, 6])).toBe(true);
  });

  test('должен использовать пользовательские имена для колонок переменных и значений', () => {
    const frame = createFrame({
      id: ['A', 'B', 'C'],
      val1: [1, 2, 3],
      val2: [4, 5, 6],
    });

    const result = melt(
      frame,
      'id',
      ['val1', 'val2'],
      'column_name',
      'column_value',
    );

    // Проверяем структуру результата
    expect(arrayEquals(result.columns.id, ['A', 'A', 'B', 'B', 'C', 'C'])).toBe(
      true,
    );
    expect(
      arrayEquals(result.columns.column_name, [
        'val1',
        'val2',
        'val1',
        'val2',
        'val1',
        'val2',
      ]),
    ).toBe(true);
    expect(arrayEquals(result.columns.column_value, [1, 4, 2, 5, 3, 6])).toBe(
      true,
    );
  });

  test('должен обрабатывать пустой фрейм', () => {
    const frame = createFrame({
      id: [],
      val1: [],
      val2: [],
    });

    const result = melt(frame, 'id', ['val1', 'val2']);

    expect(result.rowCount).toBe(0);
    expect(arrayEquals(result.columns.id, [])).toBe(true);
    expect(arrayEquals(result.columns.variable, [])).toBe(true);
    expect(arrayEquals(result.columns.value, [])).toBe(true);
  });

  test('должен обрабатывать фрейм с одной строкой', () => {
    const frame = createFrame({
      id: ['A'],
      val1: [1],
      val2: [2],
    });

    const result = melt(frame, 'id', ['val1', 'val2']);

    expect(result.rowCount).toBe(2);
    expect(arrayEquals(result.columns.id, ['A', 'A'])).toBe(true);
    expect(arrayEquals(result.columns.variable, ['val1', 'val2'])).toBe(true);
    expect(arrayEquals(result.columns.value, [1, 2])).toBe(true);
  });

  test('должен обрабатывать фрейм с одной колонкой значений', () => {
    const frame = createFrame({
      id: ['A', 'B', 'C'],
      val1: [1, 2, 3],
    });

    const result = melt(frame, 'id', ['val1']);

    expect(result.rowCount).toBe(3);
    expect(arrayEquals(result.columns.id, ['A', 'B', 'C'])).toBe(true);
    expect(arrayEquals(result.columns.variable, ['val1', 'val1', 'val1'])).toBe(
      true,
    );
    expect(arrayEquals(result.columns.value, [1, 2, 3])).toBe(true);
  });

  test('должен выбрасывать ошибку при неверном входном фрейме', () => {
    expect(() => melt(null, 'id', ['val1'])).toThrow();
    expect(() => melt({}, 'id', ['val1'])).toThrow();
    expect(() => melt({ columns: {} }, 'id', ['val1'])).toThrow();
  });

  test('должен выбрасывать ошибку при несуществующей колонке id_vars', () => {
    const frame = createFrame({
      id: ['A', 'B', 'C'],
      val1: [1, 2, 3],
    });

    expect(() => melt(frame, 'non_existent', ['val1'])).toThrow();
  });

  test('должен выбрасывать ошибку при несуществующей колонке value_vars', () => {
    const frame = createFrame({
      id: ['A', 'B', 'C'],
      val1: [1, 2, 3],
    });

    expect(() => melt(frame, 'id', ['non_existent'])).toThrow();
  });
});
