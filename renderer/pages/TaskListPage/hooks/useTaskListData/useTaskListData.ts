import { getAllTasks } from '@renderer/api'
import type { Task } from '@renderer/shared/types'
import { useCallback, useEffect, useMemo, useState } from 'react'

export interface UseTaskListDataReturn {
  tasks: Task[]
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTasks = useCallback(async () => {
    try {
      setError(null)
      const result = await getAllTasks()
      setTasks(result)
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
    loading,
    error,
    setError,
    reload: loadTasks,
    activeTasks,
    completedTasks,
    hasCompleted,
  }
}
