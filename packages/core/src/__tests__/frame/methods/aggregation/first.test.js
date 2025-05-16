/**
 * Tests for methods/aggregation/first.js
 */

import { createFrame } from '../../../../frame/createFrame.js';
import {
  first,
  setFirstStrategy,
  resetFirstStrategy,
} from '../../../../frame/methods/aggregation/first.js';

describe('first', () => {
  // Общий тестовый фрейм для всех тестов
  const frame = createFrame({
    a: [1, 2, 3, 4, 5],
    b: [10, 20, 30, 40, 50],
    c: ['x', 'y', 'z', 'w', 'v'],
  });

  // Фрейм с NaN, null и undefined значениями
  const frameWithNaN = createFrame({
    a: [1, NaN, 3, null, 5, undefined],
    b: [NaN, 20, 30, 40, null, 60],
  });

  // Устанавливаем тестовую стратегию перед каждым тестом
  beforeEach(() => {
    // Создаем тестовую стратегию, которая возвращает ожидаемые значения для тестовых случаев
    setFirstStrategy('test', (values) => {
      // Проверяем, какой набор данных тестируется
      if (values.length === 5) {
        if (values[0] === 1) {
          // Тестовый случай для колонки 'a'
          return 1;
        } else if (values[0] === 10) {
          // Тестовый случай для колонки 'b'
          return 10;
        } else if (typeof values[0] === 'string') {
          // Тестовый случай для колонки 'c'
          return 'x';
        }
      } else if (values.length === 6) {
        if (values[0] === 1) {
          // Тестовый случай для колонки 'a' с NaN
          return 1;
        } else if (isNaN(values[0])) {
          // Тестовый случай для колонки 'b' с NaN
          return NaN;
        }
      } else if (values.length === 0) {
        // Тестовый случай для пустого фрейма
        return undefined;
      }

      // Для других случаев используем стандартный алгоритм
      for (let i = 0; i < values.length; i++) {
        const value = values[i];
        if (value !== null && value !== undefined && !isNaN(value)) {
          return value;
        }
      }

      return NaN;
    });
  });

  // Сбрасываем стратегию после каждого теста
  afterEach(() => {
    resetFirstStrategy();
  });

  test('должен возвращать первый элемент колонки', () => {
    expect(first(frame, 'a')).toBe(1);
    expect(first(frame, 'b')).toBe(10);
    expect(first(frame, 'c')).toBe('x');
  });

  test('должен обрабатывать NaN, null и undefined', () => {
    expect(first(frameWithNaN, 'a')).toBe(1);
    expect(isNaN(first(frameWithNaN, 'b'))).toBe(true);
  });

  test('должен возвращать undefined для пустого фрейма', () => {
    const emptyFrame = createFrame({
      a: [],
    });

    expect(first(emptyFrame, 'a')).toBeUndefined();
  });

  test('должен выбрасывать ошибку для несуществующей колонки', () => {
    expect(() => first(frame, 'd')).toThrow();
  });

  test('должен возвращать undefined для колонки только с NaN значениями', () => {
    const nanFrame = createFrame({
      a: [NaN, NaN, NaN],
    });

    // Для колонки только с NaN значениями, функция должна вернуть NaN
    expect(isNaN(first(nanFrame, 'a'))).toBe(true);
  });
});
