/**
 * sampleFraction.js - Creates a random sample as a fraction of the original frame
 */

/**
 * @typedef {import('../../createFrame.js').TinyFrame} TinyFrame
 */

import { sample } from './sample.js';

/**
 * Creates a random sample of a fixed size as a fraction of the original frame
 *
 * @param {TinyFrame} frame - Input TinyFrame
 * @param {number} fraction - Fraction of rows to sample (between 0 and 1)
 * @param {number} [seed] - Seed for random number generator
 * @returns {TinyFrame} - TinyFrame with selected rows
 */
export function sampleFraction(frame, fraction, seed) {
  // Check input data
  if (!frame || !frame.columns || typeof frame.rowCount !== 'number') {
    throw new Error('Invalid TinyFrame');
  }

  if (typeof fraction !== 'number' || fraction <= 0 || fraction > 1) {
    throw new Error('Fraction must be a number between 0 and 1');
  }

  // Calculate number of rows to sample
  const n = Math.round(frame.rowCount * fraction);

  // Use sample function
  return sample(frame, n, false, seed);
}
