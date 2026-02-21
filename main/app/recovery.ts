import type Database from 'better-sqlite3'
import * as appStateRepo from '../repositories/appStateRepository'
import * as timeEntryRepo from '../repositories/timeEntryRepository'
import { LAST_SEEN_KEY } from '../constants/appStateKeys'

/**
 * Закрывает все открытые time_entries значением last_seen (или текущим временем).
 * Возвращает массив id закрытых записей для передачи в setRecoveryClosedIds.
 */
export function runRecovery(db: Database.Database): number[] {
  const openEntries = timeEntryRepo.getOpen(db)
  const closedIds: number[] = []
  if (openEntries.length === 0) return closedIds
  const lastSeen =
    appStateRepo.get(db, LAST_SEEN_KEY) ?? new Date().toISOString()
  for (const entry of openEntries) {
    timeEntryRepo.update(db, entry.id, { ended_at: lastSeen })
    closedIds.push(entry.id)
  }
  return closedIds
}
