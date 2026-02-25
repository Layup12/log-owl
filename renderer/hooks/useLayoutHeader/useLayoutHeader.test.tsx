import { type LayoutConfig, LayoutContext } from '@renderer/context'
import { expectWithSilencedConsole } from '@renderer/tests/lib'
import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useLayoutHeader } from './useLayoutHeader'

function createWrapper(config: LayoutConfig) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <LayoutContext.Provider
      value={{
        config,
        setConfig: vi.fn(),
      }}
    >
      {children}
    </LayoutContext.Provider>
  )

  return Wrapper
}

describe('useLayoutHeader', () => {
  it('возвращает конфиг по умолчанию из контекста', () => {
    const config: LayoutConfig = { title: 'Log Owl' }

    const { result } = renderHook(() => useLayoutHeader(), {
      wrapper: createWrapper(config),
    })

    expect(result.current).toBe(config)
  })

  it('возвращает переданный конфиг', () => {
    const customConfig = { title: 'Другая страница' }

    const { result } = renderHook(() => useLayoutHeader(), {
      wrapper: createWrapper(customConfig),
    })

    expect(result.current).toBe(customConfig)
  })

  it('выбрасывает ошибку вне LayoutProvider', () => {
    expectWithSilencedConsole(() => {
      expect(() => renderHook(() => useLayoutHeader())).toThrowError(
        'useLayoutHeader must be used within a LayoutProvider'
      )
    })
  })
})
