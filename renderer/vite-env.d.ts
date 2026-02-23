/// <reference types="vite/client" />

import type { ElectronApi } from '@contracts'

import type { IpcMap } from './ipcMap'

declare global {
  interface Window {
    electron: ElectronApi<IpcMap>
  }
}

export {}
