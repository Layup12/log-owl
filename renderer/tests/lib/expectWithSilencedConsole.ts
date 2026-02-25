import { vi } from 'vitest'

type ConsoleMethod = 'error' | 'warn'

export function expectWithSilencedConsole(
  assertion: () => void,
  type: ConsoleMethod = 'error'
) {
  const spy = vi.spyOn(console, type).mockImplementation(() => {})

  try {
    assertion()
  } finally {
    spy.mockRestore()
  }
}
