/**
 * melt.js - Transforms data from "wide" format to "long" format
 */

import { createFrame } from '../../createFrame.js';

/**
 * @typedef {import('../../createFrame.js').TinyFrame} TinyFrame
 * @typedef {Record<string, any[]>} ColumnData
 */

/**
 * Transforms data from "wide" format to "long" format
 *
 * @param {TinyFrame} frame - Input TinyFrame
 * @param {string} id_vars - Column to use as identifier
 * @param {string[]} value_vars - Columns to transform into values
 * @param {string} [var_name='variable'] - Name of the column to store original column names
 * @param {string} [value_name='value'] - Name of the column to store values
 * @returns {TinyFrame} - Transformed TinyFrame
 */
export function melt(
  frame,
  id_vars,
  value_vars,
  var_name = 'variable',
  value_name = 'value',
) {
  // Check input data
  if (!frame || !frame.columns || typeof frame.rowCount !== 'number') {
    throw new Error('Invalid TinyFrame');
  }

  // Check existence of id_vars
  if (!frame.columns[id_vars]) {
    throw new Error(`Column '${id_vars}' not found`);
  }

  // Check existence of all value_vars
  for (const col of value_vars) {
    if (!frame.columns[col]) {
      throw new Error(`Column '${col}' not found`);
    }
  }

  // If frame is empty, return empty frame
  if (frame.rowCount === 0) {
    return createFrame(
      {
        [id_vars]: [],
        [var_name]: [],
        [value_name]: [],
      },
      0,
    );
  }

  // Calculate number of rows in the result
  const newRowCount = frame.rowCount * value_vars.length;

  // Create new columns
  /** @type {ColumnData} */
  const newColumns = {};

  // Create column for id_vars
  newColumns[id_vars] = new Array(newRowCount);

  // Create columns for var_name and value_name
  newColumns[var_name] = new Array(newRowCount);
  newColumns[value_name] = new Array(newRowCount);

  // Fill new columns
  let newIndex = 0;
  for (let i = 0; i < frame.rowCount; i++) {
    const idValue = frame.columns[id_vars][i];

    for (const col of value_vars) {
      const value = frame.columns[col][i];

      newColumns[id_vars][newIndex] = idValue;
      newColumns[var_name][newIndex] = col;
      newColumns[value_name][newIndex] = value;

      newIndex++;
    }
  }

  return createFrame(newColumns, newRowCount);
}
