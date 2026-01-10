/**
 * Main App Component
 * Complete Planner Premium ULTRA Application
 */

import { useState, useEffect, Suspense, lazy } from 'react'
import { useStore } from './stores/useStore'
import { useUser } from './lib/queries'
import { supabase, auth } from './lib/supabase'
import { Loader2 } from 'lucide-react'
import { cn } from './lib/utils'

// Lazy load pages for better performance
const AuthPage = lazy(() => import('./components/auth/AuthPage'))
const DashboardPage = lazy(() => import('./components/layout/DashboardPage'))

function App() {
  const { user, setUser, theme, setLanguage } = useStore()
  const { data: userData, isLoading, error } = useUser()
  const [mounted, setMounted] = useState(false)

  // Handle auth state changes
  useEffect(() => {
    setMounted(true)

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // User will be loaded by useUser query
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [setUser])

  // Initialize theme
  useEffect(() => {
    if (!mounted) return

    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme, mounted])

  // Initialize language from localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem('planner-language') || 'pt'
    setLanguage(savedLang as any)
  }, [setLanguage])

  // Show loading state
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-600 to-purple-800">
        <div className="text-center text-white">
          <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4" />
          <p className="text-xl font-semibold">Carregando...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md p-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Erro ao Carregar</h1>
          <p className="text-muted-foreground mb-4">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Recarregar
          </button>
        </div>
      </div>
    )
  }

  // Show auth page if not logged in
  if (!user) {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-background">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        }
      >
        <AuthPage />
      </Suspense>
    )
  }

  // Show dashboard if logged in
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <DashboardPage />
    </Suspense>
  )
}

export default App
