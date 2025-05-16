/**
 * Unit tests for createFrame.js
 */

import {
  createFrame,
  getColumn,
  validateColumn,
} from '../../frame/createFrame.js';

describe('createFrame', () => {
  test('should create a frame from object data', () => {
    const data = {
      a: [1, 2, 3],
      b: ['a', 'b', 'c'],
    };

    const frame = createFrame(data);

    expect(frame.rowCount).toBe(3);
    expect(Object.keys(frame.columns)).toEqual(['a', 'b']);
    expect(frame.columns.a instanceof Float64Array).toBe(true);
    expect(Array.from(frame.columns.a)).toEqual([1, 2, 3]);
    expect(frame.columns.b).toEqual(['a', 'b', 'c']);
  });

  test('should create a frame from array of objects', () => {
    const data = [
      { a: 1, b: 'a' },
      { a: 2, b: 'b' },
      { a: 3, b: 'c' },
    ];

    const frame = createFrame(data);

    expect(frame.rowCount).toBe(3);
    expect(Object.keys(frame.columns)).toEqual(['a', 'b']);
    expect(frame.columns.a instanceof Float64Array).toBe(true);
    expect(Array.from(frame.columns.a)).toEqual([1, 2, 3]);
    expect(frame.columns.b).toEqual(['a', 'b', 'c']);
  });

  test('should create a frame from another frame', () => {
    const data = {
      a: [1, 2, 3],
      b: ['a', 'b', 'c'],
    };

    const frame1 = createFrame(data);
    const frame2 = createFrame(frame1);

    expect(frame2.rowCount).toBe(3);
    expect(Object.keys(frame2.columns)).toEqual(['a', 'b']);
    expect(frame2.columns.a instanceof Float64Array).toBe(true);
    expect(Array.from(frame2.columns.a)).toEqual([1, 2, 3]);
    expect(frame2.columns.b).toEqual(['a', 'b', 'c']);

    // Проверяем, что это копия, а не ссылка
    frame1.columns.a[0] = 100;
    expect(frame2.columns.a[0]).toBe(1);
  });

  test('should handle empty data', () => {
    const data = {};

    const frame = createFrame(data);

    expect(frame.rowCount).toBe(0);
    expect(Object.keys(frame.columns)).toEqual([]);
  });

  test('should throw error for invalid data', () => {
    expect(() => createFrame(null)).toThrow(
      'Input data cannot be null or undefined',
    );
    expect(() => createFrame(undefined)).toThrow(
      'Input data cannot be null or undefined',
    );
  });

  test('should detect numeric columns and use TypedArrays', () => {
    const data = {
      a: [1, 2, 3],
      b: [4, 5, 6],
      c: ['a', 'b', 'c'],
    };

    const frame = createFrame(data);

    expect(frame.columns.a instanceof Float64Array).toBe(true);
    expect(frame.columns.b instanceof Float64Array).toBe(true);
    expect(Array.isArray(frame.columns.c)).toBe(true);
  });

  test('should not use TypedArrays when disabled', () => {
    const data = {
      a: [1, 2, 3],
      b: [4, 5, 6],
    };

    const frame = createFrame(data, { useTypedArrays: false });

    expect(Array.isArray(frame.columns.a)).toBe(true);
    expect(Array.isArray(frame.columns.b)).toBe(true);
  });

  test('should handle mixed types in columns', () => {
    const data = {
      a: [1, 'string', 3],
      b: [4, 5, null],
    };

    const frame = createFrame(data, { useTypedArrays: false });

    expect(Array.isArray(frame.columns.a)).toBe(true);
    expect(frame.columns.a).toEqual([1, 'string', 3]);
    expect(Array.isArray(frame.columns.b)).toBe(true);
    expect(frame.columns.b).toEqual([4, 5, null]);
  });

  test('should handle NaN values in numeric columns', () => {
    const data = {
      a: [1, NaN, 3],
      b: [4, 5, NaN],
    };

    const frame = createFrame(data);

    expect(frame.columns.a instanceof Float64Array).toBe(true);
    expect(isNaN(frame.columns.a[1])).toBe(true);
    expect(frame.columns.a[2]).toBe(3);

    expect(frame.columns.b instanceof Float64Array).toBe(true);
    expect(frame.columns.b[1]).toBe(5);
    expect(isNaN(frame.columns.b[2])).toBe(true);
  });

  test('should handle null and undefined values in numeric columns', () => {
    const data = {
      a: [1, null, 3],
      b: [4, undefined, 6],
    };

    const frame = createFrame(data, { useTypedArrays: true });

    expect(frame.columns.a instanceof Float64Array).toBe(true);
    // null сохраняется как 0 для совместимости с другими функциями
    expect(frame.columns.a[1]).toBe(0);
    expect(frame.columns.a[2]).toBe(3);

    expect(frame.columns.b instanceof Float64Array).toBe(true);
    // undefined преобразуется в NaN
    expect(isNaN(frame.columns.b[1])).toBe(true);
    expect(frame.columns.b[2]).toBe(6);
  });
});

describe('getColumn', () => {
  test('should return column data', () => {
    const data = {
      a: [1, 2, 3],
      b: ['a', 'b', 'c'],
    };

    const frame = createFrame(data);

    expect(getColumn(frame, 'a')).toEqual(frame.columns.a);
    expect(getColumn(frame, 'b')).toEqual(frame.columns.b);
  });

  test('should throw error for non-existent column', () => {
    const data = {
      a: [1, 2, 3],
    };

    const frame = createFrame(data);

    expect(() => getColumn(frame, 'b')).toThrow("Column 'b' not found");
  });
});

describe('validateColumn', () => {
  test('should not throw for valid column', () => {
    const data = {
      a: [1, 2, 3],
      b: ['a', 'b', 'c'],
    };

    const frame = createFrame(data);

    expect(() => validateColumn(frame, 'a')).not.toThrow();
    expect(() => validateColumn(frame, 'b')).not.toThrow();
  });

  test('should throw for non-existent column', () => {
    const data = {
      a: [1, 2, 3],
    };

    const frame = createFrame(data);

    expect(() => validateColumn(frame, 'b')).toThrow("Column 'b' not found");
  });
});
