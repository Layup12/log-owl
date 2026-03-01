# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.1] - 2026-02-28

### Fixed

- Исправлена сборка macOS: добавлена корректная поддержка архитектуры Intel (x64)
- Целостность БД: включены foreign keys в SQLite.
- Конфигурация Vite и алиасы путей для стабильной сборки.

### Internal

- CI: добавлена проверка typecheck
- Добавлен ручной workflow для сборки ветки dev с возможностью скачать артефакты без публикации в Release.
- Инструменты: настройка commit hooks и обновление конфигов линтера/форматера.

## [0.1.0] - 2026-02-27

### Added

- Desktop-приложение для трекинга времени и задач (Electron + React + TypeScript).
- Локальное хранение в SQLite, миграции схемы.
- Типобезопасный IPC (Zod, контракты), сборка через Vite и electron-builder.
- Юнит-тесты (Vitest), e2e (Playwright), линтинг, pre-commit и CI (GitHub Actions).
- Документация: README, DEV-SETUP, ARCHITECTURE, BUILD, BACKLOG.
