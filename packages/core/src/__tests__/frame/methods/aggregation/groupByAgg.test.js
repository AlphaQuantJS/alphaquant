/**
 * Tests for group/groupByAgg.js
 */

import { createFrame } from '../../../../frame/createFrame.js';
import { groupByAgg } from '../../../../frame/methods/aggregation/groupByAgg.js';

describe('groupByAgg', () => {
  test('должен группировать данные по одной колонке и применять агрегацию', () => {
    const frame = createFrame({
      category: ['A', 'B', 'A', 'B', 'A'],
      value: [10, 20, 30, 40, 50],
    });

    // Группировка по category, агрегация sum для value
    const result = groupByAgg(frame, ['category'], { value: 'sum' });

    // Проверяем результат
    expect(result.rowCount).toBe(2); // Две уникальные категории: A и B

    // Проверяем наличие колонок
    expect(result.columns.category).toBeDefined();
    expect(result.columns.value).toBeDefined();

    // Находим индексы для каждой категории
    let indexA = -1;
    let indexB = -1;

    for (let i = 0; i < result.rowCount; i++) {
      if (result.columns.category[i] === 'A') indexA = i;
      if (result.columns.category[i] === 'B') indexB = i;
    }

    // Проверяем, что категории найдены
    expect(indexA).not.toBe(-1);
    expect(indexB).not.toBe(-1);

    // Проверяем агрегированные значения
    expect(result.columns.value[indexA]).toBe(90); // 10 + 30 + 50 = 90
    expect(result.columns.value[indexB]).toBe(60); // 20 + 40 = 60
  });

  test('должен группировать данные по нескольким колонкам', () => {
    const frame = createFrame({
      category: ['A', 'A', 'B', 'B', 'A'],
      subcategory: ['X', 'Y', 'X', 'Y', 'X'],
      value: [10, 20, 30, 40, 50],
    });

    // Группировка по category и subcategory, агрегация sum для value
    const result = groupByAgg(frame, ['category', 'subcategory'], {
      value: 'sum',
    });

    // Проверяем результат
    expect(result.rowCount).toBe(4); // Четыре уникальные комбинации: A-X, A-Y, B-X, B-Y

    // Проверяем наличие колонок
    expect(result.columns.category).toBeDefined();
    expect(result.columns.subcategory).toBeDefined();
    expect(result.columns.value).toBeDefined();

    // Находим индексы для каждой комбинации
    let indexAX = -1;
    let indexAY = -1;
    let indexBX = -1;
    let indexBY = -1;

    for (let i = 0; i < result.rowCount; i++) {
      const cat = result.columns.category[i];
      const subcat = result.columns.subcategory[i];

      if (cat === 'A' && subcat === 'X') indexAX = i;
      if (cat === 'A' && subcat === 'Y') indexAY = i;
      if (cat === 'B' && subcat === 'X') indexBX = i;
      if (cat === 'B' && subcat === 'Y') indexBY = i;
    }

    // Проверяем, что все комбинации найдены
    expect(indexAX).not.toBe(-1);
    expect(indexAY).not.toBe(-1);
    expect(indexBX).not.toBe(-1);
    expect(indexBY).not.toBe(-1);

    // Проверяем агрегированные значения
    expect(result.columns.value[indexAX]).toBe(60); // 10 + 50 = 60
    expect(result.columns.value[indexAY]).toBe(20); // 20
    expect(result.columns.value[indexBX]).toBe(30); // 30
    expect(result.columns.value[indexBY]).toBe(40); // 40
  });

  test('должен применять разные агрегации к разным колонкам', () => {
    const frame = createFrame({
      category: ['A', 'B', 'A', 'B', 'A'],
      value1: [10, 20, 30, 40, 50],
      value2: [1, 2, 3, 4, 5],
    });

    // Группировка по category, разные агрегации для разных колонок
    const result = groupByAgg(frame, ['category'], {
      sum1: { column: 'value1', aggType: 'sum' },
      mean2: { column: 'value2', aggType: 'mean' },
    });

    // Проверяем результат
    expect(result.rowCount).toBe(2); // Две уникальные категории: A и B

    // Проверяем наличие колонок
    expect(result.columns.category).toBeDefined();
    expect(result.columns.sum1).toBeDefined();
    expect(result.columns.mean2).toBeDefined();

    // Находим индексы для каждой категории
    let indexA = -1;
    let indexB = -1;

    for (let i = 0; i < result.rowCount; i++) {
      if (result.columns.category[i] === 'A') indexA = i;
      if (result.columns.category[i] === 'B') indexB = i;
    }

    // Проверяем, что категории найдены
    expect(indexA).not.toBe(-1);
    expect(indexB).not.toBe(-1);

    // Проверяем агрегированные значения
    expect(result.columns.sum1[indexA]).toBe(90); // 10 + 30 + 50 = 90
    expect(result.columns.sum1[indexB]).toBe(60); // 20 + 40 = 60
    expect(result.columns.mean2[indexA]).toBe(3); // (1 + 3 + 5) / 3 = 3
    expect(result.columns.mean2[indexB]).toBe(3); // (2 + 4) / 2 = 3
  });

  test('должен поддерживать пользовательские функции агрегации', () => {
    const frame = createFrame({
      category: ['A', 'B', 'A', 'B', 'A'],
      value: [10, 20, 30, 40, 50],
    });

    // Пользовательская функция агрегации: произведение
    function product(values) {
      return values.reduce((acc, val) => acc * val, 1);
    }

    // Группировка по category, пользовательская агрегация
    const result = groupByAgg(frame, ['category'], {
      product: { column: 'value', aggType: product },
    });

    // Проверяем результат
    expect(result.rowCount).toBe(2); // Две уникальные категории: A и B

    // Проверяем наличие колонок
    expect(result.columns.category).toBeDefined();
    expect(result.columns.product).toBeDefined();

    // Находим индексы для каждой категории
    let indexA = -1;
    let indexB = -1;

    for (let i = 0; i < result.rowCount; i++) {
      if (result.columns.category[i] === 'A') indexA = i;
      if (result.columns.category[i] === 'B') indexB = i;
    }

    // Проверяем, что категории найдены
    expect(indexA).not.toBe(-1);
    expect(indexB).not.toBe(-1);

    // Проверяем агрегированные значения
    expect(result.columns.product[indexA]).toBe(15000); // 10 * 30 * 50 = 15000
    expect(result.columns.product[indexB]).toBe(800); // 20 * 40 = 800
  });

  test('должен корректно обрабатывать пустой фрейм', () => {
    const emptyFrame = createFrame({
      category: [],
      value: [],
    });

    // Группировка по category, агрегация sum для value
    const result = groupByAgg(emptyFrame, ['category'], { value: 'sum' });

    // Проверяем результат
    expect(result.rowCount).toBe(0); // Нет групп
    expect(result.columns.category.length).toBe(0);
    expect(result.columns.value.length).toBe(0);
  });

  test('должен выбрасывать ошибку для некорректного фрейма', () => {
    // Тестируем только с null, так как другие некорректные фреймы могут вызывать ошибки TypeScript
    expect(() => groupByAgg(null, ['category'], { value: 'sum' })).toThrow();
  });

  test('должен выбрасывать ошибку для некорректных групповых колонок', () => {
    const frame = createFrame({
      category: ['A', 'B', 'A', 'B', 'A'],
      value: [10, 20, 30, 40, 50],
    });

    expect(() => groupByAgg(frame, [], { value: 'sum' })).toThrow();
    expect(() =>
      groupByAgg(frame, ['nonexistent'], { value: 'sum' }),
    ).toThrow();
  });

  test('должен выбрасывать ошибку для некорректных агрегаций', () => {
    const frame = createFrame({
      category: ['A', 'B', 'A', 'B', 'A'],
      value: [10, 20, 30, 40, 50],
    });

    expect(() => groupByAgg(frame, ['category'], {})).toThrow();
    // Используем строковый литерал для агрегации
    expect(() =>
      groupByAgg(frame, ['category'], { value: 'sum' }),
    ).not.toThrow();
    expect(() =>
      groupByAgg(frame, ['category'], { nonexistent: 'sum' }),
    ).toThrow();
  });
});
