/**
 * filterByColumn.js - Filtering TinyFrame by column values
 */

import { validateColumn } from '../../../createFrame.js';
import { filter } from './filter.js';

/**
 * Filters TinyFrame by condition on column values
 *
 * @param {import('../../../createFrame.js').TinyFrame} frame - Input TinyFrame
 * @param {string} column - Column to filter
 * @param {function(any): boolean} predicate - Predicate function accepting a value
 * @returns {import('../../../createFrame.js').TinyFrame} - Filtered TinyFrame
 */
export function filterByColumn(frame, column, predicate) {
  // Check input data
  validateColumn(frame, column);

  if (typeof predicate !== 'function') {
    throw new Error('Predicate must be a function');
  }

  // Get column values array
  const values = frame.columns[column];

  // Filter the frame
  return filter(frame, (i) => predicate(values[i]));
}
