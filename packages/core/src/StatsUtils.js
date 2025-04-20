// alphaquant-core/src/StatsUtils.js
import { DataFrame } from 'data-forge';
import {
  calculateMean as typedMean,
  calculateMeanAndStd,
  filterValidToTyped,
  rollingMeanTyped,
  corrMatrixTyped,
  formatMatrixAs2D,
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
 * Получает и проверяет числовые значения из колонки
 * @param {DataFrame} df - DataFrame для проверки
 * @param {string} column - Имя колонки
 * @returns {number[]} - Массив числовых значений
 * @throws {Error} - Если колонка пуста или содержит только нечисловые значения
 */
function getValidNumericValues(df, column) {
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
 * Compute the mean of a column
 * @param {DataFrame} df - Input DataFrame
 * @param {string} column - Column to compute mean for
 * @returns {number} - Mean value
 * @throws {Error} - If column doesn't exist or contains non-numeric values
 */
export function mean(df, column) {
  assertDataFrame(df);
  assertColumnExists(df, column);

  try {
    const numericValues = getValidNumericValues(df, column);
    return typedMean(numericValues);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to compute mean: ${error.message}`);
    }
    throw new Error('Failed to compute mean: Unknown error');
  }
}

/**
 * Compute the standard deviation of a column
 * @param {DataFrame} df - Input DataFrame
 * @param {string} column - Column to compute std for
 * @returns {number} - Standard deviation
 * @throws {Error} - If column doesn't exist or contains non-numeric values
 */
export function std(df, column) {
  assertDataFrame(df);
  assertColumnExists(df, column);

  try {
    const numericValues = getValidNumericValues(df, column);
    const { std } = calculateMeanAndStd(numericValues);
    return std;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to compute standard deviation: ${error.message}`);
    }
    throw new Error('Failed to compute standard deviation: Unknown error');
  }
}

/**
 * Compute rolling mean over a window
 * @param {DataFrame} df - Input DataFrame
 * @param {string} column - Column to compute rolling mean for
 * @param {number} windowSize - Size of the rolling window
 * @returns {DataFrame} - Original DataFrame with new column `${column}_rollmean`
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
    const values = getValidNumericValues(df, column);

    // Используем оптимизированную функцию для скользящего среднего
    const rollingValues = rollingMeanTyped(values, windowSize);

    // Создаем Series из массива скользящих средних
    const data = Array.from(rollingValues).map((value) => ({ value }));
    const series = new DataFrame(data).getSeries('value');

    // Создаем новый DataFrame с колонкой скользящего среднего
    return /** @type {DataFrame} */ (
      /** @type {unknown} */ (
        df.withSeries(`${column}_rollmean`, series).bake()
      )
    );
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to compute rolling mean: ${error.message}`);
    }
    throw new Error('Failed to compute rolling mean: Unknown error');
  }
}

/**
 * Фильтрует числовые колонки из DataFrame
 * @param {DataFrame} df - DataFrame для фильтрации
 * @returns {string[]} - Массив имен числовых колонок
 * @throws {Error} - Если DataFrame не содержит числовых колонок
 */
function getNumericColumns(df) {
  if (df.count() === 0) {
    throw new Error('DataFrame is empty');
  }

  const columnNames = df.getColumnNames();
  const numericColumns = [];

  // Проверяем каждую колонку
  for (const col of columnNames) {
    try {
      // Берем первые 10 строк для проверки (или все, если меньше 10)
      const sample = df.head(Math.min(10, df.count()));
      const values = sample.getSeries(col).toArray();

      // Проверяем, есть ли хотя бы одно числовое значение
      const hasNumeric = values.some(
        (v) => typeof v === 'number' && !Number.isNaN(v) && v !== null,
      );

      if (hasNumeric) {
        numericColumns.push(col);
      }
    } catch (error) {
      // Пропускаем колонки, которые вызывают ошибки
      continue;
    }
  }

  if (numericColumns.length === 0) {
    throw new Error('No numeric columns found in DataFrame');
  }

  return numericColumns;
}

/**
 * Извлекает числовые значения из колонки DataFrame
 * @param {DataFrame} df - DataFrame для извлечения
 * @param {string} col - Имя колонки
 * @returns {number[]} - Массив числовых значений
 */
function extractNumericValues(df, col) {
  try {
    return getValidNumericValues(df, col);
  } catch (error) {
    // Если колонка не содержит числовых значений, возвращаем пустой массив
    return [];
  }
}

/**
 * Compute correlation matrix for numeric columns in a DataFrame
 * @param {DataFrame} df - Input DataFrame
 * @returns {DataFrame} - Correlation matrix as DataFrame
 * @throws {Error} - If DataFrame has no numeric columns
 */
export function corrMatrix(df) {
  assertDataFrame(df);

  try {
    // Получаем числовые колонки
    const numericCols = getNumericColumns(df);

    // Извлекаем данные для каждой колонки
    const arrays = numericCols.map((col) => {
      const values = extractNumericValues(df, col);
      return filterValidToTyped(values);
    });

    // Используем оптимизированную функцию для расчета корреляционной матрицы
    const { matrix, labels } = corrMatrixTyped(arrays, numericCols);

    // Преобразуем плоскую матрицу в двумерный массив
    const matrixArray = formatMatrixAs2D(matrix, numericCols.length);

    // Создаем массив объектов для DataFrame
    const resultData = [];
    for (let i = 0; i < numericCols.length; i++) {
      // Используем Record<string, number> для явного указания типа объекта с индексированием по строке
      const row = /** @type {Record<string, number>} */ ({});
      for (let j = 0; j < numericCols.length; j++) {
        row[numericCols[j]] = matrixArray[i][j];
      }
      resultData.push(row);
    }

    // Создаем DataFrame из массива объектов
    const result = new DataFrame(resultData);

    // Устанавливаем индекс и возвращаем результат с двойным приведением типа
    return /** @type {DataFrame} */ (
      /** @type {unknown} */ (result.withIndex(numericCols).bake())
    );
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to compute correlation matrix: ${error.message}`);
    }
    throw new Error('Failed to compute correlation matrix: Unknown error');
  }
}
