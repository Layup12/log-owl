import type Database from 'better-sqlite3'

export type WithDb = <T>(fn: (db: Database.Database) => T) => T
