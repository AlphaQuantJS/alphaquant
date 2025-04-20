# 🧠 @alphaquant/core

`@alphaquant/core` is a high-performance module for tabular data processing, numerical transformation, and statistical operations within the [AlphaQuantJS](https://github.com/alphaquant) platform.

Built on top of [data-forge](https://github.com/data-forge/data-forge-ts), it's optimized for working with financial time series and large-scale datasets.

---

## 📦 Features

### ✅ Core Functionality

- `AQDataFrame` — chainable functional wrapper over DataFrame
- Pure ESM, zero-dependency runtime
- Fully covered by Jest unit tests

### 🧪 Preprocessing

- `dropNaN()` — remove rows with missing values
- `normalize()` — scale values to `[0, 1]`
- `zscore()` — standard score transformation
- `resample()` — date-based aggregation
- `rollingMean()` — rolling window average
- `fillNaN()` — basic fill with value

### 📊 Statistics

- `mean()`, `std()` — column-level statistics
- `corrMatrix()` — compute correlation matrix

### 🧰 DataFrame Utilities

- `join()`, `concat()`, `pivot()`, `melt()`
- `aggregate()`, `groupByAgg()`, `applyMap()`, `describe()`
- `diff()`, `cumsum()`, `percentChange()`, `shift()`
- Utility-safe type checks, schema validation

---

## ⚡ Performance Benchmark (vs pandas)

| Operation       | AlphaQuantJS | Pandas  | AQ Memory | Pandas Memory | Gap                |
| --------------- | ------------ | ------- | --------- | ------------- | ------------------ |
| `rollingMean()` | 885.23ms     | 3.91ms  | 76.91 MB  | 0.12 MB       | ❌ 226x slower     |
| `normalize()`   | 321.28ms     | 5.80ms  | 60.80 MB  | 4.00 MB       | ❌ 55x slower      |
| `zscore()`      | 236.79ms     | 4.72ms  | 60.93 MB  | 3.62 MB       | ❌ 50x slower      |
| `corrMatrix()`  | 119.41ms     | 9.45ms  | 29.43 MB  | 0.38 MB       | ❌ 77x more memory |
| `resample()`    | 133.89ms     | 4.83ms  | 27.68 MB  | 0.88 MB       | ❌ 28x slower      |
| `dropNaN()`     | 73.82ms      | 26.12ms | 23.66 MB  | 6.42 MB       | ✅ Close to pandas |

> ⚠️ Benchmarked with 100,000 rows using `benchmark.js`

---

## 🔬 Optimization Roadmap

Critical performance hotspots will be migrated to `core/math/` using `Float64Array`:

```bash
core/
├── math/
│   ├── normalizeTyped.js
│   ├── zscoreTyped.js
│   ├── rollingMeanTyped.js
│   ├── corrMatrixTyped.js
│   └── utilsTyped.js
```

### Optimization Principles

- Use `TypedArray` instead of arrays
- Pre-allocate memory (`new Float64Array(n)`)
- Replace `.map()`/`.reduce()` with `for` loops
- No GC churn or intermediate object allocations
- Single-pass, vectorized computations

---

## 📈 API Roadmap — pandas Compatibility

| ✅ Implemented                     | 🛠️ In Progress        | 📌 Planned                          |
| ---------------------------------- | --------------------- | ----------------------------------- |
| `groupBy().agg()`                  | `normalizeTyped()`    | `query()` (SQL-style)               |
| `pivot()`, `melt()`                | `zscoreTyped()`       | `isin()` (set filter)               |
| `map()`, `fillNaN()`               | `rollingMeanTyped()`  | `rank()`, `clip()`, `explode()`     |
| `concat()`, `join()`               | `corrMatrixTyped()`   | `duplicated()`, `drop_duplicates()` |
| `describe()`, `diff()`, `cumsum()` | `benchmark.visual.js` | `apply(func, axis=1)`, `sample()`   |

---

## 📁 Usage Example

```js
import { AQDataFrame } from '@alphaquant/core';

const df = AQDataFrame([
  { date: '2024-01-01', price: 100, volume: 1000 },
  { date: '2024-01-02', price: 120, volume: 1100 },
  { date: '2024-01-03', price: 140, volume: 1300 },
]);

const processed = df
  .dropNaN()
  .normalize('price')
  .zscore('volume')
  .rollingMean('price', 2)
  .getFrame()
  .toArray();

console.log(processed);
```

#### 📊 Normalize + Z-score + Describe

```js
import { AQDataFrame } from '@alphaquant/core';

const df = AQDataFrame([
  { date: '2024-01-01', price: 100, volume: 1000 },
  { date: '2024-01-02', price: 110, volume: 1100 },
  { date: '2024-01-03', price: 120, volume: 1150 },
]);

const stats = df
  .normalize('price')
  .zscore('volume')
  .describe(['price', 'volume']);

console.log(stats);
```

---

#### 🕓 Time Series: Resample Daily + Rolling Average

```js
import { AQDataFrame } from '@alphaquant/core';

const raw = [
  { date: '2024-01-01T10:00', price: 100 },
  { date: '2024-01-01T14:00', price: 102 },
  { date: '2024-01-02T10:00', price: 106 },
  { date: '2024-01-03T10:00', price: 108 },
];

const df = AQDataFrame(raw)
  .resample('date', ['price'])
  .rollingMean('price', 2)
  .getFrame()
  .toArray();

console.table(df);
```

---

#### 🧠 Correlation Matrix

```js
import { AQDataFrame } from '@alphaquant/core';

const df = AQDataFrame([
  { x: 1, y: 2, z: 3 },
  { x: 2, y: 4, z: 6 },
  { x: 3, y: 6, z: 9 },
]);

const corr = df.corrMatrix();
console.log(corr.toArray());
```

---

#### 🔄 Diff + CumSum + Percent Change

```js
import { AQDataFrame } from '@alphaquant/core';

const df = AQDataFrame([
  { value: 10 },
  { value: 15 },
  { value: 18 },
  { value: 21 },
]);

const transformed = df
  .diff('value')
  .cumsum('value')
  .percentChange('value')
  .getFrame()
  .toArray();

console.table(transformed);
```

---

## 🧪 Benchmark Tools

The core repo includes:

- `benchmark.js` — core microperf runner
- `benchmark.visual.js` — CLI charts (ascii)
- `perf.test.js` — regression guard (e.g. >300ms = fail)

---

## 🧠 Contribution Guidelines

- 🧩 Use `data-forge` idioms and functional patterns
- 🧪 Cover all new code with unit tests
- 💾 Use memory-efficient loops
- 📉 Avoid unnecessary `.map()` / `.concat()`
- ⚠️ Write `TypedArray`-compatible algorithms if possible

See: [`CODING_GUIDELINES.md`](./CODING_GUIDELINES.md)

---

## 📜 License

MIT © AlphaQuantJS
