import { withDb as withDbForPath } from '@main/db'
import { app, ipcMain } from 'electron'

import { registerApp } from './app'
import type { WithDb } from './lib'
import { registerReport } from './report'
import { registerSettings } from './settings'
import { registerTask } from './task'
import { registerTaskSession } from './taskSession'
import { registerTimeEntry } from './timeEntry'

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
