import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, CircularProgress, Alert, Button } from '@mui/material'

export function NewTaskPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const createdRef = useRef(false)

  useEffect(() => {
    if (createdRef.current) return
    createdRef.current = true
    setError(null)
    window.electron
      .invoke('task:create', { title: '', comment: null })
      .then((created: unknown) => {
        const { id } = created as { id: number }
        if (id != null) navigate(`/task/${id}`, { replace: true })
        else setError('Не удалось создать задачу')
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : 'Ошибка')
        createdRef.current = false
      })
  }, [navigate])

  if (error) {
    return (
      <Box sx={{ maxWidth: 640 }}>
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
        <Button onClick={() => navigate('/')}>К списку</Button>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
      <CircularProgress />
    </Box>
  )
}
