import { getAllTasks, getServiceTask } from '@renderer/api'
import type { Task } from '@renderer/shared/types'
import { useCallback, useEffect, useMemo, useState } from 'react'

export interface UseTaskListDataReturn {
  tasks: Task[]
  serviceTask: Task | null
  loading: boolean
  error: string | null
  setError: (value: string | null) => void
  reload: () => Promise<void>
  activeTasks: Task[]
  completedTasks: Task[]
  hasCompleted: boolean
}

export function useTaskListData(): UseTaskListDataReturn {
  const [tasks, setTasks] = useState<Task[]>([])
  const [serviceTask, setServiceTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTasks = useCallback(async () => {
    try {
      setError(null)
      const [tasksResult, serviceTaskResult] = await Promise.all([
        getAllTasks(),
        getServiceTask(),
      ])
      setTasks(tasksResult)
      setServiceTask(serviceTaskResult ?? null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const activeTasks = useMemo(
    () => tasks.filter((t) => !t.completed_at),
    [tasks]
  )
  const completedTasks = useMemo(
    () => tasks.filter((t) => t.completed_at),
    [tasks]
  )
  const hasCompleted = completedTasks.length > 0

  return {
    tasks,
    serviceTask,
    loading,
    error,
    setError,
    reload: loadTasks,
    activeTasks,
    completedTasks,
    hasCompleted,
  }
}
