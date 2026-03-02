import { useLayoutOptions } from '@renderer/hooks'
import { Alert, Box, CircularProgress, Divider } from '@renderer/shared/ui'

import { CompletedTasksSection, TaskGrid } from './components'
import { useTaskListActions, useTaskListData } from './hooks'

const CELL_SIZE = 140

export function TaskListPage() {
  useLayoutOptions({ title: 'Задачи', showReportFab: true })

  const {
    loading,
    error,
    setError,
    reload,
    serviceTask,
    activeTasks,
    completedTasks,
    hasCompleted,
  } = useTaskListData()

  const {
    creating,
    handleCreateTask,
    openTask,
    completedOpen,
    toggleCompletedOpen,
  } = useTaskListActions({ onError: setError })

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

  const tasksForGrid =
    serviceTask != null
      ? [serviceTask, ...activeTasks.filter((t) => t.id !== serviceTask.id)]
      : activeTasks

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
          tasks={tasksForGrid}
          cellSize={CELL_SIZE}
          onTaskOpen={openTask}
          onTasksUpdate={reload}
          onCreateTask={handleCreateTask}
          onCreateTaskLoading={creating}
        />
      </Box>
      {hasCompleted && (
        <>
          <Divider />
          <CompletedTasksSection
            tasks={completedTasks}
            cellSize={CELL_SIZE}
            open={completedOpen}
            onToggle={toggleCompletedOpen}
            onTaskOpen={openTask}
            onTasksUpdate={reload}
          />
        </>
      )}
    </Box>
  )
}
