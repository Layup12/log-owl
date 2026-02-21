import type { IpcMain } from 'electron'
import * as taskRepo from '../repositories/taskRepository'
import {
  handleIpc,
  validateAndHandle,
  idSchema,
  taskInsertSchema,
  taskUpdateSchema,
  type WithDb,
} from './lib'

export function registerTask(ipcMain: IpcMain, withDb: WithDb): void {
  ipcMain.handle(
    'task:create',
    validateAndHandle('task:create', [taskInsertSchema], (_, data) =>
      withDb((db) => taskRepo.create(db, data))
    )
  )
  ipcMain.handle(
    'task:getById',
    validateAndHandle('task:getById', [idSchema], (_, id) =>
      withDb((db) => taskRepo.getById(db, id))
    )
  )
  ipcMain.handle('task:getAll', handleIpc('task:getAll', () =>
    withDb((db) => taskRepo.getAll(db))
  ))
  ipcMain.handle(
    'task:update',
    validateAndHandle('task:update', [idSchema, taskUpdateSchema], (_, id, data) =>
      withDb((db) => taskRepo.update(db, id, data))
    )
  )
  ipcMain.handle(
    'task:delete',
    validateAndHandle('task:delete', [idSchema], (_, id) =>
      withDb((db) => taskRepo.remove(db, id))
    )
  )
}
