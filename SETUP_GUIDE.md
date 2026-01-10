# 🚀 SETUP GUIDE - Planner Premium ULTRA

## ✅ Checklist de Instalação

### 1️⃣ Pré-requisitos

- [x] Node.js 18+ instalado
- [x] npm, yarn ou pnpm instalado
- [x] Editor de código (VS Code recomendado)

### 2️⃣ Instalação das Dependências

```bash
cd ~/Downloads/app/planner-premium-ultra
npm install
```

**Nota**: As dependências incluem:
- React 19 + React DOM 19
- TypeScript 5.7
- Vite 6
- TanStack Query v5
- Zustand v5
- Supabase JS Client v2
- shadcn/ui components (Radix UI)
- TailwindCSS 3.4
- Framer Motion 11
- Recharts 2
- i18next

### 3️⃣ Configuração do Ambiente

#### Opção A: Modo Demo (localStorage) ✅

O app já funciona em modo demo sem precisar configurar backend! Apenas execute:

```bash
npm run dev
```

O app estará disponível em: **http://localhost:3000**

#### Opção B: Flask API Backend

Se você configurou o Flask API:

1. **Configure a variável de ambiente**
   ```bash
   cp .env.example .env
   ```

2. **Edite o arquivo .env**
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

3. **Inicie o Flask API** (em outro terminal)
   ```bash
   cd /path/to/flask-api
   python app.py
   ```

4. **Inicie o app React**
   ```bash
   npm run dev
   ```

#### Opção C: Supabase Cloud

1. **Crie uma conta em** [supabase.com](https://supabase.com)

2. **Crie um novo projeto**

3. **Vá em SQL Editor e execute:**

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  planners_created INTEGER DEFAULT 0,
  achievements JSONB DEFAULT '[]',
  subscription TEXT DEFAULT 'free',
  trial_ends_at TIMESTAMPTZ,
  last_activity TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Planners table
CREATE TABLE IF NOT EXISTS planners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  planner_id UUID NOT NULL REFERENCES planners(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  priority TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'todo',
  date DATE,
  time TIME,
  duration INTEGER,
  repeat TEXT NOT NULL DEFAULT 'none',
  context TEXT NOT NULL DEFAULT 'anywhere',
  energy TEXT NOT NULL DEFAULT 'medium',
  reminder INTEGER,
  link TEXT,
  tags JSONB DEFAULT '[]',
  subtasks JSONB DEFAULT '[]',
  done BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_planners_user_id ON planners(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_planner_id ON tasks(planner_id);
CREATE INDEX IF NOT EXISTS idx_tasks_done ON tasks(done);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE planners ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE USING (auth.uid() = id);

-- Planners policies
CREATE POLICY "Users can view own planners"
  ON planners FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own planners"
  ON planners FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own planners"
  ON planners FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own planners"
  ON planners FOR DELETE USING (auth.uid() = user_id);

-- Tasks policies
CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tasks"
  ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE USING (auth.uid() = user_id);
```

4. **Copie suas credenciais Supabase**
   - Vá em Settings > API
   - Copie a URL e a anon key

5. **Configure o .env**
   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anon
   ```

6. **Reverte para Supabase no supabase.ts**
   - O arquivo foi modificado para Flask API
   - Para usar Supabase, veja a versão original no commit anterior

### 4️⃣ Executar o Projeto

```bash
npm run dev
```

Acesse: **http://localhost:3000**

### 5️⃣ Testar Funcionalidades

#### ✅ Autenticação
- [ ] Criar conta
- [ ] Fazer login
- [ ] Fazer logout

#### ✅ Planners
- [ ] Criar novo planner
- [ ] Ver lista de planners
- [ ] Deletar planner
- [ ] Abrir planner

#### ✅ Tarefas
- [ ] Criar tarefa
- [ ] Editar tarefa
- [ ] Completar tarefa (ganhar XP)
- [ ] Deletar tarefa
- [ ] Filtrar por prioridade
- [ ] Filtrar por categoria
- [ ] Buscar tarefas

#### ✅ Gamificação
- [ ] Ver nível atual
- [ ] Ver XP
- [ ] Ver streak
- [ ] Ver conquistas desbloqueadas
- [ ] Level up modal

#### ✅ Estatísticas
- [ ] Ver dashboard
- [ ] Ver taxa de conclusão
- [ ] Ver progresso de nível

#### ✅ UI/UX
- [ ] Dark mode toggle
- [ ] Responsividade mobile
- [ ] Animações suaves
- [ ] Toast notifications

## 🐛 Solução de Problemas

### Erro: "Cannot find module 'X'"

```bash
# Reinstale as dependências
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Port 3000 is already in use"

```bash
# Use outra porta
npm run dev -- --port 3001
```

### Erro: "TypeScript errors"

```bash
# Ignore temporariamente
npm run dev -- --mode development

# Ou corrija os erros
npm run type-check
```

### Erro: "Failed to compile"

```bash
# Limpe o cache
rm -rf dist node_modules/.vite
npm run dev
```

## 📱 PWA Setup

O app já está configurado como PWA! Para testar:

1. **Build para produção**
   ```bash
   npm run build
   npm run preview
   ```

2. **Teste no navegador**
   - Abra DevTools
   - Vá em Application > PWA
   - Verifique se está instalável

3. **Instale no dispositivo**
   - Chrome: Clique no ícone de install na barra de endereços
   - Safari: Share > Add to Home Screen

## 🚀 Deploy para Produção

### Vercel (Recomendado)

```bash
# Instale a Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify

```bash
# Instale a Netlify CLI
npm i -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod
```

### GitHub Pages

```bash
# Configure base path em vite.config.ts
base: '/planner-premium-ultra/'

# Build
npm run build

# Deploy para gh-pages
npm run deploy
```

## 📊 Estrutura de Arquivos Criados

```
planner-premium-ultra/
├── src/
│   ├── components/
│   │   ├── ui/              # 7 componentes shadcn/ui
│   │   ├── auth/
│   │   │   └── AuthPage.tsx
│   │   └── layout/
│   │       └── DashboardPage.tsx
│   ├── lib/
│   │   ├── supabase.ts      # Cliente Supabase/Flask API
│   │   ├── queries.ts       # React Query hooks
│   │   └── utils.ts         # Utility functions
│   ├── stores/
│   │   └── useStore.ts      # Zustand state
│   ├── types/
│   │   └── index.ts         # TypeScript types
│   ├── styles/
│   │   └── globals.css      # Tailwind + custom styles
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
├── public/
│   └── icons/               # PWA icons (criar depois)
├── index.html               # HTML entry point
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── vite.config.ts           # Vite config + PWA
├── tailwind.config.ts       # Tailwind config
└── README.md                # Documentation
```

## 🎨 Customização

### Alterar Cores

Edite `src/styles/globals.css`:

```css
:root {
  --primary: 262 83% 58%;      /* Roxo */
  --success: 142 76% 36%;       /* Verde */
  --warning: 38 92% 50%;        /* Laranja */
}
```

### Alterar Valores de XP

Edite `src/components/layout/DashboardPage.tsx`:

```typescript
// XP por ação
toast.success('Tarefa concluída! +10 XP')  // Completar tarefa
toast.success('Planner criado! +50 XP')    // Criar planner
```

### Adicionar Novos Idiomas

1. Adicione traduções em `src/lib/i18n.ts` (criar este arquivo)
2. Adicione seletor de idioma no Dashboard
3. Configure i18next em `src/main.tsx`

## ✨ Próximos Passos

- [ ] Adicionar calendário completo
- [ ] Implementar notificações push
- [ ] Adicionar gráficos interativos (Recharts)
- [ ] Implementar sincronização offline
- [ ] Adicionar exportação para PDF
- [ ] Criar sistema de tags personalizado
- [ ] Adicionar lembretes recorrentes
- [ ] Implementar compartilhamento de planners
- [ ] Adicionar modo de foco (Pomodoro)
- [ ] Criar templates de planners

## 📚 Recursos

- [React 19 Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [Vite Docs](https://vitejs.dev)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Zustand Docs](https://zustand-demo.pmnd.rs)
- [Supabase Docs](https://supabase.com/docs)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)

## 💬 Suporte

Se encontrar problemas:

1. Verifique se todas as dependências estão instaladas
2. Confira se Node.js é versão 18+
3. Limpe o cache: `rm -rf node_modules .vite`
4. Reinstale: `npm install`
5. Verifique o console do navegador para erros

---

**Desenvolvido com ❤️ por André Almeida**
