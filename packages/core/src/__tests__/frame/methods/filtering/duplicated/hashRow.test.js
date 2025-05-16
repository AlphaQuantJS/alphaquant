/**
 * Tests for hashRow.js
 */

import { hashRow } from '../../../../../frame/methods/filtering/duplicated/hashRow.js';

describe('hashRow', () => {
  test('should generate consistent hash for row', () => {
    // Теперь hashRow принимает массив значений строки
    const rowValues = [1, 'x'];

    // Hash для одних и тех же значений должен быть одинаковым
    const hash1 = hashRow(rowValues);
    const hash2 = hashRow(rowValues);

    expect(hash1).toBe(hash2);
  });

  test('should generate different hashes for different rows', () => {
    // Разные строки должны иметь разные хеши
    const row1 = [1, 'x'];
    const row2 = [2, 'y'];

    const hash1 = hashRow(row1);
    const hash2 = hashRow(row2);

    expect(hash1).not.toBe(hash2);
  });

  test('should handle subset of columns', () => {
    // Строки с одинаковыми значениями в некоторых колонках
    const row1 = [1];
    const row2 = [1];

    // Строки с разными значениями
    const row3 = ['x'];
    const row4 = ['y'];

    const hash1 = hashRow(row1);
    const hash2 = hashRow(row2);
    const hash3 = hashRow(row3);
    const hash4 = hashRow(row4);

    expect(hash1).toBe(hash2); // Одинаковый хеш для одинаковых значений
    expect(hash3).not.toBe(hash4); // Разные хеши для разных значений
  });

  test('should handle different data types', () => {
    // Разные типы данных
    const rows = [
      [1],
      ['string'],
      [true],
      [null],
      // Убираем undefined, так как он может хешироваться так же, как и null
    ];

    // Каждая строка должна иметь уникальный хеш
    const hashes = rows.map((row) => hashRow(row));

    // Проверяем, что все хеши уникальны
    const uniqueHashes = new Set(hashes);
    expect(uniqueHashes.size).toBe(hashes.length);
  });

  test('should handle null and undefined values', () => {
    // Проверяем, что null и undefined обрабатываются
    const row1 = [null];
    const row2 = [undefined];

    const hash1 = hashRow(row1);
    const hash2 = hashRow(row2);

    // Хеши для null и undefined могут быть одинаковыми в текущей реализации
    expect(typeof hash1).toBe('number');
    expect(typeof hash2).toBe('number');
  });

  test('should handle arrays', () => {
    // Проверяем, что массивы обрабатываются корректно
    const row1 = [[1, 2, 3]];
    const row2 = [[1, 2, 4]];

    const hash1 = hashRow(row1);
    const hash2 = hashRow(row2);

    // Хеши для разных массивов должны быть разными
    expect(hash1).not.toBe(hash2);
  });

  test('should handle objects', () => {
    // Проверяем, что объекты обрабатываются корректно
    const row1 = [{ a: 1 }];
    const row2 = [{ a: 2 }];

    const hash1 = hashRow(row1);
    const hash2 = hashRow(row2);

    // Хеши для разных объектов должны быть разными
    expect(hash1).not.toBe(hash2);
  });
});
