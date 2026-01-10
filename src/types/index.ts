/**
 * Core Type Definitions for Planner Premium ULTRA
 */

// ============================================
// USER TYPES
// ============================================

export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  level: number
  xp: number
  streak: number
  tasks_completed: number
  planners_created: number
  achievements: Achievement[]
  subscription?: 'free' | 'premium'
  trial_ends_at?: string
  last_activity: string
  created_at: string
  updated_at: string
}

export interface AuthUser {
  id: string
  email: string
  name?: string
  avatar_url?: string
}

// ============================================
// PLANNER TYPES
// ============================================

export type PlannerType = 'todo' | 'projeto' | 'habitos' | 'financeiro' | 'metas' | 'diario'

export interface Planner {
  id: string
  user_id: string
  name: string
  type: PlannerType
  description?: string
  icon?: string
  color?: string
  created_at: string
  updated_at: string
}

export interface PlannerFormData {
  name: string
  type: PlannerType
  description?: string
  icon?: string
  color?: string
}

// ============================================
// TASK TYPES
// ============================================

export type TaskPriority = 'baixa' | 'media' | 'alta' | 'urgente' | 'critica'
export type TaskCategory = 'trabalho' | 'pessoal' | 'saude' | 'estudos' | 'financas' | 'outro'
export type TaskStatus = 'todo' | 'progress' | 'done'
export type TaskRepeat = 'none' | 'daily' | 'weekly' | 'monthly'
export type TaskContext = 'anywhere' | 'home' | 'office' | 'online'
export type TaskEnergy = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  planner_id: string
  user_id: string
  title: string
  description?: string
  category: TaskCategory
  priority: TaskPriority
  status: TaskStatus
  date?: string
  time?: string
  duration?: number
  repeat: TaskRepeat
  context: TaskContext
  energy: TaskEnergy
  reminder?: number
  link?: string
  tags: string[]
  subtasks: Subtask[]
  done: boolean
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface Subtask {
  id: string
  text: string
  done: boolean
}

export interface TaskFormData {
  title: string
  description?: string
  category: TaskCategory
  priority: TaskPriority
  date?: string
  time?: string
  duration?: number
  repeat: TaskRepeat
  context: TaskContext
  energy: TaskEnergy
  reminder?: number
  link?: string
  tags: string[]
  subtasks: Omit<Subtask, 'id'>[]
}

// ============================================
// GAMIFICATION TYPES
// ============================================

export interface Achievement {
  id: string
  icon: string
  name: string
  description: string
  unlocked: boolean
  unlocked_at?: string
}

export type AchievementType =
  | 'first_task'
  | 'task_master'
  | 'centenarian'
  | 'week_streak'
  | 'month_streak'
  | 'level_10'
  | 'level_25'
  | 'level_50'
  | 'planner_pro'
  | 'habit_master'
  | 'early_bird'
  | 'night_owl'
  | 'perfectionist'
  | 'speed demon'

export const ACHIEVEMENTS: Record<AchievementType, Omit<Achievement, 'unlocked' | 'unlocked_at'>> = {
  first_task: { id: 'first_task', icon: '🎯', name: 'Primeira Tarefa', description: 'Complete 1 tarefa' },
  task_master: { id: 'task_master', icon: '👑', name: 'Mestre das Tarefas', description: 'Complete 10 tarefas' },
  centenarian: { id: 'centenarian', icon: '💯', name: 'Centenário', description: 'Complete 100 tarefas' },
  week_streak: { id: 'week_streak', icon: '🔥', name: 'Streak 7 Dias', description: 'Mantenha 7 dias de streak' },
  month_streak: { id: 'month_streak', icon: '💪', name: 'Streak 30 Dias', description: 'Mantenha 30 dias de streak' },
  level_10: { id: 'level_10', icon: '⭐', name: 'Nível 10', description: 'Alcance o nível 10' },
  level_25: { id: 'level_25', icon: '🌟', name: 'Nível 25', description: 'Alcance o nível 25' },
  level_50: { id: 'level_50', icon: '💫', name: 'Nível 50', description: 'Alcance o nível 50' },
  planner_pro: { id: 'planner_pro', icon: '📋', name: 'Planejador Pro', description: 'Crie 5 planners' },
  habit_master: { id: 'habit_master', icon: '🎖️', name: 'Mestre dos Hábitos', description: 'Complete 50 hábitos' },
  early_bird: { id: 'early_bird', icon: '🌅', name: 'Madrugador', description: 'Complete 10 tarefas antes das 8h' },
  night_owl: { id: 'night_owl', icon: '🦉', name: 'Noturno', description: 'Complete 10 tarefas após as 22h' },
  perfectionist: { id: 'perfectionist', icon: '💎', name: 'Perfeccionista', description: 'Complete 100 tarefas com 100% de sucesso' },
  'speed demon': { id: 'speed demon', icon: '⚡', name: 'Relâmpago', description: 'Complete 10 tarefas em 1 hora' }
}

// ============================================
// STATS TYPES
// ============================================

export interface WeeklyStats {
  day: string
  completed: number
}

export interface PriorityStats {
  priority: TaskPriority
  count: number
}

export interface CategoryStats {
  category: TaskCategory
  count: number
}

export interface UserStats {
  level: number
  xp: number
  xp_to_next: number
  xp_progress: number
  streak: number
  tasks_completed: number
  completion_rate: number
  weekly_stats: WeeklyStats[]
  priority_stats: PriorityStats[]
  category_stats: CategoryStats[]
}

// ============================================
// UI TYPES
// ============================================

export type TaskView = 'list' | 'kanban' | 'calendar'
export type ThemeMode = 'light' | 'dark' | 'system'
export type Language = 'pt' | 'en' | 'es' | 'fr' | 'de'

export interface FilterOptions {
  search?: string
  priority?: TaskPriority
  category?: TaskCategory
  status?: TaskStatus
  date?: string
}

export interface CalendarDay {
  date: string
  isToday: boolean
  isOtherMonth: boolean
  hasTasks: boolean
  taskCount: number
}

// ============================================
// SUPABASE TYPES
// ============================================

export type Database = {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<User>
      }
      planners: {
        Row: Planner
        Insert: Omit<Planner, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Planner>
      }
      tasks: {
        Row: Task
        Insert: Omit<Task, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Task>
      }
    }
  }
}

// ============================================
// UTILITY TYPES
// ============================================

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }
export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type Nullable<T> = T | null
export type MaybePromise<T> = T | Promise<T>
