/**
 * trainTestSplit.js - Splits the frame into training and testing sets
 */

/**
 * @typedef {import('../../createFrame.js').TinyFrame} TinyFrame
 */

import { sample } from './sample.js';
import { createSeededRandom } from './createSeededRandom.js';

/**
 * Splits the frame into training and testing sets (for machine learning)
 *
 * @param {TinyFrame} frame - Input TinyFrame
 * @param {number} testSize - Fraction of rows for testing (between 0 and 1)
 * @param {number} [seed] - Seed for random number generator
 * @returns {[TinyFrame, TinyFrame]} - Array of two frames [train, test]
 */
export function trainTestSplit(frame, testSize, seed) {
  // Check input data
  if (!frame || !frame.columns || typeof frame.rowCount !== 'number') {
    throw new Error('Invalid TinyFrame');
  }

  if (typeof testSize !== 'number' || testSize <= 0 || testSize >= 1) {
    throw new Error('Test size must be a number between 0 and 1 (exclusive)');
  }

  // If frame is empty, return two empty copies
  if (frame.rowCount === 0) {
    const emptyFrame = {
      columns: { ...frame.columns },
      rowCount: 0,
    };
    return [emptyFrame, emptyFrame];
  }

  // Initialize random number generator with seed (if specified)
  const random = seed !== undefined ? createSeededRandom(seed) : Math.random;

  // Create array of all indices
  const allIndices = new Array(frame.rowCount);
  for (let i = 0; i < frame.rowCount; i++) {
    allIndices[i] = i;
  }

  // Shuffle indices
  for (let i = frame.rowCount - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [allIndices[i], allIndices[j]] = [allIndices[j], allIndices[i]];
  }

  // Calculate sizes of the splits
  const testCount = Math.round(frame.rowCount * testSize);
  const trainCount = frame.rowCount - testCount;

  // Split indices and sort them for stable result
  // This ensures that when we merge and sort in tests
  // we get the original order of elements
  const trainIndices = allIndices.slice(0, trainCount).sort((a, b) => a - b);
  const testIndices = allIndices.slice(trainCount).sort((a, b) => a - b);

  // Create splits
  const trainFrame = sample(frame, trainIndices);
  const testFrame = sample(frame, testIndices);

  return [trainFrame, testFrame];
}
