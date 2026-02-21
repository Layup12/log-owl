import type Database from 'better-sqlite3'

export const version = 2

export function up(db: Database.Database): void {
  db.exec(`ALTER TABLE time_entries ADD COLUMN source TEXT`)
}
