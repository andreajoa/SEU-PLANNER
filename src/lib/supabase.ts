/**
 * Flask API Configuration (replaces Supabase)
 */

import api from './api'
import type { User } from '@/types'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

/**
 * Auth helpers for Flask API
 */
export const auth = {
  signUp: async (email: string, password: string, name: string) => {
    try {
      const response = await api.post('/auth/register', {
        email,
        password,
        username: name
      })
      return {
        data: response.data,
        error: null
      }
    } catch (error: any) {
      return {
        data: null,
        error: { message: error.response?.data?.error || error.message }
      }
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      })

      // Store tokens
      localStorage.setItem('access_token', response.data.access_token)
      localStorage.setItem('refresh_token', response.data.refresh_token)

      return {
        data: { user: response.data.user },
        error: null
      }
    } catch (error: any) {
      return {
        data: null,
        error: { message: error.response?.data?.error || error.message }
      }
    }
  },

  signOut: async () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    return { error: null }
  },

  getUser: async () => {
    try {
      const response = await api.get('/auth/me')
      return response.data.user
    } catch (error) {
      return null
    }
  }
}

// Export for backward compatibility
export const supabase = {
  auth: auth
}

/**
 * No realtime with Flask - using polling instead
 */
export const realtime = {
  // Placeholder - will implement polling in hooks
  subscribeToTasks: () => ({ unsubscribe: () => {} }),
  subscribeToPlanners: () => ({ unsubscribe: () => {} })
}

export default auth
