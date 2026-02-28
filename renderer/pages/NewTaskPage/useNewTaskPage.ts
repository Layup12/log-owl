import { createTask } from '@renderer/api'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'

interface UseNewTaskPageResult {
  error: string | null
  clearError: () => void
  goToList: () => void
}

export function useNewTaskPage(): UseNewTaskPageResult {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const createdRef = useRef(false)

  useEffect(() => {
    if (createdRef.current) return
    createdRef.current = true
    setError(null)
    createTask({ title: '', comment: null })
      .then((created) => {
        const { id } = created
        if (id != null) navigate(`/task/${id}`, { replace: true })
        else setError('Не удалось создать задачу')
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : 'Ошибка')
        createdRef.current = false
      })
  }, [navigate])

  return {
    error,
    clearError: () => setError(null),
    goToList: () => navigate('/'),
  }
}
