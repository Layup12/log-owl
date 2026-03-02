import { useTheme } from '@mui/material/styles'
import { useLayoutOptions } from '@renderer/hooks'
import { useNavigationStore } from '@renderer/shared/store'
import {
  Alert,
  Box,
  CircularProgress,
  useMediaQuery,
} from '@renderer/shared/ui'
import { useCallback, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'

import { TaskPageIntervalsAndSessions, TaskPageMainBlock } from './components'
import { useTaskPageForm, useTaskPageIntervals } from './hooks'

export function TaskPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const pushTask = useNavigationStore((s) => s.pushTask)
  const taskId = id ? parseInt(id, 10) : NaN

  const state = location.state as { returnId?: number } | null

  const form = useTaskPageForm(taskId)
  const intervals = useTaskPageIntervals(taskId, {
    form,
    task: form.task,
  })

  const {
    formFields: { editStart, editEnd },
    setFormField,
  } = form

  const theme = useTheme()
  const isWide = useMediaQuery(theme.breakpoints.up('md'))

  useEffect(() => {
    if (Number.isFinite(taskId)) {
      pushTask({ id: taskId, title: form.task?.title ?? '' })
    }
  }, [taskId, form.task?.title, pushTask])

  const returnId = state?.returnId
  const onBack = useCallback(() => {
    if (returnId != null) {
      navigate(`/task/${returnId}`)
    } else {
      navigate('/')
    }
  }, [returnId, navigate])
  const onHome = useCallback(() => navigate('/'), [navigate])

  useLayoutOptions({
    title: `Задача: ${form.task?.title ?? '-'}`,
    onBack,
    onHome: returnId != null ? onHome : undefined,
  })

  if (!Number.isFinite(taskId)) {
    return <Alert severity="error">Неверный id задачи</Alert>
  }

  if (form.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (form.error || !form.task) {
    return <Alert severity="error">{form.error ?? 'Задача не найдена'}</Alert>
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
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          mx: 'auto',
          width: '100%',
          display: 'flex',
          flexDirection: isWide ? 'row' : 'column',
          gap: 3,
          alignItems: 'stretch',
          overflow: isWide ? 'auto' : 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            overflow: 'auto',
          }}
        >
          <TaskPageMainBlock
            form={form}
            addInterval={{
              onAddInterval: intervals.handleAddInterval,
              manualError: intervals.manualError,
              onClearManualError: intervals.clearManualError,
            }}
            taskId={taskId}
            loadTimeEntries={intervals.loadTimeEntries}
          />
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minWidth: '40%',
            flex: 1,
            minHeight: 250,
            overflow: 'hidden',
          }}
        >
          <TaskPageIntervalsAndSessions
            intervals={{
              intervalsTotalMinutes: intervals.intervalsTotalMinutes,
              timeEntries: intervals.timeEntries,
              editingEntryId: intervals.editingEntryId,
              editStart,
              editEnd,
              setFormField,
              onSaveEditEntry: intervals.saveEditEntry,
              onCancelEditEntry: intervals.cancelEditEntry,
              onStartEditEntry: intervals.startEditEntry,
              onOpenDeleteEntryDialog: intervals.openDeleteEntryDialog,
              onCloseDeleteEntryDialog: intervals.closeDeleteEntryDialog,
              deleteConfirmEntry: intervals.deleteConfirmEntry,
              onDeleteEntry: intervals.handleDeleteEntry,
            }}
            taskId={taskId}
            task={form.task}
            onSessionConverted={intervals.loadTimeEntries}
          />
        </Box>
      </Box>
    </Box>
  )
}
