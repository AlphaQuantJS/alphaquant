// alphaquant-core/src/__tests__/AQDataFrame.test.js
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { DataFrame } from 'data-forge';
import { createDataFrame, AQDataFrame } from '../AQDataFrame.js';

// Создаем реальные объекты для тестов вместо моков
describe('AQDataFrame module', () => {
  // Тестовые данные
  const testData = [
    { date: '2024-01-01', price: 100, volume: 1000 },
    { date: '2024-01-02', price: 110, volume: 1500 },
    { date: '2024-01-03', price: 120, volume: 1200 },
  ];

  describe('createDataFrame', () => {
    it('создает объект DataFrame из массива объектов', () => {
      const aqdf = createDataFrame(testData);
      expect(aqdf).toBeDefined();

      // Проверяем, что внутренний df является экземпляром DataFrame
      const dfInstance = aqdf.getFrame();
      expect(dfInstance instanceof DataFrame).toBe(true);

      // Проверяем, что данные сохранены правильно
      const rows = aqdf.toArray();
      expect(rows).toEqual(testData);
    });

    it('создает объект DataFrame из экземпляра DataFrame', () => {
      const df = new DataFrame(testData);
      const aqdf = createDataFrame(df);
      expect(aqdf).toBeDefined();

      // Проверяем, что данные сохранены правильно
      const rows = aqdf.toArray();
      expect(rows).toEqual(testData);
    });

    it('выбрасывает ошибку при передаче null или undefined', () => {
      expect(() => createDataFrame(null)).toThrow();
      expect(() => createDataFrame(undefined)).toThrow();
    });
  });

  describe('Базовые методы', () => {
    let aqdf;

    beforeEach(() => {
      aqdf = createDataFrame(testData);
    });

    it('count возвращает количество строк', () => {
      expect(aqdf.count()).toBe(3);
    });

    it('toArray возвращает массив строк', () => {
      expect(aqdf.toArray()).toEqual(testData);
    });

    it('getColumnNames возвращает имена колонок', () => {
      expect(aqdf.getColumnNames()).toEqual(['date', 'price', 'volume']);
    });
  });

  describe('Методы обработки данных', () => {
    let aqdf;

    beforeEach(() => {
      aqdf = createDataFrame(testData);
    });

    it('dropNaN удаляет строки с null или NaN значениями', () => {
      const dataWithNaN = [
        { date: '2024-01-01', price: 100, volume: 1000 },
        { date: '2024-01-02', price: null, volume: 1500 },
        { date: '2024-01-03', price: NaN, volume: 1200 },
      ];

      const df = createDataFrame(dataWithNaN);
      const result = df.dropNaN();

      expect(result.count()).toBe(1);
      expect(result.toArray()[0]).toEqual(dataWithNaN[0]);
    });

    it('normalize нормализует колонку', () => {
      const result = aqdf.normalize('price');

      // В Preprocessing.js normalize добавляет новую колонку price_norm
      const normalizedPrices = result.toArray().map((row) => row.price_norm);

      // Проверяем, что значения в диапазоне [0, 1]
      for (const price of normalizedPrices) {
        expect(price).toBeGreaterThanOrEqual(0);
        expect(price).toBeLessThanOrEqual(1);
      }

      // Проверяем, что минимальное значение = 0, максимальное = 1
      expect(Math.min(...normalizedPrices)).toBeCloseTo(0);
      expect(Math.max(...normalizedPrices)).toBeCloseTo(1);
    });

    it('zscore стандартизует колонку', () => {
      const result = aqdf.zscore('price');

      // В Preprocessing.js zscore добавляет новую колонку price_zscore
      const zscores = result.toArray().map((row) => row.price_zscore);

      // Проверяем, что среднее близко к 0, а стандартное отклонение близко к 1
      const sum = zscores.reduce((acc, val) => acc + val, 0);
      const mean = sum / zscores.length;

      const squaredDiffs = zscores.map((val) => Math.pow(val - mean, 2));
      const variance =
        squaredDiffs.reduce((acc, val) => acc + val, 0) / zscores.length;
      const stdDev = Math.sqrt(variance);

      expect(mean).toBeCloseTo(0, 1);
      expect(stdDev).toBeCloseTo(1, 1);
    });
  });

  describe('Статистические методы', () => {
    let aqdf;

    beforeEach(() => {
      aqdf = createDataFrame(testData);
    });

    it('mean вычисляет среднее значение колонки', () => {
      const mean = aqdf.mean('price');
      expect(mean).toBe((100 + 110 + 120) / 3);
    });

    it('std вычисляет стандартное отклонение колонки', () => {
      const std = aqdf.std('price');

      // Вычисляем стандартное отклонение вручную
      const values = [100, 110, 120];
      const mean = values.reduce((acc, val) => acc + val, 0) / values.length;
      const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
      const variance =
        squaredDiffs.reduce((acc, val) => acc + val, 0) / values.length;
      const expectedStd = Math.sqrt(variance);

      expect(std).toBeCloseTo(expectedStd);
    });

    it('corrMatrix вычисляет корреляционную матрицу', () => {
      const corrMatrix = aqdf.corrMatrix();

      // Проверяем, что матрица имеет правильную структуру
      expect(corrMatrix).toBeDefined();

      // В StatsUtils.js corrMatrix возвращает DataFrame
      expect(corrMatrix instanceof DataFrame).toBe(true);

      // Преобразуем DataFrame в массив объектов для проверки
      const corrData = corrMatrix.toArray();

      // Проверяем, что есть строки для price и volume
      const priceRow = corrData.find((row) => row.price !== undefined);
      const volumeRow = corrData.find((row) => row.volume !== undefined);

      expect(priceRow).toBeDefined();
      expect(volumeRow).toBeDefined();

      // Диагональные элементы должны быть близки к 1
      expect(priceRow.price).toBeCloseTo(1);

      // Проверяем, что корреляция между price и volume существует
      expect(typeof priceRow.volume).toBe('number');
      expect(typeof volumeRow.price).toBe('number');
    });
  });
});
