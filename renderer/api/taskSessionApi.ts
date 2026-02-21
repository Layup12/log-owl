import type { TaskSession } from '@renderer/shared/types'
import {
  TASK_SESSION_CLOSE_OPEN_BY_TASK_ID,
  TASK_SESSION_CREATE,
  TASK_SESSION_DELETE,
  TASK_SESSION_GET_BY_TASK_ID,
  TASK_SESSION_UPDATE,
  unwrapIpcResponse
} from '@contracts'

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
  const response = await window.electron.invoke(TASK_SESSION_GET_BY_TASK_ID, taskId)
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
  const response = await window.electron.invoke(TASK_SESSION_CREATE, payload)
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
  const response = await window.electron.invoke(TASK_SESSION_UPDATE, id, payload)
  unwrapIpcResponse(response)
}

export async function deleteTaskSession(id: number): Promise<void> {
  const response = await window.electron.invoke(TASK_SESSION_DELETE, id)
  unwrapIpcResponse(response)
}

export async function closeOpenTaskSessionsByTaskId(taskId: number): Promise<void> {
  const response = await window.electron.invoke(TASK_SESSION_CLOSE_OPEN_BY_TASK_ID, taskId)
  unwrapIpcResponse(response)
}
