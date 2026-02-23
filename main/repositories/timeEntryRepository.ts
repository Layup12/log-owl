import type Database from 'better-sqlite3'

import type { TimeEntry, TimeEntryInsert } from '../types'

export function create(
  db: Database.Database,
  data: TimeEntryInsert
): TimeEntry {
  const stmt = db.prepare(
    'INSERT INTO time_entries (task_id, started_at, ended_at, source) VALUES (?, ?, ?, ?)'
  )
  const result = stmt.run(
    data.task_id,
    data.started_at,
    data.ended_at ?? null,
    data.source ?? null
  )
  const id = result.lastInsertRowid as number
  return getById(db, id)!
}

export function getById(db: Database.Database, id: number): TimeEntry | null {
  const row = db.prepare('SELECT * FROM time_entries WHERE id = ?').get(id) as
    | TimeEntry
    | undefined
  return row ?? null
}

export function getByTaskId(
  db: Database.Database,
  task_id: number
): TimeEntry[] {
  return db
    .prepare('SELECT * FROM time_entries WHERE task_id = ? ORDER BY started_at')
    .all(task_id) as TimeEntry[]
}

export function getAll(db: Database.Database): TimeEntry[] {
  return db
    .prepare('SELECT * FROM time_entries ORDER BY started_at')
    .all() as TimeEntry[]
}

export function getOpen(db: Database.Database): TimeEntry[] {
  return db
    .prepare(
      'SELECT * FROM time_entries WHERE ended_at IS NULL ORDER BY started_at'
    )
    .all() as TimeEntry[]
}

/** Time entries that overlap [fromIso, toIso]: started_at < to AND (ended_at IS NULL OR ended_at > from) */
export function getInRange(
  db: Database.Database,
  fromIso: string,
  toIso: string
): TimeEntry[] {
  return db
    .prepare(
      'SELECT * FROM time_entries WHERE started_at < ? AND (ended_at IS NULL OR ended_at > ?) ORDER BY started_at'
    )
    .all(toIso, fromIso) as TimeEntry[]
}

export function update(
  db: Database.Database,
  id: number,
  data: Partial<TimeEntryInsert>
): TimeEntry | null {
  const current = getById(db, id)
  if (!current) return null
  db.prepare(
    'UPDATE time_entries SET task_id = ?, started_at = ?, ended_at = ?, source = ? WHERE id = ?'
  ).run(
    data.task_id ?? current.task_id,
    data.started_at ?? current.started_at,
    data.ended_at !== undefined ? data.ended_at : current.ended_at,
    data.source !== undefined ? data.source : current.source,
    id
  )
  return getById(db, id)
}

export function remove(db: Database.Database, id: number): boolean {
  const result = db.prepare('DELETE FROM time_entries WHERE id = ?').run(id)
  return result.changes > 0
}
