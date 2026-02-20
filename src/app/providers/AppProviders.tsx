import React from 'react'
import { AppThemeProvider } from './ThemeProvider'
import { AppRouterProvider } from './RouterProvider'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppThemeProvider>
      <AppRouterProvider>{children}</AppRouterProvider>
    </AppThemeProvider>
  )
}
