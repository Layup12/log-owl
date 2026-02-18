import { create } from 'zustand'

export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'theme'

function getStoredMode(): ThemeMode {
  if (typeof localStorage === 'undefined') return 'light'
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'dark' || stored === 'light' ? stored : 'light'
}

interface ThemeState {
  mode: ThemeMode
  toggleMode: () => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: getStoredMode(),
  toggleMode: () =>
    set((state) => {
      const next: ThemeMode = state.mode === 'light' ? 'dark' : 'light'
      if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, next)
      return { mode: next }
    }),
}))
