import { describe, it, expect } from 'vitest'
import {
  formatDate,
  getCategoryIcon,
  getPriorityColor,
  getPlannerTypeIcon,
  cn,
} from '@/lib/utils'

describe('Utils', () => {
  describe('formatDate', () => {
    it('deve formatar data no padrão brasileiro', () => {
      const date = '2026-02-06'
      expect(formatDate(date, 'dd/MM')).toBe('06/02')
    })

    it('deve formatar data completa', () => {
      const date = '2026-02-06'
      expect(formatDate(date, 'dd/MM/yyyy')).toBe('06/02/2026')
    })

    it('deve lidar com datas inválidas', () => {
      expect(formatDate('', 'dd/MM')).toBe('')
      expect(formatDate('invalid', 'dd/MM')).toBe('invalid')
    })
  })

  describe('getCategoryIcon', () => {
    it('deve retornar ícone correto para cada categoria', () => {
      expect(getCategoryIcon('trabalho')).toBe('💼')
      expect(getCategoryIcon('pessoal')).toBe('🏠')
      expect(getCategoryIcon('saude')).toBe('💪')
      expect(getCategoryIcon('estudos')).toBe('📚')
      expect(getCategoryIcon('financas')).toBe('💰')
      expect(getCategoryIcon('outro')).toBe('📌')
    })
  })

  describe('getPriorityColor', () => {
    it('deve retornar cor correta para cada prioridade', () => {
      expect(getPriorityColor('baixa')).toContain('green')
      expect(getPriorityColor('media')).toContain('yellow')
      expect(getPriorityColor('alta')).toContain('red')
      expect(getPriorityColor('urgente')).toContain('orange')
      expect(getPriorityColor('critica')).toContain('purple')
    })
  })

  describe('getPlannerTypeIcon', () => {
    it('deve retornar ícone correto para cada tipo de planner', () => {
      expect(getPlannerTypeIcon('todo')).toBe('✅')
      expect(getPlannerTypeIcon('projeto')).toBe('🏗️')
      expect(getPlannerTypeIcon('habitos')).toBe('🔥')
      expect(getPlannerTypeIcon('financeiro')).toBe('💰')
      expect(getPlannerTypeIcon('metas')).toBe('🎯')
      expect(getPlannerTypeIcon('diario')).toBe('📅')
    })
  })

  describe('cn (classnames utility)', () => {
    it('deve combinar classes corretamente', () => {
      expect(cn('foo', 'bar')).toBe('foo bar')
      expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
      expect(cn({ foo: true, bar: false })).toBe('foo')
      expect(cn('foo', { bar: true, baz: false })).toBe('foo bar')
    })

    it('deve lidar com conflitos de tailwind', () => {
      expect(cn('px-2', 'px-4')).toBe('px-4')
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    })

    it('deve retornar string vazia se nenhum argumento', () => {
      expect(cn()).toBe('')
      expect(cn('')).toBe('')
      expect(cn(false, null, undefined)).toBe('')
    })
  })
})
