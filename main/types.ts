export interface Task {
  id: number
  title: string
  comment: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
  is_service: 0 | 1
}

export interface TaskInsert {
  title: string
  comment?: string | null
  completed_at?: string | null
  is_service?: 0 | 1
}

export interface TimeEntry {
  id: number
  task_id: number
  started_at: string
  ended_at: string | null
  source: string | null
}

export interface TimeEntryInsert {
  task_id: number
  started_at: string
  ended_at?: string | null
  source?: string | null
}

export interface TaskSession {
  id: number
  task_id: number
  opened_at: string
  closed_at: string | null
  last_seen: string | null
}

export interface TaskSessionInsert {
  task_id: number
  opened_at: string
  closed_at?: string | null
  last_seen?: string | null
}

export interface Setting {
  key: string
  value: string
}
