import React from 'react'
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@shared/ui'
import { useThemeStore } from '@shared/store'
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
