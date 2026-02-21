import { app, ipcMain } from 'electron'
import { withDb as withDbForPath } from '@main/db'
import { registerTask } from './task'
import { registerTimeEntry } from './timeEntry'
import { registerTaskSession } from './taskSession'
import { registerSettings } from './settings'
import { registerReport } from './report'
import { registerApp } from './app'
import type { WithDb } from './lib'

export function registerIpc(): void {
  const userDataPath = app.getPath('userData')
  const withDb: WithDb = (fn) => withDbForPath(userDataPath, fn)
  registerTask(ipcMain, withDb)
  registerTimeEntry(ipcMain, withDb)
  registerTaskSession(ipcMain, withDb)
  registerSettings(ipcMain, withDb)
  registerReport(ipcMain, withDb)
  registerApp(ipcMain)
}
