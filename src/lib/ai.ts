/**
 * AI Service for Planner Premium ULTRA
 * Provides intelligent recommendations and insights
 */

import type { Task, Planner, User } from '@/types'

// ============================================
// TYPES
// ============================================

export interface TaskSuggestion {
  title: string
  description: string
  priority: Task['priority']
  category: Task['category']
  duration: number
  reason: string
}

export interface ProductivityInsight {
  type: 'achievement' | 'improvement' | 'pattern' | 'warning'
  title: string
  description: string
  actionable: boolean
  actionText?: string
}

export interface ScheduleSuggestion {
  timeOfDay: 'morning' | 'afternoon' | 'evening'
  tasks: string[]
  reason: string
}

// ============================================
// AI CONFIGURATION
// ============================================

const AI_CONFIG = {
  openai: {
    model: 'gpt-4o-mini',
    maxTokens: 500,
  },
  local: {
    enabled: true, // Use local algorithms even without API
  },
}

// ============================================
// TASK SUGGESTIONS (LOCAL AI)
// ============================================

/**
 * Generate smart task suggestions based on user behavior
 */
export async function generateTaskSuggestions(
  user: User | null,
  tasks: Task[],
  planners: Planner[]
): Promise<TaskSuggestion[]> {
  const suggestions: TaskSuggestion[] = []

  if (!user) return suggestions

  // Analyze completion patterns
  const completedTasks = tasks.filter((t) => t.done)
  const pendingTasks = tasks.filter((t) => !t.done)

  // Category analysis
  const categoryCount = tasks.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Priority distribution
  const priorityCount = tasks.reduce((acc, t) => {
    acc[t.priority] = (acc[t.priority] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Suggestion 1: If user has many high-priority tasks, suggest breaking them down
  if (priorityCount.urgente > 3 || priorityCount.critica > 2) {
    suggestions.push({
      title: 'Dividir tarefas urgentes',
      description: 'Você tem muitas tarefas urgentes. Considere dividir em subtarefas menores.',
      priority: 'alta',
      category: 'pessoal',
      duration: 15,
      reason: 'Mestrar tarefas grandes aumenta a probabilidade de conclusão',
    })
  }

  // Suggestion 2: Suggest based on least worked category
  const leastWorkedCategory = Object.entries(categoryCount).sort((a, b) => a[1] - b[1])[0]?.[0] as Task['category']
  if (leastWorkedCategory) {
    const categoryNames: Record<string, string> = {
      trabalho: 'no trabalho',
      pessoal: 'na vida pessoal',
      saude: 'com a saúde',
      estudos: 'nos estudos',
      financas: 'com as finanças',
      outro: 'em outras áreas',
    }

    suggestions.push({
      title: `Focar mais ${categoryNames[leastWorkedCategory]}`,
      description: `Você tem poucas tarefas na categoria ${leastWorkedCategory}.`,
      priority: 'media',
      category: leastWorkedCategory,
      duration: 30,
      reason: 'Equilíbrio entre categorias melhora o bem-estar geral',
    })
  }

  // Suggestion 3: Based on completion rate
  const completionRate = tasks.length > 0 ? completedTasks.length / tasks.length : 0
  if (completionRate < 0.5 && tasks.length >= 5) {
    suggestions.push({
      title: 'Revisar estimativas de tempo',
      description: 'Sua taxa de conclusão está abaixo de 50%. Talvez esteja superestimando sua capacidade.',
      priority: 'alta',
      category: 'pessoal',
      duration: 20,
      reason: 'Estimativas realistas aumentam a confiança no planejamento',
    })
  }

  // Suggestion 4: Streak-based suggestion
  if (user.streak >= 7 && user.streak < 14) {
    suggestions.push({
      title: 'Manter o streak vivo!',
      description: `Você está em um streak de ${user.streak} dias. Continue assim!`,
      priority: 'media',
      category: 'pessoal',
      duration: 10,
      reason: 'Streaks longos criam hábitos duradouros',
    })
  }

  // Suggestion 5: Time-based suggestions
  const hour = new Date().getHours()
  if (hour < 12) {
    suggestions.push({
      title: 'Aproveitar a manhã',
      description: 'Sua produtividade tende a maior pela manhã. Faça as tarefas mais difíceis agora.',
      priority: 'alta',
      category: 'trabalho',
      duration: 60,
      reason: 'A maioria das pessoas é mais produtiva no período da manhã',
    })
  }

  return suggestions.slice(0, 5) // Limit to 5 suggestions
}

// ============================================
// PRODUCTIVITY INSIGHTS (LOCAL AI)
// ============================================

/**
 * Generate AI-powered productivity insights
 */
export async function generateProductivityInsights(
  user: User | null,
  tasks: Task[],
  planners: Planner[]
): Promise<ProductivityInsight[]> {
  const insights: ProductivityInsight[] = []

  if (!user) return insights

  const completedTasks = tasks.filter((t) => t.done)
  const pendingTasks = tasks.filter((t) => !t.done)
  const totalTasks = tasks.length

  // Insight 1: Completion rate
  const completionRate = totalTasks > 0 ? completedTasks.length / totalTasks : 0
  if (completionRate >= 0.8) {
    insights.push({
      type: 'achievement',
      title: 'Excelente taxa de conclusão!',
      description: `Você completou ${Math.round(completionRate * 100)}% das tarefas.`,
      actionable: false,
    })
  } else if (completionRate < 0.4 && totalTasks >= 5) {
    insights.push({
      type: 'improvement',
      title: 'Taxa de conclusão pode melhorar',
      description: `${Math.round(completionRate * 100)}% das tarefas foram concluídas. Tente definir menos tarefas por dia.`,
      actionable: true,
      actionText: 'Ajustar metas diárias',
    })
  }

  // Insight 2: Priority balance
  const highPriorityPending = pendingTasks.filter((t) => t.priority === 'urgente' || t.priority === 'critica')
  if (highPriorityPending.length > 3) {
    insights.push({
      type: 'warning',
      title: 'Muitas tarefas urgentes pendentes',
      description: `Você tem ${highPriorityPending.length} tarefas de alta prioridade sem concluir.`,
      actionable: true,
      actionText: 'Revisar prioridades',
    })
  }

  // Insight 3: Category balance
  const categories = Object.keys(tasks.reduce((acc, t) => ({ ...acc, [t.category]: true }), {} as Record<string, boolean>))
  if (categories.length === 1) {
    insights.push({
      type: 'pattern',
      title: 'Diversifique seus focos',
      description: `Todas suas tarefas são na categoria ${tasks[0]?.category}. Tente variar.`,
      actionable: true,
      actionText: 'Adicionar tarefa de outra categoria',
    })
  }

  // Insight 4: Streak achievement
  if (user.streak >= 7) {
    insights.push({
      type: 'achievement',
      title: `${user.streak} dias de streak! 🔥`,
      description: user.streak >= 30
        ? 'Você é consistente! Continue assim.'
        : 'Você está construindo um hábito sólido.',
      actionable: false,
    })
  }

  // Insight 5: Level up
  if (user.xp >= 80 && user.xp < 100) {
    insights.push({
      type: 'achievement',
      title: 'Quase no próximo nível!',
      description: `Faltam apenas ${100 - user.xp} XP para o nível ${user.level + 1}.`,
      actionable: true,
      actionText: 'Ver tarefas pendentes',
    })
  }

  return insights
}

// ============================================
// SMART SCHEDULING (LOCAL AI)
// ============================================

/**
 * Generate smart schedule suggestions
 */
export async function generateScheduleSuggestions(
  tasks: Task[],
  userPreferences: { morningPerson?: boolean; peakHours?: number[] } = {}
): Promise<ScheduleSuggestion[]> {
  const suggestions: ScheduleSuggestion[] = []

  // Group pending tasks by priority
  const highPriorityTasks = tasks.filter((t) => !t.done && (t.priority === 'urgente' || t.priority === 'critica'))
  const mediumPriorityTasks = tasks.filter((t) => !t.done && t.priority === 'media')
  const lowPriorityTasks = tasks.filter((t) => !t.done && (t.priority === 'baixa'))

  // Morning suggestion
  if (userPreferences.morningPerson !== false) {
    suggestions.push({
      timeOfDay: 'morning',
      tasks: highPriorityTasks.slice(0, 3).map((t) => t.title),
      reason: 'A energia mental está no pico pela manhã. Foque nas tarefas mais difíceis.',
    })
  }

  // Afternoon suggestion
  if (mediumPriorityTasks.length > 0) {
    suggestions.push({
      timeOfDay: 'afternoon',
      tasks: mediumPriorityTasks.slice(0, 4).map((t) => t.title),
      reason: 'Tarde é um bom momento para tarefas de complexidade média.',
    })
  }

  // Evening suggestion
  if (lowPriorityTasks.length > 0) {
    suggestions.push({
      timeOfDay: 'evening',
      tasks: lowPriorityTasks.slice(0, 5).map((t) => t.title),
      reason: 'Noite é ideal para tarefas leves e organização do próximo dia.',
    })
  }

  return suggestions
}

// ============================================
// TASK PRIORITIZATION (AI)
// ============================================

/**
 * AI-powered task prioritization using Eisenhower Matrix logic
 */
export function prioritizeTasksAI(tasks: Task[]): Task[] {
  return tasks.sort((a, b) => {
    // Priority score calculation
    const priorityScore = (task: Task) => {
      let score = 0

      // Base priority
      const priorityWeights = { critica: 5, urgente: 4, alta: 3, media: 2, baixa: 1 }
      score += priorityWeights[task.priority] || 2

      // Boost for overdue tasks
      if (task.date && new Date(task.date) < new Date() && !task.done) {
        score += 3
      }

      // Boost for tasks with due dates
      if (task.date) {
        const daysUntilDue = Math.ceil((new Date(task.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        if (daysUntilDue <= 1) score += 2
        else if (daysUntilDue <= 3) score += 1
      }

      // Boost for quick wins (estimated time <= 30min)
      if (task.duration && task.duration <= 30) {
        score += 1
      }

      return score
    }

    return priorityScore(b) - priorityScore(a)
  })
}

// ============================================
// SMART TASK BREAKDOWN
// ============================================

/**
 * Suggest subtasks for a complex task
 */
export function suggestSubtasks(taskTitle: string): string[] {
  const suggestions: string[] = []

  // Common patterns
  const patterns = [
    {
      trigger: ['criar', 'fazer', 'desenvolver', 'construir'],
      subtasks: ['Pesquisa e planejamento', 'Execução principal', 'Revisão e refinamento'],
    },
    {
      trigger: ['aprender', 'estudar', 'curso'],
      subtasks: ['Assistir às aulas', 'Fazer exercícios', 'Revisar o conteúdo'],
    },
    {
      trigger: ['reunião', 'apresentação', 'call'],
      subtasks: ['Preparar material', 'Participar', 'Enviar follow-up'],
    },
    {
      trigger: ['comprar', 'compras', 'mercado'],
      subtasks: ['Fazer lista', 'Comparar preços', 'Comprar'],
    },
  ]

  const lowerTitle = taskTitle.toLowerCase()
  for (const pattern of patterns) {
    if (pattern.trigger.some((t) => lowerTitle.includes(t))) {
      return pattern.subtasks
    }
  }

  // Generic breakdown
  return [
    'Definir objetivos específicos',
    'Identificar recursos necessários',
    'Executar tarefa principal',
    'Revisar e finalizar',
  ]
}

// ============================================
// ENERGY-BASED SCHEDULING
// ============================================

/**
 * Match tasks to energy levels
 */
export function matchTasksToEnergy(tasks: Task[]): {
  highEnergy: Task[]
  mediumEnergy: Task[]
  lowEnergy: Task[]
} {
  return {
    highEnergy: tasks.filter((t) => t.energy === 'high' || t.priority === 'critica' || t.priority === 'urgente'),
    mediumEnergy: tasks.filter(
      (t) => t.energy === 'medium' || (t.priority === 'alta' && t.energy !== 'high')
    ),
    lowEnergy: tasks.filter((t) => t.energy === 'low' || t.category === 'pessoal'),
  }
}

// ============================================
// OPENAI INTEGRATION (OPTIONAL)
// ============================================

/**
 * Generate AI suggestions using OpenAI API
 * Falls back to local AI if no API key
 */
export async function generateAISuggestionsWithOpenAI(
  prompt: string,
  apiKey?: string
): Promise<string[]> {
  if (!apiKey) {
    // Fallback to local suggestions
    return []
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: AI_CONFIG.openai.model,
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente de produtividade especializado em planejamento e gerenciamento de tarefas.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: AI_CONFIG.openai.maxTokens,
        temperature: 0.7,
      }),
    })

    const data = await response.json()
    const content = data.choices[0]?.message?.content || ''

    // Parse response into array of suggestions
    return content
      .split('\n')
      .filter((line: string) => line.trim().length > 0)
      .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
      .slice(0, 5)
  } catch (error) {
    console.error('OpenAI API error:', error)
    return []
  }
}

// ============================================
// PREDICTIVE ANALYTICS
// ============================================

/**
 * Predict task completion probability
 */
export function predictCompletionProbability(task: Task, user: User | null): number {
  if (!user) return 0.5

  let probability = 0.5

  // Base probability on user's completion rate
  const userCompletionRate = user.tasks_completed > 0
    ? (user.tasks_completed / (user.tasks_completed + (user.level * 10)))
    : 0.5
  probability = userCompletionRate

  // Adjust based on task priority
  const priorityBonus = { critica: 0.1, urgente: 0.05, alta: 0.03, media: 0, baixa: -0.05 }
  probability += priorityBonus[task.priority] || 0

  // Adjust based on estimated time
  if (task.duration) {
    if (task.duration <= 30) probability += 0.1
    else if (task.duration <= 60) probability += 0.05
    else if (task.duration > 120) probability -= 0.1
  }

  // Adjust based on category (user's strengths)
  // This would need historical data per category

  // Adjust based on due date
  if (task.date) {
    const daysUntilDue = Math.ceil((new Date(task.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (daysUntilDue < 0) probability -= 0.2
    else if (daysUntilDue <= 1) probability += 0.1
    else if (daysUntilDue > 7) probability -= 0.05
  }

  return Math.max(0, Math.min(1, probability))
}

// ============================================
// MOTIVATIONAL MESSAGES (AI)
// ============================================

/**
 * Generate personalized motivational message
 */
export function generateMotivationalMessage(user: User | null): string {
  if (!user) return 'Comece sua jornada de produtividade hoje!'

  const messages = {
    low_streak: [
      'Todo começo é um começo. Comece hoje!',
      'A consistência é a chave. Tente novamente!',
      'Pequenos passos levam a grandes resultados.',
    ],
    medium_streak: [
      `Você está no caminho certo! ${user.streak} dias de streak.`,
      'Continue assim! Você está construindo um hábito sólido.',
      'A cada dia, você fica mais forte.',
    ],
    high_streak: [
      `Incrível! ${user.streak} dias de consistência! 🔥`,
      'Você é uma máquina de produtividade!',
      'Sua dedicação é inspiradora!',
    ],
    level_up: [
      `Parabéns pelo nível ${user.level}! Continue evoluindo!`,
      'Você está desbloqueando novos patamares!',
      'Cada nível é uma nova conquista!',
    ],
  }

  if (user.streak >= 30) return messages.high_streak[Math.floor(Math.random() * messages.high_streak.length)]
  if (user.streak >= 7) return messages.medium_streak[Math.floor(Math.random() * messages.medium_streak.length)]
  if (user.xp >= 90) return messages.level_up[Math.floor(Math.random() * messages.level_up.length)]

  return messages.low_streak[Math.floor(Math.random() * messages.low_streak.length)]
}
