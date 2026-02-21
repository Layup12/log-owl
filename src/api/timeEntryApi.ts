import type { TimeEntry } from '@shared/types'
import type { IpcResponse } from './ipcResponse'
import { unwrapIpcResponse } from './ipcResponse'

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
  const response = (await window.electron.invoke('timeEntry:getByTaskId', taskId)) as IpcResponse<TimeEntry[]>
  const list = unwrapIpcResponse(response)
  return Array.isArray(list) ? list : []
}

export async function createTimeEntry(input: CreateTimeEntryInput): Promise<{ id: number; started_at: string }> {
  const payload = {
    task_id: input.taskId,
    started_at: input.startedAt,
    ended_at: input.endedAt ?? null,
    source: input.source ?? null,
  }
  const response = (await window.electron.invoke('timeEntry:create', payload)) as IpcResponse<{
    id: number
    started_at: string
  }>
  return unwrapIpcResponse(response)
}

export async function updateTimeEntry(id: number, input: UpdateTimeEntryInput): Promise<void> {
  const payload: { started_at?: string; ended_at?: string | null } = {}
  if (input.startedAt !== undefined) payload.started_at = input.startedAt
  if (input.endedAt !== undefined) payload.ended_at = input.endedAt
  const response = (await window.electron.invoke('timeEntry:update', id, payload)) as IpcResponse<void>
  unwrapIpcResponse(response)
}

export async function deleteTimeEntry(id: number): Promise<void> {
  const response = (await window.electron.invoke('timeEntry:delete', id)) as IpcResponse<boolean>
  unwrapIpcResponse(response)
}
