import type { IpcMain } from 'electron'
import * as timeEntryRepo from '../repositories/timeEntryRepository'
import { validateAndHandle, isoStringSchema, type WithDb } from './lib'

export function registerReport(ipcMain: IpcMain, withDb: WithDb): void {
  ipcMain.handle(
    'report:getTimeEntriesInRange',
    validateAndHandle(
      'report:getTimeEntriesInRange',
      [isoStringSchema, isoStringSchema],
      (_, fromIso, toIso) =>
        withDb((db) => timeEntryRepo.getInRange(db, fromIso, toIso))
    )
  )
}
