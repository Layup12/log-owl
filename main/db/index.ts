import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'

let db: Database.Database | null = null

const DB_FILENAME = 'log-owl.db'

/**
 * DB path: userData/data/log-owl.db (Electron app.getPath('userData')).
 * userData is outside the app bundle, so data persists across app updates.
 */
export function getDb(userDataPath: string): Database.Database {
  if (db) return db
  const dir = path.join(userDataPath, 'data')
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  const dbPath = path.join(dir, DB_FILENAME)
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  return db
}

/**
 * Выполняет fn с подключением к БД для указанного userDataPath.
 * Удобно для IPC-handlers: один вызов withDb(path, fn) вместо getDb + fn(getDb(...)).
 */
export function withDb<T>(
  userDataPath: string,
  fn: (database: Database.Database) => T
): T {
  return fn(getDb(userDataPath))
}

export function closeDb(): void {
  if (db) {
    db.close()
    db = null
  }
}
