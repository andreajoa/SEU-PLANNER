/**
 * Dashboard Page Component
 * Main application interface with all features
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/stores/useStore'
import { auth } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Loader2,
  LogOut,
  Settings,
  Moon,
  Sun,
  Globe,
  Plus,
  Check,
  X,
  Trash2,
  Edit2,
  Calendar,
  BarChart3,
  Trophy,
  Flame,
  Star,
  Target,
  TrendingUp
} from 'lucide-react'
import { toast } from 'sonner'
import { cn, formatDate, getCategoryIcon, getPriorityColor, getPlannerTypeIcon } from '@/lib/utils'
import type { Task, Planner, TaskPriority, TaskCategory, PlannerType } from '@/types'

export default function DashboardPage() {
  const navigate = useNavigate()
  const {
    user,
    setUser,
    planners,
    setPlanners,
    currentPlanner,
    setCurrentPlanner,
    tasks,
    setTasks,
    addPlanner,
    addTask,
    updateTask,
    removeTask,
    toggleTask,
    theme,
    setTheme,
    language,
    setLanguage,
    showLevelUp,
    setShowLevelUp,
    sidebarOpen,
    setSidebarOpen
  } = useStore()

  const [activeTab, setActiveTab] = useState('planners')
  const [creatingPlanner, setCreatingPlanner] = useState(false)
  const [newPlannerType, setNewPlannerType] = useState<PlannerType>('todo')
  const [newPlannerName, setNewPlannerName] = useState('')

  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    category: 'pessoal' as TaskCategory,
    priority: 'media' as TaskPriority,
    date: '',
    time: '',
    tags: [] as string[]
  })

  const [filterSearch, setFilterSearch] = useState('')
  const [filterPriority, setFilterPriority] = useState<TaskPriority | ''>('')
  const [filterCategory, setFilterCategory] = useState<TaskCategory | ''>('')

  // Load initial data (demo mode without Supabase)
  useEffect(() => {
    if (!user) return

    // Load from localStorage for demo
    const savedPlanners = localStorage.getItem('planners')
    const savedTasks = localStorage.getItem('tasks')

    if (savedPlanners) setPlanners(JSON.parse(savedPlanners))
    if (savedTasks) setTasks(JSON.parse(savedTasks))

    // Create demo data if empty
    if (!savedPlanners) {
      const demoPlanners: Planner[] = [
        {
          id: 'demo-1',
          user_id: user.id,
          name: 'Minhas Tarefas',
          type: 'todo',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'demo-2',
          user_id: user.id,
          name: 'Projeto Freelancer',
          type: 'projeto',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'demo-3',
          user_id: user.id,
          name: 'Hábitos Diários',
          type: 'habitos',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
      setPlanners(demoPlanners)
      localStorage.setItem('planners', JSON.stringify(demoPlanners))
    }

    if (!savedTasks && planners.length > 0) {
      const demoTasks: Task[] = [
        {
          id: 'task-1',
          planner_id: planners[0]?.id || '',
          user_id: user.id,
          title: 'Completar o setup do projeto',
          description: 'Finalizar configuração do Vite + React + TypeScript',
          category: 'trabalho',
          priority: 'alta',
          status: 'todo',
          date: new Date().toISOString().split('T')[0],
          repeat: 'none',
          context: 'anywhere',
          energy: 'medium',
          tags: ['setup', 'dev'],
          subtasks: [],
          done: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'task-2',
          planner_id: planners[0]?.id || '',
          user_id: user.id,
          title: 'Estudar TypeScript avançado',
          description: 'Revisar generics e tipos avançados',
          category: 'estudos',
          priority: 'media',
          status: 'todo',
          repeat: 'daily',
          context: 'home',
          energy: 'high',
          tags: ['typescript', 'estudos'],
          subtasks: [],
          done: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'task-3',
          planner_id: planners[0]?.id || '',
          user_id: user.id,
          title: 'Fazer exercícios',
          description: '30 minutos de cardio',
          category: 'saude',
          priority: 'baixa',
          status: 'todo',
          repeat: 'daily',
          context: 'anywhere',
          energy: 'low',
          tags: ['saude', 'fitness'],
          subtasks: [],
          done: true,
          completed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
      setTasks(demoTasks)
      localStorage.setItem('tasks', JSON.stringify(demoTasks))
    }
  }, [user, planners, setPlanners, setTasks])

  // Logout
  const handleLogout = async () => {
    await auth.signOut()
    setUser(null)
    localStorage.removeItem('planners')
    localStorage.removeItem('tasks')
    navigate('/')
  }

  // Create new planner
  const handleCreatePlanner = () => {
    if (!newPlannerName.trim()) {
      toast.error('Digite um nome para o planner')
      return
    }

    const newPlanner: Planner = {
      id: `planner-${Date.now()}`,
      user_id: user?.id || '',
      name: newPlannerName,
      type: newPlannerType,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    addPlanner(newPlanner)
    localStorage.setItem('planners', JSON.stringify([...planners, newPlanner]))

    setNewPlannerName('')
    setCreatingPlanner(false)
    toast.success('Planner criado! +50 XP')
  }

  // Open planner
  const handleOpenPlanner = (planner: Planner) => {
    setCurrentPlanner(planner)
    setActiveTab('tasks')
  }

  // Delete planner
  const handleDeletePlanner = (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este planner?')) return

    const updatedPlanners = planners.filter(p => p.id !== id)
    setPlanners(updatedPlanners)
    localStorage.setItem('planners', JSON.stringify(updatedPlanners))

    const updatedTasks = tasks.filter(t => t.planner_id !== id)
    setTasks(updatedTasks)
    localStorage.setItem('tasks', JSON.stringify(updatedTasks))

    if (currentPlanner?.id === id) {
      setCurrentPlanner(null)
    }

    toast.success('Planner excluído')
  }

  // Create/Update task
  const handleSaveTask = () => {
    if (!taskFormData.title.trim()) {
      toast.error('Digite o título da tarefa')
      return
    }

    if (!currentPlanner) {
      toast.error('Selecione um planner primeiro')
      return
    }

    if (editingTask) {
      const updatedTask = {
        ...editingTask,
        ...taskFormData,
        updated_at: new Date().toISOString()
      }
      updateTask(editingTask.id, updatedTask)

      const updatedTasks = tasks.map(t => (t.id === editingTask.id ? updatedTask : t))
      setTasks(updatedTasks)
      localStorage.setItem('tasks', JSON.stringify(updatedTasks))

      toast.success('Tarefa atualizada!')
    } else {
      const newTask: Task = {
        id: `task-${Date.now()}`,
        planner_id: currentPlanner.id,
        user_id: user?.id || '',
        title: taskFormData.title,
        description: taskFormData.description,
        category: taskFormData.category,
        priority: taskFormData.priority,
        status: 'todo',
        date: taskFormData.date,
        time: taskFormData.time,
        repeat: 'none',
        context: 'anywhere',
        energy: 'medium',
        tags: taskFormData.tags,
        subtasks: [],
        done: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      addTask(newTask)
      const updatedTasks = [...tasks, newTask]
      setTasks(updatedTasks)
      localStorage.setItem('tasks', JSON.stringify(updatedTasks))

      toast.success('Tarefa criada!')
    }

    setShowTaskDialog(false)
    setEditingTask(null)
    setTaskFormData({
      title: '',
      description: '',
      category: 'pessoal',
      priority: 'media',
      date: '',
      time: '',
      tags: []
    })
  }

  // Delete task
  const handleDeleteTask = (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return

    removeTask(id)
    const updatedTasks = tasks.filter(t => t.id !== id)
    setTasks(updatedTasks)
    localStorage.setItem('tasks', JSON.stringify(updatedTasks))
    toast.success('Tarefa excluída')
  }

  // Toggle task completion
  const handleToggleTask = (id: string) => {
    toggleTask(id)
    const updatedTasks = tasks.map(t => {
      if (t.id === id) {
        const newDone = !t.done
        if (newDone && !t.done) {
          toast.success('Tarefa concluída! +10 XP')
        }
        return { ...t, done: newDone, completed_at: newDone ? new Date().toISOString() : undefined }
      }
      return t
    })
    setTasks(updatedTasks)
    localStorage.setItem('tasks', JSON.stringify(updatedTasks))
  }

  // Open task dialog
  const openTaskDialog = (task?: Task) => {
    if (task) {
      setEditingTask(task)
      setTaskFormData({
        title: task.title,
        description: task.description || '',
        category: task.category,
        priority: task.priority,
        date: task.date || '',
        time: task.time || '',
        tags: task.tags
      })
    } else {
      setEditingTask(null)
      setTaskFormData({
        title: '',
        description: '',
        category: 'pessoal',
        priority: 'media',
        date: '',
        time: '',
        tags: []
      })
    }
    setShowTaskDialog(true)
  }

  // Filter tasks
  const filteredTasks = tasks
    .filter(t => currentPlanner ? t.planner_id === currentPlanner.id : true)
    .filter(t => {
      if (filterSearch) {
        const search = filterSearch.toLowerCase()
        return (
          t.title.toLowerCase().includes(search) ||
          t.description?.toLowerCase().includes(search) ||
          t.tags.some(tag => tag.toLowerCase().includes(search))
        )
      }
      return true
    })
    .filter(t => (filterPriority ? t.priority === filterPriority : true))
    .filter(t => (filterCategory ? t.category === filterCategory : true))

  // Calculate stats
  const completedTasks = tasks.filter(t => t.done).length
  const totalTasks = tasks.length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Planner Premium ULTRA
                </h1>
                <p className="text-xs text-muted-foreground">Bem-vindo, {user?.name}!</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Stats */}
              <div className="hidden md:flex items-center gap-4 mr-4">
                <div className="flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                  <Star className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-semibold">Nível {user?.level || 1}</span>
                </div>
                <div className="flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                  <Flame className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-semibold">{user?.streak || 0} dias</span>
                </div>
              </div>

              {/* Actions */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </Button>

              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto">
            <TabsTrigger value="planners" className="gap-2">
              <Target className="w-4 h-4" />
              Planners
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2" disabled={!currentPlanner}>
              <Check className="w-4 h-4" />
              Tarefas
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="w-4 h-4" />
              Calendário
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Stats
            </TabsTrigger>
            <TabsTrigger value="achievements" className="gap-2">
              <Trophy className="w-4 h-4" />
              Conquistas
            </TabsTrigger>
          </TabsList>

          {/* Planners Tab */}
          <TabsContent value="planners" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Meus Planners</h2>
              <Button onClick={() => setCreatingPlanner(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Planner
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {planners.map(planner => (
                <Card
                  key={planner.id}
                  className="cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => handleOpenPlanner(planner)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">{getPlannerTypeIcon(planner.type)}</div>
                        <div>
                          <CardTitle className="text-lg">{planner.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{planner.type}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={e => {
                          e.stopPropagation()
                          handleDeletePlanner(planner.id)
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      {tasks.filter(t => t.planner_id === planner.id).length} tarefas
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {planners.length === 0 && (
              <Card className="p-12 text-center">
                <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Nenhum planner ainda</h3>
                <p className="text-muted-foreground mb-4">Crie seu primeiro planner para começar!</p>
                <Button onClick={() => setCreatingPlanner(true)}>Criar Planner</Button>
              </Card>
            )}
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            {currentPlanner ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{currentPlanner.name}</h2>
                    <p className="text-muted-foreground">{filteredTasks.length} tarefas</p>
                  </div>
                  <Button onClick={() => openTaskDialog()} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Nova Tarefa
                  </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4">
                  <Input
                    placeholder="Buscar tarefas..."
                    value={filterSearch}
                    onChange={e => setFilterSearch(e.target.value)}
                    className="max-w-xs"
                  />
                  <Select value={filterPriority} onValueChange={v => setFilterPriority(v as TaskPriority | '')}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas</SelectItem>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                      <SelectItem value="critica">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterCategory} onValueChange={v => setFilterCategory(v as TaskCategory | '')}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas</SelectItem>
                      <SelectItem value="trabalho">Trabalho</SelectItem>
                      <SelectItem value="pessoal">Pessoal</SelectItem>
                      <SelectItem value="saude">Saúde</SelectItem>
                      <SelectItem value="estudos">Estudos</SelectItem>
                      <SelectItem value="financas">Finanças</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Task List */}
                <div className="space-y-3">
                  {filteredTasks.map(task => (
                    <Card key={task.id} className={cn('transition-all', task.done && 'opacity-60')}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => handleToggleTask(task.id)}
                            className={cn(
                              'w-6 h-6 rounded border-2 flex items-center justify-center transition-all mt-0.5',
                              task.done
                                ? 'bg-success border-success text-white'
                                : 'border-muted-foreground/30 hover:border-primary'
                            )}
                          >
                            {task.done && <Check className="w-4 h-4" />}
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h3 className={cn('font-semibold', task.done && 'line-through')}>
                                  {task.title}
                                </h3>
                                {task.description && (
                                  <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openTaskDialog(task)}
                                  className="h-8 w-8"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="h-8 w-8"
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <span className={cn('text-xs px-2 py-1 rounded-full', getPriorityColor(task.priority))}>
                                {task.priority}
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                {getCategoryIcon(task.category)} {task.category}
                              </span>
                              {task.date && (
                                <span className="text-xs text-muted-foreground">
                                  📅 {formatDate(task.date, 'dd/MM')}
                                </span>
                              )}
                              {task.tags.map(tag => (
                                <span
                                  key={tag}
                                  className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredTasks.length === 0 && (
                  <Card className="p-12 text-center">
                    <Check className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">Nenhuma tarefa</h3>
                    <p className="text-muted-foreground mb-4">Crie sua primeira tarefa!</p>
                    <Button onClick={() => openTaskDialog()}>Criar Tarefa</Button>
                  </Card>
                )}
              </>
            ) : (
              <Card className="p-12 text-center">
                <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Selecione um planner</h3>
                <p className="text-muted-foreground">Escolha um planner na aba Planners para ver as tarefas</p>
              </Card>
            )}
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar">
            <Card className="p-12 text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Calendário</h3>
              <p className="text-muted-foreground">Visualização de calendário em desenvolvimento</p>
            </Card>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats">
            <h2 className="text-2xl font-bold mb-6">Estatísticas</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <Star className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <div className="text-3xl font-bold">{user?.level || 1}</div>
                  <p className="text-sm text-muted-foreground">Nível</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Flame className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                  <div className="text-3xl font-bold">{user?.streak || 0}</div>
                  <p className="text-sm text-muted-foreground">Dias de Streak</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Check className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <div className="text-3xl font-bold">{completedTasks}</div>
                  <p className="text-sm text-muted-foreground">Tarefas Concluídas</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-3xl font-bold">{completionRate}%</div>
                  <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
                </CardContent>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Progresso de Nível</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>XP: {user?.xp || 0}</span>
                  <span>Próximo nível: {(user?.level || 1) * 100}</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all"
                    style={{ width: `${((user?.xp || 0) % 100)}%` }}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <h2 className="text-2xl font-bold mb-6">Conquistas</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: '🎯', name: 'Primeira Tarefa', desc: 'Complete 1 tarefa', unlocked: completedTasks >= 1 },
                { icon: '👑', name: 'Mestre das Tarefas', desc: 'Complete 10 tarefas', unlocked: completedTasks >= 10 },
                { icon: '💯', name: 'Centenário', desc: 'Complete 100 tarefas', unlocked: completedTasks >= 100 },
                { icon: '🔥', name: 'Streak 7 Dias', desc: 'Mantenha 7 dias de streak', unlocked: (user?.streak || 0) >= 7 },
                { icon: '💪', name: 'Streak 30 Dias', desc: 'Mantenha 30 dias de streak', unlocked: (user?.streak || 0) >= 30 },
                { icon: '⭐', name: 'Nível 10', desc: 'Alcance o nível 10', unlocked: (user?.level || 1) >= 10 }
              ].map((achievement, index) => (
                <Card
                  key={index}
                  className={cn(
                    'transition-all',
                    achievement.unlocked
                      ? 'border-success bg-success/5'
                      : 'opacity-50 grayscale'
                  )}
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-5xl mb-3">{achievement.icon}</div>
                    <h3 className="font-semibold mb-1">{achievement.name}</h3>
                    <p className="text-sm text-muted-foreground">{achievement.desc}</p>
                    {achievement.unlocked && (
                      <div className="mt-3 text-xs text-success font-semibold">✓ Desbloqueado</div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Create Planner Dialog */}
      <Dialog open={creatingPlanner} onOpenChange={setCreatingPlanner}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Planner</DialogTitle>
            <DialogDescription>Escolha um tipo e dê um nome ao seu planner</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select value={newPlannerType} onValueChange={v => setNewPlannerType(v as PlannerType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">✅ To-Do List</SelectItem>
                  <SelectItem value="projeto">🏗️ Projeto</SelectItem>
                  <SelectItem value="habitos">🔥 Hábitos</SelectItem>
                  <SelectItem value="financeiro">💰 Financeiro</SelectItem>
                  <SelectItem value="metas">🎯 Metas</SelectItem>
                  <SelectItem value="diario">📅 Diário</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <Input
                placeholder="Ex: Minhas Tarefas"
                value={newPlannerName}
                onChange={e => setNewPlannerName(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreatingPlanner(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreatePlanner}>Criar Planner</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
            <DialogDescription>
              {editingTask ? 'Edite os detalhes da tarefa' : 'Crie uma nova tarefa'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Título *</label>
              <Input
                placeholder="Ex: Completar relatório"
                value={taskFormData.title}
                onChange={e => setTaskFormData({ ...taskFormData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição</label>
              <Textarea
                placeholder="Adicione detalhes..."
                value={taskFormData.description}
                onChange={e => setTaskFormData({ ...taskFormData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Categoria</label>
                <Select
                  value={taskFormData.category}
                  onValueChange={v => setTaskFormData({ ...taskFormData, category: v as TaskCategory })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trabalho">💼 Trabalho</SelectItem>
                    <SelectItem value="pessoal">🏠 Pessoal</SelectItem>
                    <SelectItem value="saude">💪 Saúde</SelectItem>
                    <SelectItem value="estudos">📚 Estudos</SelectItem>
                    <SelectItem value="financas">💰 Finanças</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Prioridade</label>
                <Select
                  value={taskFormData.priority}
                  onValueChange={v => setTaskFormData({ ...taskFormData, priority: v as TaskPriority })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">🟢 Baixa</SelectItem>
                    <SelectItem value="media">🟡 Média</SelectItem>
                    <SelectItem value="alta">🔴 Alta</SelectItem>
                    <SelectItem value="urgente">🔥 Urgente</SelectItem>
                    <SelectItem value="critica">⚡ Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Data</label>
                <Input
                  type="date"
                  value={taskFormData.date}
                  onChange={e => setTaskFormData({ ...taskFormData, date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Hora</label>
                <Input
                  type="time"
                  value={taskFormData.time}
                  onChange={e => setTaskFormData({ ...taskFormData, time: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTaskDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveTask}>
              {editingTask ? 'Salvar' : 'Criar'} Tarefa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Level Up Dialog */}
      <Dialog open={showLevelUp} onOpenChange={setShowLevelUp}>
        <DialogContent className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <DialogTitle className="text-3xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Level Up!
          </DialogTitle>
          <p className="text-5xl font-bold text-purple-600 my-4">Nível {user?.level || 1}</p>
          <Button onClick={() => setShowLevelUp(false)} className="w-full">
            Continuar
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
