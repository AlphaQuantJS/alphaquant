// alphaquant-core/src/__tests__/StatsUtils.test.js
import { jest, describe, it, expect } from '@jest/globals';
import { DataFrame } from 'data-forge';
import * as StatsUtils from '../StatsUtils.js';

describe('StatsUtils module with data-forge', () => {
  // Тестовые данные
  const testData = [
    { x: 1, y: 10, z: 100 },
    { x: 2, y: 20, z: 90 },
    { x: 3, y: 30, z: 80 },
    { x: 4, y: 40, z: 70 },
    { x: 5, y: 50, z: 60 },
  ];

  const df = new DataFrame(testData);

  describe('mean', () => {
    it('вычисляет среднее значение колонки', () => {
      expect(StatsUtils.mean(df, 'x')).toBeCloseTo(3, 6); // (1+2+3+4+5)/5 = 3
      expect(StatsUtils.mean(df, 'y')).toBeCloseTo(30, 6); // (10+20+30+40+50)/5 = 30
    });

    it('выбрасывает ошибку для несуществующей колонки', () => {
      expect(() => StatsUtils.mean(df, 'nonexistent')).toThrow(
        "Column 'nonexistent' not found",
      );
    });

    it('корректно обрабатывает null и NaN значения', () => {
      const mixedData = [{ x: 1 }, { x: null }, { x: 3 }, { x: NaN }, { x: 5 }];
      const mixedDf = new DataFrame(mixedData);

      // Должен игнорировать null и NaN, среднее от 1, 3, 5 = 3
      expect(StatsUtils.mean(mixedDf, 'x')).toBeCloseTo(3, 6);
    });

    it('выбрасывает ошибку для невалидного входа', () => {
      expect(() => {
        // @ts-ignore - игнорируем ошибку типизации для теста
        StatsUtils.mean(null, 'x');
      }).toThrow('Input must be a DataFrame instance');

      expect(() => {
        // @ts-ignore - игнорируем ошибку типизации для теста
        StatsUtils.mean({}, 'x');
      }).toThrow('Input must be a DataFrame instance');
    });
  });

  describe('std', () => {
    it('вычисляет стандартное отклонение колонки', () => {
      // Для колонки x: [1,2,3,4,5], стандартное отклонение ≈ 1.414
      expect(StatsUtils.std(df, 'x')).toBeCloseTo(Math.sqrt(2), 6);
    });

    it('выбрасывает ошибку для несуществующей колонки', () => {
      expect(() => StatsUtils.std(df, 'nonexistent')).toThrow(
        "Column 'nonexistent' not found",
      );
    });

    it('выбрасывает ошибку для невалидного входа', () => {
      expect(() => {
        // @ts-ignore - игнорируем ошибку типизации для теста
        StatsUtils.std(null, 'x');
      }).toThrow('Input must be a DataFrame instance');
    });
  });

  describe('rollingMean', () => {
    it('вычисляет скользящее среднее с заданным окном', () => {
      const result = StatsUtils.rollingMean(df, 'x', 3);

      // Проверяем, что новая колонка создана
      expect(result.getColumnNames()).toContain('x_rollmean');

      // Получаем значения скользящего среднего
      const rollingValues = result.getSeries('x_rollmean').toArray();

      // Проверяем, что массив имеет правильную длину
      expect(rollingValues.length).toBe(5);

      // Проверяем конкретные значения
      // Первые (windowSize-1) значений должны быть NaN или undefined
      expect(
        Number.isNaN(rollingValues[0]) || rollingValues[0] === undefined,
      ).toBeTruthy();
      expect(
        Number.isNaN(rollingValues[1]) || rollingValues[1] === undefined,
      ).toBeTruthy();

      // Значения скользящего среднего
      // Первое окно: [1,2,3] -> среднее = 2, записывается в индекс 2
      // Второе окно: [2,3,4] -> среднее = 3, записывается в индекс 3
      // Третье окно: [3,4,5] -> среднее = 4, записывается в индекс 4
      expect(rollingValues[2]).toBeCloseTo(2, 6);
      expect(rollingValues[3]).toBeCloseTo(3, 6);
      expect(rollingValues[4]).toBeCloseTo(4, 6);
    });

    it('выбрасывает ошибку для неправильного размера окна', () => {
      expect(() => StatsUtils.rollingMean(df, 'x', 0)).toThrow(
        'Window size must be a positive integer',
      );
      expect(() => StatsUtils.rollingMean(df, 'x', -1)).toThrow(
        'Window size must be a positive integer',
      );
      expect(() => StatsUtils.rollingMean(df, 'x', 10)).toThrow(
        'Window size (10) is larger than the DataFrame length',
      );
    });

    it('выбрасывает ошибку для невалидного входа', () => {
      expect(() => {
        // @ts-ignore - игнорируем ошибку типизации для теста
        StatsUtils.rollingMean(null, 'x', 3);
      }).toThrow('Input must be a DataFrame instance');
    });
  });

  describe('corrMatrix', () => {
    it('вычисляет корреляционную матрицу для числовых колонок', () => {
      const corrMatrix = StatsUtils.corrMatrix(df);
      const rows = corrMatrix.toArray();

      // Проверяем, что диагональные элементы равны 1
      expect(rows[0].x).toBeCloseTo(1, 6);
      expect(rows[1].y).toBeCloseTo(1, 6);
      expect(rows[2].z).toBeCloseTo(1, 6);

      // Проверяем корреляцию между x и y (должна быть 1, т.к. они линейно зависимы)
      expect(rows[0].y).toBeCloseTo(1, 6);

      // Проверяем корреляцию между x и z (должна быть -1, т.к. они обратно линейно зависимы)
      expect(rows[0].z).toBeCloseTo(-1, 6);
    });

    it('выбрасывает ошибку для колонок с нулевым стандартным отклонением', () => {
      const constantData = [
        { x: 1, y: 10, z: 5 },
        { x: 1, y: 20, z: 5 },
        { x: 1, y: 30, z: 5 },
      ];
      const constantDf = new DataFrame(constantData);

      // Должен выбрасывать ошибку, т.к. колонки x и z имеют нулевое стандартное отклонение
      expect(() => StatsUtils.corrMatrix(constantDf)).toThrow(
        'correlation not possible',
      );
    });

    it('выбрасывает ошибку для DataFrame без числовых колонок', () => {
      const stringData = [
        { a: 'foo', b: 'bar' },
        { a: 'baz', b: 'qux' },
      ];
      const stringDf = new DataFrame(stringData);

      expect(() => StatsUtils.corrMatrix(stringDf)).toThrow(
        'No numeric columns found in DataFrame',
      );
    });

    it('выбрасывает ошибку для невалидного входа', () => {
      expect(() => {
        // @ts-ignore - игнорируем ошибку типизации для теста
        StatsUtils.corrMatrix(null);
      }).toThrow('Input must be a DataFrame instance');
    });
  });
});
