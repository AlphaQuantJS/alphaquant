// alphaquant-core/src/__tests__/Preprocessing.test.js
import { jest, describe, it, expect } from '@jest/globals';
import { DataFrame } from 'data-forge';
import * as Preprocessing from '../Preprocessing.js';

describe('Preprocessing module', () => {
  it('dropNaN removes rows with null and NaN', () => {
    const data = [
      { x: 1, y: 10 },
      { x: 2, y: null },
      { x: 3, y: 30 },
      { x: NaN, y: 40 },
      { x: 5, y: 50 },
    ];
    const df = new DataFrame(data);
    const cleaned = Preprocessing.dropNaN(df);

    // Проверяем, что строки с null и NaN удалены
    expect(cleaned.count()).toBe(3);
    expect(cleaned.toArray()).toEqual([
      { x: 1, y: 10 },
      { x: 3, y: 30 },
      { x: 5, y: 50 },
    ]);
  });

  it('выбрасывает ошибку для невалидного входа', () => {
    expect(() => {
      // @ts-ignore - игнорируем ошибку типизации для теста
      Preprocessing.dropNaN(null);
    }).toThrow('Input must be a DataFrame instance');

    expect(() => {
      // @ts-ignore - игнорируем ошибку типизации для теста
      Preprocessing.dropNaN({});
    }).toThrow('Input must be a DataFrame instance');
  });

  it('normalize scales column between 0 and 1', () => {
    const data = [{ x: 10 }, { x: 20 }, { x: 30 }];
    const df = new DataFrame(data);
    const normalized = Preprocessing.normalize(df, 'x');

    // Проверяем, что новая колонка создана
    expect(normalized.getColumnNames()).toContain('x_norm');

    // Получаем нормализованные значения
    const normalizedValues = normalized.getSeries('x_norm').toArray();

    // Проверяем, что значения нормализованы правильно
    expect(normalizedValues[0]).toBeCloseTo(0, 6);
    expect(normalizedValues[1]).toBeCloseTo(0.5, 6);
    expect(normalizedValues[2]).toBeCloseTo(1, 6);
  });

  it('normalize выбрасывает ошибку для колонки с константными значениями', () => {
    const data = [{ x: 10 }, { x: 10 }, { x: 10 }];
    const df = new DataFrame(data);

    expect(() => {
      Preprocessing.normalize(df, 'x');
    }).toThrow('has constant values, normalization not possible');
  });

  it('zscore standardizes column (mean ~0, std ~1)', () => {
    const data = [{ x: 1 }, { x: 2 }, { x: 3 }, { x: 4 }, { x: 5 }];
    const df = new DataFrame(data);
    const standardized = Preprocessing.zscore(df, 'x');

    // Проверяем, что новая колонка создана
    expect(standardized.getColumnNames()).toContain('x_zscore');

    // Получаем стандартизированные значения
    const zscoreValues = standardized.getSeries('x_zscore').toArray();

    // Проверяем, что среднее близко к 0
    const mean = zscoreValues.reduce((a, b) => a + b, 0) / zscoreValues.length;
    expect(mean).toBeCloseTo(0, 6);

    // Проверяем, что стандартное отклонение близко к 1
    const variance =
      zscoreValues.reduce((a, b) => a + b * b, 0) / zscoreValues.length;
    const std = Math.sqrt(variance);
    expect(std).toBeCloseTo(1, 6);
  });

  it('zscore выбрасывает ошибку для колонки с нулевым стандартным отклонением', () => {
    const data = [{ x: 10 }, { x: 10 }, { x: 10 }];
    const df = new DataFrame(data);

    expect(() => {
      Preprocessing.zscore(df, 'x');
    }).toThrow('has zero standard deviation, z-score not possible');
  });

  it('resample aggregates data to daily frequency (mean)', () => {
    const data = [
      { date: '2024-01-01T09:00:00', value: 10 },
      { date: '2024-01-01T12:00:00', value: 20 },
      { date: '2024-01-01T15:00:00', value: 30 },
      { date: '2024-01-02T09:00:00', value: 40 },
      { date: '2024-01-02T12:00:00', value: 50 },
      { date: '2024-01-02T15:00:00', value: 60 },
    ];
    const df = new DataFrame(data);
    const resampled = Preprocessing.resample(df, 'date', ['value']);

    // Проверяем, что данные агрегированы по дням
    expect(resampled.count()).toBe(2);

    const rows = resampled.toArray();

    // Проверяем, что даты правильно форматированы
    expect(rows[0].date).toBe('2024-01-01');
    expect(rows[1].date).toBe('2024-01-02');

    // Проверяем, что значения агрегированы как среднее
    expect(rows[0].value).toBeCloseTo(20, 6); // (10 + 20 + 30) / 3
    expect(rows[1].value).toBeCloseTo(50, 6); // (40 + 50 + 60) / 3
  });
});
