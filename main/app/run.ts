import { app, BrowserWindow } from 'electron'
import { registerIpc } from '../ipc'
import { initDb } from './initDb'
import { startHeartbeat } from './heartbeat'
import { createWindow } from './window'
import { logDev } from '@main/lib'

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
