import path from 'path'
import { app } from 'electron'
import { getDb } from '../db'
import { verifyDbConnection } from '../db/verifyDbConnection'
import { runMigrations } from '../migrations/runner'
import { setRecoveryClosedIds } from '../ipc/app'
import { runRecovery } from './recovery'
import { logDev } from '../lib/logger'

/**
 * Инициализация БД: миграции, проверка доступа, recovery открытых time_entries.
 * Результат recovery передаётся в setRecoveryClosedIds для UI.
 */
export function initDb(): void {
  const userDataPath = app.getPath('userData')
  const db = getDb(userDataPath)
  runMigrations(db)
  verifyDbConnection(db)
  const dbPath = path.join(userDataPath, 'data', 'log-owl.db')
  logDev('DB init OK', dbPath)
  const closedIds = runRecovery(db)
  setRecoveryClosedIds(closedIds)
}
