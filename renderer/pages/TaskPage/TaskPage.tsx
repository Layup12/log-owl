import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Box, TextField, CircularProgress, Alert, IconButton, Tooltip, Tabs, Tab, useMediaQuery } from '@renderer/shared/ui'
import { PlayArrow as PlayIcon, Pause as PauseIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { TimerCounter, DeleteTaskConfirmDialog } from '@renderer/components'
import { useLayoutOptions } from '@renderer/hooks'
import { AddIntervalForm, IntervalsList, SessionsSection } from './components'
import { useTaskPage } from './useTaskPage'

export function TaskPage() {
  const { id } = useParams<{ id: string }>()
  const taskId = id ? parseInt(id, 10) : NaN
  const state = useTaskPage(taskId)
  const theme = useTheme()
  const isWide = useMediaQuery(theme.breakpoints.up('md'))
  const [tab, setTab] = useState<'intervals' | 'sessions'>('intervals')

  useLayoutOptions({
    title: `Задача: ${state?.task?.title ?? '-'}`,
    onBack: state.goToList,
  })

  if (!Number.isFinite(taskId)) {
    return <Alert severity="error">Неверный id задачи</Alert>
  }

  if (state.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (state.error || !state.task) {
    return <Alert severity="error">{state.error ?? 'Задача не найдена'}</Alert>
  }

  const block1 = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {state.isTimerRunning ? (
          <Tooltip title="Стоп">
            <IconButton color="primary" onClick={state.handleTimerStop} aria-label="Стоп">
              <PauseIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Старт">
            <IconButton color="primary" onClick={state.handleTimerStart} aria-label="Старт">
              <PlayIcon />
            </IconButton>
          </Tooltip>
        )}
        {state.isTimerRunning && state.startedAt && <TimerCounter startedAt={state.startedAt} />}
        <Tooltip title="Удалить задачу">
          <IconButton color="error" onClick={state.openDeleteTaskDialog} aria-label="Удалить задачу" sx={{ ml: 'auto' }}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <TextField
        label="Название"
        value={state.title}
        onChange={(e) => state.setTitle(e.target.value)}
        onBlur={state.saveTitle}
        fullWidth
      />

      <TextField
        label="Комментарий"
        value={state.comment}
        onChange={(e) => state.setComment(e.target.value)}
        fullWidth
        multiline
        minRows={3}
        sx={{ '& textarea': { resize: 'vertical' } }}
      />

      <AddIntervalForm state={state} />
    </Box>
  )

  const block2 = (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden' }}>
      <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ flexShrink: 0, mb: 2 }}>
        <Tab label="Интервалы" value="intervals" />
        <Tab label="Сессии" value="sessions" />
      </Tabs>
      <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {tab === 'intervals' ? <IntervalsList state={state} /> : <SessionsSection state={state} />}
      </Box>
    </Box>
  )

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, mx: 'auto', width: '100%', display: 'flex', flexDirection: isWide ? 'row' : 'column', gap: 3, alignItems: 'stretch', overflow: isWide ? 'auto' : 'hidden' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>{block1}</Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: '40%', flex: 1, minHeight: 250, overflow: 'hidden' }}>{block2}</Box>
      </Box>

      <DeleteTaskConfirmDialog
        open={state.deleteTaskConfirmOpen}
        onClose={state.closeDeleteTaskDialog}
        onConfirm={state.handleDeleteTask}
      />
    </Box>
  )
}
