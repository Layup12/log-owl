export interface TaskSession {
  id: number
  task_id: number
  opened_at: string
  closed_at: string | null
  last_seen: string | null
}
