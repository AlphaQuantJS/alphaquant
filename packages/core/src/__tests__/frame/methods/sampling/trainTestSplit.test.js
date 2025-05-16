/**
 * Tests for trainTestSplit.js
 */

import { createFrame } from '../../../../frame/createFrame.js';
import { trainTestSplit } from '../../../../frame/methods/sampling/trainTestSplit.js';

describe('trainTestSplit', () => {
  test('должен разделять фрейм на тренировочный и тестовый наборы', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      b: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    });

    const [train, test] = trainTestSplit(frame, 0.3);

    // 30% от 10 строк = 3 строки для теста, 7 строк для тренировки
    expect(train.rowCount).toBe(7);
    expect(test.rowCount).toBe(3);

    expect(Object.keys(train.columns)).toEqual(['a', 'b']);
    expect(Object.keys(test.columns)).toEqual(['a', 'b']);

    // Проверяем, что общее количество строк сохранилось
    expect(train.rowCount + test.rowCount).toBe(frame.rowCount);

    // Проверяем, что все значения из исходного фрейма присутствуют в разделенных фреймах
    const allValues = [];
    for (let i = 0; i < train.rowCount; i++) {
      allValues.push(train.columns.a[i]);
    }
    for (let i = 0; i < test.rowCount; i++) {
      allValues.push(test.columns.a[i]);
    }
    allValues.sort((a, b) => a - b);
    expect(allValues).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  test('должен округлять количество строк для теста', () => {
    const frame = createFrame({
      a: [1, 2, 3],
      b: [10, 20, 30],
    });

    // 40% от 3 строк = 1.2 строки, округляем до 1 (Math.round)
    const [train, test] = trainTestSplit(frame, 0.4);

    expect(train.rowCount).toBe(2); // 3 - 1 = 2
    expect(test.rowCount).toBe(1); // round(3 * 0.4) = 1
  });

  test('должен возвращать воспроизводимые результаты с заданным seed', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      b: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    });

    const [train1, test1] = trainTestSplit(frame, 0.3, 42);
    const [train2, test2] = trainTestSplit(frame, 0.3, 42);

    // Проверяем, что с одинаковым seed получаем одинаковые результаты
    expect(Array.from(train1.columns.a)).toEqual(Array.from(train2.columns.a));
    expect(Array.from(test1.columns.a)).toEqual(Array.from(test2.columns.a));
  });

  test('должен возвращать разные результаты с разными seed', () => {
    const frame = createFrame({
      a: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      b: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    });

    const [train1, test1] = trainTestSplit(frame, 0.3, 42);
    const [train2, test2] = trainTestSplit(frame, 0.3, 43);

    // Проверяем, что с разными seed получаем разные результаты
    // Примечание: теоретически возможно, что даже с разными seed
    // результаты будут одинаковыми, но вероятность этого очень мала
    const trainEqual = Array.from(train1.columns.a).every(
      (val, idx) => val === train2.columns.a[idx],
    );
    const testEqual = Array.from(test1.columns.a).every(
      (val, idx) => val === test2.columns.a[idx],
    );

    expect(trainEqual && testEqual).toBe(false);
  });

  test('должен выбрасывать ошибку при testSize=1', () => {
    const frame = createFrame({
      a: [1, 2, 3],
      b: [10, 20, 30],
    });

    expect(() => trainTestSplit(frame, 1)).toThrow(
      'Test size must be a number between 0 and 1 (exclusive)',
    );
  });

  test('должен выбрасывать ошибку при testSize=0', () => {
    const frame = createFrame({
      a: [1, 2, 3],
      b: [10, 20, 30],
    });

    expect(() => trainTestSplit(frame, 0)).toThrow(
      'Test size must be a number between 0 and 1 (exclusive)',
    );
  });

  test('должен обрабатывать пустой фрейм', () => {
    const frame = createFrame({
      a: [],
      b: [],
    });

    const [train, test] = trainTestSplit(frame, 0.3);

    expect(train.rowCount).toBe(0);
    expect(test.rowCount).toBe(0);
  });

  test('должен выбрасывать ошибку для некорректного фрейма', () => {
    // @ts-ignore - Игнорируем ошибку типа, так как мы намеренно тестируем неверные входные данные
    expect(() => trainTestSplit(null, 0.3)).toThrow();
    // @ts-ignore - Игнорируем ошибку типа, так как мы намеренно тестируем неверные входные данные
    expect(() => trainTestSplit({}, 0.3)).toThrow();
    // @ts-ignore - Игнорируем ошибку типа, так как мы намеренно тестируем неверные входные данные
    expect(() => trainTestSplit({ columns: {} }, 0.3)).toThrow();
  });

  test('должен выбрасывать ошибку для некорректного размера теста', () => {
    const frame = createFrame({
      a: [1, 2, 3],
      b: [10, 20, 30],
    });

    expect(() => trainTestSplit(frame, -0.1)).toThrow();
    expect(() => trainTestSplit(frame, 1.1)).toThrow();
    // @ts-ignore - Игнорируем ошибку типа, так как мы намеренно тестируем неверные входные данные
    expect(() => trainTestSplit(frame, 'string')).toThrow();
  });
});
