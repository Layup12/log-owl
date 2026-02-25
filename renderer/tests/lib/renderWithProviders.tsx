import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom'

interface ProvidersOptions {
  router?: MemoryRouterProps
}

export function renderWithProviders(
  ui: ReactElement,
  options: ProvidersOptions = {},
  renderOptions?: Omit<RenderOptions, 'wrapper'>
) {
  const { router } = options

  return render(<MemoryRouter {...router}>{ui}</MemoryRouter>, renderOptions)
}
