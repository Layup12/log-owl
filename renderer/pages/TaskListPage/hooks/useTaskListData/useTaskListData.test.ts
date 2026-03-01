import { getAllTasks } from '@renderer/api'
import type { Task } from '@renderer/shared/types'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useTaskListData } from './useTaskListData'

vi.mock('@renderer/api', () => ({
  getAllTasks: vi.fn(),
}))

const getAllTasksMock = vi.mocked(getAllTasks)

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

describe('useTaskListData', () => {
  beforeEach(() => {
    getAllTasksMock.mockReset()
  })

  it('при mount вызывает getAllTasks', async () => {
    getAllTasksMock.mockResolvedValue([])

    renderHook(() => useTaskListData())

    await waitFor(() => {
      expect(getAllTasksMock).toHaveBeenCalledTimes(1)
    })
  })

  it('при успешной загрузке выставляет tasks, loading false, error null', async () => {
    const tasks = [createTask({ id: 1 }), createTask({ id: 2 })]
    getAllTasksMock.mockResolvedValue(tasks)

    const { result } = renderHook(() => useTaskListData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.tasks).toEqual(tasks)
    expect(result.current.error).toBeNull()
  })

  it('при успешной загрузке разделяет activeTasks и completedTasks', async () => {
    const completed = createTask({
      id: 2,
      completed_at: '2020-01-02T00:00:00Z',
    })
    const active = createTask({ id: 1, completed_at: null })
    getAllTasksMock.mockResolvedValue([active, completed])

    const { result } = renderHook(() => useTaskListData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.activeTasks).toEqual([active])
    expect(result.current.completedTasks).toEqual([completed])
    expect(result.current.hasCompleted).toBe(true)
  })

  it('при пустом списке hasCompleted false', async () => {
    getAllTasksMock.mockResolvedValue([])

    const { result } = renderHook(() => useTaskListData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.hasCompleted).toBe(false)
    expect(result.current.activeTasks).toEqual([])
    expect(result.current.completedTasks).toEqual([])
  })

  it('при ошибке getAllTasks выставляет error и loading false', async () => {
    getAllTasksMock.mockRejectedValue(new Error('Сетевая ошибка'))

    const { result } = renderHook(() => useTaskListData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.error).toBe('Сетевая ошибка')
    expect(result.current.tasks).toEqual([])
  })

  it('при ошибке не типа Error выставляет сообщение по умолчанию', async () => {
    getAllTasksMock.mockRejectedValue('string error')

    const { result } = renderHook(() => useTaskListData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.error).toBe('Failed to load tasks')
  })

  it('setError обновляет error', async () => {
    getAllTasksMock.mockResolvedValue([])
    const { result } = renderHook(() => useTaskListData())
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => {
      result.current.setError('Custom error')
    })

    expect(result.current.error).toBe('Custom error')

    act(() => {
      result.current.setError(null)
    })
    expect(result.current.error).toBeNull()
  })

  it('reload снова вызывает getAllTasks', async () => {
    getAllTasksMock.mockResolvedValue([createTask({ id: 1 })])

    const { result } = renderHook(() => useTaskListData())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.tasks).toHaveLength(1)

    getAllTasksMock.mockResolvedValue([createTask({ id: 2 })])
    await act(async () => {
      await result.current.reload()
    })

    expect(getAllTasksMock).toHaveBeenCalledTimes(2)
    expect(result.current.tasks).toHaveLength(1)
    expect(result.current.tasks[0].id).toBe(2)
  })

  it('reload при ошибке выставляет error, при повторном успешном вызове сбрасывает', async () => {
    getAllTasksMock
      .mockResolvedValueOnce([])
      .mockRejectedValueOnce(new Error('Fail'))
      .mockResolvedValueOnce([createTask({ id: 1 })])

    const { result } = renderHook(() => useTaskListData())

    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.reload()
    })
    await waitFor(() => expect(result.current.error).toBe('Fail'))

    await act(async () => {
      await result.current.reload()
    })
    await waitFor(() => expect(result.current.error).toBeNull())
    expect(result.current.tasks).toHaveLength(1)
  })
})
