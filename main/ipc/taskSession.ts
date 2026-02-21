import type { IpcMain } from 'electron'
import {
  TASK_SESSION_CLOSE_OPEN_BY_TASK_ID,
  TASK_SESSION_CREATE,
  TASK_SESSION_DELETE,
  TASK_SESSION_GET_ALL,
  TASK_SESSION_GET_BY_ID,
  TASK_SESSION_GET_BY_TASK_ID,
  TASK_SESSION_UPDATE,
} from '@contracts'
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
    TASK_SESSION_CREATE,
    validateAndHandle(
      TASK_SESSION_CREATE,
      [taskSessionInsertSchema],
      (_, data) => withDb((db) => taskSessionRepo.create(db, data))
    )
  )
  ipcMain.handle(
    TASK_SESSION_GET_BY_ID,
    validateAndHandle(TASK_SESSION_GET_BY_ID, [idSchema], (_, id) =>
      withDb((db) => taskSessionRepo.getById(db, id))
    )
  )
  ipcMain.handle(
    TASK_SESSION_GET_BY_TASK_ID,
    validateAndHandle(TASK_SESSION_GET_BY_TASK_ID, [idSchema], (_, task_id) =>
      withDb((db) => taskSessionRepo.getByTaskId(db, task_id))
    )
  )
  ipcMain.handle(
    TASK_SESSION_GET_ALL,
    handleIpc(TASK_SESSION_GET_ALL, () =>
      withDb((db) => taskSessionRepo.getAll(db))
    )
  )
  ipcMain.handle(
    TASK_SESSION_UPDATE,
    validateAndHandle(
      TASK_SESSION_UPDATE,
      [idSchema, taskSessionUpdateSchema],
      (_, id, data) => withDb((db) => taskSessionRepo.update(db, id, data))
    )
  )
  ipcMain.handle(
    TASK_SESSION_DELETE,
    validateAndHandle(TASK_SESSION_DELETE, [idSchema], (_, id) =>
      withDb((db) => taskSessionRepo.remove(db, id))
    )
  )
  ipcMain.handle(
    TASK_SESSION_CLOSE_OPEN_BY_TASK_ID,
    validateAndHandle(
      TASK_SESSION_CLOSE_OPEN_BY_TASK_ID,
      [idSchema],
      (_, task_id) =>
        withDb((db) =>
          taskSessionRepo.closeOpenByTaskId(
            db,
            task_id,
            new Date().toISOString()
          )
        )
    )
  )
}
