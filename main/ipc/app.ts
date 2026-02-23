import { APP_GET_RECOVERY_INFO } from '@contracts'
import type { IpcMain } from 'electron'

import { handleIpc } from './lib'

let recoveryClosedIds: number[] = []

export function setRecoveryClosedIds(ids: number[]): void {
  recoveryClosedIds = ids
}

export function registerApp(ipcMain: IpcMain): void {
  ipcMain.handle(
    APP_GET_RECOVERY_INFO,
    handleIpc(APP_GET_RECOVERY_INFO, () => {
      const ids = recoveryClosedIds
      recoveryClosedIds = []
      return { recovered: ids.length > 0, closedIds: ids }
    })
  )
}
