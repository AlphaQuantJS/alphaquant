// alphaquant-core/src/Preprocessing.js

import { DataFrame } from 'data-forge';

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
  const result = [];
  result.length = values.length; // Предварительное выделение памяти

  let validCount = 0;
  for (let i = 0; i < values.length; i++) {
    const v = values[i];

    if (v === null || Number.isNaN(v)) continue;

    // Молниеносная проверка типа
    if (typeof v !== 'number') {
      throw new Error(
        `Column '${column}' contains non-numeric value at row ${i}: ${JSON.stringify(v)}`,
      );
    }

    result[validCount++] = v;
  }

  if (validCount === 0) {
    throw new Error(`Column '${column}' contains no valid numeric values`);
  }

  // Обрезаем массив до фактического размера
  result.length = validCount;
  return result;
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
 * Находит минимальное и максимальное значения в массиве за один проход
 * @param {number[]} values - Массив числовых значений
 * @returns {{min: number, max: number}} - Объект с минимальным и максимальным значениями
 */
function findMinMax(values) {
  let min = values[0];
  let max = values[0];

  for (let i = 1; i < values.length; i++) {
    const v = values[i];
    if (v < min) min = v;
    if (v > max) max = v;
  }

  return { min, max };
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

  const values = getNumericValues(df, column);
  const { min, max } = findMinMax(values);

  // Проверка на диапазон значений
  if (min === max) {
    throw new Error(
      `Column '${column}' has constant values, normalization not possible`,
    );
  }

  // Оптимизированное вычисление нормализованных значений
  const range = max - min;
  const normalized = values.map((value) => (value - min) / range);

  // Создаем Series из массива перед передачей в withSeries
  const normalizedSeries = createSeriesFromArray(normalized);

  // Создаем новый DataFrame с нормализованной колонкой
  return /** @type {DataFrame} */ (
    df.withSeries(`${column}_norm`, normalizedSeries).bake()
  );
}

/**
 * Вычисляет среднее и стандартное отклонение массива за один проход
 * @param {number[]} values - Массив числовых значений
 * @returns {{mean: number, std: number}} - Объект со средним и стандартным отклонением
 */
function calculateMeanAndStd(values) {
  let sum = 0;
  let sumSq = 0;
  const n = values.length;

  for (let i = 0; i < n; i++) {
    const value = values[i];
    sum += value;
    sumSq += value * value;
  }

  const mean = sum / n;
  const variance = sumSq / n - mean * mean;
  const std = Math.sqrt(variance);

  return { mean, std };
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

  const values = getNumericValues(df, column);
  const { mean, std } = calculateMeanAndStd(values);

  // Проверка на стандартное отклонение
  if (std === 0) {
    throw new Error(
      `Column '${column}' has zero standard deviation, z-score not possible`,
    );
  }

  // Оптимизированное вычисление z-score
  const standardized = values.map((value) => (value - mean) / std);

  // Создаем Series из массива перед передачей в withSeries
  const standardizedSeries = createSeriesFromArray(standardized);

  // Создаем новый DataFrame со стандартизованной колонкой
  return /** @type {DataFrame} */ (
    df.withSeries(`${column}_zscore`, standardizedSeries).bake()
  );
}

/**
 * Преобразует дату в формат YYYY-MM-DD
 * @param {any} dateValue - Значение даты
 * @returns {string} - Строка в формате YYYY-MM-DD
 * @throws {Error} - Если формат даты некорректен
 */
function formatDateToYYYYMMDD(dateValue) {
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date format: ${JSON.stringify(dateValue)}`);
  }
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

/**
 * Вычисляет среднее значение массива чисел
 * @param {number[]} values - Массив числовых значений
 * @returns {number|null} - Среднее значение или null для пустого массива
 */
function calculateMean(values) {
  if (values.length === 0) return null;

  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
  }

  return sum / values.length;
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

  // Проверяем существование всех колонок для агрегации
  for (const col of valueCols) {
    assertColumnExists(df, col);
  }

  try {
    const parsed = /** @type {DataFrame} */ (
      df.transformSeries({
        [dateCol]: (val) => formatDateToYYYYMMDD(val),
      })
    );

    // Явно приводим результат к типу DataFrame
    return /** @type {DataFrame} */ (
      parsed
        .groupBy((row) => row[dateCol])
        .select((group) => {
          const rows = group.toArray();
          /** @type {Record<string, number | null>} */
          const avg = {};

          for (const col of valueCols) {
            const vals = [];
            vals.length = rows.length; // Предварительное выделение памяти

            let validCount = 0;
            for (let i = 0; i < rows.length; i++) {
              const v = rows[i][col];

              if (v === null || Number.isNaN(v)) continue;

              // Молниеносная проверка типа
              if (typeof v !== 'number') {
                throw new Error(
                  `Column '${col}' contains non-numeric value at row ${i}: ${JSON.stringify(v)}`,
                );
              }

              vals[validCount++] = v;
            }

            // Обрезаем массив до фактического размера
            vals.length = validCount;
            avg[col] = calculateMean(vals);
          }

          return { [dateCol]: group.first()[dateCol], ...avg };
        })
        .inflate()
        .bake()
    );
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Resampling failed: ${error.message}`);
    }
    throw new Error('Resampling failed: Unknown error');
  }
}
