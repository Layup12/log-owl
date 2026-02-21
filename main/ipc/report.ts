import type { IpcMain } from 'electron'
import { REPORT_GET_TIME_ENTRIES_IN_RANGE } from '@contracts'
import * as timeEntryRepo from '../repositories/timeEntryRepository'
import { validateAndHandle, isoStringSchema, type WithDb } from './lib'

export function registerReport(ipcMain: IpcMain, withDb: WithDb): void {
  ipcMain.handle(
    REPORT_GET_TIME_ENTRIES_IN_RANGE,
    validateAndHandle(
      REPORT_GET_TIME_ENTRIES_IN_RANGE,
      [isoStringSchema, isoStringSchema],
      (_, fromIso, toIso) =>
        withDb((db) => timeEntryRepo.getInRange(db, fromIso, toIso))
    )
  )
}
