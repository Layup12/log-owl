import type { Task } from '@shared/types'
import type { IpcResponse } from './ipcResponse'
import { unwrapIpcResponse } from './ipcResponse'

export interface CreateTaskInput {
  title: string
  comment?: string | null
  completedAt?: string | null
}

export async function getAllTasks(): Promise<Task[]> {
  const response = (await window.electron.invoke('task:getAll')) as IpcResponse<Task[]>
  const result = unwrapIpcResponse(response)
  return Array.isArray(result) ? result : []
}

export async function getTaskById(id: number): Promise<Task | null> {
  const response = (await window.electron.invoke('task:getById', id)) as IpcResponse<Task | null>
  return unwrapIpcResponse(response)
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const payload = {
    title: input.title,
    comment: input.comment ?? null,
    completed_at: input.completedAt ?? null,
  }
  const response = (await window.electron.invoke('task:create', payload)) as IpcResponse<Task>
  return unwrapIpcResponse(response)
}

export async function updateTask(
  id: number,
  data: Partial<Pick<Task, 'title' | 'comment' | 'completed_at'>>
): Promise<void> {
  const response = (await window.electron.invoke('task:update', id, data)) as IpcResponse<void>
  unwrapIpcResponse(response)
}

export async function deleteTask(id: number): Promise<void> {
  const response = (await window.electron.invoke('task:delete', id)) as IpcResponse<boolean>
  unwrapIpcResponse(response)
}
