import { type LayoutConfig, LayoutContext } from '@renderer/context'
import { expectWithSilencedConsole } from '@renderer/tests/lib'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode, SetStateAction } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { useLayoutOptions } from './useLayoutOptions'

function createWrapper(initialConfig: LayoutConfig) {
  let config = initialConfig

  const setConfig = vi.fn((updater: SetStateAction<LayoutConfig>) => {
    config =
      typeof updater === 'function'
        ? (updater as (prev: LayoutConfig) => LayoutConfig)(config)
        : updater
  })

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <LayoutContext.Provider value={{ config, setConfig }}>
      {children}
    </LayoutContext.Provider>
  )

  return { Wrapper, getConfig: () => config }
}

describe('useLayoutOptions', () => {
  it('обновляет title и onBack в контексте', async () => {
    const initialConfig: LayoutConfig = { title: 'Исходный' }
    const onBack = vi.fn()

    const { Wrapper, getConfig } = createWrapper(initialConfig)

    renderHook(
      () =>
        useLayoutOptions({
          title: 'Новый заголовок',
          onBack,
        }),
      { wrapper: Wrapper }
    )

    await waitFor(() => {
      const config = getConfig()
      expect(config.title).toBe('Новый заголовок')
      expect(config.onBack).toBe(onBack)
    })
  })

  it('сбрасывает onBack, если он не передан в options', async () => {
    const initialConfig: LayoutConfig = {
      title: 'Исходный',
      onBack: vi.fn(),
    }

    const { Wrapper, getConfig } = createWrapper(initialConfig)

    renderHook(
      () =>
        useLayoutOptions({
          title: 'Без кнопки назад',
        }),
      { wrapper: Wrapper }
    )

    await waitFor(() => {
      const config = getConfig()
      expect(config.title).toBe('Без кнопки назад')
      expect(config.onBack).toBeUndefined()
    })
  })

  it('выбрасывает ошибку вне LayoutProvider', () => {
    expectWithSilencedConsole(() => {
      expect(() =>
        renderHook(() => useLayoutOptions({ title: 'Тест' }))
      ).toThrowError('useLayoutOptions must be used within a LayoutProvider')
    })
  })
})
