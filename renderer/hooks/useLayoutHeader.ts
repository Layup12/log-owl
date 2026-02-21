import { useContext } from 'react'
import { LayoutContext } from '@renderer/context'

export function useLayoutHeader() {
  const context = useContext(LayoutContext)

  if (!context) {
    throw new Error('useLayoutHeader must be used within a LayoutProvider')
  }

  return context.config
}
