import type { IpcMain } from 'electron'
import * as timeEntryRepo from '../repositories/timeEntryRepository'
import {
  handleIpc,
  validateAndHandle,
  idSchema,
  timeEntryInsertSchema,
  timeEntryUpdateSchema,
  type WithDb,
} from './lib'

export function registerTimeEntry(ipcMain: IpcMain, withDb: WithDb): void {
  ipcMain.handle(
    'timeEntry:create',
    validateAndHandle('timeEntry:create', [timeEntryInsertSchema], (_, data) =>
      withDb((db) => timeEntryRepo.create(db, data))
    )
  )
  ipcMain.handle(
    'timeEntry:getById',
    validateAndHandle('timeEntry:getById', [idSchema], (_, id) =>
      withDb((db) => timeEntryRepo.getById(db, id))
    )
  )
  ipcMain.handle(
    'timeEntry:getByTaskId',
    validateAndHandle('timeEntry:getByTaskId', [idSchema], (_, task_id) =>
      withDb((db) => timeEntryRepo.getByTaskId(db, task_id))
    )
  )
  ipcMain.handle('timeEntry:getAll', handleIpc('timeEntry:getAll', () =>
    withDb((db) => timeEntryRepo.getAll(db))
  ))
  ipcMain.handle(
    'timeEntry:update',
    validateAndHandle('timeEntry:update', [idSchema, timeEntryUpdateSchema], (_, id, data) =>
      withDb((db) => timeEntryRepo.update(db, id, data))
    )
  )
  ipcMain.handle(
    'timeEntry:delete',
    validateAndHandle('timeEntry:delete', [idSchema], (_, id) =>
      withDb((db) => timeEntryRepo.remove(db, id))
    )
  )
}
