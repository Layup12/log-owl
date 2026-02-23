import { useLayoutOptions } from '@renderer/hooks'
import { Alert, Box, CircularProgress, Divider } from '@renderer/shared/ui'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { CompletedTasksSection, TaskGrid } from './components'
import { useTaskListPage } from './useTaskListPage'

export function TaskListPage() {
  const navigate = useNavigate()
  const { tasks, loading, error, setError, reload } = useTaskListPage()
  const [completedOpen, setCompletedOpen] = useState(false)
  useLayoutOptions({ title: 'Задачи' })

  const activeTasks = tasks.filter((t) => !t.completed_at)
  const completedTasks = tasks.filter((t) => t.completed_at)
  const cellSize = 140
  const hasCompleted = completedTasks.length > 0

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" onClose={() => setError(null)}>
        {error}
      </Alert>
    )
  }

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <TaskGrid
          tasks={activeTasks}
          cellSize={cellSize}
          onTaskOpen={(id) => navigate(`/task/${id}`)}
          onTasksUpdate={reload}
          onCreateTask={() => navigate('/task/new')}
        />
      </Box>
      {hasCompleted && (
        <>
          <Divider />
          <CompletedTasksSection
            tasks={completedTasks}
            cellSize={cellSize}
            open={completedOpen}
            onToggle={() => setCompletedOpen((o) => !o)}
            onTaskOpen={(id) => navigate(`/task/${id}`)}
            onTasksUpdate={reload}
          />
        </>
      )}
    </Box>
  )
}
