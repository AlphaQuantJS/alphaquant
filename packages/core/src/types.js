/**
 * @typedef {import('data-forge').DataFrame} DataFrame
 * @typedef {import('data-forge').IDataFrame} IDataFrame
 * @typedef {import('data-forge').Series} Series
 * @typedef {import('data-forge').ISeries} ISeries
 *
 * @typedef {Object.<string, any>} DataRow
 *
 * @typedef {Object.<string, any>} Dictionary
 *
 * @typedef {Object.<string, DataFrame>} GroupedDataFrames
 *
 * @typedef {'inner'|'left'|'right'|'outer'} JoinType
 *
 * @typedef {'mean'|'sum'|'count'|'min'|'max'} AggregationType
 * @typedef {function(any[]): any} AggregationFunction
 *
 * @typedef {Object} DataFrameLike
 * @property {function(): string[]} getColumnNames - Функция для получения имен колонок
 * @property {function(string): Series} getSeries - Функция для получения серии по имени колонки
 * @property {function(string, Series): DataFrame} withSeries - Функция для добавления серии
 * @property {function(): any[]} toArray - Функция для преобразования в массив
 *
 * @typedef {any} AnyDataFrame
 */

export {};
