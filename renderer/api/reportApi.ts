import type { TimeEntry } from '@renderer/shared/types'
import { REPORT_GET_TIME_ENTRIES_IN_RANGE, unwrapIpcResponse } from '@contracts'

export async function getTimeEntriesInRange(
  fromIso: string,
  toIso: string
): Promise<TimeEntry[]> {
  const response = await window.electron.invoke(
    REPORT_GET_TIME_ENTRIES_IN_RANGE,
    fromIso,
    toIso
  )
  const result = unwrapIpcResponse(response)
  return Array.isArray(result) ? result : []
}
