/**
 * AI Assistant Component for Planner Premium ULTRA
 * Provides intelligent suggestions and insights
 */

import { useState, useEffect, useCallback } from 'react'
import { useStore } from '@/stores/useStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sparkles,
  Lightbulb,
  TrendingUp,
  Clock,
  Target,
  ChevronRight,
  RefreshCw,
  Brain,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  generateTaskSuggestions,
  generateProductivityInsights,
  generateScheduleSuggestions,
  prioritizeTasksAI,
  suggestSubtasks,
  predictCompletionProbability,
  generateMotivationalMessage,
  matchTasksToEnergy,
} from '@/lib/ai'
import type { TaskSuggestion, ProductivityInsight, ScheduleSuggestion } from '@/lib/ai'

export function AIAssistant() {
  const { user, tasks, planners } = useStore()
  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([])
  const [insights, setInsights] = useState<ProductivityInsight[]>([])
  const [scheduleSuggestions, setScheduleSuggestions] = useState<ScheduleSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'suggestions' | 'insights' | 'schedule'>('insights')
  const [motivationalMessage, setMotivationalMessage] = useState('')

  // Load AI data
  const loadAIData = useCallback(async () => {
    setLoading(true)
    try {
      const [taskSugs, prodInsights, scheduleSugs, message] = await Promise.all([
        generateTaskSuggestions(user, tasks, planners),
        generateProductivityInsights(user, tasks, planners),
        generateScheduleSuggestions(tasks),
        Promise.resolve(generateMotivationalMessage(user)),
      ])
      setSuggestions(taskSugs)
      setInsights(prodInsights)
      setScheduleSuggestions(scheduleSugs)
      setMotivationalMessage(message)
    } catch (error) {
      console.error('Error loading AI data:', error)
    } finally {
      setLoading(false)
    }
  }, [user, tasks, planners])

  useEffect(() => {
    loadAIData()
  }, [loadAIData])

  // Apply task suggestion
  const handleApplySuggestion = (suggestion: TaskSuggestion) => {
    const { addTask } = useStore.getState()
    const { setCurrentPlanner } = useStore.getState()

    // Use first planner or create default
    let planner = planners[0]
    if (!planner) {
      planner = {
        id: `planner-${Date.now()}`,
        user_id: user?.id || '',
        name: 'Minhas Tarefas',
        type: 'todo',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      useStore.getState().addPlanner(planner)
    }

    const newTask = {
      id: `task-${Date.now()}`,
      planner_id: planner?.id || '',
      user_id: user?.id || '',
      title: suggestion.title,
      description: suggestion.description,
      category: suggestion.category,
      priority: suggestion.priority,
      status: 'todo' as const,
      repeat: 'none' as const,
      context: 'anywhere' as const,
      energy: 'medium' as const,
      tags: ['IA', 'Sugestão'],
      subtasks: [],
      done: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    addTask(newTask)
    // Remove suggestion after applying
    setSuggestions((prev) => prev.filter((s) => s.title !== suggestion.title))
  }

  // Get prioritized tasks
  const prioritizedTasks = prioritizeTasksAI(tasks.filter((t) => !t.done))

  // Get energy-matched tasks
  const energyMatched = matchTasksToEnergy(tasks.filter((t) => !t.done))

  if (loading && insights.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
        <CardContent className="p-6 flex items-center justify-center h-64">
          <div className="text-center space-y-3">
            <Brain className="w-12 h-12 text-purple-600 animate-pulse mx-auto" />
            <p className="text-purple-600 font-medium">Analisando sua produtividade...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-lg">Assistente IA</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={loadAIData}
          disabled={loading}
          className="text-purple-600 hover:text-purple-700"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
        </Button>
      </div>

      {/* Motivational Message */}
      {motivationalMessage && (
        <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
          <CardContent className="p-4">
            <p className="text-center font-medium">{motivationalMessage}</p>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('insights')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            activeTab === 'insights'
              ? 'bg-purple-600 text-white'
              : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
          )}
        >
          <Lightbulb className="w-4 h-4" />
          Insights
          {insights.length > 0 && (
            <Badge variant="secondary" className="ml-1 bg-white/20 text-white">
              {insights.length}
            </Badge>
          )}
        </button>
        <button
          onClick={() => setActiveTab('suggestions')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            activeTab === 'suggestions'
              ? 'bg-purple-600 text-white'
              : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
          )}
        >
          <Sparkles className="w-4 h-4" />
          Sugestões
          {suggestions.length > 0 && (
            <Badge variant="secondary" className="ml-1 bg-white/20 text-white">
              {suggestions.length}
            </Badge>
          )}
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            activeTab === 'schedule'
              ? 'bg-purple-600 text-white'
              : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
          )}
        >
          <Clock className="w-4 h-4" />
          Agenda
        </button>
      </div>

      {/* Content */}
      {activeTab === 'insights' && (
        <div className="space-y-3">
          {insights.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Continue usando o planner para receber insights personalizados!</p>
              </CardContent>
            </Card>
          ) : (
            insights.map((insight, index) => (
              <Card
                key={index}
                className={cn(
                  'border-l-4',
                  insight.type === 'achievement' && 'border-l-green-500 bg-green-50 dark:bg-green-950/20',
                  insight.type === 'improvement' && 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20',
                  insight.type === 'pattern' && 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20',
                  insight.type === 'warning' && 'border-l-red-500 bg-red-50 dark:bg-red-950/20'
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'p-2 rounded-lg',
                        insight.type === 'achievement' && 'bg-green-500/20',
                        insight.type === 'improvement' && 'bg-blue-500/20',
                        insight.type === 'pattern' && 'bg-yellow-500/20',
                        insight.type === 'warning' && 'bg-red-500/20'
                      )}
                    >
                      {insight.type === 'achievement' && <TrendingUp className="w-5 h-5 text-green-600" />}
                      {insight.type === 'improvement' && <Target className="w-5 h-5 text-blue-600" />}
                      {insight.type === 'pattern' && <Lightbulb className="w-5 h-5 text-yellow-600" />}
                      {insight.type === 'warning' && <Zap className="w-5 h-5 text-red-600" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                      {insight.actionable && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3 text-xs"
                          onClick={() => {/* Handle action */}}
                        >
                          {insight.actionText} <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'suggestions' && (
        <div className="space-y-3">
          {suggestions.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Tudo certo por enquanto! Continue assim!</p>
              </CardContent>
            </Card>
          ) : (
            suggestions.map((suggestion, index) => {
              const priorityColors = {
                baixa: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                media: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                alta: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
                urgente: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                critica: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
              }

              return (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{suggestion.title}</h4>
                          <Badge className={priorityColors[suggestion.priority]} variant="secondary">
                            {suggestion.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{suggestion.description}</p>
                        <p className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1">
                          <Brain className="w-3 h-3" />
                          {suggestion.reason}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleApplySuggestion(suggestion)}
                        className="shrink-0"
                      >
                        <Sparkles className="w-4 h-4 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="space-y-4">
          {scheduleSuggestions.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Adicione tarefas para receber sugestões de agenda!</p>
              </CardContent>
            </Card>
          ) : (
            scheduleSuggestions.map((suggestion, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    {suggestion.timeOfDay === 'morning' && <span className="text-2xl">🌅</span>}
                    {suggestion.timeOfDay === 'afternoon' && <span className="text-2xl">☀️</span>}
                    {suggestion.timeOfDay === 'evening' && <span className="text-2xl">🌙</span>}
                    <CardTitle className="text-lg capitalize">
                      {suggestion.timeOfDay === 'morning' && 'Manhã'}
                      {suggestion.timeOfDay === 'afternoon' && 'Tarde'}
                      {suggestion.timeOfDay === 'evening' && 'Noite'}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-3">
                    {suggestion.tasks.map((task, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <ChevronRight className="w-4 h-4 text-purple-600" />
                        {task}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground italic">{suggestion.reason}</p>
                </CardContent>
              </Card>
            ))
        )}

          {/* Energy-based matching */}
          {tasks.filter((t) => !t.done).length > 0 && (
            <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="w-5 h-5 text-orange-600" />
                  Por Nível de Energia
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-orange-700 dark:text-orange-400 mb-2">
                    ⚡ Alta Energia
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {energyMatched.highEnergy.length > 0
                      ? energyMatched.highEnergy.map((t) => t.title).join(', ')
                      : 'Nenhuma tarefa de alta energia'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400 mb-2">
                    🔋 Energia Média
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {energyMatched.mediumEnergy.length > 0
                      ? energyMatched.mediumEnergy.map((t) => t.title).join(', ')
                      : 'Nenhuma tarefa de média energia'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">
                    🌙 Baixa Energia
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {energyMatched.lowEnergy.length > 0
                      ? energyMatched.lowEnergy.map((t) => t.title).join(', ')
                      : 'Nenhuma tarefa de baixa energia'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
