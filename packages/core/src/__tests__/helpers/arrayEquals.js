/**
 * Функция для сравнения массивов, включая типизированные массивы
 * @param {any} a - Первый массив
 * @param {any} b - Второй массив
 * @returns {boolean} - true, если массивы равны
 */
export function arrayEquals(a, b) {
  // Преобразуем массивы в обычные массивы JavaScript
  const arrA = Array.from(a || []);
  const arrB = Array.from(b || []);

  // Проверяем длину
  if (arrA.length !== arrB.length) {
    return false;
  }

  // Проверяем каждый элемент
  for (let i = 0; i < arrA.length; i++) {
    // Специальная обработка для NaN
    if (Number.isNaN(arrA[i]) && Number.isNaN(arrB[i])) {
      continue;
    }

    // Обычное сравнение
    if (arrA[i] !== arrB[i]) {
      return false;
    }
  }

  return true;
}
