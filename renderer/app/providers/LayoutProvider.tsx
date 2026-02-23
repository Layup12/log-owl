import { DEFAULT_LAYOUT_CONFIG, LayoutContext } from '@renderer/context'
import { useState } from 'react'

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState(DEFAULT_LAYOUT_CONFIG)

  return (
    <LayoutContext.Provider value={{ config, setConfig }}>
      {children}
    </LayoutContext.Provider>
  )
}
