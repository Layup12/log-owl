import { deleteTask } from '@renderer/api'
import { useTimerStore } from '@renderer/shared/store'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@renderer/shared/ui'
import { useState } from 'react'

export interface DeleteTaskConfirmDialogProps {
  open: boolean
  onClose: () => void
  taskId: number | null
  onDeleted?: () => void
}

const MESSAGE =
  'Задача и все связанные интервалы будут удалены. Это действие нельзя отменить.'

export function DeleteTaskConfirmDialog({
  open,
  onClose,
  taskId,
  onDeleted,
}: DeleteTaskConfirmDialogProps) {
  const [loading, setLoading] = useState(false)
  const { activeTaskId, activeEntryId, clearActive } = useTimerStore()

  const handleConfirm = async () => {
    if (taskId === null) return
    setLoading(true)
    try {
      if (activeTaskId === taskId && activeEntryId !== null) {
        clearActive()
      }
      await deleteTask(taskId)
      onClose()
      onDeleted?.()
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
        <Button
          color="error"
          variant="contained"
          onClick={handleConfirm}
          disabled={loading}
        >
          Удалить
        </Button>
      </DialogActions>
    </Dialog>
  )
}
