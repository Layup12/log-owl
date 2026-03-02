import { getServiceTask } from '@renderer/api'
import { useNavigationStore } from '@renderer/shared/store'
import type { Task } from '@renderer/shared/types'
import { renderWithProviders } from '@renderer/tests/lib'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { TaskTray } from './TaskTray'

const navigateMock = vi.fn()

vi.mock('react-router', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react-router')>()
  return { ...mod, useNavigate: () => navigateMock }
})

vi.mock('@renderer/api', () => ({
  getServiceTask: vi.fn(),
}))

vi.mock('@renderer/shared/store', () => ({
  useNavigationStore: vi.fn(),
  useTaskInvalidationStore: (selector: (s: { version: number }) => unknown) =>
    selector({ version: 0 }),
}))

const getServiceTaskMock = vi.mocked(getServiceTask)
const useNavigationStoreMock = vi.mocked(useNavigationStore)

let mockVisitedTasks: { id: number; title: string }[] = []
useNavigationStoreMock.mockImplementation((selector) =>
  selector({
    visitedTasks: mockVisitedTasks,
    pushTask: vi.fn(),
    removeTask: vi.fn(),
  })
)

function createTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 1,
    title: 'Task',
    comment: null,
    completed_at: null,
    created_at: '',
    updated_at: '',
    is_service: 0,
    ...overrides,
  }
}

describe('TaskTray', () => {
  beforeEach(() => {
    navigateMock.mockClear()
    mockVisitedTasks = []
  })

  it('показывает чип сервис-задачи после загрузки', async () => {
    const serviceTask = createTask({ id: 10, title: 'Сервис', is_service: 1 })
    getServiceTaskMock.mockResolvedValue(serviceTask)

    renderWithProviders(<TaskTray />)

    await waitFor(() => {
      expect(screen.getByLabelText('Сервис-задача: Сервис')).toBeInTheDocument()
      expect(screen.getByText('⚡ Сервис')).toBeInTheDocument()
    })
  })

  it('не показывает чип сервис-задачи, если getServiceTask вернул null', async () => {
    getServiceTaskMock.mockResolvedValue(null)

    renderWithProviders(<TaskTray />)

    await waitFor(() => {
      expect(getServiceTaskMock).toHaveBeenCalled()
    })

    expect(screen.queryByLabelText(/Сервис-задача:/)).not.toBeInTheDocument()
  })

  it('показывает чипы последних посещённых задач из store', async () => {
    getServiceTaskMock.mockResolvedValue(null)
    mockVisitedTasks = [
      { id: 1, title: 'Первая' },
      { id: 2, title: 'Вторая' },
    ]

    renderWithProviders(<TaskTray />)

    await waitFor(() => {
      expect(getServiceTaskMock).toHaveBeenCalled()
    })

    expect(screen.getByLabelText('Задача: Первая')).toBeInTheDocument()
    expect(screen.getByLabelText('Задача: Вторая')).toBeInTheDocument()
  })

  it('ограничивает число чипов посещённых задач до 2', async () => {
    getServiceTaskMock.mockResolvedValue(null)
    mockVisitedTasks = [
      { id: 1, title: 'A' },
      { id: 2, title: 'B' },
      { id: 3, title: 'C' },
    ]

    renderWithProviders(<TaskTray />)

    await waitFor(() => {
      expect(getServiceTaskMock).toHaveBeenCalled()
    })

    expect(screen.getByLabelText('Задача: A')).toBeInTheDocument()
    expect(screen.getByLabelText('Задача: B')).toBeInTheDocument()
    expect(screen.queryByLabelText('Задача: C')).not.toBeInTheDocument()
  })

  it('не дублирует сервис-задачу в посещённых: в чипах только сервисная + до 2 других', async () => {
    const serviceTask = createTask({ id: 10, title: 'Сервис', is_service: 1 })
    getServiceTaskMock.mockResolvedValue(serviceTask)
    mockVisitedTasks = [
      { id: 10, title: 'Сервис' },
      { id: 1, title: 'Первая' },
      { id: 2, title: 'Вторая' },
    ]

    renderWithProviders(<TaskTray />)

    await waitFor(() => {
      expect(screen.getByLabelText('Сервис-задача: Сервис')).toBeInTheDocument()
    })

    expect(screen.getByLabelText('Задача: Первая')).toBeInTheDocument()
    expect(screen.getByLabelText('Задача: Вторая')).toBeInTheDocument()
    expect(screen.queryByLabelText('Задача: Сервис')).not.toBeInTheDocument()
  })

  it('по клику на чип сервис-задачи вызывает navigate с путём и state', async () => {
    const serviceTask = createTask({ id: 42, title: 'Сервис', is_service: 1 })
    getServiceTaskMock.mockResolvedValue(serviceTask)

    renderWithProviders(<TaskTray />)

    await waitFor(() => {
      expect(screen.getByLabelText('Сервис-задача: Сервис')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByLabelText('Сервис-задача: Сервис'))

    expect(navigateMock).toHaveBeenCalledWith('/task/42', {
      state: { from: 'tray' },
    })
  })

  it('по клику на чип посещённой задачи вызывает navigate с путём и state', async () => {
    getServiceTaskMock.mockResolvedValue(null)
    mockVisitedTasks = [{ id: 7, title: 'Седьмая' }]

    renderWithProviders(<TaskTray />)

    await waitFor(() => {
      expect(screen.getByLabelText('Задача: Седьмая')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByLabelText('Задача: Седьмая'))

    expect(navigateMock).toHaveBeenCalledWith('/task/7', {
      state: { from: 'tray' },
    })
  })

  it('при открытой задаче 5 передаёт returnId: 5 при переходе на другую задачу', async () => {
    getServiceTaskMock.mockResolvedValue(null)
    mockVisitedTasks = [
      { id: 5, title: 'Пятая' },
      { id: 7, title: 'Седьмая' },
    ]

    renderWithProviders(<TaskTray />, {
      router: { initialEntries: ['/task/5'] },
    })

    await waitFor(() => {
      expect(screen.getByLabelText('Задача: Седьмая')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByLabelText('Задача: Седьмая'))

    expect(navigateMock).toHaveBeenCalledWith('/task/7', {
      state: { from: 'tray', returnId: 5 },
    })
  })

  it('чип текущей задачи не кликабелен и не вызывает navigate', async () => {
    const serviceTask = createTask({ id: 42, title: 'Сервис', is_service: 1 })
    getServiceTaskMock.mockResolvedValue(serviceTask)

    renderWithProviders(<TaskTray />, {
      router: { initialEntries: ['/task/42'] },
    })

    await waitFor(() => {
      expect(screen.getByLabelText('Сервис-задача: Сервис')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByLabelText('Сервис-задача: Сервис'))

    expect(navigateMock).not.toHaveBeenCalled()
  })

  it('чип посещённой задачи в активном состоянии не вызывает navigate', async () => {
    getServiceTaskMock.mockResolvedValue(null)
    mockVisitedTasks = [{ id: 3, title: 'Третья' }]

    renderWithProviders(<TaskTray />, {
      router: { initialEntries: ['/task/3'] },
    })

    await waitFor(() => {
      expect(screen.getByLabelText('Задача: Третья')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByLabelText('Задача: Третья'))

    expect(navigateMock).not.toHaveBeenCalled()
  })
})
