export interface RecoveryInfo {
  recovered: boolean
  closedIds: number[]
}

export async function getRecoveryInfo(): Promise<RecoveryInfo> {
  const res = (await window.electron.invoke('app:getRecoveryInfo')) as RecoveryInfo
  return res
}

