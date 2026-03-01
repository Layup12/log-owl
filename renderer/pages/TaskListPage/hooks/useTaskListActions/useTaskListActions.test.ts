import { createTask as createTaskApi } from '@renderer/api'
import type { Task } from '@renderer/shared/types'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { UseTaskListActionsOptions } from './useTaskListActions'
import { useTaskListActions } from './useTaskListActions'

const navigateMock = vi.fn()

function createTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 1,
    title: '',
    comment: null,
    completed_at: null,
    created_at: '2020-01-01T00:00:00Z',
    updated_at: '2020-01-01T00:00:00Z',
    ...overrides,
  }
}

vi.mock('react-router', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react-router')>()
  return { ...mod, useNavigate: () => navigateMock }
})

vi.mock('@renderer/api', () => ({
  createTask: vi.fn(),
}))

const createTaskApiMock = vi.mocked(createTaskApi)

function createOptions(
  overrides: Partial<UseTaskListActionsOptions> = {}
): UseTaskListActionsOptions {
  return {
    onError: undefined,
    ...overrides,
  }
}

describe('useTaskListActions', () => {
  beforeEach(() => {
    navigateMock.mockClear()
    createTaskApiMock.mockReset()
  })

  it('изначально creating false, completedOpen false', () => {
    const { result } = renderHook(() => useTaskListActions(createOptions()))

    expect(result.current.creating).toBe(false)
    expect(result.current.completedOpen).toBe(false)
  })

  it('openTask вызывает navigate с /task/:id', () => {
    const { result } = renderHook(() => useTaskListActions(createOptions()))

    act(() => {
      result.current.openTask(42)
    })

    expect(navigateMock).toHaveBeenCalledWith('/task/42')
  })

  it('toggleCompletedOpen переключает completedOpen', () => {
    const { result } = renderHook(() => useTaskListActions(createOptions()))

    expect(result.current.completedOpen).toBe(false)

    act(() => {
      result.current.toggleCompletedOpen()
    })
    expect(result.current.completedOpen).toBe(true)

    act(() => {
      result.current.toggleCompletedOpen()
    })
    expect(result.current.completedOpen).toBe(false)
  })

  it('handleCreateTask при успехе вызывает navigate на /task/:id', async () => {
    createTaskApiMock.mockResolvedValue(createTask({ id: 10 }))

    const { result } = renderHook(() => useTaskListActions(createOptions()))

    act(() => {
      result.current.handleCreateTask()
    })

    expect(result.current.creating).toBe(true)
    await waitFor(() => {
      expect(result.current.creating).toBe(false)
    })
    expect(createTaskApiMock).toHaveBeenCalledWith({
      title: '',
      comment: null,
    })
    expect(navigateMock).toHaveBeenCalledWith('/task/10')
  })

  it('handleCreateTask при ответе без id вызывает onError', async () => {
    createTaskApiMock.mockResolvedValue({ id: undefined } as unknown as Task)

    const onError = vi.fn()
    const { result } = renderHook(() =>
      useTaskListActions(createOptions({ onError }))
    )

    act(() => {
      result.current.handleCreateTask()
    })

    await waitFor(() => {
      expect(result.current.creating).toBe(false)
    })
    expect(onError).toHaveBeenCalledWith('Не удалось создать задачу')
    expect(navigateMock).not.toHaveBeenCalled()
  })

  it('handleCreateTask при ошибке API вызывает onError', async () => {
    createTaskApiMock.mockRejectedValue(new Error('Сеть недоступна'))

    const onError = vi.fn()
    const { result } = renderHook(() =>
      useTaskListActions(createOptions({ onError }))
    )

    act(() => {
      result.current.handleCreateTask()
    })

    await waitFor(() => {
      expect(result.current.creating).toBe(false)
    })
    expect(onError).toHaveBeenCalledWith('Сеть недоступна')
    expect(navigateMock).not.toHaveBeenCalled()
  })

  it('handleCreateTask при creating true не вызывает createTask повторно', async () => {
    let resolveCreate: (value: Task) => void
    createTaskApiMock.mockImplementation(
      () =>
        new Promise<Task>((resolve) => {
          resolveCreate = resolve
        })
    )

    const { result } = renderHook(() => useTaskListActions(createOptions()))

    act(() => {
      result.current.handleCreateTask()
    })
    act(() => {
      result.current.handleCreateTask()
    })

    expect(createTaskApiMock).toHaveBeenCalledTimes(1)
    act(() => {
      resolveCreate!(createTask({ id: 1 }))
    })
    await waitFor(() => expect(result.current.creating).toBe(false))
  })

  it('handleCreateTask перед запросом вызывает onError(null)', async () => {
    createTaskApiMock.mockResolvedValue(createTask({ id: 1 }))
    const onError = vi.fn()
    const { result } = renderHook(() =>
      useTaskListActions(createOptions({ onError }))
    )

    act(() => {
      result.current.handleCreateTask()
    })

    expect(onError).toHaveBeenCalledWith(null)
    await waitFor(() => expect(result.current.creating).toBe(false))
  })
})
