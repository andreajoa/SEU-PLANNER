/**
 * React Query Hooks for Data Fetching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Planner, Task, User, PlannerFormData, TaskFormData } from '@/types'
import { generateId } from '@/lib/utils'
import { useStore } from '@/stores/useStore'
import { toast } from 'sonner'

// ============================================
// USER QUERIES
// ============================================

export function useUser() {
  const { setUser, updateUser } = useStore()

  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (!user) throw new Error('User not found')

      // Fetch user profile from database
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        // Create profile if it doesn't exist
        const newProfile: Omit<User, 'id' | 'created_at' | 'updated_at'> = {
          email: user.email!,
          name: user.user_metadata?.name || user.email!.split('@')[0],
          avatar_url: user.user_metadata?.avatar_url,
          level: 1,
          xp: 0,
          streak: 0,
          tasks_completed: 0,
          planners_created: 0,
          achievements: [],
          last_activity: new Date().toISOString()
        }

        const { data: createdProfile, error: createError } = await supabase
          .from('users')
          .insert({ id: user.id, ...newProfile })
          .select()
          .single()

        if (createError) throw createError
        setUser(createdProfile)
        return createdProfile
      }

      setUser(profile)
      return profile
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  const { updateUser } = useStore()

  return useMutation({
    mutationFn: async (updates: Partial<User>) => {
      const user = useStore.getState().user
      if (!user) throw new Error('User not found')

      const { error } = await supabase.from('users').update(updates).eq('id', user.id)

      if (error) throw error
      return updates
    },
    onMutate: updates => {
      updateUser(updates)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
      toast.success('Perfil atualizado com sucesso!')
    },
    onError: error => {
      toast.error('Erro ao atualizar perfil: ' + error.message)
    }
  })
}

// ============================================
// PLANNER QUERIES
// ============================================

export function usePlanners() {
  const user = useStore(state => state.user)
  const { setPlanners } = useStore()

  return useQuery({
    queryKey: ['planners', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('planners')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPlanners(data || [])
      return data
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5
  })
}

export function useCreatePlanner() {
  const queryClient = useQueryClient()
  const user = useStore(state => state.user)
  const { addPlanner, addXp } = useStore()

  return useMutation({
    mutationFn: async (formData: PlannerFormData) => {
      if (!user) throw new Error('User not authenticated')

      const newPlanner: Omit<Planner, 'id' | 'created_at' | 'updated_at'> = {
        user_id: user.id,
        name: formData.name,
        type: formData.type,
        description: formData.description,
        icon: formData.icon,
        color: formData.color
      }

      const { data, error } = await supabase
        .from('planners')
        .insert(newPlanner)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: planner => {
      addPlanner(planner)
      queryClient.invalidateQueries({ queryKey: ['planners'] })
      addXp(50)
      toast.success('Planner criado com sucesso! +50 XP')
    },
    onError: error => {
      toast.error('Erro ao criar planner: ' + error.message)
    }
  })
}

export function useUpdatePlanner() {
  const queryClient = useQueryClient()
  const { updatePlanner } = useStore()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Planner> }) => {
      const { error } = await supabase.from('planners').update(updates).eq('id', id)

      if (error) throw error
      return { id, updates }
    },
    onMutate: ({ id, updates }) => {
      updatePlanner(id, updates)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planners'] })
      toast.success('Planner atualizado!')
    },
    onError: error => {
      toast.error('Erro ao atualizar planner: ' + error.message)
    }
  })
}

export function useDeletePlanner() {
  const queryClient = useQueryClient()
  const { removePlanner } = useStore()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('planners').delete().eq('id', id)

      if (error) throw error
      return id
    },
    onMutate: id => {
      removePlanner(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planners'] })
      toast.success('Planner excluído!')
    },
    onError: error => {
      toast.error('Erro ao excluir planner: ' + error.message)
    }
  })
}

// ============================================
// TASK QUERIES
// ============================================

export function useTasks(plannerId?: string) {
  const user = useStore(state => state.user)
  const currentPlanner = useStore(state => state.currentPlanner)
  const { setTasks } = useStore()
  const targetPlannerId = plannerId || currentPlanner?.id

  return useQuery({
    queryKey: ['tasks', user?.id, targetPlannerId],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated')
      if (!targetPlannerId) return []

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('planner_id', targetPlannerId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTasks(data || [])
      return data
    },
    enabled: !!user && !!targetPlannerId,
    staleTime: 1000 * 60 * 2
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  const user = useStore(state => state.user)
  const currentPlanner = useStore(state => state.currentPlanner)
  const { addTask } = useStore()

  return useMutation({
    mutationFn: async (formData: TaskFormData) => {
      if (!user) throw new Error('User not authenticated')
      if (!currentPlanner) throw new Error('No planner selected')

      const newTask: Omit<Task, 'id' | 'created_at' | 'updated_at'> = {
        user_id: user.id,
        planner_id: currentPlanner.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        status: 'todo',
        date: formData.date,
        time: formData.time,
        duration: formData.duration,
        repeat: formData.repeat,
        context: formData.context,
        energy: formData.energy,
        reminder: formData.reminder,
        link: formData.link,
        tags: formData.tags,
        subtasks: formData.subtasks.map((st, index) => ({
          id: generateId(),
          text: st.text,
          done: st.done
        })),
        done: false
      }

      const { data, error } = await supabase.from('tasks').insert(newTask).select().single()

      if (error) throw error
      return data
    },
    onSuccess: task => {
      addTask(task)
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      toast.success('Tarefa criada com sucesso!')
    },
    onError: error => {
      toast.error('Erro ao criar tarefa: ' + error.message)
    }
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  const { updateTask } = useStore()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
      const { error } = await supabase.from('tasks').update(updates).eq('id', id)

      if (error) throw error
      return { id, updates }
    },
    onMutate: ({ id, updates }) => {
      updateTask(id, updates)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      toast.success('Tarefa atualizada!')
    },
    onError: error => {
      toast.error('Erro ao atualizar tarefa: ' + error.message)
    }
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  const { removeTask } = useStore()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id)

      if (error) throw error
      return id
    },
    onMutate: id => {
      removeTask(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      toast.success('Tarefa excluída!')
    },
    onError: error => {
      toast.error('Erro ao excluir tarefa: ' + error.message)
    }
  })
}

export function useToggleTask() {
  const queryClient = useQueryClient()
  const { toggleTask } = useStore()

  return useMutation({
    mutationFn: async (id: string) => {
      const tasks = useStore.getState().tasks
      const task = tasks.find(t => t.id === id)

      if (!task) throw new Error('Task not found')

      const updates = {
        done: !task.done,
        completed_at: !task.done ? new Date().toISOString() : null
      }

      const { error } = await supabase.from('tasks').update(updates).eq('id', id)

      if (error) throw error
      return { id, updates }
    },
    onMutate: ({ id }) => {
      toggleTask(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
    onError: error => {
      toast.error('Erro ao atualizar tarefa: ' + error.message)
    }
  })
}

// ============================================
// STATS QUERIES
// ============================================

export function useStats() {
  const user = useStore(state => state.user)
  const tasks = useStore(state => state.tasks)

  return useQuery({
    queryKey: ['stats', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated')

      const completedTasks = tasks.filter(t => t.done).length
      const totalTasks = tasks.length
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

      return {
        level: user.level || 1,
        xp: user.xp || 0,
        streak: user.streak || 0,
        tasks_completed: user.tasks_completed || completedTasks,
        completion_rate: completionRate
      }
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 1
  })
}
