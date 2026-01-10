/**
 * Authentication Page Component
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '@/lib/supabase'
import { useStore } from '@/stores/useStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const { setUser, setLanguage } = useStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        // Sign in
        const { data, error } = await auth.signIn(email, password)
        if (error) throw error

        toast.success('Login realizado com sucesso!')
      } else {
        // Sign up
        if (!name.trim()) {
          toast.error('Por favor, insira seu nome')
          setLoading(false)
          return
        }

        const { data, error } = await auth.signUp(email, password, name)
        if (error) throw error

        toast.success('Conta criada com sucesso! Verifique seu email.')
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro na autenticação')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-purple-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-2xl">
          <CardHeader className="space-y-1 text-center pb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Planner Premium ULTRA
            </CardTitle>
            <CardDescription className="text-base">
              {isLogin ? 'Entre para continuar' : 'Crie sua conta gratuita'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="name">
                    Nome
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required={!isLogin}
                    className="h-11"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="email">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="password">
                  Senha
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-11"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isLogin ? 'Entrando...' : 'Criando conta...'}
                  </>
                ) : (
                  <>{isLogin ? 'Entrar' : 'Criar Conta'}</>
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isLogin ? "Não tem uma conta? Cadastre-se" : 'Já tem uma conta? Entre'}
                </button>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t">
              <div className="text-center text-sm text-muted-foreground">
                <p className="font-medium mb-2">✨ Recursos Premium:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>✅ Múltiplos Planners</div>
                  <div>✅ Gamificação</div>
                  <div>✅ Estatísticas</div>
                  <div>✅ PWA Offline</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-white/80 text-sm mt-4">
          Versão 2.0 - React + TypeScript + Vite
        </p>
      </div>
    </div>
  )
}
