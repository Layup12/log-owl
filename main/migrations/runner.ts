import type Database from 'better-sqlite3'

import { up as up1, version as v1 } from './001_init_schema'
import { up as up2, version as v2 } from './002_time_entries_source'

export interface Migration {
  version: number
  up: (db: Database.Database) => void
}

const migrations: Migration[] = [
  { version: v1, up: up1 },
  { version: v2, up: up2 },
]

function ensureDbMeta(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS db_meta (
      schema_version INTEGER NOT NULL
    );
    INSERT INTO db_meta (schema_version) SELECT 0 WHERE (SELECT COUNT(*) FROM db_meta) = 0;
  `)
}

function getCurrentVersion(db: Database.Database): number {
  ensureDbMeta(db)
  const row = db.prepare('SELECT schema_version FROM db_meta LIMIT 1').get() as
    | { schema_version: number }
    | undefined
  return row?.schema_version ?? 0
}

export function runMigrations(db: Database.Database): void {
  const current = getCurrentVersion(db)
  const pending = migrations
    .filter((m) => m.version > current)
    .sort((a, b) => a.version - b.version)
  const setVersion = db.prepare('UPDATE db_meta SET schema_version = ?')
  for (const m of pending) {
    db.exec('BEGIN')
    try {
      m.up(db)
      setVersion.run(m.version)
      db.exec('COMMIT')
    } catch (e) {
      db.exec('ROLLBACK')
      throw e
    }
  }
}
