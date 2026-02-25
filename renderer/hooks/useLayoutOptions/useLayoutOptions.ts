import type { LayoutConfig } from '@renderer/context'
import { LayoutContext } from '@renderer/context'
import { useContext, useLayoutEffect } from 'react'

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
      showReportFab: 'showReportFab' in options ? options.showReportFab : false,
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only sync options.title/setConfig
  }, [options.title, setConfig])
}
