import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material'

interface DeleteTaskConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
}

const MESSAGE =
  'Задача и все связанные интервалы будут удалены. Это действие нельзя отменить.'

export function DeleteTaskConfirmDialog({
  open,
  onClose,
  onConfirm,
}: DeleteTaskConfirmDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Удалить задачу?</DialogTitle>
      <DialogContent>
        <Typography>{MESSAGE}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Отмена
        </Button>
        <Button color="error" variant="contained" onClick={handleConfirm} disabled={loading}>
          Удалить
        </Button>
      </DialogActions>
    </Dialog>
  )
}
