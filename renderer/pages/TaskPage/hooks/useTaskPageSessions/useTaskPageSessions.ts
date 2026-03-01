import {
  closeOpenTaskSessionsByTaskId,
  createTaskSession,
  createTimeEntry,
  getTaskSessionsByTaskId,
  updateTaskSession,
} from '@renderer/api'
import type { Task, TaskSession } from '@renderer/shared/types'
import { useCallback, useEffect, useRef, useState } from 'react'

export interface UseTaskPageSessionsOptions {
  task: Task | null
  onSessionConverted?: () => void
}

export interface UseTaskPageSessionsResult {
  sessions: TaskSession[]
  loadSessions: () => Promise<void>
  handleConvertSessionToInterval: (session: TaskSession) => Promise<void>
}

export function useTaskPageSessions(
  taskId: number,
  options: UseTaskPageSessionsOptions
): UseTaskPageSessionsResult {
  const { task, onSessionConverted } = options
  const [sessions, setSessions] = useState<TaskSession[]>([])
  const [sessionId, setSessionId] = useState<number | null>(null)
  const sessionIdRef = useRef<number | null>(null)

  useEffect(() => {
    sessionIdRef.current = sessionId
  }, [sessionId])

  const loadSessions = useCallback(async () => {
    if (!Number.isFinite(taskId)) return
    const list = await getTaskSessionsByTaskId(taskId)
    setSessions(Array.isArray(list) ? list : [])
  }, [taskId])

  useEffect(() => {
    if (!Number.isFinite(taskId)) return
    let sid: number | null = null
    let cancelled = false
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
          loadSessions()
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
    if (!task) return
    loadSessions()
  }, [task, loadSessions])

  const handleConvertSessionToInterval = useCallback(
    async (session: TaskSession) => {
      if (!session.closed_at) return
      await createTimeEntry({
        taskId,
        startedAt: session.opened_at,
        endedAt: session.closed_at,
        source: 'session_convert',
      })
      onSessionConverted?.()
    },
    [taskId, onSessionConverted]
  )

  return {
    sessions,
    loadSessions,
    handleConvertSessionToInterval,
  }
}
