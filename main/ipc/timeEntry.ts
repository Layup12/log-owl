import type { IpcMain } from 'electron'
import {
  TIME_ENTRY_CREATE,
  TIME_ENTRY_DELETE,
  TIME_ENTRY_GET_ALL,
  TIME_ENTRY_GET_BY_ID,
  TIME_ENTRY_GET_BY_TASK_ID,
  TIME_ENTRY_UPDATE,
} from '@contracts'
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
    TIME_ENTRY_CREATE,
    validateAndHandle(TIME_ENTRY_CREATE, [timeEntryInsertSchema], (_, data) =>
      withDb((db) => timeEntryRepo.create(db, data))
    )
  )
  ipcMain.handle(
    TIME_ENTRY_GET_BY_ID,
    validateAndHandle(TIME_ENTRY_GET_BY_ID, [idSchema], (_, id) =>
      withDb((db) => timeEntryRepo.getById(db, id))
    )
  )
  ipcMain.handle(
    TIME_ENTRY_GET_BY_TASK_ID,
    validateAndHandle(TIME_ENTRY_GET_BY_TASK_ID, [idSchema], (_, task_id) =>
      withDb((db) => timeEntryRepo.getByTaskId(db, task_id))
    )
  )
  ipcMain.handle(TIME_ENTRY_GET_ALL, handleIpc(TIME_ENTRY_GET_ALL, () =>
    withDb((db) => timeEntryRepo.getAll(db))
  ))
  ipcMain.handle(
    TIME_ENTRY_UPDATE,
    validateAndHandle(TIME_ENTRY_UPDATE, [idSchema, timeEntryUpdateSchema], (_, id, data) =>
      withDb((db) => timeEntryRepo.update(db, id, data))
    )
  )
  ipcMain.handle(
    TIME_ENTRY_DELETE,
    validateAndHandle(TIME_ENTRY_DELETE, [idSchema], (_, id) =>
      withDb((db) => timeEntryRepo.remove(db, id))
    )
  )
}
