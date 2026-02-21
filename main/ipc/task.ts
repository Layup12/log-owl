import type { IpcMain } from 'electron'
import {
  TASK_CREATE,
  TASK_DELETE,
  TASK_GET_ALL,
  TASK_GET_BY_ID,
  TASK_UPDATE,
} from '@contracts'
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
    TASK_CREATE,
    validateAndHandle(TASK_CREATE, [taskInsertSchema], (_, data) =>
      withDb((db) => taskRepo.create(db, data))
    )
  )
  ipcMain.handle(
    TASK_GET_BY_ID,
    validateAndHandle(TASK_GET_BY_ID, [idSchema], (_, id) =>
      withDb((db) => taskRepo.getById(db, id))
    )
  )
  ipcMain.handle(
    TASK_GET_ALL,
    handleIpc(TASK_GET_ALL, () => withDb((db) => taskRepo.getAll(db)))
  )
  ipcMain.handle(
    TASK_UPDATE,
    validateAndHandle(
      TASK_UPDATE,
      [idSchema, taskUpdateSchema],
      (_, id, data) => withDb((db) => taskRepo.update(db, id, data))
    )
  )
  ipcMain.handle(
    TASK_DELETE,
    validateAndHandle(TASK_DELETE, [idSchema], (_, id) =>
      withDb((db) => taskRepo.remove(db, id))
    )
  )
}
