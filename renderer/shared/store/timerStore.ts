import { create } from 'zustand'

interface TimerState {
  activeEntryId: number | null
  activeTaskId: number | null
  startedAt: string | null // ISO UTC
  setActive: (entryId: number, taskId: number, startedAt: string) => void
  clearActive: () => void
}

export const useTimerStore = create<TimerState>((set) => ({
  activeEntryId: null,
  activeTaskId: null,
  startedAt: null,
  setActive: (entryId, taskId, startedAt) =>
    set({ activeEntryId: entryId, activeTaskId: taskId, startedAt }),
  clearActive: () =>
    set({ activeEntryId: null, activeTaskId: null, startedAt: null }),
}))

