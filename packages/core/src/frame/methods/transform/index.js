/**
 * index.js - Export all transformation functions
 *
 * This file serves as the central point for importing all transformation functions.
 */

// Export from diff.js
export { diff, pctChange } from './diff.js';

// Export from getUniqueValues.js
export { getUniqueValues } from './getUniqueValues.js';

// Export from transformSeries.js
export { transformSeries } from './transformSeries.js';

// Export from transformMultipleSeries.js
export { transformMultipleSeries } from './transformMultipleSeries.js';

// Export from deriveColumn.js
export { deriveColumn } from './deriveColumn.js';

// Export from applyWindowFunction.js
export { applyWindowFunction } from './applyWindowFunction.js';

// Export from shift.js
export { shift } from './shift.js';

// Export from cumsum.js
export { cumsum } from './cumsum.js';

// Export from transform.js
export { transform } from './transform.js';

// Type definitions
/**
 * @typedef {import('../../createFrame.js').TinyFrame} TinyFrame
 * @typedef {Record<string, any[]|Float64Array>} ColumnData
 */
