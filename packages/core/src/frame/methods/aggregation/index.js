/**
 * Index file for aggregation operations
 *
 * This module exports functions for aggregation operations on TinyFrame
 */

// Group by operations
export { groupByAgg } from './groupByAgg.js';
export { fastNumericGroupBy } from './fastNumericGroupBy.js';
export { genericGroupBy } from './genericGroupBy.js';
export { isNumericArray } from './isNumericArray.js';

// Individual aggregation functions
export { count } from './count.js';
export { first } from './first.js';
export { last } from './last.js';
export { max } from './max.js';
export { mean } from './mean.js';
export { median } from './median.js';
export { min } from './min.js';
export { mode } from './mode.js';
export { std } from './std.js';
export { sum } from './sum.js';
