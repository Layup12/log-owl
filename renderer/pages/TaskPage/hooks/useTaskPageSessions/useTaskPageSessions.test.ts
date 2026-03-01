import {
  closeOpenTaskSessionsByTaskId,
  createTaskSession,
  createTimeEntry,
  getTaskSessionsByTaskId,
  updateTaskSession,
} from '@renderer/api'
import type { Task, TaskSession } from '@renderer/shared/types'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { UseTaskPageSessionsOptions } from './useTaskPageSessions'
import { useTaskPageSessions } from './useTaskPageSessions'

vi.mock('@renderer/api', () => ({
  closeOpenTaskSessionsByTaskId: vi.fn(),
  createTaskSession: vi.fn(),
  createTimeEntry: vi.fn(),
  getTaskSessionsByTaskId: vi.fn(),
  updateTaskSession: vi.fn(),
}))

const closeOpenMock = vi.mocked(closeOpenTaskSessionsByTaskId)
const createSessionMock = vi.mocked(createTaskSession)
const createTimeEntryMock = vi.mocked(createTimeEntry)
const getSessionsMock = vi.mocked(getTaskSessionsByTaskId)
const updateSessionMock = vi.mocked(updateTaskSession)

function createTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 1,
    title: 'Task',
    comment: null,
    completed_at: null,
    created_at: '2020-01-01T00:00:00Z',
    updated_at: '2020-01-01T00:00:00Z',
    ...overrides,
  }
}

function createSession(overrides: Partial<TaskSession> = {}): TaskSession {
  return {
    id: 1,
    task_id: 1,
    opened_at: '2020-01-01T10:00:00Z',
    closed_at: '2020-01-01T11:00:00Z',
    last_seen: null,
    ...overrides,
  }
}

function createOptions(
  overrides: Partial<UseTaskPageSessionsOptions> = {}
): UseTaskPageSessionsOptions {
  return {
    task: createTask(),
    onSessionConverted: undefined,
    ...overrides,
  }
}

describe('useTaskPageSessions', () => {
  beforeEach(() => {
    closeOpenMock.mockResolvedValue(undefined)
    createSessionMock.mockResolvedValue(createSession({ id: 10 }))
    getSessionsMock.mockResolvedValue([])
    updateSessionMock.mockResolvedValue(undefined)
    createTimeEntryMock.mockResolvedValue({ id: 1, started_at: '' })
  })

  it('изначально sessions пустой массив', async () => {
    const { result } = renderHook(() => useTaskPageSessions(5, createOptions()))
    expect(result.current.sessions).toEqual([])
    await waitFor(() => {
      expect(createSessionMock).toHaveBeenCalled()
    })
  })

  it('при валидном taskId при mount вызывает closeOpenTaskSessionsByTaskId и createTaskSession', async () => {
    renderHook(() => useTaskPageSessions(5, createOptions()))

    await waitFor(() => {
      expect(closeOpenMock).toHaveBeenCalledWith(5)
    })
    await waitFor(() => {
      expect(createSessionMock).toHaveBeenCalledWith({
        taskId: 5,
        openedAt: expect.any(String),
      })
    })
  })

  it('после createTaskSession вызывает loadSessions и обновляет sessions', async () => {
    const sessionsList: TaskSession[] = [
      createSession({ id: 1, opened_at: '2020-01-01T09:00:00Z' }),
    ]
    getSessionsMock.mockResolvedValue(sessionsList)

    const { result } = renderHook(() =>
      useTaskPageSessions(5, createOptions({ task: createTask() }))
    )

    await waitFor(() => {
      expect(result.current.sessions).toEqual(sessionsList)
    })
    expect(getSessionsMock).toHaveBeenCalledWith(5)
  })

  it('loadSessions при невалидном taskId не вызывает getTaskSessionsByTaskId', async () => {
    getSessionsMock.mockClear()
    const { result } = renderHook(() =>
      useTaskPageSessions(NaN, createOptions())
    )

    await act(async () => {
      await result.current.loadSessions()
    })

    expect(getSessionsMock).not.toHaveBeenCalled()
  })

  it('ручной вызов loadSessions обновляет sessions', async () => {
    getSessionsMock.mockResolvedValue([])
    const { result } = renderHook(() =>
      useTaskPageSessions(5, createOptions({ task: createTask() }))
    )

    await waitFor(() => {
      expect(getSessionsMock).toHaveBeenCalled()
    })
    getSessionsMock.mockClear()
    const newList = [createSession({ id: 2 })]
    getSessionsMock.mockResolvedValue(newList)

    await act(async () => {
      await result.current.loadSessions()
    })

    expect(result.current.sessions).toEqual(newList)
  })

  it('handleConvertSessionToInterval при session без closed_at ничего не делает', async () => {
    const onSessionConverted = vi.fn()
    const { result } = renderHook(() =>
      useTaskPageSessions(5, createOptions({ onSessionConverted }))
    )
    const sessionOpen = createSession({ closed_at: null })

    await act(async () => {
      await result.current.handleConvertSessionToInterval(sessionOpen)
    })

    expect(createTimeEntryMock).not.toHaveBeenCalled()
    expect(onSessionConverted).not.toHaveBeenCalled()
  })

  it('handleConvertSessionToInterval при закрытой сессии создаёт интервал и вызывает onSessionConverted', async () => {
    const onSessionConverted = vi.fn()
    const { result } = renderHook(() =>
      useTaskPageSessions(5, createOptions({ onSessionConverted }))
    )
    const session = createSession({
      id: 3,
      opened_at: '2020-01-01T10:00:00Z',
      closed_at: '2020-01-01T11:00:00Z',
    })

    await act(async () => {
      await result.current.handleConvertSessionToInterval(session)
    })

    expect(createTimeEntryMock).toHaveBeenCalledWith({
      taskId: 5,
      startedAt: '2020-01-01T10:00:00Z',
      endedAt: '2020-01-01T11:00:00Z',
      source: 'session_convert',
    })
    expect(onSessionConverted).toHaveBeenCalledTimes(1)
  })

  it('при размонтировании вызывает updateTaskSession для открытой сессии', async () => {
    createSessionMock.mockResolvedValue(createSession({ id: 20 }))
    getSessionsMock.mockResolvedValue([])

    const { unmount } = renderHook(() =>
      useTaskPageSessions(5, createOptions({ task: createTask() }))
    )

    await waitFor(() => {
      expect(createSessionMock).toHaveBeenCalled()
    })

    unmount()

    await waitFor(() => {
      expect(updateSessionMock).toHaveBeenCalledWith(20, {
        closedAt: expect.any(String),
      })
    })
  })

  it('при невалидном taskId mount-эффект не вызывает closeOpen и createTaskSession', async () => {
    closeOpenMock.mockClear()
    createSessionMock.mockClear()

    renderHook(() => useTaskPageSessions(NaN, createOptions()))

    await new Promise((r) => setTimeout(r, 50))
    expect(closeOpenMock).not.toHaveBeenCalled()
    expect(createSessionMock).not.toHaveBeenCalled()
  })
})
