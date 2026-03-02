import {
  TASK_CREATE,
  TASK_DELETE,
  TASK_GET_ALL,
  TASK_GET_BY_ID,
  TASK_GET_SERVICE,
  TASK_UPDATE,
} from '@contracts'
import type { IpcMain } from 'electron'

import * as taskRepo from '../repositories/taskRepository'
import {
  handleIpc,
  idSchema,
  taskInsertSchema,
  taskUpdateSchema,
  validateAndHandle,
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
    TASK_GET_SERVICE,
    handleIpc(TASK_GET_SERVICE, () =>
      withDb((db) => taskRepo.getServiceTask(db))
    )
  )
  ipcMain.handle(
    TASK_UPDATE,
    validateAndHandle(
      TASK_UPDATE,
      [idSchema, taskUpdateSchema],
      (_, id, data) =>
        withDb((db) => {
          const current = taskRepo.getById(db, id)
          const isCompletingServiceTask =
            current?.is_service === 1 &&
            data.completed_at != null &&
            data.completed_at !== ''
          const updateData = isCompletingServiceTask
            ? { ...data, is_service: 0 as const }
            : data
          const updated = taskRepo.update(db, id, updateData)
          if (isCompletingServiceTask) {
            taskRepo.ensureServiceTask(db)
          }
          return updated
        })
    )
  )
  ipcMain.handle(
    TASK_DELETE,
    validateAndHandle(TASK_DELETE, [idSchema], (_, id) =>
      withDb((db) => {
        const task = taskRepo.getById(db, id)
        const removed = taskRepo.remove(db, id)
        if (removed && task?.is_service === 1) {
          taskRepo.ensureServiceTask(db)
        }
        return removed
      })
    )
  )
}
