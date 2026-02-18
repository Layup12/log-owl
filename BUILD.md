# Сборка desktop

## Команда

```bash
pnpm run build:desktop
```

Собирает Electron (main), Vite (renderer) и запускает electron-builder. Артефакты в `release/`.

## Платформы (electron-builder)

- **Windows**: NSIS installer
- **mac**: dmg, zip
- **Linux**: AppImage

## Данные и обновления

- БД и app_state хранятся в **userData** (путь через `app.getPath('userData')`), не внутри папки приложения.
- При обновлении приложения (замена бинарника/установщика) каталог userData не перезаписывается — данные сохраняются.
