import { useLayoutHeader } from '@renderer/hooks'
import { useThemeStore } from '@renderer/shared/store'
import { renderWithProviders } from '@renderer/tests/lib'
import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Layout } from './Layout'

vi.mock('@renderer/hooks', () => ({
  useLayoutHeader: vi.fn(),
}))

vi.mock('@renderer/shared/store', () => ({
  useThemeStore: vi.fn(),
}))

vi.mock('../ReportModal', () => ({
  ReportModal: ({ open }: { open: boolean }) => (
    <div data-testid="report-modal" data-open={open ? 'true' : 'false'} />
  ),
}))

const useLayoutHeaderMock = vi.mocked(useLayoutHeader)
const useThemeStoreMock = vi.mocked(useThemeStore)

function renderLayout(options?: Parameters<typeof renderWithProviders>[1]) {
  return renderWithProviders(
    <Layout>
      <div>content</div>
    </Layout>,
    options
  )
}

describe('Layout', () => {
  it('отображает заголовок и не показывает кнопку Назад, когда onBack не передан', () => {
    useLayoutHeaderMock.mockReturnValue({
      title: 'Главная страница',
      onBack: undefined,
    })

    const toggleMode = vi.fn()
    useThemeStoreMock.mockReturnValue({
      mode: 'light',
      toggleMode,
    } as ReturnType<typeof useThemeStore>)

    renderLayout()

    expect(screen.getByText('Главная страница')).toBeInTheDocument()
    expect(screen.queryByLabelText('Назад')).not.toBeInTheDocument()
  })

  it('показывает кнопку Назад и вызывает onBack по клику', () => {
    const onBack = vi.fn()

    useLayoutHeaderMock.mockReturnValue({
      title: 'Детали задачи',
      onBack,
    })

    const toggleMode = vi.fn()
    useThemeStoreMock.mockReturnValue({
      mode: 'light',
      toggleMode,
    } as ReturnType<typeof useThemeStore>)

    renderLayout()

    const backButton = screen.getByLabelText('Назад')
    fireEvent.click(backButton)

    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('переключает тему по клику на иконку', () => {
    const toggleMode = vi.fn()

    useLayoutHeaderMock.mockReturnValue({
      title: 'Главная',
      onBack: undefined,
    })

    useThemeStoreMock.mockReturnValue({
      mode: 'light',
      toggleMode,
    } as ReturnType<typeof useThemeStore>)

    renderLayout()

    const toggleButton = screen.getByLabelText('toggle theme')
    fireEvent.click(toggleButton)

    expect(toggleMode).toHaveBeenCalledTimes(1)
  })

  it('не показывает FAB, если showReportFab не включён', () => {
    const toggleMode = vi.fn()

    useLayoutHeaderMock.mockReturnValue({
      title: 'Главная',
      onBack: undefined,
    })

    useThemeStoreMock.mockReturnValue({
      mode: 'light',
      toggleMode,
    } as ReturnType<typeof useThemeStore>)

    renderLayout()

    expect(screen.queryByLabelText('Отчёт')).not.toBeInTheDocument()
  })

  it('показывает FAB и открывает модалку отчёта, если showReportFab=true', () => {
    const toggleMode = vi.fn()

    useLayoutHeaderMock.mockReturnValue({
      title: 'Главная',
      onBack: undefined,
      showReportFab: true,
    } as unknown as ReturnType<typeof useLayoutHeader>)

    useThemeStoreMock.mockReturnValue({
      mode: 'light',
      toggleMode,
    } as ReturnType<typeof useThemeStore>)

    renderLayout()

    const modal = screen.getByTestId('report-modal')
    expect(modal).toHaveAttribute('data-open', 'false')

    const fab = screen.getByLabelText('Отчёт')
    fireEvent.click(fab)

    expect(screen.getByTestId('report-modal')).toHaveAttribute(
      'data-open',
      'true'
    )
  })
})
