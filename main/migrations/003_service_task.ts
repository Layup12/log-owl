import type Database from 'better-sqlite3'

export const version = 3

export function up(db: Database.Database): void {
  db.exec(`ALTER TABLE tasks ADD COLUMN is_service INTEGER NOT NULL DEFAULT 0`)
}
