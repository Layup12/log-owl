import { createTimeEntry, updateTimeEntry } from '@renderer/api'
import { useTimerStore } from '@renderer/shared/store'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { UseTaskPagePageOptions } from './useTaskPageTimer'
import { useTaskPageTimer } from './useTaskPageTimer'

const navigateMock = vi.fn()

vi.mock('react-router', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react-router')>()
  return { ...mod, useNavigate: () => navigateMock }
})

vi.mock('@renderer/api', () => ({
  createTimeEntry: vi.fn(),
  updateTimeEntry: vi.fn(),
}))

const createTimeEntryMock = vi.mocked(createTimeEntry)
const updateTimeEntryMock = vi.mocked(updateTimeEntry)

let mockStoreState: {
  activeEntryId: number | null
  activeTaskId: number | null
  startedAt: string | null
}
const setActiveMock = vi.fn()
const clearActiveMock = vi.fn()

vi.mock('@renderer/shared/store', () => ({
  useTimerStore: vi.fn(),
}))

const useTimerStoreMock = vi.mocked(useTimerStore)

function createOptions(
  overrides: Partial<UseTaskPagePageOptions> = {}
): UseTaskPagePageOptions {
  return {
    form: { flushPendingSaves: vi.fn() },
    loadTimeEntries: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}

function createWrapper(initialEntry = '/task/1') {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
  )
  return Wrapper
}

describe('useTaskPageTimer', () => {
  beforeEach(() => {
    mockStoreState = {
      activeEntryId: null,
      activeTaskId: null,
      startedAt: null,
    }
    useTimerStoreMock.mockImplementation(() => mockStoreState)
    useTimerStoreMock.getState = vi.fn(() => ({
      ...mockStoreState,
      setActive: setActiveMock,
      clearActive: clearActiveMock,
    }))
    setActiveMock.mockImplementation(
      (entryId: number, taskId: number, startedAt: string) => {
        mockStoreState.activeEntryId = entryId
        mockStoreState.activeTaskId = taskId
        mockStoreState.startedAt = startedAt
      }
    )
    clearActiveMock.mockImplementation(() => {
      mockStoreState.activeEntryId = null
      mockStoreState.activeTaskId = null
      mockStoreState.startedAt = null
    })
    createTimeEntryMock.mockReset()
    updateTimeEntryMock.mockResolvedValue(undefined)
    setActiveMock.mockClear()
    clearActiveMock.mockClear()
  })

  it('возвращает isTimerRunning: false, когда таймер не запущен для этой задачи', () => {
    const options = createOptions()
    const { result } = renderHook(() => useTaskPageTimer(5, options), {
      wrapper: createWrapper(),
    })

    expect(result.current.isTimerRunning).toBe(false)
    expect(result.current.startedAt).toBeNull()
  })

  it('возвращает isTimerRunning: true, когда активный таймер для этой задачи', () => {
    mockStoreState.activeEntryId = 10
    mockStoreState.activeTaskId = 5
    mockStoreState.startedAt = '2020-01-01T12:00:00Z'
    const options = createOptions()

    const { result } = renderHook(() => useTaskPageTimer(5, options), {
      wrapper: createWrapper(),
    })

    expect(result.current.isTimerRunning).toBe(true)
    expect(result.current.startedAt).toBe('2020-01-01T12:00:00Z')
  })

  it('onDeletedAfterDelete вызывает navigate("/")', () => {
    navigateMock.mockClear()
    const options = createOptions()
    const { result } = renderHook(() => useTaskPageTimer(1, options), {
      wrapper: createWrapper(),
    })

    act(() => {
      result.current.onDeletedAfterDelete()
    })

    expect(navigateMock).toHaveBeenCalledWith('/')
  })

  it('handleTimerStart создаёт интервал, вызывает setActive и loadTimeEntries', async () => {
    const loadTimeEntries = vi.fn().mockResolvedValue(undefined)
    const options = createOptions({ loadTimeEntries })
    createTimeEntryMock.mockResolvedValue({
      id: 99,
      started_at: '2020-01-01T10:00:00Z',
    })

    const { result } = renderHook(() => useTaskPageTimer(5, options), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      await result.current.handleTimerStart()
    })

    expect(createTimeEntryMock).toHaveBeenCalledWith({
      taskId: 5,
      startedAt: expect.any(String),
    })
    expect(setActiveMock).toHaveBeenCalledWith(99, 5, '2020-01-01T10:00:00Z')
    expect(loadTimeEntries).toHaveBeenCalled()
  })

  it('handleTimerStart при уже запущенном другом интервале сначала завершает его', async () => {
    mockStoreState.activeEntryId = 1
    mockStoreState.activeTaskId = 3
    mockStoreState.startedAt = '2020-01-01T09:00:00Z'
    const loadTimeEntries = vi.fn().mockResolvedValue(undefined)
    const options = createOptions({ loadTimeEntries })
    updateTimeEntryMock.mockResolvedValue(undefined)
    createTimeEntryMock.mockResolvedValue({
      id: 100,
      started_at: '2020-01-01T10:00:00Z',
    })

    const { result } = renderHook(() => useTaskPageTimer(5, options), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      await result.current.handleTimerStart()
    })

    expect(updateTimeEntryMock).toHaveBeenCalledWith(1, {
      endedAt: expect.any(String),
    })
    expect(clearActiveMock).toHaveBeenCalled()
    expect(createTimeEntryMock).toHaveBeenCalledWith({
      taskId: 5,
      startedAt: expect.any(String),
    })
    expect(setActiveMock).toHaveBeenCalledWith(100, 5, '2020-01-01T10:00:00Z')
  })

  it('handleTimerStop завершает активный интервал и вызывает loadTimeEntries', async () => {
    mockStoreState.activeEntryId = 7
    mockStoreState.activeTaskId = 5
    const loadTimeEntries = vi.fn().mockResolvedValue(undefined)
    const options = createOptions({ loadTimeEntries })
    updateTimeEntryMock.mockResolvedValue(undefined)

    const { result } = renderHook(() => useTaskPageTimer(5, options), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      await result.current.handleTimerStop()
    })

    expect(updateTimeEntryMock).toHaveBeenCalledWith(7, {
      endedAt: expect.any(String),
    })
    expect(clearActiveMock).toHaveBeenCalled()
    expect(loadTimeEntries).toHaveBeenCalled()
  })

  it('handleTimerStop при отсутствии активного интервала ничего не делает', async () => {
    const loadTimeEntries = vi.fn().mockResolvedValue(undefined)
    const options = createOptions({ loadTimeEntries })
    updateTimeEntryMock.mockClear()
    clearActiveMock.mockClear()

    const { result } = renderHook(() => useTaskPageTimer(5, options), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      await result.current.handleTimerStop()
    })

    expect(updateTimeEntryMock).not.toHaveBeenCalled()
    expect(clearActiveMock).not.toHaveBeenCalled()
    expect(loadTimeEntries).not.toHaveBeenCalled()
  })

  it('при размонтировании вызывает flushPendingSaves', () => {
    const flushPendingSaves = vi.fn()
    const options = createOptions({ form: { flushPendingSaves } })

    const { unmount } = renderHook(() => useTaskPageTimer(5, options), {
      wrapper: createWrapper(),
    })

    unmount()

    expect(flushPendingSaves).toHaveBeenCalledWith(false)
  })
})
