import { app } from 'electron'

import { getDb } from '../db'
import { ensureServiceTask } from '../repositories/taskRepository'

export function bootstrap(): void {
  const db = getDb(app.getPath('userData'))
  ensureServiceTask(db)
}
