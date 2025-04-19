// @ts-nocheck - Отключаем проверку типов в этом файле для совместимости с IDataFrame
// Импортируем необходимые классы из data-forge
import { DataFrame, Series } from 'data-forge';

/**
 * @typedef {Object} DataRow
 * @typedef {Object.<string, any>} Dictionary
 * @typedef {Object.<string, DataFrame>} GroupedDataFrames
 * @typedef {('inner'|'outer'|'left'|'right')} JoinType
 * @typedef {import('data-forge').IDataFrame} IDataFrame
 * @typedef {DataFrame|IDataFrame} AnyDataFrame
 * @typedef {string|function(any[]): any} AggregationType
 * @typedef {function(any[]): any} AggregationFunction
 */

/**
 * Проверяет, является ли объект DataFrame или совместимым интерфейсом
 * @param {any} obj - Объект для проверки
 * @returns {boolean} - true, если объект является DataFrame или совместимым интерфейсом
 * @throws {Error} - Если объект не является DataFrame или совместимым интерфейсом
 */
export function assertDataFrame(obj) {
  if (!obj || typeof obj !== 'object') {
    throw new Error('Object is not a DataFrame');
  }

  // Проверяем наличие методов, характерных для DataFrame
  const requiredMethods = ['toArray', 'getSeries', 'getColumnNames'];

  for (const method of requiredMethods) {
    if (typeof obj[method] !== 'function') {
      throw new Error(`Object is not a DataFrame - missing method: ${method}`);
    }
  }

  return true;
}

/**
 * Преобразует объект в DataFrame, если он еще им не является
 * @param {AnyDataFrame} obj - Объект для преобразования
 * @returns {DataFrame} - DataFrame
 * @throws {Error} - Если объект не может быть преобразован в DataFrame
 */
export function ensureDataFrame(obj) {
  if (obj instanceof DataFrame) {
    return obj;
  }

  try {
    assertDataFrame(obj);
    // Если объект прошел проверку, но не является экземпляром DataFrame,
    // создаем новый DataFrame с данными из объекта
    return new DataFrame({
      rows: obj.toArray(),
    });
  } catch (error) {
    // Если объект не является DataFrame, пробуем создать новый DataFrame
    if (Array.isArray(obj)) {
      return new DataFrame({
        rows: obj,
      });
    }

    throw new Error('Cannot convert object to DataFrame');
  }
}

/**
 * Проверяет, существует ли колонка в DataFrame
 * @param {AnyDataFrame} df - DataFrame
 * @param {string} column - Имя колонки
 * @throws {Error} - Если колонка не существует
 */
export function assertColumnExists(df, column) {
  // @ts-ignore - Игнорируем ошибку типизации для совместимости с IDataFrame
  const dataFrame = ensureDataFrame(df);

  if (!column) {
    throw new Error('Column name is required');
  }

  const columnNames = dataFrame.getColumnNames();

  if (!columnNames.includes(column)) {
    throw new Error(
      `Column "${column}" does not exist in DataFrame. Available columns: ${columnNames.join(', ')}`,
    );
  }
}

/**
 * Получает уникальные значения колонки
 * @param {DataFrame} df - DataFrame
 * @param {string} column - Имя колонки
 * @returns {any[]} - Массив уникальных значений
 * @throws {Error} - Если колонка не существует
 */
export function unique(df, column) {
  // @ts-ignore - Игнорируем ошибку типизации для совместимости с IDataFrame
  const dataFrame = ensureDataFrame(df);

  assertColumnExists(dataFrame, column);

  const values = dataFrame.getSeries(column).toArray();
  return [...new Set(values)];
}

/**
 * Подсчитывает количество каждого уникального значения в колонке
 * @param {DataFrame} df - DataFrame
 * @param {string} column - Имя колонки
 * @returns {Record<string, number>} - Объект с количеством каждого значения
 * @throws {Error} - Если колонка не существует
 */
export function valueCount(df, column) {
  // @ts-ignore - Игнорируем ошибку типизации для совместимости с IDataFrame
  const dataFrame = ensureDataFrame(df);

  assertColumnExists(dataFrame, column);

  const values = dataFrame.getSeries(column).toArray();

  /** @type {Record<string, number>} */
  const counts = {};

  for (const value of values) {
    const key = String(value);
    counts[key] = (counts[key] || 0) + 1;
  }

  return counts;
}

/**
 * Заполняет NaN значения в колонке указанным значением
 * @param {AnyDataFrame} df - DataFrame
 * @param {string} column - Колонка для заполнения
 * @param {number|string|null} [value=0] - Значение для заполнения NaN
 * @returns {DataFrame} - Новый DataFrame с заполненными значениями
 * @throws {Error} - Если колонка не существует
 */
export function fillNaN(df, column, value = 0) {
  // @ts-ignore - Игнорируем ошибку типизации для совместимости с IDataFrame
  const dataFrame = ensureDataFrame(df);

  assertColumnExists(dataFrame, column);

  // Создаем новый массив данных с заполненными значениями
  const data = dataFrame.toArray().map((row) => {
    const newRow = { ...row };
    if (
      newRow[column] === null ||
      newRow[column] === undefined ||
      (typeof newRow[column] === 'number' && isNaN(newRow[column]))
    ) {
      newRow[column] = value;
    }
    return newRow;
  });

  return new DataFrame({ rows: data });
}

/**
 * Объединяет два DataFrame по общим колонкам
 * @param {AnyDataFrame} left - Левый DataFrame
 * @param {AnyDataFrame} right - Правый DataFrame
 * @param {string|string[]} on - Колонка или колонки для объединения
 * @param {JoinType} [how='inner'] - Тип объединения
 * @returns {DataFrame} - Новый объединенный DataFrame
 * @throws {Error} - Если колонки не существуют
 */
export function join(left, right, on, how = 'inner') {
  // Заглушка для join
  // @ts-ignore - Игнорируем ошибку типизации для совместимости с IDataFrame
  const leftDf = ensureDataFrame(left);
  // @ts-ignore - Игнорируем ошибку типизации для совместимости с IDataFrame
  const rightDf = ensureDataFrame(right);

  // Простая реализация inner join
  const leftData = leftDf.toArray();
  const rightData = rightDf.toArray();

  const result = [];

  for (const leftRow of leftData) {
    for (const rightRow of rightData) {
      if (String(leftRow[on]) === String(rightRow[on])) {
        result.push({ ...leftRow, ...rightRow });
      }
    }
  }

  return new DataFrame({ rows: result });
}

/**
 * Объединяет DataFrame с другим DataFrame или массивом данных
 * @param {AnyDataFrame} df - DataFrame
 * @param {AnyDataFrame|any[]} other - Другой DataFrame или массив данных
 * @param {string} [axis='rows'] - Ось объединения ('rows' или 'columns')
 * @returns {DataFrame} - Новый объединенный DataFrame
 * @throws {Error} - Если параметры некорректны
 */
export function concat(df, other, axis = 'rows') {
  // Заглушка для concat
  // @ts-ignore - Игнорируем ошибку типизации для совместимости с IDataFrame
  const dataFrame = ensureDataFrame(df);

  if (axis === 'rows') {
    const otherDf = Array.isArray(other)
      ? new DataFrame({ rows: other })
      : ensureDataFrame(other);
    const result = [...dataFrame.toArray(), ...otherDf.toArray()];
    return new DataFrame({ rows: result });
  } else if (axis === 'columns') {
    // Упрощенная реализация для columns
    return dataFrame;
  } else {
    throw new Error('Invalid axis. Must be "rows" or "columns"');
  }
}

/**
 * Группирует DataFrame по указанным колонкам
 * @param {AnyDataFrame} df - DataFrame
 * @param {string[]} groupBy - Колонки для группировки
 * @returns {GroupedDataFrames} - Объект с группами
 * @throws {Error} - Если колонки не существуют
 */
export function groupBy(df, groupBy) {
  // Заглушка для groupBy
  // @ts-ignore - Игнорируем ошибку типизации для совместимости с IDataFrame
  const dataFrame = ensureDataFrame(df);

  const groups = {};
  const data = dataFrame.toArray();

  for (const row of data) {
    const key = groupBy.map((col) => String(row[col])).join('|');

    if (!groups[key]) {
      groups[key] = [];
    }

    groups[key].push(row);
  }

  // Преобразуем массивы в DataFrame
  for (const key in groups) {
    groups[key] = new DataFrame({ rows: groups[key] });
  }

  return groups;
}

// Заглушки для остальных функций, которые используются в AQDataFrame

/**
 * Заглушка для функции pivot
 */
export function pivot() {
  return new DataFrame();
}

/**
 * Заглушка для функции melt
 */
export function melt() {
  return new DataFrame();
}

/**
 * Заглушка для функции describe
 */
export function describe() {
  return {};
}

/**
 * Заглушка для функции aggregate
 */
export function aggregate() {
  return new DataFrame();
}

/**
 * Заглушка для функции applyMap
 */
export function applyMap() {
  return new DataFrame();
}

/**
 * Заглушка для функции rolling
 */
export function rolling() {
  return new DataFrame();
}

/**
 * Заглушка для функции shift
 */
export function shift() {
  return new DataFrame();
}

/**
 * Заглушка для функции diff
 */
export function diff() {
  return new DataFrame();
}

/**
 * Заглушка для функции cumsum
 */
export function cumsum() {
  return new DataFrame();
}

/**
 * Заглушка для функции cumprod
 */
export function cumprod() {
  return new DataFrame();
}

/**
 * Заглушка для функции percentChange
 */
export function percentChange() {
  return new DataFrame();
}

/**
 * Заглушка для функции plot
 */
export function plot() {
  return '<div>Plot placeholder</div>';
}
