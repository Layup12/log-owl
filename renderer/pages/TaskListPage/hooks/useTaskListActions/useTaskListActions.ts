import { createTask } from '@renderer/api'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router'

export interface UseTaskListActionsOptions {
  /** Проброс ошибок создания задачи (и сброс перед запросом) */
  onError?: (message: string | null) => void
}

export interface UseTaskListActionsResult {
  creating: boolean
  handleCreateTask: () => void
  openTask: (id: number) => void
  completedOpen: boolean
  toggleCompletedOpen: () => void
}

export function useTaskListActions(
  options: UseTaskListActionsOptions = {}
): UseTaskListActionsResult {
  const { onError } = options
  const navigate = useNavigate()
  const [creating, setCreating] = useState(false)
  const [completedOpen, setCompletedOpen] = useState(false)

  const handleCreateTask = useCallback(() => {
    if (creating) return
    setCreating(true)
    onError?.(null)
    createTask({ title: '', comment: null })
      .then((created) => {
        if (created.id != null) {
          navigate(`/task/${created.id}`)
        } else {
          onError?.('Не удалось создать задачу')
        }
      })
      .catch((e: unknown) => {
        onError?.(e instanceof Error ? e.message : 'Ошибка')
      })
      .finally(() => setCreating(false))
  }, [creating, navigate, onError])

  const openTask = useCallback(
    (id: number) => navigate(`/task/${id}`),
    [navigate]
  )

  const toggleCompletedOpen = useCallback(
    () => setCompletedOpen((prev) => !prev),
    []
  )

  return {
    creating,
    handleCreateTask,
    openTask,
    completedOpen,
    toggleCompletedOpen,
  }
}
