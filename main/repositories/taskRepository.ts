import type Database from 'better-sqlite3'

import type { Task, TaskInsert } from '../types'

function now(): string {
  return new Date().toISOString()
}

export function create(db: Database.Database, data: TaskInsert): Task {
  const created_at = now()
  const updated_at = created_at
  const is_service = data.is_service ?? 0
  const stmt = db.prepare(
    'INSERT INTO tasks (title, comment, completed_at, created_at, updated_at, is_service) VALUES (?, ?, ?, ?, ?, ?)'
  )
  const result = stmt.run(
    data.title,
    data.comment ?? null,
    data.completed_at ?? null,
    created_at,
    updated_at,
    is_service
  )
  const id = result.lastInsertRowid as number
  return getById(db, id)!
}

export function getById(db: Database.Database, id: number): Task | null {
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as
    | Task
    | undefined
  return row ?? null
}

export function getAll(db: Database.Database): Task[] {
  return db.prepare('SELECT * FROM tasks ORDER BY id').all() as Task[]
}

export function update(
  db: Database.Database,
  id: number,
  data: Partial<TaskInsert> & { updated_at?: string }
): Task | null {
  const current = getById(db, id)
  if (!current) return null
  const updated_at = data.updated_at ?? now()
  const is_service =
    data.is_service !== undefined ? data.is_service : current.is_service
  db.prepare(
    'UPDATE tasks SET title = ?, comment = ?, completed_at = ?, updated_at = ?, is_service = ? WHERE id = ?'
  ).run(
    data.title ?? current.title,
    data.comment !== undefined ? data.comment : current.comment,
    data.completed_at !== undefined ? data.completed_at : current.completed_at,
    updated_at,
    is_service,
    id
  )
  return getById(db, id)
}

export function getServiceTask(db: Database.Database): Task | null {
  const row = db
    .prepare(
      'SELECT * FROM tasks WHERE is_service = 1 AND completed_at IS NULL LIMIT 1'
    )
    .get() as Task | undefined
  return row ?? null
}

const SERVICE_TASK_TITLE = 'Сервисная'

export function ensureServiceTask(db: Database.Database): Task | null {
  const existing = getServiceTask(db)
  if (existing) return existing
  return create(db, { title: SERVICE_TASK_TITLE, is_service: 1 })
}

export function remove(db: Database.Database, id: number): boolean {
  db.prepare('DELETE FROM time_entries WHERE task_id = ?').run(id)
  db.prepare('DELETE FROM task_sessions WHERE task_id = ?').run(id)
  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id)
  return result.changes > 0
}
