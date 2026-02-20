import type { Task } from '@shared/types'

export interface CreateTaskInput {
  title: string
  comment?: string | null
  completedAt?: string | null
}

export async function getAllTasks(): Promise<Task[]> {
  const result = (await window.electron.invoke('task:getAll')) as Task[]
  return Array.isArray(result) ? result : []
}

export async function getTaskById(id: number): Promise<Task | null> {
  const task = (await window.electron.invoke('task:getById', id)) as Task | null
  return task ?? null
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const payload = {
    title: input.title,
    comment: input.comment ?? null,
    completed_at: input.completedAt ?? null,
  }
  const task = (await window.electron.invoke('task:create', payload)) as Task
  return task
}

export async function updateTask(
  id: number,
  data: Partial<Pick<Task, 'title' | 'comment' | 'completed_at'>>
): Promise<void> {
  await window.electron.invoke('task:update', id, data)
}

export async function deleteTask(id: number): Promise<void> {
  await window.electron.invoke('task:delete', id)
}

