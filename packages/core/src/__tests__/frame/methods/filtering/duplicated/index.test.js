/**
 * Tests for index.js in duplicated directory
 *
 * This test ensures that all functions are correctly exported from the index file.
 */

import * as duplicatedModule from '../../../../../frame/methods/filtering/duplicated/index.js';
import { duplicated } from '../../../../../frame/methods/filtering/duplicated/duplicated.js';
import { dropDuplicates } from '../../../../../frame/methods/filtering/duplicated/dropDuplicates.js';
import { duplicatedFast } from '../../../../../frame/methods/filtering/duplicated/duplicatedFast.js';
import { dropDuplicatesFast } from '../../../../../frame/methods/filtering/duplicated/dropDuplicatesFast.js';
import { hashRow } from '../../../../../frame/methods/filtering/duplicated/hashRow.js';

describe('duplicated/index.js', () => {
  test('should export all functions correctly', () => {
    // Check that all expected functions are exported
    expect(duplicatedModule.duplicated).toBeDefined();
    expect(duplicatedModule.dropDuplicates).toBeDefined();
    expect(duplicatedModule.duplicatedFast).toBeDefined();
    expect(duplicatedModule.dropDuplicatesFast).toBeDefined();
    expect(duplicatedModule.hashRow).toBeDefined();

    // Check that exported functions are the correct implementations
    expect(duplicatedModule.duplicated).toBe(duplicated);
    expect(duplicatedModule.dropDuplicates).toBe(dropDuplicates);
    expect(duplicatedModule.duplicatedFast).toBe(duplicatedFast);
    expect(duplicatedModule.dropDuplicatesFast).toBe(dropDuplicatesFast);
    expect(duplicatedModule.hashRow).toBe(hashRow);

    // Check that there are no unexpected exports
    const exportedFunctions = Object.keys(duplicatedModule);
    expect(exportedFunctions).toHaveLength(5);
    expect(exportedFunctions).toContain('duplicated');
    expect(exportedFunctions).toContain('dropDuplicates');
    expect(exportedFunctions).toContain('duplicatedFast');
    expect(exportedFunctions).toContain('dropDuplicatesFast');
    expect(exportedFunctions).toContain('hashRow');
  });
});
