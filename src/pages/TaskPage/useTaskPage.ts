import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Task, TaskSession, TimeEntry } from '@shared/types'
import { useTimerStore } from '@shared/store'
import { utcIsoToDatetimeLocal, datetimeLocalToUtcIso, totalMinutesRoundedUp } from '@shared/lib'
import {
  getTaskById,
  updateTask,
  deleteTask,
  getTaskSessionsByTaskId,
  createTaskSession,
  updateTaskSession,
  closeOpenTaskSessionsByTaskId,
  getTimeEntriesByTaskId,
  createTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
} from '@api'

const COMMENT_DEBOUNCE_MS = 800

/** Сегодня в формате datetime-local (YYYY-MM-DDTHH:mm), время 00:00 */
function getTodayDateTimeLocal(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}T00:00`
}

export interface TaskPageState {
  taskId: number
  task: Task | null
  sessions: TaskSession[]
  timeEntries: TimeEntry[]
  loading: boolean
  error: string | null
  title: string
  comment: string
  manualStart: string
  manualEnd: string
  manualError: string | null
  editingEntryId: number | null
  editStart: string
  editEnd: string
  deleteConfirmEntry: TimeEntry | null
  deleteTaskConfirmOpen: boolean
  isTimerRunning: boolean
  startedAt: string | null
  intervalsTotalMinutes: number
}

export interface TaskPageHandlers {
  setTitle: (value: string) => void
  saveTitle: () => Promise<void>
  setComment: (value: string) => void
  setManualStart: (value: string) => void
  setManualEnd: (value: string) => void
  clearManualError: () => void
  handleAddInterval: () => Promise<void>
  startEditEntry: (entry: TimeEntry) => void
  cancelEditEntry: () => void
  setEditStart: (value: string) => void
  setEditEnd: (value: string) => void
  saveEditEntry: () => Promise<void>
  openDeleteEntryDialog: (entry: TimeEntry) => void
  closeDeleteEntryDialog: () => void
  handleDeleteEntry: () => Promise<void>
  openDeleteTaskDialog: () => void
  closeDeleteTaskDialog: () => void
  handleDeleteTask: () => Promise<void>
  handleTimerStart: () => Promise<void>
  handleTimerStop: () => Promise<void>
  goToList: () => void
  handleConvertSessionToInterval: (session: TaskSession) => Promise<void>
}

export function useTaskPage(taskId: number): TaskPageState & TaskPageHandlers {
  const navigate = useNavigate()
  const [task, setTask] = useState<Task | null>(null)
  const [sessions, setSessions] = useState<TaskSession[]>([])
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const commentSaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { activeEntryId, activeTaskId, startedAt, clearActive } = useTimerStore()
  const isTimerRunning = activeTaskId === taskId && activeEntryId !== null
  // Manual interval form (по умолчанию — сегодня, время 00:00)
  const [manualStart, setManualStart] = useState(getTodayDateTimeLocal)
  const [manualEnd, setManualEnd] = useState(getTodayDateTimeLocal)
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
      const t = await getTaskById(taskId)
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
    const list = await getTaskSessionsByTaskId(taskId)
    setSessions(Array.isArray(list) ? list : [])
  }, [taskId])

  const loadTimeEntries = useCallback(async () => {
    if (!Number.isFinite(taskId)) return
    const list = await getTimeEntriesByTaskId(taskId)
    setTimeEntries(Array.isArray(list) ? list : [])
  }, [taskId])

  const sessionIdRef = useRef<number | null>(null)
  sessionIdRef.current = sessionId

  useEffect(() => {
    if (!Number.isFinite(taskId)) return
    let sid: number | null = null
    let cancelled = false
    // Сначала закрываем все открытые сессии этой задачи (убьёт дубли от Strict Mode и старые «не закрыта»)
    closeOpenTaskSessionsByTaskId(taskId)
      .then(() => {
        if (cancelled) return null
        return createTaskSession({
          taskId,
          openedAt: new Date().toISOString(),
        })
      })
      .then((session) => {
        if (cancelled || session == null) return
        if (session.id) {
          sid = session.id
          sessionIdRef.current = session.id
          setSessionId(session.id)
          loadSessions() // обновить список: старые «не закрыта» уже закрыты, одна новая текущая
        }
      })
      .catch(() => {})

    return () => {
      cancelled = true
      const idToClose = sessionIdRef.current ?? sid
      if (idToClose !== null) {
        const closed_at = new Date().toISOString()
        updateTaskSession(idToClose, { closedAt: closed_at }).catch(() => {})
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
        updateTimeEntry(state.activeEntryId, { endedAt: ended_at }).catch(() => {})
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
      updateTask(task.id, { comment: comment || null }).catch(() => {})
    }, COMMENT_DEBOUNCE_MS)
    return () => {
      if (commentSaveTimeout.current) clearTimeout(commentSaveTimeout.current)
    }
  }, [comment, task])

  const saveTitle = async () => {
    if (!task || title.trim() === '' || title === task.title) return
    await updateTask(task.id, { title: title.trim() })
    setTask((t) => (t ? { ...t, title: title.trim() } : null))
  }

  const handleTimerStart = async () => {
    const state = useTimerStore.getState()
    if (state.activeEntryId !== null) {
      const ended_at = new Date().toISOString()
      await updateTimeEntry(state.activeEntryId, { endedAt: ended_at })
      useTimerStore.getState().clearActive()
    }
    const started_at = new Date().toISOString()
    const entry = await createTimeEntry({
      taskId,
      startedAt: started_at,
    })
    useTimerStore.getState().setActive(entry.id, taskId, entry.started_at)
  }

  const handleTimerStop = async () => {
    const state = useTimerStore.getState()
    if (state.activeEntryId === null) return
    const ended_at = new Date().toISOString()
    await updateTimeEntry(state.activeEntryId, { endedAt: ended_at })
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
    await createTimeEntry({
      taskId,
      startedAt: startIso,
      endedAt: endIso,
    })
    setManualStart(getTodayDateTimeLocal())
    setManualEnd(getTodayDateTimeLocal())
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
    await updateTimeEntry(editingEntryId, {
      startedAt: startIso,
      endedAt: endIso,
    })
    cancelEditEntry()
    loadTimeEntries()
  }

  const handleDeleteEntry = async () => {
    if (!deleteConfirmEntry) return
    await deleteTimeEntry(deleteConfirmEntry.id)
    setDeleteConfirmEntry(null)
    loadTimeEntries()
  }

  const handleDeleteTask = async () => {
    if (!Number.isFinite(taskId)) return
    if (activeTaskId === taskId && activeEntryId !== null) clearActive()
    await deleteTask(taskId)
    navigate('/')
  }

  const intervals = timeEntries.map((e) => ({
    start: e.started_at,
    end: e.ended_at,
  }))
  const intervalsTotalMinutes = totalMinutesRoundedUp(intervals)

  const handleConvertSessionToInterval = async (session: TaskSession) => {
    if (!session.closed_at) return
    await createTimeEntry({
      taskId,
      startedAt: session.opened_at,
      endedAt: session.closed_at,
      source: 'session_convert',
    })
    loadTimeEntries()
  }

  return {
    taskId,
    task,
    sessions,
    timeEntries,
    loading,
    error,
    title,
    comment,
    manualStart,
    manualEnd,
    manualError,
    editingEntryId,
    editStart,
    editEnd,
    deleteConfirmEntry,
    deleteTaskConfirmOpen,
    isTimerRunning,
    startedAt,
    intervalsTotalMinutes,
    setTitle,
    saveTitle,
    setComment,
    setManualStart,
    setManualEnd,
    clearManualError: () => setManualError(null),
    handleAddInterval,
    startEditEntry,
    cancelEditEntry,
    setEditStart,
    setEditEnd,
    saveEditEntry,
    openDeleteEntryDialog: (entry: TimeEntry) => setDeleteConfirmEntry(entry),
    closeDeleteEntryDialog: () => setDeleteConfirmEntry(null),
    handleDeleteEntry,
    openDeleteTaskDialog: () => setDeleteTaskConfirmOpen(true),
    closeDeleteTaskDialog: () => setDeleteTaskConfirmOpen(false),
    handleDeleteTask,
    handleTimerStart,
    handleTimerStop,
    goToList: () => navigate('/'),
    handleConvertSessionToInterval,
  }
}

