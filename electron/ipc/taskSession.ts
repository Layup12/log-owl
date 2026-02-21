import type { IpcMain } from 'electron'
import * as taskSessionRepo from '../repositories/taskSessionRepository'
import {
  handleIpc,
  validateAndHandle,
  idSchema,
  taskSessionInsertSchema,
  taskSessionUpdateSchema,
  type WithDb,
} from './lib'

export function registerTaskSession(ipcMain: IpcMain, withDb: WithDb): void {
  ipcMain.handle(
    'taskSession:create',
    validateAndHandle('taskSession:create', [taskSessionInsertSchema], (_, data) =>
      withDb((db) => taskSessionRepo.create(db, data))
    )
  )
  ipcMain.handle(
    'taskSession:getById',
    validateAndHandle('taskSession:getById', [idSchema], (_, id) =>
      withDb((db) => taskSessionRepo.getById(db, id))
    )
  )
  ipcMain.handle(
    'taskSession:getByTaskId',
    validateAndHandle('taskSession:getByTaskId', [idSchema], (_, task_id) =>
      withDb((db) => taskSessionRepo.getByTaskId(db, task_id))
    )
  )
  ipcMain.handle('taskSession:getAll', handleIpc('taskSession:getAll', () =>
    withDb((db) => taskSessionRepo.getAll(db))
  ))
  ipcMain.handle(
    'taskSession:update',
    validateAndHandle('taskSession:update', [idSchema, taskSessionUpdateSchema], (_, id, data) =>
      withDb((db) => taskSessionRepo.update(db, id, data))
    )
  )
  ipcMain.handle(
    'taskSession:delete',
    validateAndHandle('taskSession:delete', [idSchema], (_, id) =>
      withDb((db) => taskSessionRepo.remove(db, id))
    )
  )
  ipcMain.handle(
    'taskSession:closeOpenByTaskId',
    validateAndHandle('taskSession:closeOpenByTaskId', [idSchema], (_, task_id) =>
      withDb((db) => taskSessionRepo.closeOpenByTaskId(db, task_id, new Date().toISOString()))
    )
  )
}
