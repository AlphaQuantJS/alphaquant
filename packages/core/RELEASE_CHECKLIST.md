## ✅ RELEASE CHECKLIST for `@alphaquant/core@1.0.0`

### 🔹 1. Финализация оптимизаций (core/math)

| Задача                                        | Статус         | Примечание                 |
| --------------------------------------------- | -------------- | -------------------------- |
| `normalizeTyped.js`                           | ✅ done        | ✔️ уже в `core/math/`      |
| `zscoreTyped.js`                              | ✅ done        | ✔️ использует Float64Array |
| `rollingMeanTyped.js`                         | ⚙️ in progress | 🔥 приоритет №1            |
| `corrMatrixTyped.js`                          | ⚙️ in progress | есть рабочая версия        |
| Подключение typed-версий к `Preprocessing.js` | 🔲 pending     | через fallback API         |
| Подключение typed-версий в `StatsUtils.js`    | 🔲 pending     | через fallback API         |
| Unit-тесты для всех `typed` функций           | 🔲 pending     | включая edge cases         |
| Perf guard (test fails if >300ms)             | 🔲 pending     | добавить в `perf.test.js`  |

---

### 🔹 2. Финализация функционала DataFrame API

| Метод                     | Статус             | Примечание                           |
| ------------------------- | ------------------ | ------------------------------------ | -------- |
| `isin()`                  | 🔲 not implemented | быстро реализуется через `Set.has()` |
| `rank()`                  | 🔲 not implemented | требуется сортировка + индексация    |
| `query()`                 | 🔲 not implemented | нужна минимальная реализация парсера |
| `fillNaN(method='ffill')` | 🔲 not implemented | поддержать `method: 'ffill'          | 'bfill'` |
| `clip()`                  | 🔲 not implemented | ограничение значений по min/max      |
| `drop_duplicates()`       | 🔲 not implemented | через `Set` + сериализация строки    |
| `sample()`                | 🔲 not implemented | можно на основе `Math.random()`      |

---

### 🔹 3. Документация и devtools

| Задача                                               | Статус      | Комментарий                               |
| ---------------------------------------------------- | ----------- | ----------------------------------------- |
| 📄 Обновить `README.md`                              | ✅ done     | уже отражает текущее состояние            |
| 🧪 Добавить `benchmark.js` (сравнение typed/vanilla) | ✅ done     | ✔️ запуск из CLI                          |
| 📉 Добавить `benchmark.visual.js`                    | 🔲 planned  | ASCII-чарты по времени/памяти             |
| 🧠 `profile.memory.js`                               | 🔲 optional | heap snapshot через v8-profiler           |
| 🗺️ Создать `ROADMAP.md`                              | 🔲 pending  | включить краткосрочные/среднесрочные цели |
| 📚 Сгенерировать JSDoc / Markdown API-документацию   | 🔲 optional | `npm run docs` через `jsdoc2md`           |

---

### 🔹 4. CI/CD и versioning

| Задача                                      | Статус     | Примечание                                   |
| ------------------------------------------- | ---------- | -------------------------------------------- |
| Создать changelog (v1.0.0)                  | 🔲 planned | через `auto-changelog` или вручную           |
| Настроить `turbo run test/lint/build`       | ✅ done    | команда работает в монорепо                  |
| Commit: `feat(core): release v1.0.0 stable` | 🔲 pending | сгенерировать на основе Conventional Commits |
| Tag: `v1.0.0`                               | 🔲 pending | git tag + publish                            |
| Publish to npm                              | 🔲 pending | `npm publish --access public`                |

---

## 📈 Результат после релиза

После выполнения всех пунктов:

- У тебя будет стабильный, модульный, протестированный и оптимизированный пакет `@alphaquant/core@1.0.0`
- Возможность сравнивать его с pandas через CLI
- Готовая почва для будущих фич и performance-гарантий
- Ясный roadmap для 1.1.0+ с возможностью внедрения WebAssembly, WebGPU и др.
