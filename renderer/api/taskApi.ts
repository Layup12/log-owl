import {
  TASK_CREATE,
  TASK_DELETE,
  TASK_GET_ALL,
  TASK_GET_BY_ID,
  TASK_UPDATE,
  unwrapIpcResponse,
} from '@contracts'
import type { Task } from '@renderer/shared/types'

export interface CreateTaskInput {
  title: string
  comment?: string | null
  completedAt?: string | null
}

export async function getAllTasks(): Promise<Task[]> {
  const response = await window.electron.invoke(TASK_GET_ALL)
  const result = unwrapIpcResponse(response)
  return Array.isArray(result) ? result : []
}

export async function getTaskById(id: number): Promise<Task | null> {
  const response = await window.electron.invoke(TASK_GET_BY_ID, id)
  return unwrapIpcResponse(response)
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const payload = {
    title: input.title,
    comment: input.comment ?? null,
    completed_at: input.completedAt ?? null,
  }
  const response = await window.electron.invoke(TASK_CREATE, payload)
  return unwrapIpcResponse(response)
}

export async function updateTask(
  id: number,
  data: Partial<Pick<Task, 'title' | 'comment' | 'completed_at'>>
): Promise<void> {
  const response = await window.electron.invoke(TASK_UPDATE, id, data)
  unwrapIpcResponse(response)
}

export async function deleteTask(id: number): Promise<void> {
  const response = await window.electron.invoke(TASK_DELETE, id)
  unwrapIpcResponse(response)
}
