import { closeDb, getDb } from '@main/db'
import { logWarn } from '@main/lib'
import { app } from 'electron'

import * as taskSessionRepo from '../repositories/taskSessionRepository'
import { saveWindowState } from '../windowState'

/**
 * Регистрирует обработчики жизненного цикла приложения: before-quit и window-all-closed.
 */
export function setupAppLifecycle(): void {
  app.on('before-quit', () => {
    saveWindowState()
    try {
      const db = getDb(app.getPath('userData'))
      const closedAt = new Date().toISOString()
      taskSessionRepo.closeAllOpen(db, closedAt)
    } catch (e) {
      logWarn('before-quit closeAllOpen:', e)
    } finally {
      closeDb()
    }
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
}
