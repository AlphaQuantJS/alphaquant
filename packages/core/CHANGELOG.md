# @alphaquant/core - CHANGELOG

## 1.0.0 (unreleased)

### 🚀 Features

- Implemented `AQDataFrame` factory-based API
- Added preprocessing functions: `normalize`, `zscore`, `dropNaN`, `resample`
- Added statistical functions: `mean`, `std`, `rollingMean`, `corrMatrix`
- Functional, modular architecture with memory-efficient optimizations
- Full test coverage for `StatsUtils` and `Preprocessing`

### ⚡️ Performance

- Single-pass computation for mean/std
- Early exit on validation failures
- Preallocated arrays and avoidance of closures for large loops

### 🐛 Исправления (22.04.2025)

- Исправлены тесты для методов предобработки данных в `AQDataFrame`
- Улучшена обработка `null` и `NaN` значений в `dropNaN` и `fillNaN`
- Добавлены тесты для функционального заполнения пропусков через `transformColumn`
- Оптимизирована обработка пропущенных значений в `TinyFrame`

### 🔄 Реорганизация (22.04.2025)

- Проведена полная реорганизация структуры модулей по принципу "одна функция - один файл"
- Созданы отдельные модули для всех функций агрегации (`sum`, `mean`, `std`, `count`, `first`, `last`, `median`, `mode`, `min`, `max`)
- Разделены функции фильтрации (`dropNaN`, `fillNaN`) и работы с дубликатами (`duplicated`, `dropDuplicates`)
- Реорганизованы функции описательной статистики (`describe`), выборки данных (`sample`) и сортировки (`sort`)
- Добавлены индексные файлы для удобного импорта функций из каждого модуля
- Улучшена модульность и тестируемость кода
- Оптимизирована структура для будущих расширений и оптимизаций
