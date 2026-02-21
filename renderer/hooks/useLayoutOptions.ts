import { useContext, useLayoutEffect } from 'react'
import { LayoutContext } from '@renderer/context'
import type { LayoutConfig } from '@renderer/context'

export function useLayoutOptions(options: LayoutConfig) {
  const context = useContext(LayoutContext)

  if (!context) {
    throw new Error('useLayoutOptions must be used within a LayoutProvider')
  }

  const { setConfig } = context

  useLayoutEffect(() => {
    setConfig((prev) => ({
      ...prev,
      ...(options.title !== undefined && { title: options.title }),
      onBack: 'onBack' in options ? options.onBack : undefined,
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only sync options.title/setConfig
  }, [options.title, setConfig])
}
