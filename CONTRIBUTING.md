### 📄 `CONTRIBUTING.md`

```markdown
# 🤝 Contributing to AlphaQuant

Thank you for your interest in contributing to **AlphaQuant** — the open-source JavaScript framework for quantitative analysis and algorithmic trading.

We welcome contributions of all kinds: code, documentation, examples, bug reports, and suggestions.

---

## 🧰 Project Structure

AlphaQuant uses a **monorepo** structure:

```
/packages/
  core/       # DataFrame & data utilities
  ta/         # Technical analysis indicators
  strategy/   # Strategy interfaces and helpers
  backtest/   # Backtesting engine
  report/     # Output and metrics formatter

/apps/
  cli/        # Node.js CLI tool
  playground/ # Browser-based playground
```

---

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/AlphaQuantJS/alphaquant.git
   cd alphaquant
   npm install
   ```

3. **Create a feature branch:**
   ```bash
   git checkout -b feature/my-awesome-feature
   ```

4. Make your changes inside the appropriate `packages/*` or `apps/*` folder.

5. Run tests and linting before pushing:
   ```bash
   npm run lint && npm run test
   ```

6. **Commit using conventional format** (see below)

7. **Push and open a Pull Request** to `main` or `dev` branch

---

## ✅ Pull Request Checklist

- [ ] Code compiles and builds successfully
- [ ] Tests are added or updated
- [ ] Linting passes (Prettier/ESLint)
- [ ] No console.logs or debug code left
- [ ] Follows commit message convention (see below)
- [ ] Good description of the changes

---

## 🧾 Commit Message Convention

We use [**Conventional Commits**](https://www.conventionalcommits.org/) to generate changelogs and version bumps automatically.

### Format:
```
<type>(scope): short description
```

### Examples:
- `feat(ta): add Bollinger Bands indicator`
- `fix(backtest): fix division by zero bug`
- `docs(core): improve merge() API documentation`

### Common Types:
| Type     | Purpose                          |
|----------|----------------------------------|
| `feat`   | A new feature                    |
| `fix`    | A bug fix                        |
| `docs`   | Changes to documentation         |
| `refactor` | Code refactoring (no behavior change) |
| `test`   | Adding or modifying tests        |
| `chore`  | Other changes (tooling, CI, etc) |

> 💡 Commit messages are automatically checked via `commitlint` and `husky`.

---

## 🐞 Reporting Bugs / Requesting Features

Please use GitHub [Issues](https://github.com/alphaquant/alphaquant/issues) and choose the appropriate template:
- **Bug Report** — something isn't working
- **Feature Request** — suggest a new idea
- **Discussion** — open-ended question or idea

We tag good beginner tasks as `good first issue`!

---

## 📚 Documentation & Examples

Documentation is located in `/docs/` (or `README.md` in each package). You can also contribute:
- Code examples for the `/examples/` folder
- Improvements to API docs or tutorials

---

## 💬 Community & Support

- Ask questions via GitHub Discussions
- Follow us on Twitter [@AlphaQuantJS](https://twitter.com/AlphaQuantJS)
- Contribute tutorials, videos or content — we love it!

---

Thank you again for contributing to AlphaQuant! 🙏  
Let’s build the future of JavaScript-based quant finance together 💹
```


