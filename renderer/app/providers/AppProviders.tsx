import React from 'react'

import { AppRouterProvider } from './RouterProvider'
import { AppThemeProvider } from './ThemeProvider'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppThemeProvider>
      <AppRouterProvider>{children}</AppRouterProvider>
    </AppThemeProvider>
  )
}
