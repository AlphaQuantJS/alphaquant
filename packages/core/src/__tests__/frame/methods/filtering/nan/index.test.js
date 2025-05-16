/**
 * Tests for index.js in nan directory
 *
 * This test ensures that all functions are correctly exported from the index file.
 */

import * as nanModule from '../../../../../frame/methods/filtering/nan/index.js';
import { dropNaN } from '../../../../../frame/methods/filtering/nan/dropNaN.js';
import { fillNaN } from '../../../../../frame/methods/filtering/nan/fillNaN.js';

describe('nan/index.js', () => {
  test('should export all functions correctly', () => {
    // Check that all expected functions are exported
    expect(nanModule.dropNaN).toBeDefined();
    expect(nanModule.fillNaN).toBeDefined();

    // Check that exported functions are the correct implementations
    expect(nanModule.dropNaN).toBe(dropNaN);
    expect(nanModule.fillNaN).toBe(fillNaN);

    // Check that there are no unexpected exports
    const exportedFunctions = Object.keys(nanModule);
    expect(exportedFunctions).toHaveLength(2);
    expect(exportedFunctions).toContain('dropNaN');
    expect(exportedFunctions).toContain('fillNaN');
  });
});
