import {
  TIME_ENTRY_CREATE,
  TIME_ENTRY_DELETE,
  TIME_ENTRY_GET_BY_TASK_ID,
  TIME_ENTRY_UPDATE,
  unwrapIpcResponse,
} from '@contracts'
import type { TimeEntry } from '@renderer/shared/types'

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

export async function getTimeEntriesByTaskId(
  taskId: number
): Promise<TimeEntry[]> {
  const response = await window.electron.invoke(
    TIME_ENTRY_GET_BY_TASK_ID,
    taskId
  )
  const list = unwrapIpcResponse(response)
  return Array.isArray(list) ? list : []
}

export async function createTimeEntry(
  input: CreateTimeEntryInput
): Promise<{ id: number; started_at: string }> {
  const payload = {
    task_id: input.taskId,
    started_at: input.startedAt,
    ended_at: input.endedAt ?? null,
    source: input.source ?? null,
  }
  const response = await window.electron.invoke(TIME_ENTRY_CREATE, payload)
  return unwrapIpcResponse(response)
}

export async function updateTimeEntry(
  id: number,
  input: UpdateTimeEntryInput
): Promise<void> {
  const payload: { started_at?: string; ended_at?: string | null } = {}
  if (input.startedAt !== undefined) payload.started_at = input.startedAt
  if (input.endedAt !== undefined) payload.ended_at = input.endedAt
  const response = await window.electron.invoke(TIME_ENTRY_UPDATE, id, payload)
  unwrapIpcResponse(response)
}

export async function deleteTimeEntry(id: number): Promise<void> {
  const response = await window.electron.invoke(TIME_ENTRY_DELETE, id)
  unwrapIpcResponse(response)
}
