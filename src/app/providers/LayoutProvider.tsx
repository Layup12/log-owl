import { useState } from 'react'
import { LayoutContext, DEFAULT_LAYOUT_CONFIG } from '@context'

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState(DEFAULT_LAYOUT_CONFIG)

  return (
    <LayoutContext.Provider value={{ config, setConfig }}>
      {children}
    </LayoutContext.Provider>
  )
}
