import { useCallback, useState } from 'react'

interface UseDeleteTaskDialogResult {
  isOpen: boolean
  taskId: number | null
  open: (taskId: number) => void
  close: () => void
}

export function useDeleteTaskDialog(): UseDeleteTaskDialogResult {
  const [state, setState] = useState<{
    isOpen: boolean
    taskId: number | null
  }>({ isOpen: false, taskId: null })

  const open = useCallback((taskId: number) => {
    setState({ isOpen: true, taskId })
  }, [])

  const close = useCallback(() => {
    setState({ isOpen: false, taskId: null })
  }, [])

  return {
    isOpen: state.isOpen,
    taskId: state.taskId,
    open,
    close,
  }
}
