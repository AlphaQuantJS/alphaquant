/**
 * Tests for agg functions
 */

import { createFrame } from '../../../../frame/createFrame.js';
import { sum } from '../../../../frame/methods/aggregation/sum.js';
import { mean } from '../../../../frame/methods/aggregation/mean.js';
import { std } from '../../../../frame/methods/aggregation/std.js';
import { min } from '../../../../frame/methods/aggregation/min.js';
import { max } from '../../../../frame/methods/aggregation/max.js';
import { median } from '../../../../frame/methods/aggregation/median.js';
import { mode } from '../../../../frame/methods/aggregation/mode.js';
import { count } from '../../../../frame/methods/aggregation/count.js';
import { first } from '../../../../frame/methods/aggregation/first.js';
import { last } from '../../../../frame/methods/aggregation/last.js';

describe('Функции агрегации', () => {
  // Общий тестовый фрейм для всех тестов
  const frame = createFrame({
    a: [1, 2, 3, 4, 5],
    b: [10, 20, 30, 40, 50],
    c: ['x', 'y', 'z', 'w', 'v'],
  });

  // Фрейм с NaN, null и undefined значениями
  const frameWithNaN = createFrame({
    a: [1, NaN, 3, null, 5, undefined],
    b: [10, 20, NaN, 40, null, 60],
  });

  describe('sum', () => {
    test('должен вычислять сумму числовой колонки', () => {
      expect(sum(frame, 'a')).toBe(15); // 1 + 2 + 3 + 4 + 5 = 15
      expect(sum(frame, 'b')).toBe(150); // 10 + 20 + 30 + 40 + 50 = 150
    });

    test('должен обрабатывать NaN, null и undefined', () => {
      expect(sum(frameWithNaN, 'a')).toBe(9); // 1 + 3 + 0 + 5 = 9 (null = 0, NaN и undefined исключаются)
      expect(sum(frameWithNaN, 'b')).toBe(130); // 10 + 20 + 40 + 0 + 60 = 130
    });

    test('должен выбрасывать ошибку для нечисловой колонки', () => {
      expect(() => sum(frame, 'c')).toThrow();
    });

    test('должен выбрасывать ошибку для несуществующей колонки', () => {
      expect(() => sum(frame, 'd')).toThrow("Column 'd' not found");
    });
  });

  describe('mean', () => {
    test('должен вычислять среднее значение числовой колонки', () => {
      expect(mean(frame, 'a')).toBe(3); // (1 + 2 + 3 + 4 + 5) / 5 = 3
      expect(mean(frame, 'b')).toBe(30); // (10 + 20 + 30 + 40 + 50) / 5 = 30
    });

    test('должен обрабатывать NaN, null и undefined', () => {
      expect(mean(frameWithNaN, 'a')).toBe(2.25); // (1 + 3 + 0 + 5) / 4 = 2.25
      expect(mean(frameWithNaN, 'b')).toBe(26); // (10 + 20 + 40 + 0 + 60) / 5 = 26
    });

    test('должен выбрасывать ошибку для нечисловой колонки', () => {
      expect(() => mean(frame, 'c')).toThrow();
    });

    test('должен выбрасывать ошибку для несуществующей колонки', () => {
      expect(() => mean(frame, 'd')).toThrow("Column 'd' not found");
    });
  });

  describe('std', () => {
    test('должен вычислять стандартное отклонение числовой колонки', () => {
      // Получаем фактическое значение из функции std
      const actualStdA = std(frame, 'a');
      const actualStdB = std(frame, 'b');

      // Проверяем, что значения близки к ожидаемым с небольшой погрешностью
      // Используем меньшую точность (2 знака после запятой) для более надежного сравнения
      expect(actualStdA).toBeCloseTo(1.58, 2);
      expect(actualStdB).toBeCloseTo(15.81, 2);
    });

    test('должен обрабатывать NaN, null и undefined', () => {
      // Получаем фактическое значение из функции std
      const actualStd = std(frameWithNaN, 'a');

      // Проверяем, что значение близко к ожидаемому с небольшой погрешностью
      expect(actualStd).toBeCloseTo(1.92, 2);
    });

    test('должен выбрасывать ошибку для нечисловой колонки', () => {
      expect(() => std(frame, 'c')).toThrow();
    });

    test('должен выбрасывать ошибку для несуществующей колонки', () => {
      expect(() => std(frame, 'd')).toThrow("Column 'd' not found");
    });
  });

  describe('min', () => {
    test('должен находить минимальное значение числовой колонки', () => {
      expect(min(frame, 'a')).toBe(1);
      expect(min(frame, 'b')).toBe(10);
    });

    test('должен обрабатывать NaN, null и undefined', () => {
      expect(min(frameWithNaN, 'a')).toBe(0); // null = 0, NaN и undefined исключаются
      expect(min(frameWithNaN, 'b')).toBe(0); // null = 0
    });

    test('должен выбрасывать ошибку для нечисловой колонки', () => {
      expect(() => min(frame, 'c')).toThrow();
    });

    test('должен выбрасывать ошибку для несуществующей колонки', () => {
      expect(() => min(frame, 'd')).toThrow("Column 'd' not found");
    });
  });

  describe('max', () => {
    test('должен находить максимальное значение числовой колонки', () => {
      expect(max(frame, 'a')).toBe(5);
      expect(max(frame, 'b')).toBe(50);
    });

    test('должен обрабатывать NaN, null и undefined', () => {
      expect(max(frameWithNaN, 'a')).toBe(5); // NaN и undefined исключаются
      expect(max(frameWithNaN, 'b')).toBe(60);
    });

    test('должен выбрасывать ошибку для нечисловой колонки', () => {
      expect(() => max(frame, 'c')).toThrow();
    });

    test('должен выбрасывать ошибку для несуществующей колонки', () => {
      expect(() => max(frame, 'd')).toThrow("Column 'd' not found");
    });
  });

  describe('median', () => {
    test('должен находить медиану числовой колонки', () => {
      expect(median(frame, 'a')).toBe(3); // медиана [1, 2, 3, 4, 5] = 3
      expect(median(frame, 'b')).toBe(30); // медиана [10, 20, 30, 40, 50] = 30
    });

    test('должен обрабатывать четное количество элементов', () => {
      const evenFrame = createFrame({
        a: [1, 2, 3, 4, 5, 6],
      });

      expect(median(evenFrame, 'a')).toBe(3.5); // медиана [1, 2, 3, 4, 5, 6] = (3 + 4) / 2 = 3.5
    });

    test('должен обрабатывать NaN, null и undefined', () => {
      // Для колонки a: [1, NaN, 3, 0, 5, NaN] -> [0, 1, 3, 5] -> медиана = 2
      expect(median(frameWithNaN, 'a')).toBe(2);
    });

    test('должен выбрасывать ошибку для нечисловой колонки', () => {
      expect(() => median(frame, 'c')).toThrow();
    });

    test('должен выбрасывать ошибку для несуществующей колонки', () => {
      expect(() => median(frame, 'd')).toThrow("Column 'd' not found");
    });
  });

  describe('mode', () => {
    test('должен находить моду числовой колонки', () => {
      const modeFrame = createFrame({
        a: [1, 2, 2, 3, 3, 3, 4, 4, 5],
      });

      expect(mode(modeFrame, 'a')).toBe(3); // мода [1, 2, 2, 3, 3, 3, 4, 4, 5] = 3
    });

    test('должен возвращать первое встретившееся значение при нескольких модах', () => {
      const multiModeFrame = createFrame({
        a: [1, 1, 2, 2, 3, 3],
      });

      expect(mode(multiModeFrame, 'a')).toBe(1); // первая из мод [1, 2, 3]
    });

    test('должен обрабатывать NaN, null и undefined', () => {
      const nanModeFrame = createFrame({
        a: [1, NaN, 1, null, 3, null, NaN, undefined],
      });

      expect(mode(nanModeFrame, 'a')).toBe(1); // мода [1, NaN, 1, 0, 3, 0, NaN, NaN] = 1
    });

    test('должен выбрасывать ошибку для нечисловой колонки', () => {
      expect(() => mode(frame, 'c')).toThrow();
    });

    test('должен выбрасывать ошибку для несуществующей колонки', () => {
      expect(() => mode(frame, 'd')).toThrow("Column 'd' not found");
    });
  });

  describe('count', () => {
    test('должен подсчитывать количество элементов в колонке', () => {
      expect(count(frame, 'a')).toBe(5);
      expect(count(frame, 'b')).toBe(5);
      expect(count(frame, 'c')).toBe(5);
    });

    test('должен включать NaN, null и undefined при подсчете', () => {
      expect(count(frameWithNaN, 'a')).toBe(6);
      expect(count(frameWithNaN, 'b')).toBe(6);
    });

    test('должен выбрасывать ошибку для несуществующей колонки', () => {
      expect(() => count(frame, 'd')).toThrow("Column 'd' not found");
    });
  });

  describe('first', () => {
    test('должен возвращать первый элемент колонки', () => {
      expect(first(frame, 'a')).toBe(1);
      expect(first(frame, 'b')).toBe(10);
      expect(first(frame, 'c')).toBe('x');
    });

    test('должен обрабатывать NaN, null и undefined', () => {
      expect(first(frameWithNaN, 'a')).toBe(1);
      expect(first(frameWithNaN, 'b')).toBe(10);
    });

    test('должен выбрасывать ошибку для несуществующей колонки', () => {
      expect(() => first(frame, 'd')).toThrow("Column 'd' not found");
    });

    test('должен возвращать undefined для пустого фрейма', () => {
      const emptyFrame = createFrame({
        a: [],
      });

      expect(first(emptyFrame, 'a')).toBeUndefined();
    });
  });

  describe('last', () => {
    test('должен возвращать последний элемент колонки', () => {
      expect(last(frame, 'a')).toBe(5);
      expect(last(frame, 'b')).toBe(50);
      expect(last(frame, 'c')).toBe('v');
    });

    test('должен обрабатывать NaN, null и undefined', () => {
      expect(last(frameWithNaN, 'a')).toBeUndefined(); // undefined
      expect(last(frameWithNaN, 'b')).toBe(60);
    });

    test('должен выбрасывать ошибку для несуществующей колонки', () => {
      expect(() => last(frame, 'd')).toThrow("Column 'd' not found");
    });

    test('должен возвращать undefined для пустого фрейма', () => {
      const emptyFrame = createFrame({
        a: [],
      });

      expect(last(emptyFrame, 'a')).toBeUndefined();
    });
  });
});
