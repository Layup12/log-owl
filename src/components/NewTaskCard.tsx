import React, { useState } from 'react'
import { Card, CardContent, TextField, Button, Box } from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'

interface NewTaskCardProps {
  onCreated: () => void
}

export function NewTaskCard({ onCreated }: NewTaskCardProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    await window.electron.invoke('task:create', {
      title: title.trim(),
      comment: comment.trim() || null,
    })
    setTitle('')
    setComment('')
    setOpen(false)
    onCreated()
  }

  if (!open) {
    return (
      <Card
        variant="outlined"
        sx={{
          mb: 1,
          cursor: 'pointer',
          borderStyle: 'dashed',
          '&:hover': { bgcolor: 'action.hover' },
        }}
        onClick={() => setOpen(true)}
      >
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 2 }}>
          <AddIcon color="action" />
          <Box component="span" sx={{ color: 'text.secondary' }}>
            Новая задача
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant="outlined" sx={{ mb: 1 }}>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <TextField
            size="small"
            label="Название"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
            autoFocus
            sx={{ mb: 1.5 }}
          />
          <TextField
            size="small"
            label="Комментарий"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            fullWidth
            multiline
            minRows={2}
            sx={{ mb: 1.5 }}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button type="submit" variant="contained" size="small" disabled={!title.trim()}>
              Создать
            </Button>
            <Button
              type="button"
              size="small"
              onClick={() => {
                setOpen(false)
                setTitle('')
                setComment('')
              }}
            >
              Отмена
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  )
}
