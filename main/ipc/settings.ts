import type { IpcMain } from 'electron'
import {
  SETTINGS_DELETE,
  SETTINGS_GET,
  SETTINGS_GET_ALL,
  SETTINGS_SET,
} from '@contracts'
import * as settingsRepo from '../repositories/settingsRepository'
import {
  handleIpc,
  validateAndHandle,
  keySchema,
  valueSchema,
  type WithDb,
} from './lib'

export function registerSettings(ipcMain: IpcMain, withDb: WithDb): void {
  ipcMain.handle(
    SETTINGS_GET,
    validateAndHandle(SETTINGS_GET, [keySchema], (_, key) =>
      withDb((db) => settingsRepo.get(db, key))
    )
  )
  ipcMain.handle(
    SETTINGS_SET,
    validateAndHandle(SETTINGS_SET, [keySchema, valueSchema], (_, key, value) =>
      withDb((db) => {
        settingsRepo.set(db, key, value)
        return undefined
      })
    )
  )
  ipcMain.handle(SETTINGS_GET_ALL, handleIpc(SETTINGS_GET_ALL, () =>
    withDb((db) => settingsRepo.getAll(db))
  ))
  ipcMain.handle(
    SETTINGS_DELETE,
    validateAndHandle(SETTINGS_DELETE, [keySchema], (_, key) =>
      withDb((db) => settingsRepo.remove(db, key))
    )
  )
}
