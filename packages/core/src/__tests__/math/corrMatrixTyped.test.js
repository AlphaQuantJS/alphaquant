// alphaquant-core/src/__tests__/math/corrMatrixTyped.test.js
import { jest, describe, it, expect } from '@jest/globals';
import {
  corrMatrixTyped,
  formatMatrixAs2D,
} from '../../math/corrMatrixTyped.js';

describe('corrMatrixTyped module', () => {
  describe('corrMatrixTyped', () => {
    it('calculates correlation matrix for multiple arrays', () => {
      // Создаем тестовые данные: три массива с линейными зависимостями
      const arr1 = new Float64Array([1, 2, 3, 4, 5]); // x
      const arr2 = new Float64Array([10, 20, 30, 40, 50]); // y = 10*x
      const arr3 = new Float64Array([50, 40, 30, 20, 10]); // z = 60-10*x

      const arrays = [arr1, arr2, arr3];
      const labels = ['x', 'y', 'z'];

      const { matrix, labels: resultLabels } = corrMatrixTyped(arrays, labels);

      // Проверяем, что возвращаемые метки совпадают с входными
      expect(resultLabels).toEqual(labels);

      // Преобразуем плоскую матрицу в двумерную для удобства проверки
      const matrixArray = formatMatrixAs2D(matrix, 3);

      // Проверяем диагональные элементы (должны быть 1)
      expect(matrixArray[0][0]).toBeCloseTo(1, 6);
      expect(matrixArray[1][1]).toBeCloseTo(1, 6);
      expect(matrixArray[2][2]).toBeCloseTo(1, 6);

      // Проверяем корреляцию между x и y (должна быть 1, т.к. они линейно зависимы)
      expect(matrixArray[0][1]).toBeCloseTo(1, 6);
      expect(matrixArray[1][0]).toBeCloseTo(1, 6);

      // Проверяем корреляцию между x и z (должна быть -1, т.к. они обратно линейно зависимы)
      expect(matrixArray[0][2]).toBeCloseTo(-1, 6);
      expect(matrixArray[2][0]).toBeCloseTo(-1, 6);

      // Проверяем корреляцию между y и z (должна быть -1, т.к. они обратно линейно зависимы)
      expect(matrixArray[1][2]).toBeCloseTo(-1, 6);
      expect(matrixArray[2][1]).toBeCloseTo(-1, 6);
    });

    it('throws error for arrays with constant values', () => {
      const arr1 = new Float64Array([1, 1, 1]);
      const arr2 = new Float64Array([10, 20, 30]);

      const arrays = [arr1, arr2];
      const labels = ['const', 'var'];

      expect(() => corrMatrixTyped(arrays, labels)).toThrow(
        'Array 0 has constant values, correlation not possible',
      );
    });

    it('throws error when both arrays have constant values', () => {
      const arr1 = new Float64Array([5, 5, 5]);
      const arr2 = new Float64Array([10, 10, 10]);

      const arrays = [arr1, arr2];
      const labels = ['const1', 'const2'];

      expect(() => corrMatrixTyped(arrays, labels)).toThrow(
        'Array 0 has constant values, correlation not possible',
      );
    });

    it('throws error for empty arrays', () => {
      expect(() => corrMatrixTyped([], [])).toThrow(
        'Input must be a non-empty array of arrays',
      );
    });

    it('throws error when arrays have different lengths', () => {
      const arr1 = new Float64Array([1, 2, 3]);
      const arr2 = new Float64Array([10, 20]);

      expect(() => corrMatrixTyped([arr1, arr2], ['x', 'y'])).toThrow(
        'All arrays must have the same length',
      );
    });
  });

  describe('formatMatrixAs2D', () => {
    it('converts flat array to 2D matrix', () => {
      // Плоский массив 3x3 матрицы (в строчном порядке)
      const flatMatrix = new Float64Array([
        1,
        2,
        3, // первая строка
        4,
        5,
        6, // вторая строка
        7,
        8,
        9, // третья строка
      ]);

      const matrix2D = formatMatrixAs2D(flatMatrix, 3);

      expect(matrix2D).toEqual([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ]);
    });

    it('handles 2x2 matrix', () => {
      const flatMatrix = new Float64Array([1, 2, 3, 4]);
      const matrix2D = formatMatrixAs2D(flatMatrix, 2);

      expect(matrix2D).toEqual([
        [1, 2],
        [3, 4],
      ]);
    });
  });
});
