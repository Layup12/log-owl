import type { TimeEntry } from '@shared/types'

export async function getTimeEntriesInRange(fromIso: string, toIso: string): Promise<TimeEntry[]> {
  const result = (await window.electron.invoke(
    'report:getTimeEntriesInRange',
    fromIso,
    toIso
  )) as TimeEntry[]
  return Array.isArray(result) ? result : []
}

