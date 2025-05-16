/**
 * argsort.js - Returns sorted indices without modifying the frame
 */

import { validateColumn } from '../../createFrame.js';

/**
 * @typedef {import('../../createFrame.js').TinyFrame} TinyFrame
 */

/**
 * Returns sorted indices without modifying the frame or array
 *
 * @param {TinyFrame|Array<any>|Float64Array} input - Input TinyFrame or array
 * @param {string|boolean} [columnOrAscending] - Column for sorting (for TinyFrame) or ascending flag
 * @param {boolean} [ascending=true] - Sorting direction
 * @returns {number[]} - Array of indices
 */
export function argsort(input, columnOrAscending, ascending = true) {
  // Check for empty array or TypedArray
  if (Array.isArray(input) || input instanceof Float64Array) {
    // If input is an array or TypedArray
    if (input.length === 0) {
      return [];
    }

    // Determine sorting direction
    let asc = ascending;
    if (typeof columnOrAscending === 'boolean') {
      asc = columnOrAscending;
    }

    // Create indices for sorting
    const indices = new Array(input.length);
    for (let i = 0; i < input.length; i++) {
      indices[i] = i;
    }

    // Sort indices by array values
    indices.sort((a, b) => {
      const valA = input[a];
      const valB = input[b];

      // Handle null/undefined/NaN
      if (
        valA === null ||
        valA === undefined ||
        (typeof valA === 'number' && isNaN(valA))
      ) {
        return asc ? 1 : -1;
      }
      if (
        valB === null ||
        valB === undefined ||
        (typeof valB === 'number' && isNaN(valB))
      ) {
        return asc ? -1 : 1;
      }

      // Compare values
      if (valA < valB) return asc ? -1 : 1;
      if (valA > valB) return asc ? 1 : -1;
      return 0;
    });

    return indices;
  } else {
    // If input is a TinyFrame
    // Check input data
    if (!input || !input.columns || typeof input.rowCount !== 'number') {
      throw new Error('Invalid TinyFrame');
    }

    // Determine column and sorting direction
    const column =
      typeof columnOrAscending === 'string' ? columnOrAscending : '';
    const asc = ascending;

    if (typeof columnOrAscending !== 'string' || !column) {
      throw new Error('Column must be specified for TinyFrame');
    }

    validateColumn(input, column);

    // If frame is empty, return empty array
    if (input.rowCount === 0) {
      return [];
    }

    // Create indices for sorting
    const indices = new Array(input.rowCount);
    for (let i = 0; i < input.rowCount; i++) {
      indices[i] = i;
    }

    // Get column values for sorting
    const values = input.columns[column];

    // Sort indices by values
    indices.sort((a, b) => {
      const valA = values[a];
      const valB = values[b];

      // Handle null/undefined/NaN
      if (
        valA === null ||
        valA === undefined ||
        (typeof valA === 'number' && isNaN(valA))
      ) {
        return asc ? 1 : -1;
      }
      if (
        valB === null ||
        valB === undefined ||
        (typeof valB === 'number' && isNaN(valB))
      ) {
        return asc ? -1 : 1;
      }

      // Compare values
      if (valA < valB) return asc ? -1 : 1;
      if (valA > valB) return asc ? 1 : -1;
      return 0;
    });

    return indices;
  }
}
