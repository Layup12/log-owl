import { LayoutContext } from '@renderer/context'
import { useContext } from 'react'

export function useLayoutHeader() {
  const context = useContext(LayoutContext)

  if (!context) {
    throw new Error('useLayoutHeader must be used within a LayoutProvider')
  }

  return context.config
}
