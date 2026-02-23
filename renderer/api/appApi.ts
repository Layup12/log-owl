import type { RecoveryInfo } from '@contracts'
import { APP_GET_RECOVERY_INFO } from '@contracts'
import { unwrapIpcResponse } from '@contracts'

export type { RecoveryInfo }

export async function getRecoveryInfo(): Promise<RecoveryInfo> {
  const response = await window.electron.invoke(APP_GET_RECOVERY_INFO)
  return unwrapIpcResponse(response)
}
