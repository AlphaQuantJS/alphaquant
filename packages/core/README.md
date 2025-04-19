# @alphaquant/core

`@alphaquant/core` is the foundational data processing and statistics module of the AlphaQuant platform. It provides clean, fast, and composable APIs for handling financial time series using a familiar DataFrame-based interface.

---

## 📦 Features

- Lightweight DataFrame abstraction using [`data-forge`](https://github.com/data-forge/data-forge-ts)
- Preprocessing utilities:
  - `dropNaN()`, `normalize()`, `zscore()`, `resample()`
- Statistical utilities:
  - `mean()`, `std()`, `rollingMean()`, `corrMatrix()` (coming soon)
- AQDataFrame: our custom wrapper inspired by pandas, with chaining support
- Pure JavaScript — fast, minimal, no native dependencies

---

## 📁 Folder structure

| File               | Responsibility                                 |
| ------------------ | ---------------------------------------------- |
| `AQDataFrame.js`   | Pandas-style OOP wrapper around DataFrame      |
| `Preprocessing.js` | Normalization, NaN handling, resampling        |
| `StatsUtils.js`    | Statistical tools like mean/std/corr (planned) |

---

## 🔧 Installation

This package is meant to be used within the monorepo via Turborepo.

But you can install and test it locally:

```bash
npm install data-forge
npm install
npm run test
```

---

## 🧪 Testing

We use [Jest](https://jestjs.io/) with native ESM and `type: "module"` support.

To run tests:

```bash
npm run test
```

To watch tests:

```bash
npm run test:watch
```

> Note: Jest runs with `--experimental-vm-modules` to support native ESM imports.

---

## 🔬 Example Usage

```js
import { DataFrame } from 'data-forge';
import { normalize, dropNaN } from './Preprocessing.js';

const df = new DataFrame([
  { date: '2024-01-01', price: 100 },
  { date: '2024-01-02', price: null },
  { date: '2024-01-03', price: 120 },
]);

const clean = dropNaN(df);
const normalized = normalize(clean, 'price');

console.log(normalized.toArray());
```

---

## 📍 Status

✅ MVP-ready  
🔜 Upcoming:

- `StatsUtils.js`: rolling statistics, correlation matrix
- `AQSeries`: 1D column-level operations
- CLI interface for transforming CSV files

---

## 📃 License

MIT – AlphaQuant Contributors
