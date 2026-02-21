import React from 'react'
import { Box, Card, CardContent, SvgIcon } from '@renderer/shared/ui'
import { TaskCard } from '@renderer/components'
import type { Task } from '@renderer/shared/types'

interface TaskGridProps {
  tasks: Task[]
  cellSize: number
  onTaskOpen: (id: number) => void
  onTasksUpdate: () => void
  onCreateTask: () => void
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
        variant="outlined"
        sx={{
          height: '100%',
          minHeight: 0,
          cursor: 'pointer',
          borderStyle: 'dashed',
          '&:hover': { bgcolor: 'action.hover' },
        }}
        onClick={onCreateTask}
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
          <ThinPlusIcon
            sx={{ fontSize: 70, color: 'action.active', opacity: 0.7 }}
          />
        </CardContent>
      </Card>
    </Box>
  )
}
