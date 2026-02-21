import type { TaskSession } from '@shared/types'
import type { IpcResponse } from './ipcResponse'
import { unwrapIpcResponse } from './ipcResponse'

export interface CreateTaskSessionInput {
  taskId: number
  openedAt: string
  closedAt?: string | null
  lastSeen?: string | null
}

export interface UpdateTaskSessionInput {
  taskId?: number
  openedAt?: string
  closedAt?: string | null
  lastSeen?: string | null
}

export async function getTaskSessionsByTaskId(taskId: number): Promise<TaskSession[]> {
  const response = (await window.electron.invoke('taskSession:getByTaskId', taskId)) as IpcResponse<TaskSession[]>
  const list = unwrapIpcResponse(response)
  return Array.isArray(list) ? list : []
}

export async function createTaskSession(input: CreateTaskSessionInput): Promise<TaskSession> {
  const payload = {
    task_id: input.taskId,
    opened_at: input.openedAt,
    closed_at: input.closedAt ?? null,
    last_seen: input.lastSeen ?? null,
  }
  const response = (await window.electron.invoke('taskSession:create', payload)) as IpcResponse<TaskSession>
  return unwrapIpcResponse(response)
}

export async function updateTaskSession(id: number, input: UpdateTaskSessionInput): Promise<void> {
  const payload: {
    task_id?: number
    opened_at?: string
    closed_at?: string | null
    last_seen?: string | null
  } = {}
  if (input.taskId !== undefined) payload.task_id = input.taskId
  if (input.openedAt !== undefined) payload.opened_at = input.openedAt
  if (input.closedAt !== undefined) payload.closed_at = input.closedAt
  if (input.lastSeen !== undefined) payload.last_seen = input.lastSeen
  const response = (await window.electron.invoke('taskSession:update', id, payload)) as IpcResponse<void>
  unwrapIpcResponse(response)
}

export async function deleteTaskSession(id: number): Promise<void> {
  const response = (await window.electron.invoke('taskSession:delete', id)) as IpcResponse<boolean>
  unwrapIpcResponse(response)
}

export async function closeOpenTaskSessionsByTaskId(taskId: number): Promise<void> {
  const response = (await window.electron.invoke('taskSession:closeOpenByTaskId', taskId)) as IpcResponse<number>
  unwrapIpcResponse(response)
}
