import { app, ipcMain } from 'electron'
import { getDb } from './db'
import * as taskRepo from './repositories/taskRepository'
import * as timeEntryRepo from './repositories/timeEntryRepository'
import * as taskSessionRepo from './repositories/taskSessionRepository'
import * as settingsRepo from './repositories/settingsRepository'
import type { TaskInsert, TimeEntryInsert, TaskSessionInsert } from './types'

function withDb<T>(fn: (db: ReturnType<typeof getDb>) => T): T {
  const db = getDb(app.getPath('userData'))
  return fn(db)
}

export function registerIpc(): void {
  // task
  ipcMain.handle('task:create', (_, data: TaskInsert) =>
    withDb((db) => taskRepo.create(db, data))
  )
  ipcMain.handle('task:getById', (_, id: number) =>
    withDb((db) => taskRepo.getById(db, id))
  )
  ipcMain.handle('task:getAll', () =>
    withDb((db) => taskRepo.getAll(db))
  )
  ipcMain.handle('task:update', (_, id: number, data: Partial<TaskInsert>) =>
    withDb((db) => taskRepo.update(db, id, data))
  )
  ipcMain.handle('task:delete', (_, id: number) =>
    withDb((db) => taskRepo.remove(db, id))
  )

  // timeEntry
  ipcMain.handle('timeEntry:create', (_, data: TimeEntryInsert) =>
    withDb((db) => timeEntryRepo.create(db, data))
  )
  ipcMain.handle('timeEntry:getById', (_, id: number) =>
    withDb((db) => timeEntryRepo.getById(db, id))
  )
  ipcMain.handle('timeEntry:getByTaskId', (_, task_id: number) =>
    withDb((db) => timeEntryRepo.getByTaskId(db, task_id))
  )
  ipcMain.handle('timeEntry:getAll', () =>
    withDb((db) => timeEntryRepo.getAll(db))
  )
  ipcMain.handle('timeEntry:update', (_, id: number, data: Partial<TimeEntryInsert>) =>
    withDb((db) => timeEntryRepo.update(db, id, data))
  )
  ipcMain.handle('timeEntry:delete', (_, id: number) =>
    withDb((db) => timeEntryRepo.remove(db, id))
  )

  // taskSession
  ipcMain.handle('taskSession:create', (_, data: TaskSessionInsert) =>
    withDb((db) => taskSessionRepo.create(db, data))
  )
  ipcMain.handle('taskSession:getById', (_, id: number) =>
    withDb((db) => taskSessionRepo.getById(db, id))
  )
  ipcMain.handle('taskSession:getByTaskId', (_, task_id: number) =>
    withDb((db) => taskSessionRepo.getByTaskId(db, task_id))
  )
  ipcMain.handle('taskSession:getAll', () =>
    withDb((db) => taskSessionRepo.getAll(db))
  )
  ipcMain.handle('taskSession:update', (_, id: number, data: Partial<TaskSessionInsert>) =>
    withDb((db) => taskSessionRepo.update(db, id, data))
  )
  ipcMain.handle('taskSession:delete', (_, id: number) =>
    withDb((db) => taskSessionRepo.remove(db, id))
  )
  ipcMain.handle('taskSession:closeOpenByTaskId', (_, task_id: number) =>
    withDb((db) => taskSessionRepo.closeOpenByTaskId(db, task_id, new Date().toISOString()))
  )

  // settings
  ipcMain.handle('settings:get', (_, key: string) =>
    withDb((db) => settingsRepo.get(db, key))
  )
  ipcMain.handle('settings:set', (_, key: string, value: string) =>
    withDb((db) => { settingsRepo.set(db, key, value); return undefined })
  )
  ipcMain.handle('settings:getAll', () =>
    withDb((db) => settingsRepo.getAll(db))
  )
  ipcMain.handle('settings:delete', (_, key: string) =>
    withDb((db) => settingsRepo.remove(db, key))
  )

  // report
  ipcMain.handle('report:getTimeEntriesInRange', (_, fromIso: string, toIso: string) =>
    withDb((db) => timeEntryRepo.getInRange(db, fromIso, toIso))
  )
}
