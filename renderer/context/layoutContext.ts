import { createContext, type Dispatch, type SetStateAction } from 'react'

export interface LayoutConfig {
  title: string
  onBack?: () => void
  onHome?: () => void
  showReportFab?: boolean
}

interface LayoutContextValue {
  config: LayoutConfig
  setConfig: Dispatch<SetStateAction<LayoutConfig>>
}

export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  title: 'Log Owl',
  showReportFab: false,
}

export const LayoutContext = createContext<LayoutContextValue | undefined>(
  undefined
)
