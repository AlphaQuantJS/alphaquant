# ✅ CI/CD-инфраструктура AlphaQuant

## 🔧 Архитектура

- **Monorepo** — проект структурирован с помощью `Turborepo`
- **Модули** расположены в `/packages/*`
- **CI/CD и релизы** автоматизированы через GitHub Actions и Changesets

---

## 📦 Установленные инструменты

| Инструмент             | Назначение                                                      |
| ---------------------- | --------------------------------------------------------------- |
| `Turborepo`            | Сборка и управление зависимостями в монорепо                    |
| `ESLint`               | Линтинг с кастомными строгими правилами                         |
| `Prettier`             | Форматирование кода по единым правилам (через `.prettierrc`)    |
| `Husky` + `Commitlint` | Проверка коммитов (Conventional Commits) и линта перед коммитом |
| `Changesets`           | Версионирование и публикация отдельных npm-пакетов              |
| `GitHub Actions`       | Автоматический CI и релизы                                      |

---

## ⚙️ Локальная разработка

### Коммиты

- Используется [**Conventional Commits**](https://www.conventionalcommits.org/), например:

  ```
  feat(ta): add new RSI indicator
  fix(core): correct error in DataFrame merge
  ```

- Проверка выполняется через `husky` + `commitlint` (`.husky/commit-msg`)

---

### Перед коммитом

- Линтинг и автоформатирование запускается через `.husky/pre-commit`:

  ```bash
  npm run lint
  npm run format:check
  ```

- Также можно запускать вручную:

  ```bash
  npm run format   # применить форматирование ко всем файлам
  npm run format:check  # только проверить
  ```

---

## 🚀 CI: GitHub Actions

### 📄 `.github/workflows/ci.yml`

Запускается при любом `push` или `pull_request` в ветки `main` и `dev`.

**Выполняет:**

- Установку зависимостей
- Запуск `npm run lint`
- Запуск `npm run format:check`
- Запуск `npm run test`
- Запуск `npm run build`

### 📄 `.github/workflows/release.yml`

Запускается только при `push` в `main`.

**Выполняет:**

- Сборку всех пакетов через `turbo run build`
- Проверку наличия `.changeset/*`
- Автоматическую генерацию версий, changelog и публикацию в npm

---

## 🏗️ Turborepo: сборка и пайплайны

📄 `turbo.json`:

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["^test"],
      "outputs": []
    },
    "lint": {
      "dependsOn": ["^lint"],
      "outputs": []
    }
  }
}
```

Теперь можно запускать:

```bash
npm run lint
npm run format
npm run test
npm run build
```

Или через Turborepo:

```bash
turbo run lint
```

---

## 🧾 Changesets: версионирование и релизы

📄 `.changeset/config.json`:

```json
{
  "changelog": ["@changesets/changelog", { "repo": "alphaquant/alphaquant" }],
  "commit": true,
  "access": "public",
  "baseBranch": "main"
}
```

### Как использовать:

1. Создай changeset:

   ```bash
   npx changeset
   ```

2. Смерджи изменения в `main`

3. GitHub Action:
   - обновит версию каждого затронутого пакета
   - сгенерирует changelog
   - создаст git-тег
   - **опубликует в npm**

---

## 🧼 ESLint + Prettier

📄 `.eslintrc.json` — содержит более 60 правил, включая:

- `camelCase`, `semi`, `quotes`, `max-len`, `no-var`, `prefer-const`, и др.

📄 `.prettierrc`:

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "overrides": [
    {
      "files": ["**/.*rc"],
      "options": { "parser": "json" }
    }
  ]
}
```

📄 `.prettierignore`:

```
node_modules
dist
coverage
*.log
*.lock
.env
```

---

## 🔐 Секреты GitHub (обязательно для публикации)

Находятся в:  
🔗 `https://github.com/alphaquant/alphaquant/settings/secrets/actions`

| Название    | Что это                         |
| ----------- | ------------------------------- |
| `NPM_TOKEN` | Токен от `npm` (для публикации) |

---

## ✅ Поддержка и стандарты

- Коммит-месседжи валидируются через `commitlint`
- Линт и форматтер запускаются до коммита (`husky`)
- Все PR проходят CI и ревью
- Стандарты задокументированы в `README.md` и `CONTRIBUTING.md`
