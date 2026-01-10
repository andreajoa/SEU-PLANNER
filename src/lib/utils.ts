/**
 * Utility Functions
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO, isToday, isSameMonth, differenceInDays, startOfDay } from 'date-fns'
import { ptBR, enUS, es, fr, de } from 'date-fns/locale'
import type { TaskPriority, TaskCategory, Task } from '@/types'

/**
 * Merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format date based on locale
 */
export function formatDate(date: string | Date, formatStr: string = 'PPP', locale: string = 'pt') {
  const locales = { pt: ptBR, en: enUS, es: es, fr: fr, de: de }
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, formatStr, { locale: locales[locale as keyof typeof locales] || ptBR })
}

/**
 * Get category icon
 */
export function getCategoryIcon(category: TaskCategory): string {
  const icons: Record<TaskCategory, string> = {
    trabalho: '💼',
    pessoal: '🏠',
    saude: '💪',
    estudos: '📚',
    financas: '💰',
    outro: '📦'
  }
  return icons[category] || '📦'
}

/**
 * Get priority color
 */
export function getPriorityColor(priority: TaskPriority): string {
  const colors: Record<TaskPriority, string> = {
    baixa: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    media: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    alta: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    urgente: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    critica: 'bg-red-600 text-white dark:bg-red-500'
  }
  return colors[priority] || colors.media
}

/**
 * Calculate XP progress
 */
export function calculateXPProgress(xp: number, level: number): number {
  const xpForCurrentLevel = (level - 1) * 100
  const xpInCurrentLevel = xp - xpForCurrentLevel
  const xpNeededForNextLevel = level * 100 - xpForCurrentLevel
  return Math.min(100, Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100))
}

/**
 * Calculate level from XP
 */
export function calculateLevel(xp: number): number {
  return Math.floor(xp / 100) + 1
}

/**
 * Calculate streak
 */
export function calculateStreak(lastActivity: string | null): number {
  if (!lastActivity) return 0

  const last = parseISO(lastActivity)
  const today = startOfDay(new Date())
  const daysDiff = differenceInDays(today, startOfDay(last))

  if (daysDiff === 0) return 1 // Same day
  if (daysDiff === 1) return 1 // Yesterday
  if (daysDiff > 1) return 0 // Streak broken

  return daysDiff + 1
}

/**
 * Get planner type icon
 */
export function getPlannerTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    todo: '✅',
    projeto: '🏗️',
    habitos: '🔥',
    financeiro: '💰',
    metas: '🎯',
    diario: '📅'
  }
  return icons[type] || '📋'
}

/**
 * Get planner type color
 */
export function getPlannerTypeColor(type: string): string {
  const colors: Record<string, string> = {
    todo: 'border-green-500 bg-green-50 dark:bg-green-950/30',
    projeto: 'border-blue-500 bg-blue-50 dark:bg-blue-950/30',
    habitos: 'border-orange-500 bg-orange-50 dark:bg-orange-950/30',
    financeiro: 'border-purple-500 bg-purple-50 dark:bg-purple-950/30',
    metas: 'border-pink-500 bg-pink-50 dark:bg-pink-950/30',
    diario: 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
  }
  return colors[type] || 'border-gray-500 bg-gray-50 dark:bg-gray-950/30'
}

/**
 * Sort tasks by priority
 */
export function sortTasksByPriority(tasks: Task[]): Task[] {
  const priorityOrder: Record<TaskPriority, number> = {
    critica: 0,
    urgente: 1,
    alta: 2,
    media: 3,
    baixa: 4
  }

  return [...tasks].sort((a, b) => {
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })
}

/**
 * Filter tasks
 */
export function filterTasks(tasks: Task[], filters: {
  search?: string
  priority?: TaskPriority
  category?: TaskCategory
  status?: string
}): Task[] {
  return tasks.filter(task => {
    if (filters.search) {
      const search = filters.search.toLowerCase()
      const matchTitle = task.title.toLowerCase().includes(search)
      const matchDesc = task.description?.toLowerCase().includes(search)
      const matchTags = task.tags.some(tag => tag.toLowerCase().includes(search))
      if (!matchTitle && !matchDesc && !matchTags) return false
    }

    if (filters.priority && task.priority !== filters.priority) return false
    if (filters.category && task.category !== filters.category) return false
    if (filters.status === 'done' && !task.done) return false
    if (filters.status === 'todo' && task.done) return false

    return true
  })
}

/**
 * Export tasks to CSV
 */
export function exportTasksToCSV(tasks: Task[]): void {
  const headers = ['Título', 'Descrição', 'Categoria', 'Prioridade', 'Concluída', 'Data']
  const rows = tasks.map(task => [
    task.title,
    task.description || '',
    task.category,
    task.priority,
    task.done ? 'Sim' : 'Não',
    task.date || ''
  ])

  const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `tarefas-${format(new Date(), 'yyyy-MM-dd')}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Generate ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Sleep function
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Format number with suffix
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

/**
 * Truncate text
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.substr(0, length) + '...'
}

/**
 * Copy to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
