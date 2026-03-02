import { useLayoutOptions } from '@renderer/hooks'
import type { Task } from '@renderer/shared/types'
import { renderWithProviders } from '@renderer/tests/lib'
import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { UseTaskPageFormResult, UseTaskPageIntervalsResult } from './hooks'
import { useTaskPageForm, useTaskPageIntervals } from './hooks'
import { TaskPage } from './TaskPage'

const navigateMock = vi.fn()

vi.mock('react-router', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react-router')>()
  return { ...mod, useNavigate: () => navigateMock }
})

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

vi.mock('./hooks', () => ({
  useTaskPageForm: vi.fn(),
  useTaskPageIntervals: vi.fn(),
}))

vi.mock('@renderer/hooks', () => ({
  useLayoutOptions: vi.fn(),
}))

vi.mock('@mui/material', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@mui/material')>()
  return {
    ...mod,
    useTheme: () => ({ breakpoints: { up: () => '(min-width:0px)' } }),
    useMediaQuery: () => false,
  }
})

vi.mock('./components', () => ({
  TaskPageMainBlock: () => <div data-testid="task-page-main-block" />,
  TaskPageIntervalsAndSessions: () => (
    <div data-testid="task-page-intervals-and-sessions" />
  ),
}))

const useTaskPageFormMock = vi.mocked(useTaskPageForm)
const useTaskPageIntervalsMock = vi.mocked(useTaskPageIntervals)
const useLayoutOptionsMock = vi.mocked(useLayoutOptions)

function createFormOverrides(
  overrides: Partial<UseTaskPageFormResult> = {}
): UseTaskPageFormResult {
  return {
    task: createTask(),
    loading: false,
    error: null,
    formFields: {
      title: 'Task',
      comment: '',
      manualStart: '',
      manualEnd: '',
      editStart: '',
      editEnd: '',
    },
    setFormField: vi.fn(),
    getValues: vi.fn(),
    saveTitle: vi.fn(),
    saveComment: vi.fn(),
    flushPendingSaves: vi.fn(),
    ...overrides,
  }
}

function createIntervalsOverrides(
  overrides: Partial<UseTaskPageIntervalsResult> = {}
): UseTaskPageIntervalsResult {
  return {
    timeEntries: [],
    intervalsTotalMinutes: 0,
    editingEntryId: null,
    manualError: null,
    loadTimeEntries: vi.fn(),
    handleAddInterval: vi.fn(),
    clearManualError: vi.fn(),
    startEditEntry: vi.fn(),
    saveEditEntry: vi.fn(),
    cancelEditEntry: vi.fn(),
    openDeleteEntryDialog: vi.fn(),
    closeDeleteEntryDialog: vi.fn(),
    deleteConfirmEntry: null,
    handleDeleteEntry: vi.fn(),
    ...overrides,
  }
}

function renderTaskPage(
  initialEntry: string | { pathname: string; state?: unknown } = '/task/1'
) {
  return renderWithProviders(
    <Routes>
      <Route path="/task/:id" element={<TaskPage />} />
    </Routes>,
    { router: { initialEntries: [initialEntry] } }
  )
}

describe('TaskPage', () => {
  beforeEach(() => {
    useLayoutOptionsMock.mockClear()
    useTaskPageFormMock.mockImplementation((taskId) =>
      createFormOverrides(
        Number.isFinite(taskId) ? { task: createTask({ id: taskId }) } : {}
      )
    )
    useTaskPageIntervalsMock.mockImplementation(() =>
      createIntervalsOverrides()
    )
  })

  it('показывает "Неверный id задачи", если id не число', () => {
    renderTaskPage('/task/abc')

    expect(screen.getByText('Неверный id задачи')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('показывает индикатор загрузки, когда form.loading === true', () => {
    useTaskPageFormMock.mockReturnValue(
      createFormOverrides({ loading: true, task: null })
    )

    renderTaskPage('/task/1')

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('показывает ошибку из form.error, когда form.error задан', () => {
    useTaskPageFormMock.mockReturnValue(
      createFormOverrides({
        loading: false,
        error: 'Сетевая ошибка',
        task: null,
      })
    )

    renderTaskPage('/task/1')

    expect(screen.getByText('Сетевая ошибка')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('показывает "Задача не найдена", когда form.task === null и form.error нет', () => {
    useTaskPageFormMock.mockReturnValue(
      createFormOverrides({
        loading: false,
        error: null,
        task: null,
      })
    )

    renderTaskPage('/task/1')

    expect(screen.getByText('Задача не найдена')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('при успешной загрузке происходит рендер основного контента (MainBlock и IntervalsAndSessions)', () => {
    useTaskPageFormMock.mockReturnValue(
      createFormOverrides({
        loading: false,
        error: null,
        task: createTask({ id: 1, title: 'My Task' }),
      })
    )

    renderTaskPage('/task/1')

    expect(screen.getByTestId('task-page-main-block')).toBeInTheDocument()
    expect(
      screen.getByTestId('task-page-intervals-and-sessions')
    ).toBeInTheDocument()
  })

  it('при location.state.returnId передаёт onBack (назад к задаче) и onHome (на главную)', () => {
    useTaskPageFormMock.mockReturnValue(
      createFormOverrides({
        task: createTask({ id: 7, title: 'Task 7' }),
      })
    )

    renderTaskPage({ pathname: '/task/7', state: { returnId: 5 } })

    expect(useLayoutOptionsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Задача: Task 7',
        onHome: expect.any(Function),
      })
    )

    const lastCall = useLayoutOptionsMock.mock.calls.at(-1)?.[0]
    if (!lastCall?.onBack || !lastCall?.onHome)
      throw new Error('expected onBack/onHome')

    navigateMock.mockClear()
    lastCall.onBack()
    expect(navigateMock).toHaveBeenCalledWith('/task/5')

    navigateMock.mockClear()
    lastCall.onHome()
    expect(navigateMock).toHaveBeenCalledWith('/')
  })
})
