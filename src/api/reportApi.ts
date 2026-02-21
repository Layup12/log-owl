import type { TimeEntry } from '@shared/types'
import type { IpcResponse } from './ipcResponse'
import { unwrapIpcResponse } from './ipcResponse'

export async function getTimeEntriesInRange(fromIso: string, toIso: string): Promise<TimeEntry[]> {
  const response = (await window.electron.invoke(
    'report:getTimeEntriesInRange',
    fromIso,
    toIso
  )) as IpcResponse<TimeEntry[]>
  const result = unwrapIpcResponse(response)
  return Array.isArray(result) ? result : []
}
