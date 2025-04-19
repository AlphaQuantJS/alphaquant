// alphaquant-core/src/AQDataFrame.js

import { DataFrame } from 'data-forge';
import * as Preprocessing from './Preprocessing.js';
import * as StatsUtils from './StatsUtils.js';

/**
 * @typedef {{ [key: string]: number | string | null }} Row
 */

/**
 * Обрабатывает ошибки и добавляет контекст
 * @param {Function} fn - Функция для выполнения
 * @param {string} errorPrefix - Префикс для сообщения об ошибке
 * @returns {any} - Результат выполнения функции
 * @throws {Error} - Если произошла ошибка
 */
function handleErrors(fn, errorPrefix) {
  try {
    return fn();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`${errorPrefix}: ${error.message}`);
    }
    throw new Error(`${errorPrefix}: Unknown error`);
  }
}

/**
 * Проверяет существование колонки в DataFrame
 * @param {DataFrame} df - DataFrame для проверки
 * @param {string} column - Имя колонки для проверки
 * @throws {Error} - Если колонка не существует
 */
function validateColumn(df, column) {
  if (typeof column !== 'string') {
    throw new Error('Column name must be a string');
  }

  if (!df.getColumnNames().includes(column)) {
    throw new Error(`Column '${column}' not found in DataFrame`);
  }
}

/**
 * Создает AQDataFrame из данных или существующего DataFrame
 * @param {Row[] | DataFrame} data - Массив строк или существующий DataFrame
 * @returns {Object} - AQDataFrame с методами для работы с данными
 * @throws {Error} - Если данные некорректны
 */
export function createDataFrame(data) {
  if (data === null || data === undefined) {
    throw new Error('Data cannot be null or undefined');
  }

  // Создаем DataFrame
  const df = handleErrors(() => {
    return data instanceof DataFrame ? data : new DataFrame(data);
  }, 'Failed to create DataFrame');

  // Проверка, что DataFrame не пустой
  if (df.count() === 0) {
    console.warn('Created an empty DataFrame');
  }

  // Возвращаем объект с методами
  return {
    /**
     * Получает внутренний DataFrame
     * @returns {DataFrame} - DataFrame
     */
    getFrame() {
      return df;
    },

    /**
     * Преобразует DataFrame в массив строк
     * @returns {Row[]} - Массив строк
     */
    toArray() {
      return df.toArray();
    },

    /**
     * Возвращает количество строк в DataFrame
     * @returns {number} - Количество строк
     */
    count() {
      return df.count();
    },

    /**
     * Возвращает имена колонок DataFrame
     * @returns {string[]} - Массив имен колонок
     */
    getColumnNames() {
      return df.getColumnNames();
    },

    /**
     * Удаляет строки с null или NaN значениями
     * @returns {Object} - Новый DataFrame без null или NaN значений
     */
    dropNaN() {
      const newDf = handleErrors(() => {
        return Preprocessing.dropNaN(df);
      }, 'Failed to drop NaN values');

      return createDataFrame(newDf);
    },

    /**
     * Нормализует колонку
     * @param {string} column - Имя колонки
     * @returns {Object} - Новый DataFrame с нормализованной колонкой
     * @throws {Error} - Если колонка не существует
     */
    normalize(column) {
      validateColumn(df, column);

      const newDf = handleErrors(() => {
        return Preprocessing.normalize(df, column);
      }, `Failed to normalize column '${column}'`);

      return createDataFrame(newDf);
    },

    /**
     * Стандартизует колонку (z-score)
     * @param {string} column - Имя колонки
     * @returns {Object} - Новый DataFrame со стандартизованной колонкой
     * @throws {Error} - Если колонка не существует
     */
    zscore(column) {
      validateColumn(df, column);

      const newDf = handleErrors(() => {
        return Preprocessing.zscore(df, column);
      }, `Failed to standardize column '${column}'`);

      return createDataFrame(newDf);
    },

    /**
     * Ресемплирует данные по дате
     * @param {string} dateCol - Колонка с датами
     * @param {string[]} valueCols - Колонки для агрегации
     * @returns {Object} - Новый DataFrame с ресемплированными данными
     * @throws {Error} - Если колонки не существуют
     */
    resample(dateCol, valueCols) {
      validateColumn(df, dateCol);

      if (!Array.isArray(valueCols)) {
        throw new Error('Value columns must be an array');
      }

      for (const col of valueCols) {
        validateColumn(df, col);
      }

      const newDf = handleErrors(() => {
        return Preprocessing.resample(df, dateCol, valueCols);
      }, `Failed to resample data`);

      return createDataFrame(newDf);
    },

    /**
     * Вычисляет скользящее среднее
     * @param {string} column - Имя колонки
     * @param {number} windowSize - Размер окна
     * @returns {Object} - Новый DataFrame со скользящим средним
     * @throws {Error} - Если колонка не существует или размер окна некорректен
     */
    rollingMean(column, windowSize) {
      validateColumn(df, column);

      if (!Number.isInteger(windowSize) || windowSize <= 0) {
        throw new Error('Window size must be a positive integer');
      }

      const newDf = handleErrors(() => {
        return StatsUtils.rollingMean(df, column, windowSize);
      }, `Failed to compute rolling mean`);

      return createDataFrame(newDf);
    },

    /**
     * Вычисляет корреляционную матрицу
     * @returns {Object.<string, Object.<string, number>>} - Корреляционная матрица
     * @throws {Error} - Если нет числовых колонок
     */
    corrMatrix() {
      return handleErrors(() => {
        return StatsUtils.corrMatrix(df);
      }, `Failed to compute correlation matrix`);
    },

    /**
     * Вычисляет среднее значение колонки
     * @param {string} column - Имя колонки
     * @returns {number} - Среднее значение
     * @throws {Error} - Если колонка не существует
     */
    mean(column) {
      validateColumn(df, column);

      return handleErrors(() => {
        return StatsUtils.mean(df, column);
      }, `Failed to compute mean for column '${column}'`);
    },

    /**
     * Вычисляет стандартное отклонение колонки
     * @param {string} column - Имя колонки
     * @returns {number} - Стандартное отклонение
     * @throws {Error} - Если колонка не существует
     */
    std(column) {
      validateColumn(df, column);

      return handleErrors(() => {
        return StatsUtils.std(df, column);
      }, `Failed to compute standard deviation for column '${column}'`);
    },
  };
}

// Для обратной совместимости
export const AQDataFrame = createDataFrame;
