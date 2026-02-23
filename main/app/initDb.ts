import { getDb } from '@main/db'
import { logDev } from '@main/lib'
import { app } from 'electron'
import path from 'path'

import { verifyDbConnection } from '../db/verifyDbConnection'
import { setRecoveryClosedIds } from '../ipc/app'
import { runMigrations } from '../migrations/runner'
import { runRecovery } from './recovery'

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
