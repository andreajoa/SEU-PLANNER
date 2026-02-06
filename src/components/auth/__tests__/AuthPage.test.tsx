import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import AuthPage from '@/components/auth/AuthPage'

// Mock do useStore
vi.mock('@/stores/useStore', () => ({
  useStore: () => ({
    setUser: vi.fn(),
  }),
}))

// Mock do auth
vi.mock('@/lib/supabase', () => ({
  auth: {
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  },
}))

// Mock do toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

const renderWithProviders = (component: React.ReactNode) => {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{component}</MemoryRouter>
    </QueryClientProvider>
  )
}

describe('AuthPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar o título corretamente', () => {
    renderWithProviders(<AuthPage />)
    expect(screen.getByText('Planner Premium ULTRA')).toBeInTheDocument()
  })

  it('deve alternar entre login e registro', () => {
    renderWithProviders(<AuthPage />)

    // Inicia mostrando "Entre para continuar"
    expect(screen.getByText('Entre para continuar')).toBeInTheDocument()

    // Clica no link para alternar
    const toggleButton = screen.getByText('Não tem uma conta? Cadastre-se')
    fireEvent.click(toggleButton)

    // Agora mostra "Crie sua conta gratuita"
    expect(screen.getByText('Crie sua conta gratuita')).toBeInTheDocument()
  })

  it('deve validar campos obrigatórios no login', async () => {
    const { auth } = await import('@/lib/supabase')
    const mockSignIn = vi.mocked(auth.signIn)

    renderWithProviders(<AuthPage />)

    // Tenta enviar sem preencher campos
    const submitButton = screen.getByText('Entrar')
    const emailInput = screen.getByPlaceholderText('seu@email.com')
    const passwordInput = screen.getByPlaceholderText('••••••••')

    fireEvent.change(emailInput, { target: { value: '' } })
    fireEvent.change(passwordInput, { target: { value: '' } })

    // Form HTML5 validation deve impedir submit
    fireEvent.click(submitButton)

    // signIn não deve ser chamado
    expect(mockSignIn).not.toHaveBeenCalled()
  })

  it('deve validar senha mínima de 6 caracteres', async () => {
    renderWithProviders(<AuthPage />)

    // Alterna para cadastro
    fireEvent.click(screen.getByText('Não tem uma conta? Cadastre-se'))

    const nameInput = screen.getByPlaceholderText('Seu nome')
    const emailInput = screen.getByPlaceholderText('seu@email.com')
    const passwordInput = screen.getByPlaceholderText('••••••••')

    fireEvent.change(nameInput, { target: { value: 'Test User' } })
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: '123' } })

    const submitButton = screen.getByText('Criar Conta')

    // Senha muito curta (minLength="6")
    expect(passwordInput).toHaveAttribute('minLength', '6')
  })

  it('deve chamar auth.signIn com credenciais corretas', async () => {
    const { auth } = await import('@/lib/supabase')
    const mockSignIn = vi.fn().mockResolvedValue({
      data: { user: { id: '123', email: 'test@example.com', name: 'Test User' } },
      error: null,
    })
    auth.signIn = mockSignIn

    renderWithProviders(<AuthPage />)

    const emailInput = screen.getByPlaceholderText('seu@email.com')
    const passwordInput = screen.getByPlaceholderText('••••••••')
    const submitButton = screen.getByText('Entrar')

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })
})
