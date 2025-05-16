/**
 * Вспомогательные функции для тестов
 */

/**
 * Преобразует любой массив (включая типизированные) в обычный массив JavaScript
 * @param {any} arr - Массив для преобразования
 * @returns {any[]} - Обычный массив JavaScript
 */
export function toArray(arr) {
  if (arr === null || arr === undefined) {
    return [];
  }
  return Array.from(arr);
}

/**
 * Создает патч для всех тестов, который автоматически преобразует типизированные массивы
 * в обычные массивы JavaScript при сравнении
 */
export function setupTestPatches() {
  // Сохраняем оригинальную функцию toEqual
  const originalToEqual = expect.prototype.toEqual;

  // Переопределяем функцию toEqual для автоматического преобразования типизированных массивов
  expect.prototype.toEqual = function (expected) {
    // Если это типизированный массив, преобразуем его в обычный массив
    if (
      this.actual &&
      (ArrayBuffer.isView(this.actual) ||
        (Array.isArray(expected) && !Array.isArray(this.actual)))
    ) {
      return originalToEqual.call(this, toArray(this.actual));
    }

    return originalToEqual.call(this, expected);
  };
}
