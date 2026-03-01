import {
  createTimeEntry,
  deleteTimeEntry,
  getTimeEntriesByTaskId,
  updateTimeEntry,
} from '@renderer/api'
import {
  datetimeLocalToUtcIso,
  totalMinutesRoundedUp,
  utcIsoToDatetimeLocal,
} from '@renderer/shared/lib'
import type { Task, TimeEntry } from '@renderer/shared/types'
import { useCallback, useEffect, useState } from 'react'

import type { UseTaskPageFormResult } from '../useTaskPageForm'

function getTodayDateTimeLocal(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}T00:00`
}

export interface UseTaskPageIntervalsOptions {
  form: Pick<UseTaskPageFormResult, 'getValues' | 'setFormField' | 'formFields'>
  task: Task | null
}

export interface UseTaskPageIntervalsResult {
  timeEntries: TimeEntry[]
  loadTimeEntries: () => Promise<void>
  intervalsTotalMinutes: number
  manualError: string | null
  clearManualError: () => void
  editingEntryId: number | null
  handleAddInterval: () => Promise<void>
  startEditEntry: (entry: TimeEntry) => void
  cancelEditEntry: () => void
  saveEditEntry: () => Promise<void>
  deleteConfirmEntry: TimeEntry | null
  openDeleteEntryDialog: (entry: TimeEntry) => void
  closeDeleteEntryDialog: () => void
  handleDeleteEntry: () => Promise<void>
}

export function useTaskPageIntervals(
  taskId: number,
  options: UseTaskPageIntervalsOptions
): UseTaskPageIntervalsResult {
  const { form, task } = options
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [manualError, setManualError] = useState<string | null>(null)
  const [editingEntryId, setEditingEntryId] = useState<number | null>(null)
  const [deleteConfirmEntry, setDeleteConfirmEntry] =
    useState<TimeEntry | null>(null)

  const loadTimeEntries = useCallback(async () => {
    if (!Number.isFinite(taskId)) return
    const list = await getTimeEntriesByTaskId(taskId)
    setTimeEntries(Array.isArray(list) ? list : [])
  }, [taskId])

  useEffect(() => {
    if (!task) return
    loadTimeEntries()
  }, [task, loadTimeEntries])

  const nowIso = () => new Date().toISOString()

  const handleAddInterval = useCallback(async () => {
    setManualError(null)
    const values = form.getValues()
    const start = values.manualStart
    const end = values.manualEnd
    if (!start || !end) {
      setManualError('Укажите начало и конец')
      return
    }
    const startIso = datetimeLocalToUtcIso(start)
    const endIso = datetimeLocalToUtcIso(end)
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
    const today = getTodayDateTimeLocal()
    form.setFormField('manualStart', today)
    form.setFormField('manualEnd', today)
    await loadTimeEntries()
  }, [taskId, form, loadTimeEntries])

  const startEditEntry = useCallback(
    (entry: TimeEntry) => {
      setEditingEntryId(entry.id)
      form.setFormField('editStart', utcIsoToDatetimeLocal(entry.started_at))
      form.setFormField(
        'editEnd',
        entry.ended_at ? utcIsoToDatetimeLocal(entry.ended_at) : ''
      )
    },
    [form]
  )

  const cancelEditEntry = useCallback(() => {
    setEditingEntryId(null)
    form.setFormField('editStart', '')
    form.setFormField('editEnd', '')
  }, [form])

  const saveEditEntry = useCallback(async () => {
    if (editingEntryId === null) return
    setManualError(null)
    const values = form.getValues()
    const start = values.editStart
    const end = values.editEnd
    if (!start || !end) return
    const startIso = datetimeLocalToUtcIso(start)
    const endIso = datetimeLocalToUtcIso(end)
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
    await loadTimeEntries()
  }, [editingEntryId, form, cancelEditEntry, loadTimeEntries])

  const handleDeleteEntry = useCallback(async () => {
    if (!deleteConfirmEntry) return
    await deleteTimeEntry(deleteConfirmEntry.id)
    setDeleteConfirmEntry(null)
    await loadTimeEntries()
  }, [deleteConfirmEntry, loadTimeEntries])

  const intervals = timeEntries.map((e) => ({
    start: e.started_at,
    end: e.ended_at,
  }))
  const intervalsTotalMinutes = totalMinutesRoundedUp(intervals)

  return {
    timeEntries,
    loadTimeEntries,
    intervalsTotalMinutes,
    manualError,
    clearManualError: () => setManualError(null),
    editingEntryId,
    handleAddInterval,
    startEditEntry,
    cancelEditEntry,
    saveEditEntry,
    deleteConfirmEntry,
    openDeleteEntryDialog: (entry: TimeEntry) => setDeleteConfirmEntry(entry),
    closeDeleteEntryDialog: () => setDeleteConfirmEntry(null),
    handleDeleteEntry,
  }
}
