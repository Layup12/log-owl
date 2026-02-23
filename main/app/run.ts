import { logDev } from '@main/lib'
import { app, BrowserWindow } from 'electron'

import { registerIpc } from '../ipc'
import { startHeartbeat } from './heartbeat'
import { initDb } from './initDb'
import { createWindow } from './window'

/**
 * Запуск приложения после app.whenReady(): БД, IPC, окно, heartbeat, обработчик activate.
 */
export function runApp(): void {
  initDb()
  registerIpc()
  createWindow()
  startHeartbeat()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
  logDev('App ready')
}
