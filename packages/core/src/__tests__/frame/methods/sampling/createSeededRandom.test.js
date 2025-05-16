/**
 * Tests for createSeededRandom.js
 */

import { createSeededRandom } from '../../../../frame/methods/sampling/createSeededRandom.js';

describe('createSeededRandom', () => {
  test('должен создавать детерминированную последовательность с заданным seed', () => {
    const random1 = createSeededRandom(42);
    const random2 = createSeededRandom(42);

    // Генерируем несколько случайных чисел и проверяем, что они идентичны
    const values1 = [];
    const values2 = [];

    for (let i = 0; i < 10; i++) {
      values1.push(random1());
      values2.push(random2());
    }

    expect(values1).toEqual(values2);
  });

  test('должен создавать разные последовательности с разными seed', () => {
    const random1 = createSeededRandom(42);
    const random2 = createSeededRandom(43);

    // Генерируем несколько случайных чисел
    const values1 = [];
    const values2 = [];

    for (let i = 0; i < 10; i++) {
      values1.push(random1());
      values2.push(random2());
    }

    // Проверяем, что последовательности отличаются
    expect(values1).not.toEqual(values2);
  });

  test('должен создавать числа в диапазоне [0, 1)', () => {
    const random = createSeededRandom(42);

    // Генерируем 100 случайных чисел и проверяем, что они все в диапазоне [0, 1)
    for (let i = 0; i < 100; i++) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  test('должен работать без заданного seed', () => {
    const random = createSeededRandom();

    // Проверяем, что функция работает и возвращает числа в правильном диапазоне
    for (let i = 0; i < 10; i++) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  test('должен работать с различными типами seed', () => {
    // Проверяем, что функция работает с разными типами seed
    const randomString = createSeededRandom('string-seed');
    const randomFloat = createSeededRandom(3.14);
    const randomBool = createSeededRandom(true);

    // Проверяем, что все функции возвращают числа в правильном диапазоне
    expect(randomString()).toBeGreaterThanOrEqual(0);
    expect(randomString()).toBeLessThan(1);

    expect(randomFloat()).toBeGreaterThanOrEqual(0);
    expect(randomFloat()).toBeLessThan(1);

    expect(randomBool()).toBeGreaterThanOrEqual(0);
    expect(randomBool()).toBeLessThan(1);
  });
});
