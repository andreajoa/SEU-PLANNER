/**
 * React Query Hooks for Data Fetching
 * Using Flask API instead of Supabase
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Planner, Task, User, PlannerFormData, TaskFormData } from '@/types'
import { toast } from 'sonner'

// ============================================
// USER QUERIES
// ============================================

export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const token = localStorage.getItem('access_token')
      if (!token) {
        return null
      }

      try {
        const response = await api.get('/user/profile')
        // API retorna o user diretamente, não {user: ...}
        return response.data.user || response.data
      } catch (error: any) {
        // Se API falhar, retorna null (demo mode)
        if (error.response?.status === 422 || error.response?.status === 401 || error.response?.status === 404) {
          console.log('API não disponível, usando demo mode')
          return null
        }
        throw error
      }
    },
    retry: false
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<User>) => {
      const response = await api.put('/user/profile', data)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data)
      toast.success('Perfil atualizado!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao atualizar perfil')
    }
  })
}

export function useUserStats() {
  return useQuery({
    queryKey: ['user', 'stats'],
    queryFn: async () => {
      const response = await api.get('/user/stats')
      return response.data.stats || response.data || {}
    }
  })
}

// ============================================
// PLANNER QUERIES
// ============================================

export function usePlanners() {
  return useQuery({
    queryKey: ['planners'],
    queryFn: async () => {
      const response = await api.get('/planners')
      return response.data.planners || response.data || []
    }
  })
}

export function usePlanner(id: string) {
  return useQuery({
    queryKey: ['planner', id],
    queryFn: async () => {
      const response = await api.get(`/planners/${id}`)
      return response.data.planner || response.data
    },
    enabled: !!id
  })
}

export function useCreatePlanner() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: PlannerFormData) => {
      const response = await api.post('/planners', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planners'] })
      toast.success('Planner criado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao criar planner')
    }
  })
}

export function useUpdatePlanner() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Planner> }) => {
      const response = await api.put(`/planners/${id}`, data)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['planners'] })
      queryClient.invalidateQueries({ queryKey: ['planner', variables.id] })
      toast.success('Planner atualizado!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao atualizar planner')
    }
  })
}

export function useDeletePlanner() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/planners/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planners'] })
      toast.success('Planner excluído!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao excluir planner')
    }
  })
}

// ============================================
// TASK QUERIES
// ============================================

export function useTasks(plannerId: string) {
  return useQuery({
    queryKey: ['tasks', plannerId],
    queryFn: async () => {
      const response = await api.get(`/tasks?planner_id=${plannerId}`)
      return response.data.tasks || response.data || []
    },
    enabled: !!plannerId
  })
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ['task', id],
    queryFn: async () => {
      const response = await api.get(`/tasks/${id}`)
      return response.data.task || response.data
    },
    enabled: !!id
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: TaskFormData) => {
      const response = await api.post('/tasks', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['user', 'stats'] })
      toast.success('Tarefa criada com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao criar tarefa')
    }
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Task> }) => {
      const response = await api.put(`/tasks/${id}`, data)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['user', 'stats'] })
      toast.success('Tarefa atualizada!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao atualizar tarefa')
    }
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/tasks/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['user', 'stats'] })
      toast.success('Tarefa excluída!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao excluir tarefa')
    }
  })
}

export function useToggleTaskComplete() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const response = await api.patch(`/tasks/${id}/toggle`, { completed })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['user', 'stats'] })
      toast.success('Tarefa atualizada!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao atualizar tarefa')
    }
  })
}

// ============================================
// SUBTASK QUERIES
// ============================================

export function useCreateSubtask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ taskId, title }: { taskId: string; title: string }) => {
      const response = await api.post(`/tasks/${taskId}/subtasks`, { title })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Subtarefa criada!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao criar subtarefa')
    }
  })
}

export function useToggleSubtask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ taskId, subtaskId }: { taskId: string; subtaskId: string }) => {
      const response = await api.patch(`/tasks/${taskId}/subtasks/${subtaskId}/toggle`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao atualizar subtarefa')
    }
  })
}

export function useDeleteSubtask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ taskId, subtaskId }: { taskId: string; subtaskId: string }) => {
      const response = await api.delete(`/tasks/${taskId}/subtasks/${subtaskId}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Subtarefa excluída!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao excluir subtarefa')
    }
  })
}

// ============================================
// ACHIEVEMENT QUERIES
// ============================================

export function useAchievements() {
  return useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const response = await api.get('/achievements')
      return response.data.achievements || response.data || []
    }
  })
}

export function useUnlockAchievement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (achievementId: string) => {
      const response = await api.post(`/achievements/${achievementId}/unlock`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] })
      queryClient.invalidateQueries({ queryKey: ['user'] })
      queryClient.invalidateQueries({ queryKey: ['user', 'stats'] })
      toast.success('Conquista desbloqueada! 🎉')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao desbloquear conquista')
    }
  })
}

export function useLeaderboard() {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const response = await api.get('/achievements/leaderboard')
      return response.data.leaderboard || response.data || []
    }
  })
}
