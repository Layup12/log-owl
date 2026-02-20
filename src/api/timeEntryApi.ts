import type { TimeEntry } from '@shared/types'

export interface CreateTimeEntryInput {
  taskId: number
  startedAt: string
  endedAt?: string | null
  source?: string | null
}

export interface UpdateTimeEntryInput {
  startedAt?: string
  endedAt?: string | null
}

export async function getTimeEntriesByTaskId(taskId: number): Promise<TimeEntry[]> {
  const list = (await window.electron.invoke('timeEntry:getByTaskId', taskId)) as TimeEntry[]
  return Array.isArray(list) ? list : []
}

export async function createTimeEntry(input: CreateTimeEntryInput): Promise<{ id: number; started_at: string }> {
  const payload = {
    task_id: input.taskId,
    started_at: input.startedAt,
    ended_at: input.endedAt ?? null,
    source: input.source ?? null,
  }
  const entry = (await window.electron.invoke('timeEntry:create', payload)) as {
    id: number
    started_at: string
  }
  return entry
}

export async function updateTimeEntry(id: number, input: UpdateTimeEntryInput): Promise<void> {
  const payload: { started_at?: string; ended_at?: string | null } = {}
  if (input.startedAt !== undefined) payload.started_at = input.startedAt
  if (input.endedAt !== undefined) payload.ended_at = input.endedAt
  await window.electron.invoke('timeEntry:update', id, payload)
}

export async function deleteTimeEntry(id: number): Promise<void> {
  await window.electron.invoke('timeEntry:delete', id)
}

