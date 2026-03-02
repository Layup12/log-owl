import { useLayoutOptions } from '@renderer/hooks'
import type { Task } from '@renderer/shared/types'
import { renderWithProviders } from '@renderer/tests/lib'
import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { UseTaskListActionsResult, UseTaskListDataReturn } from './hooks'
import { useTaskListActions, useTaskListData } from './hooks'
import { TaskListPage } from './TaskListPage'

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
  useTaskListData: vi.fn(),
  useTaskListActions: vi.fn(),
}))

vi.mock('@renderer/hooks', () => ({
  useLayoutOptions: vi.fn(),
}))

vi.mock('./components', () => ({
  TaskGrid: ({
    tasks,
  }: {
    tasks: { id: number }[]
    cellSize: number
    onTaskOpen: (id: number) => void
    onTasksUpdate: () => void
    onCreateTask: () => void
    onCreateTaskLoading?: boolean
  }) => (
    <div
      data-testid="task-list-task-grid"
      data-first-task-id={tasks[0]?.id ?? undefined}
    />
  ),
  CompletedTasksSection: () => (
    <div data-testid="task-list-completed-section" />
  ),
}))

vi.mock('@renderer/components', () => ({
  TaskCard: ({ task }: { task: { id: number; title: string } }) => (
    <div data-testid="task-card" data-task-id={task.id}>
      {task.title}
    </div>
  ),
}))

const useTaskListDataMock = vi.mocked(useTaskListData)
const useTaskListActionsMock = vi.mocked(useTaskListActions)
const useLayoutOptionsMock = vi.mocked(useLayoutOptions)

function createTaskListOverrides(
  overrides: Partial<UseTaskListDataReturn> = {}
): UseTaskListDataReturn {
  return {
    tasks: [],
    serviceTask: null,
    loading: false,
    error: null,
    setError: vi.fn(),
    reload: vi.fn(),
    activeTasks: [],
    completedTasks: [],
    hasCompleted: false,
    ...overrides,
  }
}

function createActionsOverrides(
  overrides: Partial<UseTaskListActionsResult> = {}
): UseTaskListActionsResult {
  return {
    creating: false,
    handleCreateTask: vi.fn(),
    openTask: vi.fn(),
    completedOpen: false,
    toggleCompletedOpen: vi.fn(),
    ...overrides,
  }
}

function renderTaskListPage(initialEntry: string = '/') {
  return renderWithProviders(
    <Routes>
      <Route path="/" element={<TaskListPage />} />
    </Routes>,
    { router: { initialEntries: [initialEntry] } }
  )
}

describe('TaskListPage', () => {
  beforeEach(() => {
    useLayoutOptionsMock.mockClear()
    useTaskListDataMock.mockReturnValue(createTaskListOverrides())
    useTaskListActionsMock.mockReturnValue(createActionsOverrides())
  })

  it('вызывает useLayoutOptions с заголовком и showReportFab', () => {
    renderTaskListPage()

    expect(useLayoutOptionsMock).toHaveBeenCalledWith({
      title: 'Задачи',
      showReportFab: true,
    })
  })

  it('показывает индикатор загрузки, когда loading === true', () => {
    useTaskListDataMock.mockReturnValue(
      createTaskListOverrides({ loading: true })
    )

    renderTaskListPage()

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('показывает ошибку из error, когда error задан', () => {
    useTaskListDataMock.mockReturnValue(
      createTaskListOverrides({ error: 'Сетевая ошибка' })
    )

    renderTaskListPage()

    expect(screen.getByText('Сетевая ошибка')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('при успешной загрузке происходит рендер TaskGrid', () => {
    useTaskListDataMock.mockReturnValue(
      createTaskListOverrides({
        loading: false,
        error: null,
        activeTasks: [createTask({ id: 1, title: 'Active' })],
      })
    )

    renderTaskListPage()

    expect(screen.getByTestId('task-list-task-grid')).toBeInTheDocument()
  })

  it('при успешной загрузке и hasCompleted происходит рендер CompletedTasksSection', () => {
    useTaskListDataMock.mockReturnValue(
      createTaskListOverrides({
        loading: false,
        error: null,
        hasCompleted: true,
        completedTasks: [createTask({ id: 2, completed_at: '2020-01-02' })],
      })
    )

    renderTaskListPage()

    expect(
      screen.getByTestId('task-list-completed-section')
    ).toBeInTheDocument()
  })

  it('при успешной загрузке без завершённых не происходит рендер CompletedTasksSection', () => {
    useTaskListDataMock.mockReturnValue(
      createTaskListOverrides({
        loading: false,
        error: null,
        hasCompleted: false,
      })
    )

    renderTaskListPage()

    expect(
      screen.queryByTestId('task-list-completed-section')
    ).not.toBeInTheDocument()
  })

  it('при наличии serviceTask первая карточка в сетке — сервисная задача', () => {
    const serviceTask = createTask({
      id: 99,
      title: 'Сервисная задача',
      is_service: 1,
    })
    useTaskListDataMock.mockReturnValue(
      createTaskListOverrides({
        loading: false,
        error: null,
        serviceTask,
        activeTasks: [createTask({ id: 1 })],
      })
    )

    renderTaskListPage()

    const grid = screen.getByTestId('task-list-task-grid')
    expect(grid).toHaveAttribute('data-first-task-id', '99')
  })
})
