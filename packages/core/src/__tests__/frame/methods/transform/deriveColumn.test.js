/**
 * Tests for methods/transform/deriveColumn.js
 */

import { createFrame } from '../../../../frame/createFrame.js';
import { deriveColumn } from '../../../../frame/methods/transform/deriveColumn.js';

describe('deriveColumn', () => {
  test('должен создавать новую колонку на основе нескольких входных колонок', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
      b: [10, 20, 30, 40, 50],
    });

    // Функция: сумма значений колонок a и b
    const result = deriveColumn(frame, ['a', 'b'], 'sum', (rowValues) => {
      return rowValues.a + rowValues.b;
    });

    // Проверяем, что новая колонка создана корректно
    expect(Array.from(result.columns.sum)).toEqual([11, 22, 33, 44, 55]);

    // Другие колонки должны остаться без изменений
    expect(Array.from(result.columns.a)).toEqual([1, 2, 3, 4, 5]);
    expect(Array.from(result.columns.b)).toEqual([10, 20, 30, 40, 50]);
  });

  test('должен предоставлять доступ к индексу строки', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
      b: [10, 20, 30, 40, 50],
    });

    // Функция: сумма значений колонок a и b, умноженная на индекс
    const result = deriveColumn(
      frame,
      ['a', 'b'],
      'weighted_sum',
      (rowValues, index) => {
        return (rowValues.a + rowValues.b) * index;
      },
    );

    // Проверяем результат
    expect(Array.from(result.columns.weighted_sum)).toEqual([
      0, 22, 66, 132, 220,
    ]);
  });

  test('должен корректно обрабатывать NaN и null значения', () => {
    const frame = createFrame({
      a: [1, NaN, 3, null, 5],
      b: [10, 20, 30, 40, 50],
    });

    // Функция: сумма значений колонок a и b с проверкой на NaN
    const result = deriveColumn(frame, ['a', 'b'], 'safe_sum', (rowValues) => {
      const a = rowValues.a;
      const b = rowValues.b;

      if (
        a === null ||
        a === undefined ||
        (typeof a === 'number' && isNaN(a))
      ) {
        return b;
      }

      return a + b;
    });

    // Проверяем результат
    const resultArray = Array.from(result.columns.safe_sum);
    expect(resultArray[0]).toBe(11); // 1 + 10
    expect(resultArray[1]).toBe(20); // NaN + 20 = 20 (из-за нашей проверки)
    expect(resultArray[2]).toBe(33); // 3 + 30
    expect(resultArray[3]).toBe(40); // null + 40 = 40 (из-за нашей проверки)
    expect(resultArray[4]).toBe(55); // 5 + 50
  });

  test('должен выбрасывать ошибку при неверных входных данных', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5],
      b: [10, 20, 30, 40, 50],
    });

    // Некорректные входные колонки
    expect(() =>
      deriveColumn(frame, ['nonexistent'], 'sum', (rowValues) => rowValues.a),
    ).toThrow();
    expect(() =>
      deriveColumn(frame, [], 'sum', (rowValues) => rowValues.a),
    ).toThrow();
    expect(() =>
      deriveColumn(frame, 'a', 'sum', (rowValues) => rowValues.a),
    ).toThrow();

    // Некорректное имя выходной колонки
    expect(() =>
      deriveColumn(
        frame,
        ['a', 'b'],
        '',
        (rowValues) => rowValues.a + rowValues.b,
      ),
    ).toThrow();
    expect(() =>
      deriveColumn(
        frame,
        ['a', 'b'],
        null,
        (rowValues) => rowValues.a + rowValues.b,
      ),
    ).toThrow();

    // Некорректная функция трансформации
    expect(() => deriveColumn(frame, ['a', 'b'], 'sum', null)).toThrow();
    expect(() => deriveColumn(frame, ['a', 'b'], 'sum', 'invalid')).toThrow();

    // Некорректный фрейм
    expect(() =>
      deriveColumn(
        null,
        ['a', 'b'],
        'sum',
        (rowValues) => rowValues.a + rowValues.b,
      ),
    ).toThrow();
    expect(() =>
      deriveColumn(
        {},
        ['a', 'b'],
        'sum',
        (rowValues) => rowValues.a + rowValues.b,
      ),
    ).toThrow();
    expect(() =>
      deriveColumn(
        { columns: {} },
        ['a', 'b'],
        'sum',
        (rowValues) => rowValues.a + rowValues.b,
      ),
    ).toThrow();
  });
});
