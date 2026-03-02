import { create } from 'zustand'

interface TaskInvalidationState {
  version: number
  invalidate: () => void
}

export const useTaskInvalidationStore = create<TaskInvalidationState>(
  (set) => ({
    version: 0,
    invalidate: () => set((s) => ({ version: s.version + 1 })),
  })
)
