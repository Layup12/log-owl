import type { IpcResponse } from './ipcResponse'
import { unwrapIpcResponse } from './ipcResponse'

export interface RecoveryInfo {
  recovered: boolean
  closedIds: number[]
}

export async function getRecoveryInfo(): Promise<RecoveryInfo> {
  const response = (await window.electron.invoke('app:getRecoveryInfo')) as IpcResponse<RecoveryInfo>
  return unwrapIpcResponse(response)
}
