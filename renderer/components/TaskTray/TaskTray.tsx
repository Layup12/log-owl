import { Chip } from '@mui/material'
import { getServiceTask } from '@renderer/api'
import {
  useNavigationStore,
  useTaskInvalidationStore,
} from '@renderer/shared/store'
import type { Task } from '@renderer/shared/types'
import { Box } from '@renderer/shared/ui'
import { useEffect, useState } from 'react'
import { useMatch, useNavigate } from 'react-router'

const VISITED_CHIPS_MAX = 2

const chipLabelSx = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}

const CHIP_MAX_WIDTH = 180

const baseChipSx = {
  flex: 1,
  minWidth: 0,
  maxWidth: CHIP_MAX_WIDTH,
  '& .MuiChip-label': chipLabelSx,
}

export function TaskTray() {
  const navigate = useNavigate()
  const taskMatch = useMatch('/task/:id')
  const currentTaskIdParam = taskMatch?.params?.id
  const currentTaskId = currentTaskIdParam
    ? parseInt(currentTaskIdParam, 10)
    : null
  const visitedTasks = useNavigationStore((s) => s.visitedTasks)
  const taskInvalidationVersion = useTaskInvalidationStore((s) => s.version)
  const [serviceTask, setServiceTask] = useState<Task | null>(null)

  useEffect(() => {
    let cancelled = false
    getServiceTask().then((task: Task | null) => {
      if (!cancelled) setServiceTask(task)
    })
    return () => {
      cancelled = true
    }
  }, [taskInvalidationVersion])

  const handleChipClick = (id: number) => () => {
    const returnId =
      currentTaskId != null &&
      Number.isFinite(currentTaskId) &&
      currentTaskId !== id
        ? currentTaskId
        : undefined
    navigate(`/task/${id}`, { state: { from: 'tray', returnId } })
  }

  const visitedToShow = visitedTasks
    .filter((t) => t.id !== serviceTask?.id)
    .slice(0, VISITED_CHIPS_MAX)

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        flexWrap: 'nowrap',
        minWidth: 0,
        width: '100%',
      }}
    >
      {serviceTask &&
        (() => {
          const isActive = currentTaskId === serviceTask.id
          return (
            <Chip
              label={`⚡ ${serviceTask.title}`}
              color="secondary"
              variant={isActive ? 'filled' : 'outlined'}
              size="small"
              disabled={isActive}
              onClick={isActive ? undefined : handleChipClick(serviceTask.id)}
              sx={{
                ...baseChipSx,
                ...(isActive && {
                  opacity: 1,
                  '&.MuiChip-root': { cursor: 'default' },
                }),
              }}
              aria-label={`Сервис-задача: ${serviceTask.title}`}
            />
          )
        })()}
      {visitedToShow.map((entry) => {
        const isActive = entry.id === currentTaskId
        return (
          <Chip
            key={entry.id}
            label={entry.title}
            size="small"
            variant={isActive ? 'filled' : 'outlined'}
            color={isActive ? 'primary' : undefined}
            disabled={isActive}
            onClick={isActive ? undefined : handleChipClick(entry.id)}
            sx={{
              ...baseChipSx,
              color: isActive ? undefined : 'inherit',
              borderColor: isActive ? undefined : 'currentColor',
              ...(isActive && {
                opacity: 1,
                '&.MuiChip-root': { cursor: 'default' },
              }),
            }}
            aria-label={`Задача: ${entry.title}`}
          />
        )
      })}
    </Box>
  )
}
