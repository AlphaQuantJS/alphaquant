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
 * @property {function(): string[]} getColumnNames - Function to get column names
 * @property {function(string): Series} getSeries - Function to get a series by column name
 * @property {function(string, Series): DataFrame} withSeries - Function to add a series
 * @property {function(): any[]} toArray - Function to convert to an array
 *
 * @typedef {any} AnyDataFrame
 */

export {};
