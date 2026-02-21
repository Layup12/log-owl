import { useCallback, useEffect, useState } from 'react'
import type { Task } from '@renderer/shared/types'
import { getAllTasks } from '@renderer/api'

interface UseTaskListPageResult {
  tasks: Task[]
  loading: boolean
  error: string | null
  setError: (value: string | null) => void
  reload: () => Promise<void>
}

export function useTaskListPage(): UseTaskListPageResult {
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

  return {
    tasks,
    loading,
    error,
    setError,
    reload: loadTasks,
  }
}

