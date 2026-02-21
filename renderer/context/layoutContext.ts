import { createContext, type Dispatch, type SetStateAction } from 'react'

export interface LayoutConfig {
  title: string
  onBack?: () => void
}

export interface LayoutContextValue {
  config: LayoutConfig
  setConfig: Dispatch<SetStateAction<LayoutConfig>>
}

export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  title: 'Log Owl',
}

export const LayoutContext = createContext<LayoutContextValue | undefined>(undefined)
