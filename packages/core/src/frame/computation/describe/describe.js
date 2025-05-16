/**
 * describe.js - Calculates basic statistics for numeric columns
 */

import { calculateMeanAndStd } from '../utils.js';
import { calculateQuantile } from './calculateQuantile.js';
import { getNumericColumns } from './getNumericColumns.js';

/**
 * @typedef {import('../../createFrame.js').TinyFrame} TinyFrame
 * @typedef {Record<string, any[]>} ResultColumns
 */

/**
 * Calculates basic statistics for numeric columns
 *
 * @param {TinyFrame} frame - Input TinyFrame
 * @param {string[]} [columns] - Columns to analyze (default: all numeric)
 * @returns {TinyFrame} - TinyFrame with statistics results
 */
export function describe(frame, columns) {
  if (!frame || !frame.columns || typeof frame.rowCount !== 'number') {
    throw new Error('Invalid TinyFrame');
  }

  // If columns not specified, use all numeric columns
  const colsToAnalyze = columns || getNumericColumns(frame);

  if (colsToAnalyze.length === 0) {
    throw new Error('No numeric columns found for analysis');
  }

  // Statistics to calculate
  const stats = ['count', 'mean', 'std', 'min', '25%', '50%', '75%', 'max'];

  // Create result columns
  /** @type {ResultColumns} */
  const resultColumns = {
    // Add index column
    _stat: stats,
  };

  // Calculate statistics for each column
  for (const col of colsToAnalyze) {
    if (!frame.columns[col]) {
      continue; // Skip non-existent columns
    }

    const values = frame.columns[col];

    // Create array for statistics results
    resultColumns[col] = new Array(stats.length);

    // Filter valid values
    const validValues = [];
    let validCount = 0;

    for (let i = 0; i < frame.rowCount; i++) {
      const val = values[i];
      if (
        val !== null &&
        val !== undefined &&
        typeof val === 'number' &&
        !isNaN(val)
      ) {
        validValues.push(val);
        validCount++;
      }
    }

    // If no valid values, fill with NaN
    if (validCount === 0) {
      for (let i = 0; i < stats.length; i++) {
        resultColumns[col][i] = NaN;
      }
      continue;
    }

    // Sort for quantile calculation
    validValues.sort((a, b) => a - b);

    // Calculate statistics
    const { mean, std } = calculateMeanAndStd(validValues);
    const min = validValues[0];
    const max = validValues[validValues.length - 1];
    const q1 = calculateQuantile(validValues, 0.25);
    const q2 = calculateQuantile(validValues, 0.5);
    const q3 = calculateQuantile(validValues, 0.75);

    // Fill results
    resultColumns[col][0] = validCount;
    resultColumns[col][1] = mean;
    resultColumns[col][2] = std;
    resultColumns[col][3] = min;
    resultColumns[col][4] = q1;
    resultColumns[col][5] = q2;
    resultColumns[col][6] = q3;
    resultColumns[col][7] = max;
  }

  return {
    columns: resultColumns,
    rowCount: stats.length,
  };
}
