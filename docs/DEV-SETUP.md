# Разработка Log Owl

Этот документ описывает, как развернуть и развивать проект **Log Owl**: какие есть скрипты, как устроена структура каталогов с точки зрения разработчика, какие правила по стилю кода и тестам.

Общее описание и цели проекта смотрите в `README.md`. Если вас интересуют архитектурные решения (IPC, миграции БД, слои и т.п.), подробнее в `docs/ARCHITECTURE.md`.

Если вы просто хотите быстро запустить проект, начните с раздела «Быстрый старт».

---

## Быстрый старт

### Требования

- **Node.js** 20+
- **pnpm** (см. версию в `package.json` → `packageManager`)

### Установка зависимостей

```bash
pnpm install
```

### Dev‑режим

Основной сценарий для разработки:

```bash
pnpm run dev
```

Команда:

- собирает main‑часть (Electron) в `dist-electron`;
- запускает Vite‑dev‑сервер для renderer на `http://localhost:5173`;
- после готовности фронта стартует Electron, указывая на dev‑сервер.

Альтернативные варианты:

- только фронтенд:

  ```bash
  pnpm run dev:vite
  ```

- только Electron (если Vite уже запущен):

  ```bash
  pnpm run dev:electron
  ```

---

## Структура проекта (с точки зрения разработки)

На высоком уровне:

- **`main/`** — Electron main‑процесс:
  - точка входа приложения;
  - настройка окон;
  - работа с БД (`better-sqlite3`) и миграциями (`main/migrations`);
  - регистрация IPC‑хендлеров;
  - инфраструктурные утилиты (логирование, обработка ошибок и т.д.).
- **`renderer/`** — React‑приложение:
  - страницы и маршрутизация;
  - UI‑компоненты (MUI + кастомные);
  - хранилища состояния (Zustand);
  - вызовы IPC‑методов через обёртки/клиент.
- **`contracts/`** — общие типы и контракты между main и renderer (подробности см. в `docs/ARCHITECTURE.md`).
- **`scripts/`** — вспомогательные скрипты:
  - например, `generate-preload-channels.js` для автогенерации каналов.
- **`tests/`** — общая инфраструктура тестов:
  - `tests/vitest.setup.ts` — глобальный setup для Vitest (jest-dom и т.п.);
  - `tests/e2e/` — e2e‑сценарии Playwright (спеки, артефакты и отчёт при запуске).
- **`docs/`** — документация:
  - `DEV-SETUP.md` — текущий файл (setup и сценарии разработки);
  - `ARCHITECTURE.md` — архитектура и технические решения;
  - `BUILD.md` — сборка desktop‑артефактов;
  - `BACKLOG.md` — идеи и планируемые задачи.

### Алиасы и импорты

Чтобы избежать относительных импортов вида `../../../`, используются алиасы (см. `tsconfig.base.json` и `vite.config.ts`):

- `@main`, `@main/app`, `@main/db`, `@main/ipc`, … — код main‑процесса.
- `@renderer`, `@renderer/components`, `@renderer/hooks`, `@renderer/shared/*`, … — код renderer.
- `@contracts` — общие контракты/типы.

Это позволяет:

- проще рефакторить структуру каталогов;
- явно видеть, из какого слоя мы импортируем зависимости.

---

## Скрипты `package.json`

Ниже перечислены основные команды. Жирным выделены те, которые чаще всего используются в ежедневной разработке.

### Часто используемые

- **`pnpm run dev`** — полный dev‑режим (Vite + Electron).
- **`pnpm run check`** — единая проверка качества: lint, format:check, spellcheck, test:coverage, e2e.
- **`pnpm run test`** — разовый прогон юнит‑тестов (без отчёта покрытия).
- **`pnpm run test:coverage`** — разовый прогон тестов с отчётом покрытия и проверкой порога; именно эта команда используется в `check` и в pre-commit.

### Dev‑сценарии

- `pnpm run dev` — полный dev‑режим (Vite + Electron).
- `pnpm run dev:vite` — только фронтенд (Vite‑dev‑сервер).
- `pnpm run dev:electron` — Electron, ожидающий Vite на `http://localhost:5173`.
- `pnpm run preview` — `vite preview`, просмотр собранного фронтенда без Electron (может быть полезен для чисто веб‑отладки).

### Сборка

- `pnpm run build:electron` — сборка только main‑части (TS → `dist-electron`).
- `pnpm run build:desktop` — полноценная сборка desktop‑приложения (см. `docs/BUILD.md`).
- `pnpm run build` — алиас для `build:desktop`.

### Качество кода и тесты

- `pnpm run lint` — запуск ESLint.
- `pnpm run lint:fix` — ESLint с автофиксом.
- `pnpm run format` — форматирование всего проекта Prettier.
- `pnpm run format:check` — проверка форматирования без изменений файлов.
- `pnpm run spellcheck` — CSpell по проекту.
- `pnpm run test:watch` — Vitest в watch‑режиме.
- `pnpm run test:coverage` — тесты с покрытием (Vitest Coverage, провайдер v8) и проверкой порога; отчёт в терминале и HTML в каталоге `coverage/`. Порог пока намеренно низкий; повышение планируется по мере роста покрытия.
- `pnpm run e2e` — прогон e2e‑тестов (Playwright): поднимается Vite‑dev‑сервер, затем выполняются сценарии из `tests/e2e/`. Артефакты и HTML‑отчёт сохраняются в `tests/e2e/.generated/` (подкаталоги `results/` и `report/`).
- `pnpm run typecheck` — проверка типов TypeScript без сборки, для main и renderer.

### Анализ кода и бандла

- `pnpm run analyze:bundle` — сборка renderer с визуализацией бандла; результат в `dist/stats.html` (treemap).
- `pnpm run analyze:exports:main` — поиск неиспользуемых экспортов (ts-unused-exports) в main.
- `pnpm run analyze:exports:renderer` — то же для renderer.

### Служебные

- `pnpm run generate-preload-channels` — генерация каналов для preload‑скрипта (обычно вызывается из других скриптов).
- `pnpm run postinstall` — `electron-rebuild` для `better-sqlite3` после установки зависимостей (запускается автоматически).
- `pnpm run prepare` — инициализация Husky (также запускается автоматически при установке зависимостей).

---

## Ветки и коммиты

В проекте действует единое соглашение по:

- именам веток;
- формату сообщений коммитов по **Conventional Commits**.

Подробные правила, принципы и примеры см. в `CONTRIBUTING.md`.  
Соблюдение этих соглашений проверяется git‑хуком `.husky/commit-msg` (см. раздел «Git‑хуки» ниже).

---

## Стиль кода и линтинг

Проект использует:

- **TypeScript strict mode** (`strict: true` и дополнительные флаги вроде `noUnusedLocals`, `noUnusedParameters`).
- **ESLint** (новый формат конфигурации `typescript-eslint.config(...)`) с:
  - отдельными правилами для TS/TSX, Node‑кода и React‑кода;
  - сортировкой импортов (`simple-import-sort`);
  - запретом `default`‑экспортов (`import/no-default-export`), за исключением технических файлов вроде `vite.config.ts`.
- **Prettier** — форматирование.
- **CSpell** — проверка орфографии (включая `cspell-dict-ru_ru`).
- **Git‑хуки** — автоматический запуск части этих проверок при коммите (подробности — в разделе «Git‑хуки» ниже).

Рекомендации:

- Следовать существующим правилам ESLint/Prettier.
- Предпочитать именованные экспорты (кроме случаев, где tooling требует default).
- Использовать алиасы (`@main/...`, `@renderer/...`, `@contracts`) вместо относительных импортов.

### Git‑хуки

- `.husky/pre-commit` — проверяет имя ветки и запускает базовый набор проверок по изменённым файлам (lint-staged, тесты с покрытием и т.п.).
- `.husky/commit-msg` — проверяет сообщение коммита через commitlint по соглашению Conventional Commits.
- Подробные правила и примеры — в `CONTRIBUTING.md`.

---

## Тестирование

Юнит‑тесты реализованы через **Vitest**:

- конфигурация в `vite.config.ts` (раздел `test`).
- по умолчанию используется окружение `node`, что хорошо подходит для:
  - чистых функций;
  - бизнес‑логики;
  - утилит и IPC‑слоя (в т.ч. Zod‑схем).
- **Покрытие кода (Coverage)** включено: провайдер v8, отчёт в терминале и HTML в каталоге `coverage/`. В `check` и в pre-commit используется `pnpm run test:coverage`, поэтому порог покрытия проверяется при каждой проверке качества. Порог пока намеренно низкий; планируется повышать его по мере добавления тестов.

Базовые команды:

```bash
pnpm run test          # разовый прогон без покрытия
pnpm run test:coverage # разовый прогон с покрытием и проверкой порога (используется в check и pre-commit)
pnpm run test:watch   # watch-режим
```

При необходимости UI‑тестов можно переключать окружение на `jsdom` для отдельных тестов/файлов (для `renderer/**` это уже настроено через `environmentMatchGlobs`).

**E2E‑тесты (Playwright)** настроены отдельно:

- сценарии лежат в **`tests/e2e/`**;
- глобальный setup для Vitest — **`tests/vitest.setup.ts`** (подключение jest-dom);
- конфигурация Playwright — **`playwright.config.ts`** в корне (testDir, webServer на Vite, артефакты и отчёт внутри `tests/e2e/.generated/`).

Команды: `pnpm run e2e` (разовый прогон). Перед первым запуском при необходимости установите браузеры: `pnpm exec playwright install chromium`.

---

## Сборка и релизы

Подробная инструкция по локальной сборке desktop‑артефактов и артефактам в `release/` находится в `docs/BUILD.md`.
Ниже — лишь высокоуровневый обзор и связь с CI.

- **main‑часть**:
  - компилируется TypeScript → JavaScript в `dist-electron`;
  - используется `tsc-alias` для замены алиасов путями.
- **renderer**:
  - собирается Vite в `dist/`.
- **electron-builder**:
  - читает `electron-builder.json`;
  - упаковывает приложение для Windows/macOS/Linux;
  - складывает артефакты в `release/`.

Также настроен GitHub Actions:

- проверка качества на каждый push/PR (`.github/workflows/ci.yml`);
- сборка и выкладка инсталляторов в Releases по тегу (`.github/workflows/release.yml`).

---

## Замечания по развитию проекта

Так как это pet‑project:

- не все технические решения доведены до «идеала»;
- приоритет был у демонстрации:
  - архитектурного разбиения;
  - типизированного IPC;
  - миграций БД;
  - цепочки quality‑gate (lint → format → tests → spellcheck);
  - сборки и релизов через CI.

Идеи возможного расширения и развития проекта можно посмотреть в `BACKLOG.md`.
