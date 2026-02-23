import { useThemeStore } from '@renderer/shared/store'
import {
  CssBaseline,
  ThemeProvider as MuiThemeProvider,
} from '@renderer/shared/ui'
import React from 'react'

import { getTheme } from '../config/theme'

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useThemeStore((state) => state.mode)
  const theme = React.useMemo(() => getTheme(mode), [mode])

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  )
}
