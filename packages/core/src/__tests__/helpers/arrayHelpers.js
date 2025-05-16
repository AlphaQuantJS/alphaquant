/**
 * Вспомогательные функции для работы с массивами в тестах
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
 * Проверяет равенство двух массивов с учетом NaN значений
 * @param {any[]} expected - Ожидаемый массив
 * @param {any[]} actual - Фактический массив
 * @returns {boolean} - true, если массивы равны
 */
export function arraysEqual(expected, actual) {
  const expectedArray = toArray(expected);
  const actualArray = toArray(actual);

  if (expectedArray.length !== actualArray.length) {
    return false;
  }

  for (let i = 0; i < expectedArray.length; i++) {
    const expectedValue = expectedArray[i];
    const actualValue = actualArray[i];

    if (Number.isNaN(expectedValue)) {
      if (!Number.isNaN(actualValue)) {
        return false;
      }
    } else if (expectedValue !== actualValue) {
      return false;
    }
  }

  return true;
}
