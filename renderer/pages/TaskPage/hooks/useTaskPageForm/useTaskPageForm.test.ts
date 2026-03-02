import { getTaskById, updateTask } from '@renderer/api'
import type { Task } from '@renderer/shared/types'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useTaskPageForm } from './useTaskPageForm'

vi.mock('@renderer/api', () => ({
  getTaskById: vi.fn(),
  updateTask: vi.fn(),
}))

const getTaskByIdMock = vi.mocked(getTaskById)
const updateTaskMock = vi.mocked(updateTask)

function createTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 1,
    title: 'Task',
    comment: null,
    completed_at: null,
    created_at: '2020-01-01T00:00:00Z',
    updated_at: '2020-01-01T00:00:00Z',
    is_service: 0,
    ...overrides,
  }
}

describe('useTaskPageForm', () => {
  beforeEach(() => {
    getTaskByIdMock.mockReset()
    updateTaskMock.mockReset()
    updateTaskMock.mockResolvedValue(undefined)
  })

  it('при невалидном taskId не вызывает getTaskById (loading остаётся true — ранний return до finally)', async () => {
    const { result } = renderHook(() => useTaskPageForm(NaN))

    await act(async () => {})
    expect(getTaskByIdMock).not.toHaveBeenCalled()
    expect(result.current.task).toBeNull()
    expect(result.current.loading).toBe(true)
  })

  it('при успешной загрузке заполняет task и formFields', async () => {
    const task = createTask({ id: 5, title: 'My Task', comment: 'Note' })
    getTaskByIdMock.mockResolvedValue(task)

    const { result } = renderHook(() => useTaskPageForm(5))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.task).toEqual(task)
    expect(result.current.error).toBeNull()
    expect(result.current.formFields.title).toBe('My Task')
    expect(result.current.formFields.comment).toBe('Note')
  })

  it('при getTaskById(null) выставляет error и task null', async () => {
    getTaskByIdMock.mockResolvedValue(null)

    const { result } = renderHook(() => useTaskPageForm(5))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.error).toBe('Задача не найдена')
    expect(result.current.task).toBeNull()
  })

  it('при ошибке getTaskById выставляет error', async () => {
    getTaskByIdMock.mockRejectedValue(new Error('Сетевая ошибка'))

    const { result } = renderHook(() => useTaskPageForm(5))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.error).toBe('Сетевая ошибка')
    expect(result.current.task).toBeNull()
  })

  it('flushPendingSaves(true) не вызывает updateTask', async () => {
    getTaskByIdMock.mockResolvedValue(createTask())
    const { result } = renderHook(() => useTaskPageForm(5))
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => {
      result.current.flushPendingSaves(true)
    })

    expect(updateTaskMock).not.toHaveBeenCalled()
  })

  it('flushPendingSaves(false) с изменённым comment вызывает updateTask с comment', async () => {
    getTaskByIdMock.mockResolvedValue(createTask({ id: 5, comment: null }))
    const { result } = renderHook(() => useTaskPageForm(5))
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => {
      result.current.setFormField('comment', 'New comment')
    })
    act(() => {
      result.current.flushPendingSaves(false)
    })

    expect(updateTaskMock).toHaveBeenCalledWith(5, { comment: 'New comment' })
  })

  it('flushPendingSaves(false) с изменённым title вызывает updateTask с title', async () => {
    getTaskByIdMock.mockResolvedValue(createTask({ id: 5, title: 'Old' }))
    const { result } = renderHook(() => useTaskPageForm(5))
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => {
      result.current.setFormField('title', '  New title  ')
    })
    act(() => {
      result.current.flushPendingSaves(false)
    })

    expect(updateTaskMock).toHaveBeenCalledWith(5, { title: 'New title' })
  })

  it('saveTitle, если title не был изменен, не вызывает updateTask', async () => {
    getTaskByIdMock.mockResolvedValue(createTask({ id: 5, title: 'Same' }))
    const { result } = renderHook(() => useTaskPageForm(5))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.saveTitle()
    })

    expect(updateTaskMock).not.toHaveBeenCalled()
  })

  it('saveTitle, если title был изменен, вызывает updateTask и обновляет task', async () => {
    getTaskByIdMock.mockResolvedValue(createTask({ id: 5, title: 'Old' }))
    const { result } = renderHook(() => useTaskPageForm(5))
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => {
      result.current.setFormField('title', 'New Title')
    })
    await act(async () => {
      await result.current.saveTitle()
    })

    expect(updateTaskMock).toHaveBeenCalledWith(5, { title: 'New Title' })
    expect(result.current.task?.title).toBe('New Title')
  })

  it('saveComment, если comment не был изменен, не вызывает updateTask', async () => {
    getTaskByIdMock.mockResolvedValue(createTask({ id: 5, comment: 'Same' }))
    const { result } = renderHook(() => useTaskPageForm(5))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.saveComment()
    })

    expect(updateTaskMock).not.toHaveBeenCalled()
  })

  it('saveComment, если comment был изменен, вызывает updateTask и обновляет task', async () => {
    getTaskByIdMock.mockResolvedValue(createTask({ id: 5, comment: null }))
    const { result } = renderHook(() => useTaskPageForm(5))
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => {
      result.current.setFormField('comment', 'New note')
    })
    await act(async () => {
      await result.current.saveComment()
    })

    expect(updateTaskMock).toHaveBeenCalledWith(5, { comment: 'New note' })
    expect(result.current.task?.comment).toBe('New note')
  })
})
