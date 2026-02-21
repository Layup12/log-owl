import type Database from 'better-sqlite3'
import type { TaskSession, TaskSessionInsert } from '../types'

export function create(db: Database.Database, data: TaskSessionInsert): TaskSession {
  const stmt = db.prepare(
    'INSERT INTO task_sessions (task_id, opened_at, closed_at, last_seen) VALUES (?, ?, ?, ?)'
  )
  const result = stmt.run(
    data.task_id,
    data.opened_at,
    data.closed_at ?? null,
    data.last_seen ?? null
  )
  const id = result.lastInsertRowid as number
  return getById(db, id)!
}

export function getById(db: Database.Database, id: number): TaskSession | null {
  const row = db.prepare('SELECT * FROM task_sessions WHERE id = ?').get(id) as TaskSession | undefined
  return row ?? null
}

export function getByTaskId(db: Database.Database, task_id: number): TaskSession[] {
  return db.prepare('SELECT * FROM task_sessions WHERE task_id = ? ORDER BY opened_at').all(task_id) as TaskSession[]
}

export function getAll(db: Database.Database): TaskSession[] {
  return db.prepare('SELECT * FROM task_sessions ORDER BY opened_at').all() as TaskSession[]
}

export function update(
  db: Database.Database,
  id: number,
  data: Partial<TaskSessionInsert>
): TaskSession | null {
  const current = getById(db, id)
  if (!current) return null
  db.prepare(
    'UPDATE task_sessions SET task_id = ?, opened_at = ?, closed_at = ?, last_seen = ? WHERE id = ?'
  ).run(
    data.task_id ?? current.task_id,
    data.opened_at ?? current.opened_at,
    data.closed_at !== undefined ? data.closed_at : current.closed_at,
    data.last_seen !== undefined ? data.last_seen : current.last_seen,
    id
  )
  return getById(db, id)
}

export function remove(db: Database.Database, id: number): boolean {
  const result = db.prepare('DELETE FROM task_sessions WHERE id = ?').run(id)
  return result.changes > 0
}

/** Закрывает все сессии с closed_at = null (при выходе из приложения). */
export function closeAllOpen(db: Database.Database, closedAt: string): number {
  const result = db.prepare(
    'UPDATE task_sessions SET closed_at = ? WHERE closed_at IS NULL'
  ).run(closedAt)
  return result.changes
}

/** Закрывает все открытые сессии по задаче (перед созданием новой — чтобы была только одна «текущая»). */
export function closeOpenByTaskId(db: Database.Database, task_id: number, closedAt: string): number {
  const result = db.prepare(
    'UPDATE task_sessions SET closed_at = ? WHERE task_id = ? AND closed_at IS NULL'
  ).run(closedAt, task_id)
  return result.changes
}
