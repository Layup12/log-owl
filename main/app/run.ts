import { logDev } from '@main/lib'
import { app, BrowserWindow } from 'electron'

import { registerIpc } from '../ipc'
import { bootstrap } from './bootstrap'
import { startHeartbeat } from './heartbeat'
import { initDb } from './initDb'
import { createWindow } from './window'

export function runApp(): void {
  initDb()
  bootstrap()
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
