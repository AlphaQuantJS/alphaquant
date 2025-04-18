# ⚡️ AlphaQuant

**Modern JavaScript Framework for Quantitative Finance**  
_Pandas + TA-Lib + Backtrader — all in JS_

[![CI](https://img.shields.io/github/actions/workflow/status/alphaquant/alphaquant/ci.yml?branch=main&label=CI&style=flat-square&logo=github)](https://github.com/alphaquant/alphaquant/actions/workflows/ci.yml)
[![NPM Version](https://img.shields.io/npm/v/@alphaquant/core?style=flat-square&logo=npm)](https://www.npmjs.com/org/alphaquant)
![TypeScript](https://img.shields.io/badge/Built%20With-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![MIT License](https://img.shields.io/badge/license-MIT-green?style=flat-square)
![Status](https://img.shields.io/badge/status-MVP-orange?style=flat-square)

![AlphaQuant Demo](https://user-images.githubusercontent.com/674621/196881240-fbccdcf4-753e-4f82-a8b5-e471d6c13d02.gif)


---

## ✨ About

AlphaQuant is a modern, modular, full-stack **JavaScript framework for quant research and strategy development**. Built for **Node.js and browser**, it brings real quant tools to web-native developers.

- 📊 Pandas-style DataFrame (via Danfo.js)
- 🧠 TA indicators (RSI, EMA, SMA, MACD...)
- 🎯 Strategy interface: `onBar(data)` / `class Strategy`
- 📉 Backtester with equity, metrics, trades
- 🖥 CLI & browser playground (coming)
- 🌐 LLM-powered code generator (planned)

---

## 🛠 Getting Started

```bash
npm install @alphaquant/core @alphaquant/ta @alphaquant/backtest
```

```ts
import { SMA, RSI } from '@alphaquant/ta';
import { BacktestEngine } from '@alphaquant/backtest';

const result = BacktestEngine.run(myStrategy, data);
console.log(result.metrics);
```

Full example: [`examples/sma-cross.ts`](./examples/sma-cross.ts)

---

## 📁 Monorepo Structure

```
/packages/
  core/        → DataFrame engine
  ta/          → Technical analysis
  backtest/    → Event-driven executor
  strategy/    → Strategy templates
  report/      → Output metrics & logs

/apps/
  cli/         → Command-line tool
  playground/  → Browser interface (coming)
```

---

## 🧪 Development Workflow

```bash
turbo run lint    # Lint all packages
turbo run build   # Compile everything
turbo run test    # Run tests (WIP)
npx changeset     # Start new release
```

CI/CD is fully automated via GitHub Actions + Changesets. See [How CI/CD Works](#️how-cicd-works)

---

## 💼 Roadmap Highlights

- [x] Strategy + backtesting engine
- [x] CLI interface (Node.js)
- [ ] Portfolio optimization
- [ ] Time-series ARIMA/GARCH
- [ ] QuantLib WASM pricing
- [ ] Web-based UI & visual builder
- [ ] GPT-style code assistant

---

## 🛠️ How CI/CD Works

AlphaQuant uses **Turborepo + Changesets + GitHub Actions** to provide zero-config continuous integration and delivery.

- ✅ ESLint via `.eslintrc.json` (strict style rules)
- ✅ Commitlint + Husky enforce Conventional Commits
- ✅ `turbo run` manages build/test/lint pipelines
- 🚀 `changeset` auto-generates versions + changelog
- 📦 Auto-publish to npm on merge to `main` (with `NPM_TOKEN`)

---

## 🤝 Contributing

We welcome contributions!  
Just fork → feature branch → PR 🙌

> See [CONTRIBUTING.md](./CONTRIBUTING.md) for details

---

## 🧑‍💻 Developer

Made with ❤️ by [@a3ka](https://github.com/a3ka)

---

## 🌟 Support the Project

If you like what we're building, please consider:

- ⭐️ Starring this repository
- 🐦 Sharing on Twitter / Reddit
- 👨‍💻 Submitting a PR
- 💬 Giving feedback in [Discussions](https://github.com/alphaquant/alphaquant/discussions)

Together we can bring **quant tools to the web**.

---

## 📜 License

MIT © AlphaQuant Authors — use freely, build boldly.

