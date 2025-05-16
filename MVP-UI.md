Отлично, возвращаемся к **полной архитектуре AlphaQuant как фреймворка**. Сейчас у тебя уже:

- ✅ Готова база `tinyframe-core` (аналог Pandas на JS)
- ✅ Есть концепт `TableDisplay` (визуализация данных, вдохновлённая Tabulator/AG Grid)
- ✅ Структурирован plan по UX/UI (RStudio-подобный playground)
- ✅ Принято решение отказаться от Turborepo → раздельные пакеты

Теперь разложим **всю архитектуру AlphaQuant как фреймворка** — по слоям и возможностям.

---

# 🧠 Архитектура фреймворка **AlphaQuant**

---

## 1. **Структура пакетов (модули)**

| Пакет                        | Назначение                                               | Аналог в Python                |
| ---------------------------- | -------------------------------------------------------- | ------------------------------ |
| `tinyframe-core`             | Табличные структуры, трансформации, агрегаты             | `pandas`                       |
| `tinyframe-ta`               | RSI, EMA, SMA, Bollinger, MACD и др. индикаторы          | `ta-lib`, `pandas-ta`          |
| `tinyframe-strategy`         | Стратегии: классы, шаблоны, сигналы                      | `zipline`, `bt`                |
| `tinyframe-backtest`         | Бэктест-движок, торговые симуляции, ордера, позиции      | `backtrader`, `backtesting.py` |
| `tinyframe-display`          | Модуль визуализации (таблицы, графики, консоль)          | `pyviz`, `plotly`, `tabulator` |
| `alphaquant` (glue layer)    | Финальный сборщик API: объединяет всё в единый интерфейс | весь `quantlib`                |
| `alphaquant-ui` (playground) | Веб-интерфейс, визуальный REPL, editor, графики          | Jupyter, RStudio               |

---

## 2. **Ключевые возможности AlphaQuant (MVP)**

| Категория               | Возможность                                                   | Где реализуется                    |
| ----------------------- | ------------------------------------------------------------- | ---------------------------------- |
| 📊 Работа с данными     | Загрузка, фильтрация, агрегация, трансформации (chain API)    | `tinyframe-core`                   |
| 📈 Индикаторы           | RSI, EMA, SMA, MACD, Bollinger Bands и пр.                    | `tinyframe-ta`                     |
| 📐 Построение стратегий | API для `onBar()`, `generateSignal()`, шаблоны стратегий      | `tinyframe-strategy`               |
| 🔁 Бэктест              | OHLCV симуляция, управление капиталом, сделки, метрики        | `tinyframe-backtest`               |
| 📈 Графики              | Equity curve, drawdown, price chart, overlay индикаторов      | `tinyframe-display` + `Plotly/TV`  |
| 📋 Таблицы              | Просмотр датафреймов, сделок, логов                           | `tinyframe-display` + TableDisplay |
| 🖥 Интерфейс            | Playground: редактор кода + вывод результатов (RStudio-style) | `alphaquant-ui`                    |
| 📤 Экспорт              | CSV/PDF/HTML экспорт таблиц и графиков                        | `tinyframe-display` (ExportModule) |
| 🧠 API интеграция       | Вызов функций `plot()`, `view()`, `display()`, `export()`     | `alphaquant` (glue layer)          |

---

## 3. **Как пользователь будет работать с AlphaQuant**

```js
import { DataFrame } from 'alphaquant';
import { RSI } from 'alphaquant';

const df = new DataFrame(data); // загружаем OHLCV
const rsi = RSI(df, 14);

class MyStrategy {
  onBar(bar) {
    return bar.rsi < 30 ? 'buy' : 'hold';
  }
}

const engine = new BacktestEngine(MyStrategy, df);
const results = engine.run();

results.equityCurve.show(); // график
results.trades.show(); // таблица
results.metrics.show(); // метрики
```

---

## 4. **Фронтенд-интерфейс (`alphaquant-ui`)**

В веб-интерфейсе ты получаешь:

- Monaco Editor + Run Button
- Вкладки: Console, Plots, Data Viewer
- Поддержку горячих клавиш, экспорта, кастомных визуализаций
- Потенциально: live execution, streaming data, hook API

---

## 5. **Философия**

| Принцип                    | Реализация в AlphaQuant                                                 |
| -------------------------- | ----------------------------------------------------------------------- |
| 📦 Модульность             | Каждый пакет независим, можно подключать выборочно                      |
| 🧱 Layered architecture    | Core → TA → Strategy → Backtest → Display → UI                          |
| 🧪 Интероперабельность     | Все модули возвращают plain объекты, нет скрытых зависимостей           |
| 🔐 Безопасность исполнения | Код запускается в sandbox (`eval5` или WebWorker)                       |
| 🧰 Расширяемость           | Поддержка custom renderers, методов, стратегий                          |
| 📈 Производительность      | TypedArrays, виртуализация, lazy-loading                                |
| 👥 Открытость и гибкость   | MIT-совместимый open-source, адаптируемость под корпоративные use-cases |

---

## 6. Что дальше?

Если хочешь — я могу:

- 📁 Сформировать скелет `alphaquant` (glue-layer): index.js, экспорты, прокси к `display()`
- 🧪 Подготовить `alphaquant-ui` (Next.js + Monaco + Display)
- 📦 Подключить текущие tinyframe-\* модули как зависимости
- 🔧 Создать install-ready `alphaquant` для npm

Хочешь — начну с `alphaquant` фреймворка и glue-слоя?
