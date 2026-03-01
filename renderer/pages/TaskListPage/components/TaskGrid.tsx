import { TaskCard } from '@renderer/components'
import type { Task } from '@renderer/shared/types'
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  SvgIcon,
} from '@renderer/shared/ui'
import React from 'react'

interface TaskGridProps {
  tasks: Task[]
  cellSize: number
  onTaskOpen: (id: number) => void
  onTasksUpdate: () => void
  onCreateTask: () => void
  onCreateTaskLoading?: boolean
}

function ThinPlusIcon(props: React.ComponentProps<typeof SvgIcon>) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24" fill="none">
      <path
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        d="M12 5v14M5 12h14"
      />
    </SvgIcon>
  )
}

export function TaskGrid({
  tasks,
  cellSize,
  onTaskOpen,
  onTasksUpdate,
  onCreateTask,
  onCreateTaskLoading = false,
}: TaskGridProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, ${cellSize}px)`,
        gridAutoRows: `${cellSize}px`,
        gap: 1,
      }}
    >
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onUpdate={onTasksUpdate}
          onOpen={() => onTaskOpen(task.id)}
        />
      ))}
      <Card
        data-testid="add-task-card"
        variant="outlined"
        sx={{
          height: '100%',
          minHeight: 0,
          cursor: onCreateTaskLoading ? 'default' : 'pointer',
          borderStyle: 'dashed',
          '&:hover': onCreateTaskLoading
            ? undefined
            : { bgcolor: 'action.hover' },
        }}
        onClick={onCreateTaskLoading ? undefined : onCreateTask}
      >
        <CardContent
          sx={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 1,
            px: 1,
            '&:last-child': { pb: 1 },
          }}
        >
          {onCreateTaskLoading ? (
            <CircularProgress size={40} />
          ) : (
            <ThinPlusIcon
              sx={{ fontSize: 70, color: 'action.active', opacity: 0.7 }}
            />
          )}
        </CardContent>
      </Card>
    </Box>
  )
}
