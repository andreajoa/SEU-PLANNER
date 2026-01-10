/**
 * Global State Management with Zustand
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Planner, Task, ThemeMode, Language, TaskView } from '@/types'

interface AppState {
  // User state
  user: User | null
  setUser: (user: User | null) => void
  updateUser: (updates: Partial<User>) => void

  // Planner state
  planners: Planner[]
  setPlanners: (planners: Planner[]) => void
  addPlanner: (planner: Planner) => void
  updatePlanner: (id: string, updates: Partial<Planner>) => void
  removePlanner: (id: string) => void
  currentPlanner: Planner | null
  setCurrentPlanner: (planner: Planner | null) => void

  // Task state
  tasks: Task[]
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  removeTask: (id: string) => void
  toggleTask: (id: string) => void

  // UI state
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  language: Language
  setLanguage: (language: Language) => void
  taskView: TaskView
  setTaskView: (view: TaskView) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void

  // Gamification state
  showLevelUp: boolean
  setShowLevelUp: (show: boolean) => void
  addXp: (amount: number) => void
  unlockAchievement: (achievementId: string) => void

  // Loading state
  isLoading: boolean
  setIsLoading: (loading: boolean) => void

  // Reset state
  reset: () => void
}

const initialState = {
  user: null,
  planners: [],
  currentPlanner: null,
  tasks: [],
  theme: 'system' as ThemeMode,
  language: 'pt' as Language,
  taskView: 'list' as TaskView,
  sidebarOpen: true,
  showLevelUp: false,
  isLoading: false
}

export const useStore = create<AppState>()(
  persist(
    set => ({
      ...initialState,

      // User actions
      setUser: user => set({ user }),
      updateUser: updates =>
        set(state => ({
          user: state.user ? { ...state.user, ...updates } : null
        })),

      // Planner actions
      setPlanners: planners => set({ planners }),
      addPlanner: planner =>
        set(state => ({
          planners: [...state.planners, planner]
        })),
      updatePlanner: (id, updates) =>
        set(state => ({
          planners: state.planners.map(p => (p.id === id ? { ...p, ...updates } : p)),
          currentPlanner:
            state.currentPlanner?.id === id
              ? { ...state.currentPlanner, ...updates }
              : state.currentPlanner
        })),
      removePlanner: id =>
        set(state => ({
          planners: state.planners.filter(p => p.id !== id),
          tasks: state.tasks.filter(t => t.planner_id !== id),
          currentPlanner: state.currentPlanner?.id === id ? null : state.currentPlanner
        })),
      setCurrentPlanner: planner => set({ currentPlanner: planner }),

      // Task actions
      setTasks: tasks => set({ tasks }),
      addTask: task =>
        set(state => ({
          tasks: [...state.tasks, task]
        })),
      updateTask: (id, updates) =>
        set(state => ({
          tasks: state.tasks.map(t => (t.id === id ? { ...t, ...updates } : t))
        })),
      removeTask: id =>
        set(state => ({
          tasks: state.tasks.filter(t => t.id !== id)
        })),
      toggleTask: id =>
        set(state => {
          const task = state.tasks.find(t => t.id === id)
          if (!task) return state

          const updatedTask = {
            ...task,
            done: !task.done,
            completed_at: !task.done ? new Date().toISOString() : undefined
          }

          // Award XP for completing tasks
          if (!task.done && state.user) {
            const newXp = (state.user.xp || 0) + 10
            const newLevel = Math.floor(newXp / 100) + 1
            const showLevelUp = newLevel > (state.user.level || 1)

            return {
              tasks: state.tasks.map(t => (t.id === id ? updatedTask : t)),
              user: {
                ...state.user,
                xp: newXp,
                level: newLevel,
                tasks_completed: (state.user.tasks_completed || 0) + 1
              },
              showLevelUp
            }
          }

          // Remove XP for uncompleting tasks
          if (task.done && state.user) {
            return {
              tasks: state.tasks.map(t => (t.id === id ? updatedTask : t)),
              user: {
                ...state.user,
                xp: Math.max(0, (state.user.xp || 0) - 10),
                level: Math.max(1, Math.floor(Math.max(0, (state.user.xp || 0) - 10) / 100) + 1),
                tasks_completed: Math.max(0, (state.user.tasks_completed || 0) - 1)
              }
            }
          }

          return {
            tasks: state.tasks.map(t => (t.id === id ? updatedTask : t))
          }
        }),

      // UI actions
      setTheme: theme => set({ theme }),
      setLanguage: language => set({ language }),
      setTaskView: taskView => set({ taskView }),
      setSidebarOpen: sidebarOpen => set({ sidebarOpen }),

      // Gamification actions
      setShowLevelUp: showLevelUp => set({ showLevelUp }),
      addXp: amount =>
        set(state => {
          if (!state.user) return state

          const newXp = (state.user.xp || 0) + amount
          const newLevel = Math.floor(newXp / 100) + 1
          const showLevelUp = newLevel > (state.user.level || 1)

          return {
            user: {
              ...state.user,
              xp: newXp,
              level: newLevel
            },
            showLevelUp
          }
        }),
      unlockAchievement: achievementId =>
        set(state => {
          if (!state.user) return state

          const achievement = state.user.achievements.find(a => a.id === achievementId)
          if (achievement?.unlocked) return state

          return {
            user: {
              ...state.user,
              achievements: state.user.achievements.map(a =>
                a.id === achievementId ? { ...a, unlocked: true, unlocked_at: new Date().toISOString() } : a
              )
            }
          }
        }),

      // Loading state
      setIsLoading: isLoading => set({ isLoading }),

      // Reset
      reset: () => set(initialState)
    }),
    {
      name: 'planner-storage',
      partialize: state => ({
        theme: state.theme,
        language: state.language,
        taskView: state.taskView,
        sidebarOpen: state.sidebarOpen
      })
    }
  )
)
