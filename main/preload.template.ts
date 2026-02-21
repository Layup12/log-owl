import { contextBridge, ipcRenderer } from 'electron'

const ALLOWED_CHANNELS: readonly string[] = [
  /* __ALLOWED_CHANNELS_ARRAY__ */
]
const allowedChannels = new Set<string>(ALLOWED_CHANNELS)

contextBridge.exposeInMainWorld('electron', {
  invoke: (channel: string, ...args: unknown[]) => {
    if (!allowedChannels.has(channel)) {
      return Promise.reject(new Error(`IPC channel not allowed: ${channel}`))
    }
    return ipcRenderer.invoke(channel, ...args)
  },
})
