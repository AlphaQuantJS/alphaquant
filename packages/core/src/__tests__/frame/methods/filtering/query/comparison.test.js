/**
 * comparison.test.js - Tests for comparison filtering functions
 */

import {
  filterEqual,
  filterNotEqual,
  filterGreater,
  filterGreaterEqual,
  filterLess,
  filterLessEqual,
  filterBetween,
} from '../../../../../frame/methods/filtering/query/comparison.js';
import { createFrame } from '../../../../../frame/createFrame.js';
import { arrayEquals } from '../../../../helpers/arrayEquals.js';

describe('Comparison Filters', () => {
  // Setup test frame
  const testFrame = createFrame({
    id: [1, 2, 3, 4, 5],
    value: [10, 20, 30, 40, 50],
    name: ['apple', 'banana', 'cherry', 'date', 'elderberry'],
  });

  describe('filterEqual', () => {
    test('should filter rows where column value equals the specified value', () => {
      const result = filterEqual(testFrame, 'value', 30);

      expect(result.rowCount).toBe(1);
      expect(arrayEquals(result.columns.id, [3])).toBe(true);
      expect(arrayEquals(result.columns.value, [30])).toBe(true);
      expect(arrayEquals(result.columns.name, ['cherry'])).toBe(true);
    });

    test('should handle string values', () => {
      const result = filterEqual(testFrame, 'name', 'banana');

      expect(result.rowCount).toBe(1);
      expect(arrayEquals(result.columns.id, [2])).toBe(true);
      expect(arrayEquals(result.columns.value, [20])).toBe(true);
      expect(arrayEquals(result.columns.name, ['banana'])).toBe(true);
    });

    test('should return empty frame when no matches', () => {
      const result = filterEqual(testFrame, 'value', 100);

      expect(result.rowCount).toBe(0);
      expect(arrayEquals(result.columns.value, [])).toBe(true);
    });
  });

  describe('filterNotEqual', () => {
    test('should filter rows where column value does not equal the specified value', () => {
      const result = filterNotEqual(testFrame, 'value', 30);

      expect(result.rowCount).toBe(4);
      expect(arrayEquals(result.columns.value, [10, 20, 40, 50])).toBe(true);
    });

    test('should handle string values', () => {
      const result = filterNotEqual(testFrame, 'name', 'banana');

      expect(result.rowCount).toBe(4);
      expect(
        arrayEquals(result.columns.name, [
          'apple',
          'cherry',
          'date',
          'elderberry',
        ]),
      ).toBe(true);
    });

    test('should return all rows when no matches', () => {
      const result = filterNotEqual(testFrame, 'value', 100);

      expect(result.rowCount).toBe(5);
      expect(arrayEquals(result.columns.value, [10, 20, 30, 40, 50])).toBe(
        true,
      );
    });
  });

  describe('filterGreater', () => {
    test('should filter rows where column value is greater than the specified value', () => {
      const result = filterGreater(testFrame, 'value', 30);

      expect(result.rowCount).toBe(2);
      expect(arrayEquals(result.columns.value, [40, 50])).toBe(true);
    });

    test('should handle string values', () => {
      const result = filterGreater(testFrame, 'name', 'cherry');

      expect(result.rowCount).toBe(2);
      expect(arrayEquals(result.columns.name, ['date', 'elderberry'])).toBe(
        true,
      );
    });

    test('should return empty frame when no matches', () => {
      const result = filterGreater(testFrame, 'value', 100);

      expect(result.rowCount).toBe(0);
      expect(arrayEquals(result.columns.value, [])).toBe(true);
    });
  });

  describe('filterGreaterEqual', () => {
    test('should filter rows where column value is greater than or equal to the specified value', () => {
      const result = filterGreaterEqual(testFrame, 'value', 30);

      expect(result.rowCount).toBe(3);
      expect(arrayEquals(result.columns.value, [30, 40, 50])).toBe(true);
    });

    test('should handle string values', () => {
      const result = filterGreaterEqual(testFrame, 'name', 'cherry');

      expect(result.rowCount).toBe(3);
      expect(
        arrayEquals(result.columns.name, ['cherry', 'date', 'elderberry']),
      ).toBe(true);
    });

    test('should return empty frame when no matches', () => {
      const result = filterGreaterEqual(testFrame, 'value', 100);

      expect(result.rowCount).toBe(0);
      expect(arrayEquals(result.columns.value, [])).toBe(true);
    });
  });

  describe('filterLess', () => {
    test('should filter rows where column value is less than the specified value', () => {
      const result = filterLess(testFrame, 'value', 30);

      expect(result.rowCount).toBe(2);
      expect(arrayEquals(result.columns.value, [10, 20])).toBe(true);
    });

    test('should handle string values', () => {
      const result = filterLess(testFrame, 'name', 'cherry');

      expect(result.rowCount).toBe(2);
      expect(arrayEquals(result.columns.name, ['apple', 'banana'])).toBe(true);
    });

    test('should return empty frame when no matches', () => {
      const result = filterLess(testFrame, 'value', 0);

      expect(result.rowCount).toBe(0);
      expect(arrayEquals(result.columns.value, [])).toBe(true);
    });
  });

  describe('filterLessEqual', () => {
    test('should filter rows where column value is less than or equal to the specified value', () => {
      const result = filterLessEqual(testFrame, 'value', 30);

      expect(result.rowCount).toBe(3);
      expect(arrayEquals(result.columns.value, [10, 20, 30])).toBe(true);
    });

    test('should handle string values', () => {
      const result = filterLessEqual(testFrame, 'name', 'cherry');

      expect(result.rowCount).toBe(3);
      expect(
        arrayEquals(result.columns.name, ['apple', 'banana', 'cherry']),
      ).toBe(true);
    });

    test('should return empty frame when no matches', () => {
      const result = filterLessEqual(testFrame, 'value', 0);

      expect(result.rowCount).toBe(0);
      expect(arrayEquals(result.columns.value, [])).toBe(true);
    });
  });

  describe('filterBetween', () => {
    test('should filter rows where column value is between lower and upper bounds', () => {
      const result = filterBetween(testFrame, 'value', 20, 40);

      expect(result.rowCount).toBe(3);
      expect(arrayEquals(result.columns.id, [2, 3, 4])).toBe(true);
    });

    test('should include both lower and upper bounds', () => {
      const result = filterBetween(testFrame, 'value', 20, 40);

      expect(result.rowCount).toBe(3);
      expect(arrayEquals(result.columns.id, [2, 3, 4])).toBe(true);
    });

    test('should return empty frame when no matches', () => {
      const result = filterBetween(testFrame, 'value', 100, 200);

      expect(result.rowCount).toBe(0);
      expect(arrayEquals(result.columns.value, [])).toBe(true);
    });
  });
});
