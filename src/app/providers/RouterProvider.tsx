import React from 'react'
import { HashRouter } from 'react-router-dom'

export function AppRouterProvider({ children }: { children: React.ReactNode }) {
  return <HashRouter>{children}</HashRouter>
}
