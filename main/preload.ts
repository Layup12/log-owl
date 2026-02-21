import { contextBridge, ipcRenderer } from 'electron'

const ALLOWED_CHANNELS: readonly string[] = [
  'task:getAll', 'task:getById', 'task:create', 'task:update', 'task:delete',
  'taskSession:getAll', 'taskSession:getById', 'taskSession:getByTaskId', 'taskSession:create', 'taskSession:update', 'taskSession:delete', 'taskSession:closeOpenByTaskId',
  'timeEntry:getAll', 'timeEntry:getById', 'timeEntry:getByTaskId', 'timeEntry:create', 'timeEntry:update', 'timeEntry:delete',
  'settings:get', 'settings:set', 'settings:getAll', 'settings:delete',
  'report:getTimeEntriesInRange',
  'app:getRecoveryInfo'
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
