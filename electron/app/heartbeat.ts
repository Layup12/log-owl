import { app } from 'electron'
import { getDb } from '../db'
import * as appStateRepo from '../repositories/appStateRepository'
import { LAST_SEEN_KEY } from '../constants/appStateKeys'

const HEARTBEAT_INTERVAL_MS = 45 * 1000

export function startHeartbeat(): void {
  const db = getDb(app.getPath('userData'))
  const tick = () => {
    appStateRepo.set(db, LAST_SEEN_KEY, new Date().toISOString())
  }
  tick()
  setInterval(tick, HEARTBEAT_INTERVAL_MS)
}
