#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для вывода заголовка
print_header() {
    echo -e "${BLUE}=======================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}=======================================${NC}"
}

# Функция для вывода сообщения об успехе
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Функция для вывода предупреждения
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Функция для вывода ошибки
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Проверяем, что мы находимся в корне пакета core
if [ ! -f "package.json" ]; then
    print_error "Скрипт должен запускаться из корня пакета core"
    exit 1
fi

# Создаем массив с путями к тестам
TEST_FILES=(
    "src/__tests__/math/utilsTyped.test.js"
    "src/__tests__/math/normalizeTyped.test.js"
    "src/__tests__/math/zscoreTyped.test.js"
    "src/__tests__/math/rollingMeanTyped.test.js"
    "src/__tests__/math/corrMatrixTyped.test.js"
    "src/__tests__/Preprocessing.test.js"
    "src/__tests__/StatsUtils.test.js"
    "src/__tests__/AQDataFrame.test.js"
)

# Счетчики для статистики
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Запускаем тесты
print_header "Запуск тестов @alphaquant/core"

for test_file in "${TEST_FILES[@]}"; do
    print_header "Запуск теста: $test_file"
    
    # Запускаем тест с нужными флагами
    node --experimental-vm-modules ../../node_modules/jest/bin/jest.js --testMatch="**/$test_file" --no-cache
    
    # Проверяем результат выполнения
    if [ $? -eq 0 ]; then
        print_success "Тест $test_file успешно пройден"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        print_error "Тест $test_file не пройден"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
done

# Выводим статистику
print_header "Результаты тестирования"
echo "Всего тестов: $TOTAL_TESTS"
echo "Успешно пройдено: $PASSED_TESTS"
echo "Не пройдено: $FAILED_TESTS"

# Запускаем бенчмарки, если все тесты прошли успешно
if [ $FAILED_TESTS -eq 0 ]; then
    print_header "Запуск бенчмарков"
    
    # Проверяем наличие скрипта запуска бенчмарков
    if [ -f "benchmark/run_benchmarks.sh" ]; then
        cd benchmark && ./run_benchmarks.sh
        if [ $? -eq 0 ]; then
            print_success "Бенчмарки успешно выполнены"
        else
            print_error "Ошибка при выполнении бенчмарков"
        fi
    else
        print_warning "Скрипт запуска бенчмарков не найден"
    fi
else
    print_warning "Бенчмарки не запущены из-за ошибок в тестах"
fi

# Выводим общий результат
if [ $FAILED_TESTS -eq 0 ]; then
    print_success "Все тесты успешно пройдены!"
    exit 0
else
    print_error "Некоторые тесты не пройдены"
    exit 1
fi
