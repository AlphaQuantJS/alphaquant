// alphaquant-core/src/StatsUtils.js
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
 * Получает и проверяет числовые значения из колонки
 * @param {DataFrame} df - DataFrame для проверки
 * @param {string} column - Имя колонки
 * @returns {number[]} - Массив числовых значений
 * @throws {Error} - Если колонка пуста или содержит только нечисловые значения
 */
function getValidNumericValues(df, column) {
  const values = df.getSeries(column).toArray();

  // Проверка на пустой массив
  if (values.length === 0) {
    throw new Error(`Column '${column}' is empty`);
  }

  // Оптимизированная фильтрация и проверка числовых значений
  const numericValues = new Array(values.length);
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

    numericValues[validCount++] = v;
  }

  if (validCount === 0) {
    throw new Error(`Column '${column}' contains no valid numeric values`);
  }

  // Обрезаем массив до фактического размера
  numericValues.length = validCount;
  return numericValues;
}

/**
 * Вычисляет среднее значение массива чисел
 * @param {number[]} values - Массив числовых значений
 * @returns {number} - Среднее значение
 */
function calculateMean(values) {
  let sum = 0;
  const n = values.length;

  for (let i = 0; i < n; i++) {
    sum += values[i];
  }

  return sum / n;
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

  const numericValues = getValidNumericValues(df, column);
  return calculateMean(numericValues);
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
 * Compute the standard deviation of a column
 * @param {DataFrame} df - Input DataFrame
 * @param {string} column - Column to compute std for
 * @returns {number} - Standard deviation
 * @throws {Error} - If column doesn't exist or contains non-numeric values
 */
export function std(df, column) {
  assertDataFrame(df);
  assertColumnExists(df, column);

  const numericValues = getValidNumericValues(df, column);
  const { std } = calculateMeanAndStd(numericValues);

  return std;
}

/**
 * Вычисляет скользящее среднее для массива значений
 * @param {any[]} values - Массив значений
 * @param {number} windowSize - Размер окна
 * @returns {(number|null)[]} - Массив скользящих средних
 */
function calculateRollingMean(values, windowSize) {
  const result = new Array(values.length - windowSize + 1);
  result.fill(null);

  for (let i = 0; i <= values.length - windowSize; i++) {
    const windowValues = [];
    let validCount = 0;

    // Собираем валидные значения в текущем окне
    for (let j = 0; j < windowSize; j++) {
      const v = values[i + j];
      if (typeof v === 'number' && !Number.isNaN(v) && v !== null) {
        windowValues[validCount++] = v;
      }
    }

    // Если есть валидные значения, вычисляем среднее
    if (validCount > 0) {
      let sum = 0;
      for (let k = 0; k < validCount; k++) {
        sum += windowValues[k];
      }
      result[i] = sum / validCount;
    }
  }

  return result;
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
    const series = df
      .getSeries(column)
      .rollingWindow(windowSize)
      .select((win) => {
        const values = win.toArray();
        const validValues = new Array(values.length);
        let validCount = 0;

        // Оптимизированная фильтрация
        for (let i = 0; i < values.length; i++) {
          const v = values[i];
          if (typeof v === 'number' && !Number.isNaN(v) && v !== null) {
            validValues[validCount++] = v;
          }
        }

        if (validCount === 0) return null;

        // Обрезаем массив до фактического размера
        validValues.length = validCount;

        // Оптимизированное вычисление среднего
        return calculateMean(validValues);
      });

    // Явно приводим результат к типу DataFrame
    return /** @type {DataFrame} */ (
      df.withSeries(`${column}_rollmean`, series).bake()
    );
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Rolling mean calculation failed: ${error.message}`);
    }
    throw new Error('Rolling mean calculation failed: Unknown error');
  }
}

/**
 * Фильтрует числовые колонки из DataFrame
 * @param {DataFrame} df - DataFrame для фильтрации
 * @returns {string[]} - Массив имен числовых колонок
 * @throws {Error} - Если DataFrame не содержит числовых колонок
 */
function getNumericColumns(df) {
  const cols = df.getColumnNames();

  if (cols.length === 0) {
    throw new Error('DataFrame has no columns');
  }

  // Оптимизированная фильтрация числовых колонок
  const numericCols = [];
  numericCols.length = cols.length; // Предварительное выделение памяти
  let numericColCount = 0;

  for (let i = 0; i < cols.length; i++) {
    const col = cols[i];
    const values = df.getSeries(col).toArray();

    // Ищем хотя бы одно числовое значение
    let hasNumeric = false;
    for (let j = 0; j < values.length; j++) {
      const v = values[j];
      if (typeof v === 'number' && !Number.isNaN(v) && v !== null) {
        hasNumeric = true;
        break;
      }
    }

    if (hasNumeric) {
      numericCols[numericColCount++] = col;
    }
  }

  // Обрезаем массив до фактического размера
  numericCols.length = numericColCount;

  if (numericColCount === 0) {
    throw new Error(
      'DataFrame has no numeric columns for correlation calculation',
    );
  }

  return numericCols;
}

/**
 * Извлекает числовые значения из колонки DataFrame
 * @param {DataFrame} df - DataFrame для извлечения
 * @param {string} col - Имя колонки
 * @returns {number[]} - Массив числовых значений
 */
function extractNumericValues(df, col) {
  const allValues = df.getSeries(col).toArray();
  const values = new Array(allValues.length);
  let validCount = 0;

  // Оптимизированная фильтрация числовых значений
  for (let i = 0; i < allValues.length; i++) {
    const v = allValues[i];
    if (typeof v === 'number' && !Number.isNaN(v) && v !== null) {
      values[validCount++] = v;
    }
  }

  // Обрезаем массив до фактического размера
  values.length = validCount;
  return values;
}

/**
 * Вычисляет ковариацию между двумя массивами
 * @param {number[]} x - Первый массив
 * @param {number[]} y - Второй массив
 * @param {number} meanX - Среднее значение первого массива
 * @param {number} meanY - Среднее значение второго массива
 * @returns {number} - Ковариация
 */
function calculateCovariance(x, y, meanX, meanY) {
  const n = Math.min(x.length, y.length);
  let cov = 0;

  for (let i = 0; i < n; i++) {
    cov += (x[i] - meanX) * (y[i] - meanY);
  }

  return cov / n;
}

/**
 * Compute correlation matrix for numeric columns in a DataFrame
 * @param {DataFrame} df - Input DataFrame
 * @returns {DataFrame} - Correlation matrix as DataFrame
 * @throws {Error} - If DataFrame has no numeric columns
 */
export function corrMatrix(df) {
  assertDataFrame(df);

  const numericCols = getNumericColumns(df);

  // Предварительно вычисляем средние значения и стандартные отклонения
  /** @type {Record<string, number>} */
  const means = {};
  /** @type {Record<string, number>} */
  const stds = {};
  /** @type {Record<string, number[]>} */
  const seriesValues = {};

  // Предварительное выделение памяти для объектов
  for (let colIdx = 0; colIdx < numericCols.length; colIdx++) {
    const col = numericCols[colIdx];

    // Извлекаем числовые значения
    const values = extractNumericValues(df, col);
    seriesValues[col] = values;

    // Вычисляем среднее и стандартное отклонение
    const { mean, std } = calculateMeanAndStd(values);
    means[col] = mean;
    stds[col] = std;
  }

  // Вычисляем корреляционную матрицу
  const result = new Array(numericCols.length);

  for (let aIdx = 0; aIdx < numericCols.length; aIdx++) {
    const colA = numericCols[aIdx];
    /** @type {Record<string, number>} */
    const row = {};
    const seriesA = seriesValues[colA];
    const meanA = means[colA];
    const stdA = stds[colA];

    for (let bIdx = 0; bIdx < numericCols.length; bIdx++) {
      const colB = numericCols[bIdx];
      const seriesB = seriesValues[colB];
      const meanB = means[colB];
      const stdB = stds[colB];

      // Проверяем на нулевое стандартное отклонение
      if (stdA === 0 || stdB === 0) {
        row[colB] = stdA === stdB ? 1 : 0; // Если оба std = 0, то корреляция = 1
      } else {
        // Вычисляем ковариацию оптимизированным способом
        const cov = calculateCovariance(seriesA, seriesB, meanA, meanB);
        row[colB] = cov / (stdA * stdB);
      }
    }

    result[aIdx] = row;
  }

  // Явно приводим результат к типу DataFrame через двойное приведение
  // @ts-ignore - Игнорируем проверку типов для этого выражения
  return /** @type {DataFrame} */ (
    /** @type {unknown} */ (new DataFrame(result).withIndex(numericCols))
  );
}
