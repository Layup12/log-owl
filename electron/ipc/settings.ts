import type { IpcMain } from 'electron'
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
    'settings:get',
    validateAndHandle('settings:get', [keySchema], (_, key) =>
      withDb((db) => settingsRepo.get(db, key))
    )
  )
  ipcMain.handle(
    'settings:set',
    validateAndHandle('settings:set', [keySchema, valueSchema], (_, key, value) =>
      withDb((db) => {
        settingsRepo.set(db, key, value)
        return undefined
      })
    )
  )
  ipcMain.handle('settings:getAll', handleIpc('settings:getAll', () =>
    withDb((db) => settingsRepo.getAll(db))
  ))
  ipcMain.handle(
    'settings:delete',
    validateAndHandle('settings:delete', [keySchema], (_, key) =>
      withDb((db) => settingsRepo.remove(db, key))
    )
  )
}
