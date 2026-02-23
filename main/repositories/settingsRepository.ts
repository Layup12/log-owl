import type Database from 'better-sqlite3'

import type { Setting } from '../types'

export function get(db: Database.Database, key: string): string | null {
  const row = db
    .prepare('SELECT value FROM settings WHERE key = ?')
    .get(key) as { value: string } | undefined
  return row?.value ?? null
}

export function set(db: Database.Database, key: string, value: string): void {
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(
    key,
    value
  )
}

export function getAll(db: Database.Database): Setting[] {
  return db.prepare('SELECT key, value FROM settings').all() as Setting[]
}

export function remove(db: Database.Database, key: string): boolean {
  const result = db.prepare('DELETE FROM settings WHERE key = ?').run(key)
  return result.changes > 0
}
