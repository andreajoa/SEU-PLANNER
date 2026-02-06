import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useStore } from '@/stores/useStore'
import type { User, Planner, Task } from '@/types'

describe('useStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useStore.getState().reset()
  })

  afterEach(() => {
    useStore.getState().reset()
  })

  it('deve inicializar com estado padrão', () => {
    const { result } = renderHook(() => useStore())

    expect(result.current.user).toBeNull()
    expect(result.current.planners).toEqual([])
    expect(result.current.tasks).toEqual([])
    expect(result.current.theme).toBe('system')
    expect(result.current.language).toBe('pt')
  })

  it('deve setar usuário corretamente', () => {
    const { result } = renderHook(() => useStore())

    const mockUser: User = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      avatar_url: '',
      level: 1,
      xp: 0,
      streak: 0,
      tasks_completed: 0,
      planners_created: 0,
      achievements: [],
      last_activity: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    act(() => {
      result.current.setUser(mockUser)
    })

    expect(result.current.user).toEqual(mockUser)
  })

  it('deve adicionar planner corretamente', () => {
    const { result } = renderHook(() => useStore())

    const mockPlanner: Planner = {
      id: 'planner-1',
      user_id: '123',
      name: 'Meu Planner',
      type: 'todo',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    act(() => {
      result.current.addPlanner(mockPlanner)
    })

    expect(result.current.planners).toHaveLength(1)
    expect(result.current.planners[0]).toEqual(mockPlanner)
  })

  it('deve adicionar tarefa corretamente', () => {
    const { result } = renderHook(() => useStore())

    const mockTask: Task = {
      id: 'task-1',
      planner_id: 'planner-1',
      user_id: '123',
      title: 'Minha Tarefa',
      category: 'pessoal',
      priority: 'media',
      status: 'todo',
      repeat: 'none',
      context: 'anywhere',
      energy: 'medium',
      tags: [],
      subtasks: [],
      done: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    act(() => {
      result.current.addTask(mockTask)
    })

    expect(result.current.tasks).toHaveLength(1)
    expect(result.current.tasks[0]).toEqual(mockTask)
  })

  it('deve alternar status da tarefa e conceder XP', () => {
    const { result } = renderHook(() => useStore())

    const mockUser: User = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      level: 1,
      xp: 0,
      streak: 0,
      tasks_completed: 0,
      planners_created: 0,
      achievements: [],
      last_activity: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const mockTask: Task = {
      id: 'task-1',
      planner_id: 'planner-1',
      user_id: '123',
      title: 'Minha Tarefa',
      category: 'pessoal',
      priority: 'media',
      status: 'todo',
      repeat: 'none',
      context: 'anywhere',
      energy: 'medium',
      tags: [],
      subtasks: [],
      done: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    act(() => {
      result.current.setUser(mockUser)
      result.current.addTask(mockTask)
    })

    const initialXP = result.current.user?.xp || 0

    act(() => {
      result.current.toggleTask('task-1')
    })

    // Deve conceder 10 XP por completar tarefa
    expect(result.current.user?.xp).toBe(initialXP + 10)
    expect(result.current.tasks[0].done).toBe(true)
  })

  it('deve atualizar tema', () => {
    const { result } = renderHook(() => useStore())

    act(() => {
      result.current.setTheme('dark')
    })

    expect(result.current.theme).toBe('dark')
  })

  it('deve adicionar XP ao usuário', () => {
    const { result } = renderHook(() => useStore())

    const mockUser: User = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      level: 1,
      xp: 50,
      streak: 0,
      tasks_completed: 0,
      planners_created: 0,
      achievements: [],
      last_activity: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    act(() => {
      result.current.setUser(mockUser)
    })

    act(() => {
      result.current.addXp(50)
    })

    // 50 XP inicial + 50 adicionais = 100 XP = nível 2
    expect(result.current.user?.xp).toBe(100)
    expect(result.current.user?.level).toBe(2)
  })
})
