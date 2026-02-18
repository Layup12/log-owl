import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  SvgIcon,
  Divider,
} from '@mui/material'
import { ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material'
import { TaskCard } from '../components/TaskCard'
import type { Task } from '../types/task'

function ThinPlusIcon(props: React.ComponentProps<typeof SvgIcon>) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24" fill="none">
      <path stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" d="M12 5v14M5 12h14" />
    </SvgIcon>
  )
}

export function TaskListScreen() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [completedOpen, setCompletedOpen] = useState(false)

  const loadTasks = useCallback(async () => {
    try {
      setError(null)
      const result = (await window.electron.invoke('task:getAll')) as Task[]
      setTasks(Array.isArray(result) ? result : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

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

  const activeGrid = (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, ${cellSize}px)`,
        gridAutoRows: `${cellSize}px`,
        gap: 1,
      }}
    >
      {activeTasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onUpdate={loadTasks}
          onOpen={() => navigate(`/task/${task.id}`)}
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
        onClick={() => navigate('/task/new')}
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
          <ThinPlusIcon sx={{ fontSize: 70, color: 'action.active', opacity: 0.7 }} />
        </CardContent>
      </Card>
    </Box>
  )

  const completedHeader = hasCompleted && (
    <Box
      component="button"
      type="button"
      onClick={() => setCompletedOpen((o) => !o)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        width: '100%',
        border: 0,
        py: 0.75,
        px: 0,
        background: 'none',
        cursor: 'pointer',
        color: 'text.secondary',
        fontSize: '0.875rem',
        '&:hover': { color: 'text.primary' },
      }}
    >
      {completedOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      <span>Выполнено ({completedTasks.length})</span>
    </Box>
  )

  const completedGrid = completedOpen && (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, ${cellSize}px)`,
        gridAutoRows: `${cellSize}px`,
        gap: 1,
      }}
    >
      {completedTasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onUpdate={loadTasks}
          onOpen={() => navigate(`/task/${task.id}`)}
        />
      ))}
    </Box>
  )

  if (!hasCompleted) {
    return (
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>{activeGrid}</Box>
      </Box>
    )
  }

  if (!completedOpen) {
    return (
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>{activeGrid}</Box>
        <Box sx={{ flexShrink: 0, borderTop: 1, borderColor: 'divider' }}>{completedHeader}</Box>
      </Box>
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
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>{activeGrid}</Box>
      <Divider />
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ flexShrink: 0 }}>{completedHeader}</Box>
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>{completedGrid}</Box>
      </Box>
    </Box>
  )
}
