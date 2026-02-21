import type { IpcMain } from 'electron'
import { handleIpc } from './lib'

let recoveryClosedIds: number[] = []

export function setRecoveryClosedIds(ids: number[]): void {
  recoveryClosedIds = ids
}

export function registerApp(ipcMain: IpcMain): void {
  ipcMain.handle('app:getRecoveryInfo', handleIpc('app:getRecoveryInfo', () => {
    const ids = recoveryClosedIds
    recoveryClosedIds = []
    return { recovered: ids.length > 0, closedIds: ids }
  }))
}
