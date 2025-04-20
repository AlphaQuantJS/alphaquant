// alphaquant-core/src/Preprocessing.js

import { DataFrame } from 'data-forge';
import {
  normalizeTyped,
  zscoreTyped,
  rollingMeanTyped,
  filterValidToTyped,
  calculateMeanAndStd,
} from './math/index.js';

/**
 * Проверяет, что переданный объект является экземпляром DataFrame
 * @param {any} df - Объект для проверки
 * @throws {Error} - Если объект не является DataFrame
 */
function assertDataFrame(df) {
  if (!(df instanceof DataFrame)) {
    throw new Error('Input must be a DataFrame instance');
  }
}

/**
 * Проверяет существование колонки в DataFrame
 * @param {DataFrame} df - DataFrame для проверки
 * @param {string} column - Имя колонки
 * @throws {Error} - Если колонка не существует
 */
function assertColumnExists(df, column) {
  if (!df.getColumnNames().includes(column)) {
    throw new Error(`Column '${column}' not found in DataFrame`);
  }
}

/**
 * Проверяет, что колонка содержит только числовые значения и возвращает их
 * @param {DataFrame} df - DataFrame для проверки
 * @param {string} column - Имя колонки
 * @returns {number[]} - Массив числовых значений
 * @throws {Error} - Если колонка содержит нечисловые значения
 */
function getNumericValues(df, column) {
  const values = df.getSeries(column).toArray();

  try {
    // Используем оптимизированную функцию для фильтрации и проверки числовых значений
    return Array.from(filterValidToTyped(values));
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Column '${column}': ${error.message}`);
    }
    throw new Error(`Column '${column}': Unknown error during validation`);
  }
}

/**
 * Создает Series из массива значений
 * @param {number[]} values - Массив значений
 * @returns {import('data-forge').ISeries} - Series объект
 */
function createSeriesFromArray(values) {
  // Создаем объект с данными для DataFrame
  const data = values.map((value) => ({ value }));
  return new DataFrame(data).getSeries('value');
}

/**
 * Removes rows that contain NaN or null values.
 *
 * @param {DataFrame} df - DataFrame instance
 * @returns {DataFrame} - Cleaned DataFrame
 * @throws {Error} - If input is not a DataFrame
 */
export function dropNaN(df) {
  assertDataFrame(df);

  // Оптимизированная версия без использования .every()
  return /** @type {DataFrame} */ (
    df
      .where((row) => {
        const values = Object.values(row);
        for (let i = 0; i < values.length; i++) {
          const v = values[i];
          if (v === null || Number.isNaN(v)) return false;
        }
        return true;
      })
      .bake()
  );
}

/**
 * Normalizes a column to [0, 1]
 *
 * @param {DataFrame} df - Input DataFrame
 * @param {string} column - Column to normalize
 * @returns {DataFrame} - DataFrame with new column `${column}_norm`
 * @throws {Error} - If column doesn't exist or contains non-numeric values
 */
export function normalize(df, column) {
  assertDataFrame(df);
  assertColumnExists(df, column);

  try {
    // Получаем числовые значения
    const values = getNumericValues(df, column);

    // Используем оптимизированную функцию нормализации
    const normalized = normalizeTyped(values);

    // Создаем Series из массива перед передачей в withSeries
    const normalizedSeries = createSeriesFromArray(Array.from(normalized));

    // Создаем новый DataFrame с нормализованной колонкой
    return /** @type {DataFrame} */ (
      df.withSeries(`${column}_norm`, normalizedSeries).bake()
    );
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to normalize column '${column}': ${error.message}`,
      );
    }
    throw new Error(`Failed to normalize column '${column}': Unknown error`);
  }
}

/**
 * Z-score standardization for a column
 *
 * @param {DataFrame} df - Input DataFrame
 * @param {string} column - Column to z-score
 * @returns {DataFrame} - DataFrame with new column `${column}_zscore`
 * @throws {Error} - If column doesn't exist or contains non-numeric values
 */
export function zscore(df, column) {
  assertDataFrame(df);
  assertColumnExists(df, column);

  try {
    // Получаем числовые значения
    const values = getNumericValues(df, column);

    // Используем оптимизированную функцию z-score
    const standardized = zscoreTyped(values);

    // Создаем Series из массива перед передачей в withSeries
    const standardizedSeries = createSeriesFromArray(Array.from(standardized));

    // Создаем новый DataFrame со стандартизованной колонкой
    return /** @type {DataFrame} */ (
      df.withSeries(`${column}_zscore`, standardizedSeries).bake()
    );
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to z-score column '${column}': ${error.message}`);
    }
    throw new Error(`Failed to z-score column '${column}': Unknown error`);
  }
}

/**
 * Преобразует дату в формат YYYY-MM-DD
 * @param {any} dateValue - Значение даты
 * @returns {string} - Строка в формате YYYY-MM-DD
 * @throws {Error} - Если формат даты некорректен
 */
function formatDateToYYYYMMDD(dateValue) {
  let date;
  try {
    date = new Date(dateValue);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(`Failed to parse date: ${dateValue}. ${e.message}`);
    }
    throw new Error(`Failed to parse date: ${dateValue}. Unknown error`);
  }

  return date.toISOString().split('T')[0];
}

/**
 * Вычисляет среднее значение массива чисел
 * @param {number[]} values - Массив числовых значений
 * @returns {number|null} - Среднее значение или null для пустого массива
 */
function calculateMean(values) {
  if (!values || values.length === 0) return null;

  try {
    // Используем оптимизированную функцию для расчета среднего
    const { mean } = calculateMeanAndStd(values);
    return mean;
  } catch (error) {
    return null;
  }
}

/**
 * Resample by daily aggregation using mean
 *
 * @param {DataFrame} df - DataFrame with date field (must be parsable)
 * @param {string} dateCol - Column with date
 * @param {string[]} valueCols - Columns to aggregate
 * @returns {DataFrame} - Resampled daily DataFrame
 * @throws {Error} - If columns don't exist or date parsing fails
 */
export function resample(df, dateCol, valueCols) {
  assertDataFrame(df);
  assertColumnExists(df, dateCol);

  // Проверяем существование всех колонок со значениями
  for (const col of valueCols) {
    assertColumnExists(df, col);
  }

  // Группируем данные по дате
  try {
    const grouped = df
      .groupBy((row) => {
        try {
          return formatDateToYYYYMMDD(row[dateCol]);
        } catch (e) {
          if (e instanceof Error) {
            throw new Error(
              `Failed to parse date in row: ${JSON.stringify(row)}. ${e.message}`,
            );
          }
          throw new Error(
            `Failed to parse date in row: ${JSON.stringify(row)}. Unknown error`,
          );
        }
      })
      .select((group) => {
        const result = {
          [dateCol]: group.first()[dateCol],
        };

        // Для каждой колонки вычисляем среднее
        for (const col of valueCols) {
          const values = group
            .getSeries(col)
            .where((v) => v !== null && !Number.isNaN(v))
            .toArray();

          result[col] = calculateMean(values);
        }

        return result;
      });

    // Приведение типа с использованием промежуточного unknown
    return /** @type {DataFrame} */ (/** @type {unknown} */ (grouped.bake()));
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to resample: ${error.message}`);
    }
    throw new Error(`Failed to resample: Unknown error`);
  }
}

/**
 * Compute rolling mean for a column
 *
 * @param {DataFrame} df - Input DataFrame
 * @param {string} column - Column to compute rolling mean for
 * @param {number} windowSize - Size of the rolling window
 * @returns {DataFrame} - DataFrame with new column `${column}_rollmean`
 * @throws {Error} - If column doesn't exist or window size is invalid
 */
export function rollingMean(df, column, windowSize) {
  assertDataFrame(df);
  assertColumnExists(df, column);

  if (!Number.isInteger(windowSize) || windowSize <= 0) {
    throw new Error('Window size must be a positive integer');
  }

  if (windowSize > df.count()) {
    throw new Error(
      `Window size (${windowSize}) is larger than the DataFrame length (${df.count()})`,
    );
  }

  try {
    // Получаем числовые значения
    const values = getNumericValues(df, column);

    // Используем оптимизированную функцию для скользящего среднего
    const rollingValues = rollingMeanTyped(values, windowSize);

    // Преобразуем TypedArray обратно в обычный массив для совместимости с DataFrame
    const rollingArray = Array.from(rollingValues);

    // Создаем Series из массива перед передачей в withSeries
    const rollingSeries = createSeriesFromArray(rollingArray);

    // Создаем новый DataFrame с колонкой скользящего среднего
    // Используем двойное приведение типа через unknown для обхода проверки типов
    return /** @type {DataFrame} */ (
      /** @type {unknown} */ (
        df.withSeries(`${column}_rollmean`, rollingSeries).bake()
      )
    );
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to compute rolling mean: ${error.message}`);
    }
    throw new Error(`Failed to compute rolling mean: Unknown error`);
  }
}
