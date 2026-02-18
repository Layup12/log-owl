import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material'
import { Check as CheckIcon, Close as CloseIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { DeleteTaskConfirmDialog } from './DeleteTaskConfirmDialog'
import { useTimerStore } from '../store/timerStore'
import type { Task } from '../types/task'

interface TaskCardProps {
  task: Task
  onUpdate: () => void
  onOpen?: () => void
}

export function TaskCard({ task, onUpdate, onOpen }: TaskCardProps) {
  const isCompleted = !!task.completed_at
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const clearActive = useTimerStore((s) => s.clearActive)
  const activeTaskId = useTimerStore((s) => s.activeTaskId)
  const activeEntryId = useTimerStore((s) => s.activeEntryId)

  const handleToggleCompleted = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await window.electron.invoke('task:update', task.id, {
      completed_at: isCompleted ? null : new Date().toISOString(),
    })
    onUpdate()
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (activeTaskId === task.id && activeEntryId !== null) clearActive()
    await window.electron.invoke('task:delete', task.id)
    onUpdate()
  }

  return (
    <>
      <Card
        variant="outlined"
        sx={{
          height: '100%',
          minHeight: 0,
          display: 'flex',
          cursor: onOpen ? 'pointer' : undefined,
          '&:hover': onOpen ? { bgcolor: 'action.hover' } : undefined,
        }}
        onClick={onOpen ? () => onOpen() : undefined}
      >
        <CardContent
          sx={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            py: 1,
            px: 1,
            '&:last-child': { pb: 1 },
          }}
        >
          <Typography
            variant="body2"
            sx={{
              flex: 1,
              minHeight: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              textDecoration: isCompleted ? 'line-through' : 'none',
              color: isCompleted ? 'text.secondary' : 'text.primary',
              textAlign: 'left',
            }}
          >
            {task.title?.trim() ? task.title : '—'}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 0,
              mt: 0.5,
            }}
          >
            <Tooltip title={isCompleted ? 'Пометить активной' : 'Отметить выполненной'}>
              <IconButton
                size="small"
                onClick={handleToggleCompleted}
                aria-label={isCompleted ? 'Пометить активной' : 'Отметить выполненной'}
              >
                {isCompleted ? (
                  <CloseIcon fontSize="small" />
                ) : (
                  <CheckIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip title="Удалить">
              <IconButton
                size="small"
                onClick={handleDeleteClick}
                aria-label="Удалить"
                color="error"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>
      <DeleteTaskConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}
