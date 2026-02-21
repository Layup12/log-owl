import { app } from 'electron'
import { getDb, closeDb } from '@main/db'
import { saveWindowState } from '../windowState'
import { logWarn } from '@main/lib'
import * as taskSessionRepo from '../repositories/taskSessionRepository'

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
