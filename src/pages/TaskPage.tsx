import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import type { Task } from '../types/task'
import type { TaskSession } from '../types/taskSession'
import type { TimeEntry } from '../types/timeEntry'
import { useTimerStore } from '../store/timerStore'
import { TimerCounter } from '../components/TimerCounter'
import { DeleteTaskConfirmDialog } from '../components/DeleteTaskConfirmDialog'
import { utcIsoToDatetimeLocal, datetimeLocalToUtcIso, formatUtcLocal } from '../utils/datetime'
import { totalMinutesRoundedUp } from '../utils/mergeIntervals'
import dayjs from 'dayjs'

const COMMENT_DEBOUNCE_MS = 800

export function TaskPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const taskId = id ? parseInt(id, 10) : NaN
  const [task, setTask] = useState<Task | null>(null)
  const [sessions, setSessions] = useState<TaskSession[]>([])
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const commentSaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { activeEntryId, activeTaskId, startedAt, setActive, clearActive } = useTimerStore()
  const isTimerRunning = activeTaskId === taskId && activeEntryId !== null
  // Manual interval form
  const [manualStart, setManualStart] = useState('')
  const [manualEnd, setManualEnd] = useState('')
  const [manualError, setManualError] = useState<string | null>(null)
  // Edit interval
  const [editingEntryId, setEditingEntryId] = useState<number | null>(null)
  const [editStart, setEditStart] = useState('')
  const [editEnd, setEditEnd] = useState('')
  // Delete confirm
  const [deleteConfirmEntry, setDeleteConfirmEntry] = useState<TimeEntry | null>(null)
  const [deleteTaskConfirmOpen, setDeleteTaskConfirmOpen] = useState(false)

  const loadTask = useCallback(async () => {
    if (!Number.isFinite(taskId)) return
    try {
      setError(null)
      const t = (await window.electron.invoke('task:getById', taskId)) as Task | null
      if (!t) {
        setError('Задача не найдена')
        setTask(null)
        return
      }
      setTask(t)
      setTitle(t.title)
      setComment(t.comment ?? '')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }, [taskId])

  const loadSessions = useCallback(async () => {
    if (!Number.isFinite(taskId)) return
    const list = (await window.electron.invoke('taskSession:getByTaskId', taskId)) as TaskSession[]
    setSessions(Array.isArray(list) ? list : [])
  }, [taskId])

  const loadTimeEntries = useCallback(async () => {
    if (!Number.isFinite(taskId)) return
    const list = (await window.electron.invoke('timeEntry:getByTaskId', taskId)) as TimeEntry[]
    setTimeEntries(Array.isArray(list) ? list : [])
  }, [taskId])

  const sessionIdRef = useRef<number | null>(null)
  sessionIdRef.current = sessionId
  useEffect(() => {
    if (!Number.isFinite(taskId)) return
    let sid: number | null = null
    let cancelled = false
    // Сначала закрываем все открытые сессии этой задачи (убьёт дубли от Strict Mode и старые «не закрыта»)
    window.electron
      .invoke('taskSession:closeOpenByTaskId', taskId)
      .then(() => {
        if (cancelled) return
        return window.electron.invoke('taskSession:create', {
          task_id: taskId,
          opened_at: new Date().toISOString(),
        })
      })
      .then((session: unknown) => {
        if (cancelled || session == null) return
        const s = session as TaskSession
        if (s?.id) {
          sid = s.id
          sessionIdRef.current = s.id
          setSessionId(s.id)
          loadSessions() // обновить список: старые «не закрыта» уже закрыты, одна новая текущая
        }
      })
      .catch(() => {})

    return () => {
      cancelled = true
      const idToClose = sessionIdRef.current ?? sid
      if (idToClose !== null) {
        const closed_at = new Date().toISOString()
        window.electron.invoke('taskSession:update', idToClose, { closed_at }).catch(() => {})
      }
    }
  }, [taskId, loadSessions])

  useEffect(() => {
    loadTask()
  }, [loadTask])

  useEffect(() => {
    if (!task) return
    loadSessions()
    loadTimeEntries()
  }, [task, loadSessions, loadTimeEntries])

  // Unmount task page → auto stop timer for this task
  useEffect(() => {
    return () => {
      const state = useTimerStore.getState()
      if (state.activeTaskId === taskId && state.activeEntryId !== null) {
        const ended_at = new Date().toISOString()
        window.electron.invoke('timeEntry:update', state.activeEntryId, { ended_at }).catch(() => {})
        useTimerStore.getState().clearActive()
      }
    }
  }, [taskId])

  // Debounced comment save
  useEffect(() => {
    if (task === null || comment === (task.comment ?? '')) return
    if (commentSaveTimeout.current) clearTimeout(commentSaveTimeout.current)
    commentSaveTimeout.current = setTimeout(() => {
      commentSaveTimeout.current = null
      window.electron.invoke('task:update', task.id, { comment: comment || null }).catch(() => {})
    }, COMMENT_DEBOUNCE_MS)
    return () => {
      if (commentSaveTimeout.current) clearTimeout(commentSaveTimeout.current)
    }
  }, [comment, task])

  const saveTitle = async () => {
    if (!task || title.trim() === '' || title === task.title) return
    await window.electron.invoke('task:update', task.id, { title: title.trim() })
    setTask((t) => (t ? { ...t, title: title.trim() } : null))
  }

  const handleTimerStart = async () => {
    const state = useTimerStore.getState()
    if (state.activeEntryId !== null) {
      const ended_at = new Date().toISOString()
      await window.electron.invoke('timeEntry:update', state.activeEntryId, { ended_at })
      useTimerStore.getState().clearActive()
    }
    const started_at = new Date().toISOString()
    const entry = (await window.electron.invoke('timeEntry:create', {
      task_id: taskId,
      started_at,
    })) as { id: number; started_at: string }
    useTimerStore.getState().setActive(entry.id, taskId, entry.started_at)
  }

  const handleTimerStop = async () => {
    const state = useTimerStore.getState()
    if (state.activeEntryId === null) return
    const ended_at = new Date().toISOString()
    await window.electron.invoke('timeEntry:update', state.activeEntryId, { ended_at })
    useTimerStore.getState().clearActive()
  }

  const nowIso = () => new Date().toISOString()

  const handleAddInterval = async () => {
    setManualError(null)
    if (!manualStart || !manualEnd) {
      setManualError('Укажите начало и конец')
      return
    }
    const startIso = datetimeLocalToUtcIso(manualStart)
    const endIso = datetimeLocalToUtcIso(manualEnd)
    if (startIso > nowIso() || endIso > nowIso()) {
      setManualError('Нельзя указывать будущее время')
      return
    }
    if (endIso <= startIso) {
      setManualError('Конец должен быть позже начала')
      return
    }
    await window.electron.invoke('timeEntry:create', {
      task_id: taskId,
      started_at: startIso,
      ended_at: endIso,
    })
    setManualStart('')
    setManualEnd('')
    loadTimeEntries()
  }

  const startEditEntry = (entry: TimeEntry) => {
    setEditingEntryId(entry.id)
    setEditStart(utcIsoToDatetimeLocal(entry.started_at))
    setEditEnd(entry.ended_at ? utcIsoToDatetimeLocal(entry.ended_at) : '')
  }

  const cancelEditEntry = () => {
    setEditingEntryId(null)
    setEditStart('')
    setEditEnd('')
  }

  const saveEditEntry = async () => {
    if (editingEntryId === null) return
    setManualError(null)
    if (!editStart || !editEnd) return
    const startIso = datetimeLocalToUtcIso(editStart)
    const endIso = datetimeLocalToUtcIso(editEnd)
    if (startIso > nowIso() || endIso > nowIso()) {
      setManualError('Нельзя указывать будущее время')
      return
    }
    if (endIso <= startIso) {
      setManualError('Конец должен быть позже начала')
      return
    }
    await window.electron.invoke('timeEntry:update', editingEntryId, {
      started_at: startIso,
      ended_at: endIso,
    })
    cancelEditEntry()
    loadTimeEntries()
  }

  const handleDeleteEntry = async () => {
    if (!deleteConfirmEntry) return
    await window.electron.invoke('timeEntry:delete', deleteConfirmEntry.id)
    setDeleteConfirmEntry(null)
    loadTimeEntries()
  }

  const handleDeleteTask = async () => {
    if (!Number.isFinite(taskId)) return
    if (activeTaskId === taskId && activeEntryId !== null) clearActive()
    await window.electron.invoke('task:delete', taskId)
    navigate('/')
  }

  if (!Number.isFinite(taskId)) {
    return (
      <Alert severity="error">
        Неверный id задачи
        <Button sx={{ ml: 1 }} onClick={() => navigate('/')}>
          К списку
        </Button>
      </Alert>
    )
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error || !task) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error ?? 'Задача не найдена'}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')}>
          К списку
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 640 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')}>
          К списку
        </Button>
        <Button color="error" startIcon={<DeleteIcon />} onClick={() => setDeleteTaskConfirmOpen(true)}>
          Удалить задачу
        </Button>
      </Box>

      <TextField
        label="Название"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={saveTitle}
        fullWidth
        sx={{ mb: 2 }}
      />

      <TextField
        label="Комментарий"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        fullWidth
        multiline
        minRows={3}
        sx={{ mb: 3 }}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        {isTimerRunning ? (
          <>
            <TimerCounter startedAt={startedAt!} />
            <Button variant="outlined" startIcon={<PauseIcon />} onClick={handleTimerStop}>
              Стоп
            </Button>
          </>
        ) : (
          <Button variant="contained" startIcon={<PlayIcon />} onClick={handleTimerStart}>
            Старт
          </Button>
        )}
      </Box>

      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Добавить интервал
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-start', mb: 2 }}>
        <TextField
          label="Начало"
          type="datetime-local"
          value={manualStart}
          onChange={(e) => setManualStart(e.target.value)}
          InputProps={{ sx: { minWidth: 220 } }}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Конец"
          type="datetime-local"
          value={manualEnd}
          onChange={(e) => setManualEnd(e.target.value)}
          InputProps={{ sx: { minWidth: 220 } }}
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="outlined" onClick={handleAddInterval}>
          Добавить
        </Button>
      </Box>
      {manualError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setManualError(null)}>
          {manualError}
        </Alert>
      )}

      {(() => {
        const intervals = timeEntries.map((e) => ({
          start: e.started_at,
          end: e.ended_at,
        }))
        const totalMinutes = totalMinutesRoundedUp(intervals)
        return (
          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2, mb: 0.5 }}>
            Всего: {totalMinutes} мин
          </Typography>
        )
      })()}
      <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 1 }}>
        Интервалы
      </Typography>
      <List dense component="div" sx={{ bgcolor: 'action.hover', borderRadius: 1, mb: 3 }}>
        {timeEntries.length === 0 ? (
          <ListItem>
            <ListItemText primary="Нет интервалов" />
          </ListItem>
        ) : (
          [...timeEntries]
            .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
            .map((entry) =>
              editingEntryId === entry.id ? (
                <ListItem key={entry.id} sx={{ flexWrap: 'wrap', gap: 1 }}>
                  <TextField
                    size="small"
                    label="Начало"
                    type="datetime-local"
                    value={editStart}
                    onChange={(e) => setEditStart(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ minWidth: 200 }}
                  />
                  <TextField
                    size="small"
                    label="Конец"
                    type="datetime-local"
                    value={editEnd}
                    onChange={(e) => setEditEnd(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ minWidth: 200 }}
                  />
                  <IconButton size="small" onClick={saveEditEntry} aria-label="Сохранить">
                    <SaveIcon />
                  </IconButton>
                  <IconButton size="small" onClick={cancelEditEntry} aria-label="Отмена">
                    <CloseIcon />
                  </IconButton>
                </ListItem>
              ) : (
                <ListItem key={entry.id}>
                  <ListItemText
                    primary={`${formatUtcLocal(entry.started_at)} — ${entry.ended_at ? formatUtcLocal(entry.ended_at) : '…'}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton size="small" onClick={() => startEditEntry(entry)} aria-label="Редактировать">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => setDeleteConfirmEntry(entry)} aria-label="Удалить">
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              )
            )
        )}
      </List>

      <Dialog open={deleteConfirmEntry !== null} onClose={() => setDeleteConfirmEntry(null)}>
        <DialogTitle>Удалить интервал?</DialogTitle>
        <DialogContent>
          {deleteConfirmEntry && (
            <Typography>
              {formatUtcLocal(deleteConfirmEntry.started_at)} —{' '}
              {deleteConfirmEntry.ended_at ? formatUtcLocal(deleteConfirmEntry.ended_at) : '…'}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmEntry(null)}>Отмена</Button>
          <Button color="error" variant="contained" onClick={handleDeleteEntry}>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      <DeleteTaskConfirmDialog
        open={deleteTaskConfirmOpen}
        onClose={() => setDeleteTaskConfirmOpen(false)}
        onConfirm={handleDeleteTask}
      />

      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Сессии (открытия страницы)
      </Typography>
      <List dense component="div" sx={{ bgcolor: 'action.hover', borderRadius: 1 }}>
        {sessions.length === 0 ? (
          <ListItem>
            <ListItemText primary="Нет сессий" />
          </ListItem>
        ) : (
          [...sessions].reverse().map((s) => (
            <ListItem key={s.id}>
              <ListItemText
                primary={`${dayjs(s.opened_at).format('DD.MM.YYYY HH:mm:ss')} — ${s.closed_at ? dayjs(s.closed_at).format('DD.MM.YYYY HH:mm:ss') : 'не закрыта'}`}
              />
              {s.closed_at && (
                <ListItemSecondaryAction>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={async () => {
                      await window.electron.invoke('timeEntry:create', {
                        task_id: taskId,
                        started_at: s.opened_at,
                        ended_at: s.closed_at,
                        source: 'session_convert',
                      })
                      loadTimeEntries()
                    }}
                  >
                    В рабочий интервал
                  </Button>
                </ListItemSecondaryAction>
              )}
            </ListItem>
          ))
        )}
      </List>
    </Box>
  )
}
