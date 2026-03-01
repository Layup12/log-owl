import { createTimeEntry, updateTimeEntry } from '@renderer/api'
import { useTimerStore } from '@renderer/shared/store'
import { useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'

import type { UseTaskPageFormResult } from '../useTaskPageForm/useTaskPageForm'

export interface UseTaskPagePageOptions {
  form: Pick<UseTaskPageFormResult, 'flushPendingSaves'>
  loadTimeEntries: () => Promise<void>
}

export interface UseTaskPagePageResult {
  isTimerRunning: boolean
  startedAt: string | null
  handleTimerStart: () => Promise<void>
  handleTimerStop: () => Promise<void>
  onDeletedAfterDelete: () => void
}

export function useTaskPageTimer(
  taskId: number,
  options: UseTaskPagePageOptions
): UseTaskPagePageResult {
  const navigate = useNavigate()
  const { form, loadTimeEntries } = options
  const skipFlushOnUnmountRef = useRef(false)
  const formRef = useRef(form)
  useEffect(() => {
    formRef.current = form
  }, [form])

  const { activeEntryId, activeTaskId, startedAt } = useTimerStore()
  const isTimerRunning = activeTaskId === taskId && activeEntryId !== null

  const onDeletedAfterDelete = useCallback(() => {
    skipFlushOnUnmountRef.current = true
    navigate('/')
  }, [navigate])

  const onCloseTaskPage = useCallback(() => {
    const state = useTimerStore.getState()
    if (state.activeTaskId === taskId && state.activeEntryId !== null) {
      const ended_at = new Date().toISOString()
      updateTimeEntry(state.activeEntryId, { endedAt: ended_at }).catch(
        () => {}
      )
      useTimerStore.getState().clearActive()
    }
    formRef.current.flushPendingSaves(skipFlushOnUnmountRef.current)
  }, [taskId])

  useEffect(() => {
    return () => {
      onCloseTaskPage()
    }
  }, [onCloseTaskPage])

  const handleTimerStart = useCallback(async () => {
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
    await loadTimeEntries()
  }, [taskId, loadTimeEntries])

  const handleTimerStop = useCallback(async () => {
    const state = useTimerStore.getState()
    if (state.activeEntryId === null) return
    const ended_at = new Date().toISOString()
    await updateTimeEntry(state.activeEntryId, { endedAt: ended_at })
    useTimerStore.getState().clearActive()
    await loadTimeEntries()
  }, [loadTimeEntries])

  return {
    isTimerRunning,
    startedAt,
    handleTimerStart,
    handleTimerStop,
    onDeletedAfterDelete,
  }
}
