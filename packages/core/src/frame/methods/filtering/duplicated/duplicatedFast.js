/**
 * duplicatedFast.js - Finds duplicates using an optimized hashing algorithm
 */

/**
 * @typedef {import('../../../createFrame.js').TinyFrame} TinyFrame
 */

import { hashRow } from './hashRow.js';

/**
 * Finds duplicates using an optimized hashing algorithm
 * for large datasets
 *
 * @param {TinyFrame} frame - Input TinyFrame
 * @param {string[]} [subset] - Subset of columns to check
 * @param {boolean} [keepFirst=true] - Keep first occurrence
 * @returns {boolean[]} - Array of flags, where true means duplicate
 */
export function duplicatedFast(frame, subset, keepFirst = true) {
  // Check input data
  if (!frame || !frame.columns || typeof frame.rowCount !== 'number') {
    throw new Error('Invalid TinyFrame');
  }

  // If frame is empty, return empty array
  if (frame.rowCount === 0) {
    return [];
  }

  // Determine columns to check
  const columnsToCheck = subset || Object.keys(frame.columns);

  // Check that all specified columns exist
  for (const col of columnsToCheck) {
    if (!frame.columns[col]) {
      throw new Error(`Column '${col}' not found`);
    }
  }

  // Create array for results
  const isDuplicate = new Array(frame.rowCount).fill(false);

  // Create hash table with open addressing
  // Use size that is approximately 1.5 times the number of rows to reduce collisions
  const tableSize = Math.max(
    16,
    1 << Math.ceil(Math.log2(frame.rowCount * 1.5)),
  );
  const hashMask = tableSize - 1; // For fast calculation of remainder

  // Initialize hash table
  // Store row index + 1 (0 means empty cell)
  const hashTable = new Uint32Array(tableSize);

  // Array to store row hashes
  const rowHashes = new Uint32Array(frame.rowCount);

  // Calculate hashes for all rows
  for (let i = 0; i < frame.rowCount; i++) {
    const rowValues = columnsToCheck.map((col) => {
      const val = frame.columns[col][i];
      // Special handling for NaN, undefined and null
      if (val === undefined) return 'undefined';
      if (val === null) return 'null';
      if (typeof val === 'number' && isNaN(val)) return 'NaN';
      return val;
    });

    // Calculate hash for row
    rowHashes[i] = hashRow(rowValues);
  }

  // Check each row for duplicates
  for (let i = 0; i < frame.rowCount; i++) {
    const hash = rowHashes[i];

    // Calculate starting position in hash table
    let pos = hash & hashMask;

    // Flag, indicating if we found a duplicate
    let foundDuplicate = false;

    // Check if there is a row with the same hash in the table
    while (hashTable[pos] !== 0) {
      const candidateIdx = hashTable[pos] - 1;

      // If hashes match, check row values
      if (rowHashes[candidateIdx] === hash) {
        // Check if it is a duplicate by comparing values directly
        let isEqual = true;

        // Compare each column value
        for (let j = 0; j < columnsToCheck.length; j++) {
          const col = columnsToCheck[j];
          const val1 = frame.columns[col][i];
          const val2 = frame.columns[col][candidateIdx];

          // Handle special cases
          if (val1 === undefined && val2 === undefined) continue;
          if (val1 === null && val2 === null) continue;
          if (
            typeof val1 === 'number' &&
            isNaN(val1) &&
            typeof val2 === 'number' &&
            isNaN(val2)
          )
            continue;

          // Direct comparison for primitive types
          if (val1 !== val2) {
            isEqual = false;
            break;
          }
        }

        if (isEqual) {
          foundDuplicate = true;
          break;
        }
      }

      // Linear probing: move to the next cell
      pos = (pos + 1) & hashMask;
    }

    if (foundDuplicate) {
      // This is a duplicate
      isDuplicate[i] = true;
    } else {
      // This is the first occurrence with this hash
      hashTable[pos] = i + 1; // Save index + 1

      // If keepFirst=false, mark the first occurrence as a duplicate
      if (!keepFirst) {
        isDuplicate[i] = true;
      }
    }
  }

  return isDuplicate;
}
