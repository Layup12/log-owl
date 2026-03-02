import {
  Check as CheckIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  PushPin as PushPinIcon,
} from '@mui/icons-material'
import { updateTask } from '@renderer/api'
import { useDeleteTaskDialog } from '@renderer/hooks'
import { useTaskInvalidationStore } from '@renderer/shared/store'
import type { Task } from '@renderer/shared/types'
import {
  Box,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Typography,
} from '@renderer/shared/ui'
import React from 'react'

import { DeleteTaskConfirmDialog } from './DeleteTaskConfirmDialog'

interface TaskCardProps {
  task: Task
  onUpdate: () => void
  onOpen?: () => void
}

export function TaskCard({ task, onUpdate, onOpen }: TaskCardProps) {
  const isService = task.is_service === 1
  const isCompleted = !!task.completed_at
  const deleteTaskDialog = useDeleteTaskDialog()
  const invalidateTasks = useTaskInvalidationStore((s) => s.invalidate)

  const handleToggleCompleted = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await updateTask(task.id, {
      completed_at: isCompleted ? null : new Date().toISOString(),
    })
    invalidateTasks()
    onUpdate()
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    deleteTaskDialog.open(task.id)
  }

  return (
    <>
      <Card
        data-testid="task-card"
        variant="outlined"
        sx={{
          height: '100%',
          minHeight: 0,
          display: 'flex',
          cursor: onOpen ? 'pointer' : undefined,
          '&:hover': onOpen ? { bgcolor: 'action.hover' } : undefined,
          ...(isService && {
            borderWidth: 2,
            borderColor: 'secondary.main',
          }),
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
            position: 'relative',
            '&:last-child': { pb: 1 },
          }}
        >
          {isService && (
            <Box
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                color: 'secondary.main',
              }}
              aria-hidden
            >
              <PushPinIcon sx={{ fontSize: 18 }} />
            </Box>
          )}
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
            <Tooltip
              title={isCompleted ? 'Пометить активной' : 'Отметить выполненной'}
            >
              <IconButton
                size="small"
                onClick={handleToggleCompleted}
                aria-label={
                  isCompleted ? 'Пометить активной' : 'Отметить выполненной'
                }
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
        open={deleteTaskDialog.isOpen}
        onClose={deleteTaskDialog.close}
        taskId={deleteTaskDialog.taskId}
        onDeleted={onUpdate}
      />
    </>
  )
}
