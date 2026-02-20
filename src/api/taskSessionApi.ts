import type { TaskSession } from '@shared/types'

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
  const list = (await window.electron.invoke('taskSession:getByTaskId', taskId)) as TaskSession[]
  return Array.isArray(list) ? list : []
}

export async function createTaskSession(input: CreateTaskSessionInput): Promise<TaskSession> {
  const payload = {
    task_id: input.taskId,
    opened_at: input.openedAt,
    closed_at: input.closedAt ?? null,
    last_seen: input.lastSeen ?? null,
  }
  const session = (await window.electron.invoke('taskSession:create', payload)) as TaskSession
  return session
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
  await window.electron.invoke('taskSession:update', id, payload)
}

export async function deleteTaskSession(id: number): Promise<void> {
  await window.electron.invoke('taskSession:delete', id)
}

export async function closeOpenTaskSessionsByTaskId(taskId: number): Promise<void> {
  await window.electron.invoke('taskSession:closeOpenByTaskId', taskId)
}

