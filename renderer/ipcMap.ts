import type { Task, TaskSession, TimeEntry } from '@renderer/shared/types'
import { CHANNELS, type IpcChannelName } from '@contracts'
import type { RecoveryInfo } from '@contracts'

export interface TaskCreatePayload {
  title: string
  comment: string | null
  completed_at: string | null
}

export interface TaskUpdatePayload {
  title?: string
  comment?: string | null
  completed_at?: string | null
}

export interface TaskSessionCreatePayload {
  task_id: number
  opened_at: string
  closed_at: string | null
  last_seen: string | null
}

export interface TaskSessionUpdatePayload {
  task_id?: number
  opened_at?: string
  closed_at?: string | null
  last_seen?: string | null
}

export interface TimeEntryCreatePayload {
  task_id: number
  started_at: string
  ended_at: string | null
  source: string | null
}

export interface TimeEntryUpdatePayload {
  started_at?: string
  ended_at?: string | null
}

export interface TimeEntryCreateResult {
  id: number
  started_at: string
}

export interface SettingsGetAllResult {
  key: string
  value: string
}

type ChannelPayload = { args: unknown[]; result: unknown }

const ipcMap = {
  [CHANNELS.TASK_GET_ALL]: { args: [] as const, result: [] as Task[] },
  [CHANNELS.TASK_GET_BY_ID]: { args: [0] as [number], result: null as Task | null },
  [CHANNELS.TASK_CREATE]: { args: [{} as TaskCreatePayload], result: {} as Task },
  [CHANNELS.TASK_UPDATE]: { args: [0, {} as TaskUpdatePayload], result: undefined as void },
  [CHANNELS.TASK_DELETE]: { args: [0], result: true as boolean },

  [CHANNELS.TASK_SESSION_GET_ALL]: { args: [] as const, result: [] as TaskSession[] },
  [CHANNELS.TASK_SESSION_GET_BY_ID]: { args: [0] as [number], result: null as TaskSession | null },
  [CHANNELS.TASK_SESSION_GET_BY_TASK_ID]: { args: [0] as [number], result: [] as TaskSession[] },
  [CHANNELS.TASK_SESSION_CREATE]: { args: [{} as TaskSessionCreatePayload], result: {} as TaskSession },
  [CHANNELS.TASK_SESSION_UPDATE]: { args: [0, {} as TaskSessionUpdatePayload], result: undefined as void },
  [CHANNELS.TASK_SESSION_DELETE]: { args: [0], result: true as boolean },
  [CHANNELS.TASK_SESSION_CLOSE_OPEN_BY_TASK_ID]: { args: [0] as [number], result: 0 as number },

  [CHANNELS.TIME_ENTRY_GET_ALL]: { args: [] as const, result: [] as TimeEntry[] },
  [CHANNELS.TIME_ENTRY_GET_BY_ID]: { args: [0] as [number], result: null as TimeEntry | null },
  [CHANNELS.TIME_ENTRY_GET_BY_TASK_ID]: { args: [0] as [number], result: [] as TimeEntry[] },
  [CHANNELS.TIME_ENTRY_CREATE]: { args: [{} as TimeEntryCreatePayload], result: {} as TimeEntryCreateResult },
  [CHANNELS.TIME_ENTRY_UPDATE]: { args: [0, {} as TimeEntryUpdatePayload], result: undefined as void },
  [CHANNELS.TIME_ENTRY_DELETE]: { args: [0], result: true as boolean },

  [CHANNELS.SETTINGS_GET]: { args: [''], result: null as string | null },
  [CHANNELS.SETTINGS_SET]: { args: ['', ''], result: undefined as void },
  [CHANNELS.SETTINGS_GET_ALL]: { args: [] as const, result: [] as SettingsGetAllResult[] },
  [CHANNELS.SETTINGS_DELETE]: { args: [''], result: true as boolean },

  [CHANNELS.REPORT_GET_TIME_ENTRIES_IN_RANGE]: { args: ['', ''] as [string, string], result: [] as TimeEntry[] },

  [CHANNELS.APP_GET_RECOVERY_INFO]: { args: [] as const, result: {} as RecoveryInfo },
} satisfies Record<IpcChannelName, ChannelPayload>

export type IpcMap = typeof ipcMap
