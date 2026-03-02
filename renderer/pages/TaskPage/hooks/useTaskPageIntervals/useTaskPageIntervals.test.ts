import {
  createTimeEntry,
  deleteTimeEntry,
  getTimeEntriesByTaskId,
  updateTimeEntry,
} from '@renderer/api'
import {
  datetimeLocalToUtcIso,
  totalMinutesRoundedUp,
} from '@renderer/shared/lib'
import type { Task, TimeEntry } from '@renderer/shared/types'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { TaskPageFormValues } from '../useTaskPageForm'
import type { UseTaskPageIntervalsOptions } from './useTaskPageIntervals'
import { useTaskPageIntervals } from './useTaskPageIntervals'

vi.mock('@renderer/api', () => ({
  createTimeEntry: vi.fn(),
  deleteTimeEntry: vi.fn(),
  getTimeEntriesByTaskId: vi.fn(),
  updateTimeEntry: vi.fn(),
}))

vi.mock('@renderer/shared/lib', () => ({
  datetimeLocalToUtcIso: vi.fn(),
  totalMinutesRoundedUp: vi.fn(() => 0),
  utcIsoToDatetimeLocal: vi.fn((iso: string) =>
    iso.slice(0, 19).replace('Z', '')
  ),
}))

const createTimeEntryMock = vi.mocked(createTimeEntry)
const deleteTimeEntryMock = vi.mocked(deleteTimeEntry)
const getTimeEntriesMock = vi.mocked(getTimeEntriesByTaskId)
const updateTimeEntryMock = vi.mocked(updateTimeEntry)
const datetimeLocalToUtcIsoMock = vi.mocked(datetimeLocalToUtcIso)
const totalMinutesRoundedUpMock = vi.mocked(totalMinutesRoundedUp)

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

function createTimeEntryFixture(overrides: Partial<TimeEntry> = {}): TimeEntry {
  return {
    id: 1,
    task_id: 1,
    started_at: '2020-01-01T10:00:00.000Z',
    ended_at: '2020-01-01T11:00:00.000Z',
    ...overrides,
  }
}

function createFormMock(overrides: Partial<TaskPageFormValues> = {}) {
  const state: TaskPageFormValues = {
    title: '',
    comment: '',
    manualStart: '2020-01-01T10:00',
    manualEnd: '2020-01-01T11:00',
    editStart: '',
    editEnd: '',
    ...overrides,
  }
  const setFormField = vi.fn(
    (name: keyof TaskPageFormValues, value: string) => {
      if (name in state)
        (state as unknown as Record<string, string>)[name] = value
    }
  )
  const getValues = vi.fn((): TaskPageFormValues => ({ ...state }))
  return {
    formFields: state,
    getValues,
    setFormField,
  }
}

function createOptions(
  overrides: Partial<UseTaskPageIntervalsOptions> = {}
): UseTaskPageIntervalsOptions {
  const form = createFormMock()
  return {
    form,
    task: createTask(),
    ...overrides,
  }
}

describe('useTaskPageIntervals', () => {
  beforeEach(() => {
    getTimeEntriesMock.mockResolvedValue([])
    createTimeEntryMock.mockResolvedValue(createTimeEntryFixture())
    updateTimeEntryMock.mockResolvedValue(undefined)
    deleteTimeEntryMock.mockResolvedValue(undefined)
    totalMinutesRoundedUpMock.mockReturnValue(0)
    datetimeLocalToUtcIsoMock.mockImplementation((local: string) => {
      if (local.includes('11:') || local.endsWith('11:00')) {
        return '2020-01-01T11:00:00.000Z'
      }
      return '2020-01-01T10:00:00.000Z'
    })
  })

  it('при наличии task вызывает loadTimeEntries и заполняет timeEntries', async () => {
    const entries = [createTimeEntryFixture({ id: 1 })]
    getTimeEntriesMock.mockResolvedValue(entries)

    const { result } = renderHook(() =>
      useTaskPageIntervals(5, createOptions({ task: createTask() }))
    )

    await waitFor(() => {
      expect(result.current.timeEntries).toEqual(entries)
    })
    expect(getTimeEntriesMock).toHaveBeenCalledWith(5)
  })

  it('при task null не вызывает getTimeEntriesByTaskId при mount', async () => {
    getTimeEntriesMock.mockClear()
    renderHook(() => useTaskPageIntervals(5, createOptions({ task: null })))
    await act(async () => {})
    expect(getTimeEntriesMock).not.toHaveBeenCalled()
  })

  it('loadTimeEntries при невалидном taskId не вызывает API', async () => {
    getTimeEntriesMock.mockClear()
    const { result } = renderHook(() =>
      useTaskPageIntervals(NaN, createOptions())
    )
    await act(async () => {
      await result.current.loadTimeEntries()
    })
    expect(getTimeEntriesMock).not.toHaveBeenCalled()
  })

  it('handleAddInterval при пустых manualStart/manualEnd выставляет manualError', async () => {
    const form = createFormMock({ manualStart: '', manualEnd: '' })
    const { result } = renderHook(() =>
      useTaskPageIntervals(5, createOptions({ form, task: createTask() }))
    )
    await waitFor(() => expect(getTimeEntriesMock).toHaveBeenCalled())

    await act(async () => {
      await result.current.handleAddInterval()
    })

    expect(result.current.manualError).toBe('Укажите начало и конец')
    expect(createTimeEntryMock).not.toHaveBeenCalled()
  })

  it('handleAddInterval при конце <= начала выставляет manualError', async () => {
    datetimeLocalToUtcIsoMock.mockReturnValue('2020-01-01T10:00:00.000Z')
    const form = createFormMock()
    const { result } = renderHook(() =>
      useTaskPageIntervals(5, createOptions({ form, task: createTask() }))
    )
    await waitFor(() => expect(getTimeEntriesMock).toHaveBeenCalled())

    await act(async () => {
      await result.current.handleAddInterval()
    })

    expect(result.current.manualError).toBe('Конец должен быть позже начала')
    expect(createTimeEntryMock).not.toHaveBeenCalled()
  })

  it('handleAddInterval при валидных данных создаёт интервал и сбрасывает форму', async () => {
    datetimeLocalToUtcIsoMock
      .mockReturnValueOnce('2020-01-01T10:00:00.000Z')
      .mockReturnValueOnce('2020-01-01T11:00:00.000Z')
    const form = createFormMock()
    const { result } = renderHook(() =>
      useTaskPageIntervals(5, createOptions({ form, task: createTask() }))
    )
    await waitFor(() => expect(getTimeEntriesMock).toHaveBeenCalled())
    getTimeEntriesMock.mockClear()

    await act(async () => {
      await result.current.handleAddInterval()
    })

    expect(createTimeEntryMock).toHaveBeenCalledWith({
      taskId: 5,
      startedAt: '2020-01-01T10:00:00.000Z',
      endedAt: '2020-01-01T11:00:00.000Z',
    })
    expect(form.setFormField).toHaveBeenCalledWith(
      'manualStart',
      expect.any(String)
    )
    expect(form.setFormField).toHaveBeenCalledWith(
      'manualEnd',
      expect.any(String)
    )
    expect(getTimeEntriesMock).toHaveBeenCalled()
  })

  it('clearManualError сбрасывает manualError', async () => {
    const form = createFormMock({ manualStart: '', manualEnd: '' })
    const { result } = renderHook(() =>
      useTaskPageIntervals(5, createOptions({ form, task: createTask() }))
    )
    await waitFor(() => expect(getTimeEntriesMock).toHaveBeenCalled())
    await act(async () => {
      await result.current.handleAddInterval()
    })
    expect(result.current.manualError).not.toBeNull()

    await act(async () => {
      result.current.clearManualError()
      await Promise.resolve()
    })
    expect(result.current.manualError).toBeNull()
  })

  it('startEditEntry выставляет editingEntryId и поля формы', async () => {
    const form = createFormMock()
    const entry = createTimeEntryFixture({
      id: 10,
      started_at: '2020-01-01T09:00:00.000Z',
      ended_at: '2020-01-01T10:00:00.000Z',
    })
    const { result } = renderHook(() =>
      useTaskPageIntervals(5, createOptions({ form, task: createTask() }))
    )
    await waitFor(() => expect(getTimeEntriesMock).toHaveBeenCalled())

    await act(async () => {
      result.current.startEditEntry(entry)
      await Promise.resolve()
    })

    expect(result.current.editingEntryId).toBe(10)
    expect(form.setFormField).toHaveBeenCalledWith(
      'editStart',
      expect.any(String)
    )
    expect(form.setFormField).toHaveBeenCalledWith(
      'editEnd',
      expect.any(String)
    )
  })

  it('cancelEditEntry сбрасывает editingEntryId и поля', async () => {
    const form = createFormMock({ editStart: 'x', editEnd: 'y' })
    const { result } = renderHook(() =>
      useTaskPageIntervals(5, createOptions({ form, task: createTask() }))
    )
    await waitFor(() => expect(getTimeEntriesMock).toHaveBeenCalled())
    await act(async () => {
      result.current.startEditEntry(createTimeEntryFixture({ id: 1 }))
      await Promise.resolve()
    })

    await act(async () => {
      result.current.cancelEditEntry()
      await Promise.resolve()
    })

    expect(result.current.editingEntryId).toBeNull()
    expect(form.setFormField).toHaveBeenCalledWith('editStart', '')
    expect(form.setFormField).toHaveBeenCalledWith('editEnd', '')
  })

  it('saveEditEntry при отсутствии редактирования не вызывает updateTimeEntry', async () => {
    const { result } = renderHook(() =>
      useTaskPageIntervals(5, createOptions({ task: createTask() }))
    )

    await act(async () => {
      await result.current.saveEditEntry()
    })

    expect(updateTimeEntryMock).not.toHaveBeenCalled()
  })

  it('saveEditEntry при валидном редактировании обновляет интервал', async () => {
    datetimeLocalToUtcIsoMock
      .mockReturnValueOnce('2020-01-01T09:00:00.000Z')
      .mockReturnValueOnce('2020-01-01T10:00:00.000Z')
    const form = createFormMock({
      editStart: '2020-01-01T09:00',
      editEnd: '2020-01-01T10:00',
    })
    const { result } = renderHook(() =>
      useTaskPageIntervals(5, createOptions({ form, task: createTask() }))
    )
    await act(async () => {
      result.current.startEditEntry(createTimeEntryFixture({ id: 7 }))
      await Promise.resolve()
    })
    updateTimeEntryMock.mockClear()

    await act(async () => {
      await result.current.saveEditEntry()
    })

    expect(updateTimeEntryMock).toHaveBeenCalledWith(7, {
      startedAt: '2020-01-01T09:00:00.000Z',
      endedAt: '2020-01-01T10:00:00.000Z',
    })
    expect(result.current.editingEntryId).toBeNull()
  })

  it('openDeleteEntryDialog и closeDeleteEntryDialog управляют deleteConfirmEntry', async () => {
    const entry = createTimeEntryFixture({ id: 3 })
    const { result } = renderHook(() =>
      useTaskPageIntervals(5, createOptions({ task: createTask() }))
    )
    await waitFor(() => expect(getTimeEntriesMock).toHaveBeenCalled())

    expect(result.current.deleteConfirmEntry).toBeNull()
    await act(async () => {
      result.current.openDeleteEntryDialog(entry)
      await Promise.resolve()
    })
    expect(result.current.deleteConfirmEntry).toEqual(entry)
    await act(async () => {
      result.current.closeDeleteEntryDialog()
      await Promise.resolve()
    })
    expect(result.current.deleteConfirmEntry).toBeNull()
  })

  it('handleDeleteEntry при отсутствии deleteConfirmEntry не вызывает deleteTimeEntry', async () => {
    const { result } = renderHook(() =>
      useTaskPageIntervals(5, createOptions({ task: createTask() }))
    )

    await act(async () => {
      await result.current.handleDeleteEntry()
    })

    expect(deleteTimeEntryMock).not.toHaveBeenCalled()
  })

  it('handleDeleteEntry при выбранной записи удаляет и перезагружает список', async () => {
    getTimeEntriesMock.mockResolvedValue([])
    const entry = createTimeEntryFixture({ id: 2 })
    const { result } = renderHook(() =>
      useTaskPageIntervals(5, createOptions({ task: createTask() }))
    )
    await waitFor(() => expect(getTimeEntriesMock).toHaveBeenCalled())
    await act(async () => {
      result.current.openDeleteEntryDialog(entry)
      await Promise.resolve()
    })
    deleteTimeEntryMock.mockClear()
    getTimeEntriesMock.mockClear()

    await act(async () => {
      await result.current.handleDeleteEntry()
    })

    expect(deleteTimeEntryMock).toHaveBeenCalledWith(2)
    expect(result.current.deleteConfirmEntry).toBeNull()
    expect(getTimeEntriesMock).toHaveBeenCalled()
  })

  it('intervalsTotalMinutes возвращает значение из totalMinutesRoundedUp', async () => {
    getTimeEntriesMock.mockResolvedValue([
      createTimeEntryFixture({
        started_at: '2020-01-01T10:00:00Z',
        ended_at: '2020-01-01T11:00:00Z',
      }),
    ])
    totalMinutesRoundedUpMock.mockReturnValue(60)
    const { result } = renderHook(() =>
      useTaskPageIntervals(5, createOptions({ task: createTask() }))
    )

    await waitFor(() => {
      expect(result.current.timeEntries.length).toBe(1)
    })
    expect(result.current.intervalsTotalMinutes).toBe(60)
  })
})
