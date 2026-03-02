import { create } from 'zustand'

const MAX_VISITED_TASKS = 5

export interface NavEntry {
  id: number
  title: string
}

interface NavigationState {
  visitedTasks: NavEntry[]
  pushTask: (entry: NavEntry) => void
  removeTask: (id: number) => void
}

export const useNavigationStore = create<NavigationState>((set) => ({
  visitedTasks: [],

  pushTask: (entry) =>
    set((state) => {
      const withoutThis = state.visitedTasks.filter((t) => t.id !== entry.id)
      const next = [entry, ...withoutThis].slice(0, MAX_VISITED_TASKS)
      return { visitedTasks: next }
    }),

  removeTask: (id) =>
    set((state) => ({
      visitedTasks: state.visitedTasks.filter((t) => t.id !== id),
    })),
}))
