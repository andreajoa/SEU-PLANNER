<<<<<<< HEAD
# ✨ Planner Premium ULTRA - React + TypeScript Edition

> Versão 2.0 - Aplicação moderna de planejamento com gamificação

## 🎯 Sobre o Projeto

**Planner Premium ULTRA** é uma aplicação PWA completa para gestão de tarefas, hábitos e metas com sistema de gamificação integrado.

### ✨ Principais Features

- 📋 **Múltiplos Planners** - Diário, Semanal, Mensal, Projetos, Hábitos, Metas
- 🎮 **Gamificação** - XP, níveis, conquistas, streaks
- 🌙 **Dark Mode** - Suporte completo a tema claro/escuro
- 📱 **PWA** - Instale como app, funciona offline
- 📊 **Dashboard** - Gráficos e estatísticas detalhadas
- ☁️ **Cloud Sync** - Sincronização com Supabase
- 🌍 **Internacionalização** - Suporte a múltiplos idiomas
- 🎨 **UI Moderna** - Design com shadcn/ui + TailwindCSS

## 🛠️ Tecnologias

- React 19 + TypeScript 5.7 + Vite 6
- TanStack Query v5 + Zustand v5
- Supabase (Auth, Database, Realtime)
- shadcn/ui + TailwindCSS + Framer Motion
- React Hook Form + Zod
- Recharts + i18next

## 📦 Instalação

```bash
# 1. Instalar dependências
npm install

# 2. Configurar Supabase (opcional)
cp .env.example .env
# Edite .env com suas credenciais Supabase

# 3. Executar em desenvolvimento
npm run dev

# 4. Build para produção
npm run build
npm run preview
```

## 🗄️ Setup do Supabase

Crie um projeto em [supabase.com](https://supabase.com) e execute o SQL abaixo no SQL Editor:

```sql
-- Tabelas
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  achievements JSONB DEFAULT '[]',
  last_activity TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE planners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  planner_id UUID NOT NULL REFERENCES planners(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  priority TEXT NOT NULL,
  done BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  tags JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE planners ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can manage own planners" ON planners
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own tasks" ON tasks
  FOR ALL USING (auth.uid() = user_id);
```

## 🎮 Como Usar

1. **Criar Conta** - Clique em "Criar Conta" e preencha seus dados
2. **Criar Planner** - Clique em "Novo Planner" e escolha o tipo
3. **Adicionar Tarefas** - Clique em "Nova Tarefa" e preencha os detalhes
4. **Completar Tarefas** - Clique no checkbox para ganhar XP
5. **Ver Estatísticas** - Acompanhe seu progresso na aba "Stats"

## 📂 Estrutura

```
src/
├── components/ui/       # shadcn/ui components
├── components/auth/     # Authentication
├── components/layout/   # Layout components
├── lib/
│   ├── supabase.ts     # Supabase client
│   ├── queries.ts      # React Query hooks
│   └── utils.ts        # Utilities
├── stores/
│   └── useStore.ts     # Zustand state
├── types/
│   └── index.ts        # TypeScript types
├── styles/
│   └── globals.css     # Global styles
├── App.tsx             # Main app
└── main.tsx            # Entry point
```

## 🚀 Scripts

```bash
npm run dev          # Development
npm run build        # Production build
npm run preview      # Preview build
npm run lint         # Lint code
npm run format       # Format code
```

## 👨‍💻 Autor

**André Almeida** - andremuseu@gmail.com

---

⭐ Deixe uma estrela se gostou!
=======
# ✨ Planner Premium ULTRA

> Organize sua vida com gamificação e produtividade inteligente!

## 🎯 Sobre o Projeto

**Planner Premium ULTRA** é uma aplicação web PWA completa para gestão de tarefas, hábitos e metas com sistema de gamificação integrado.

### ✨ Principais Features

- 📋 Múltiplos Planners (Diário, Semanal, Mensal, Projetos, Hábitos, Metas)
- 🎮 Gamificação (XP, níveis, conquistas, streaks)
- 🌙 Dark Mode
- 📱 PWA - Instale como app
- 🔔 Notificações inteligentes
- 📊 Dashboard com gráficos
- ☁️ Cloud Sync com Supabase

## 🚀 Demo

[https://andreajoa.github.io/SEU-PLANNER/](https://andreajoa.github.io/SEU-PLANNER/)

**Conta Admin:**
- Email: andremuseu@gmail.com
- Senha: senha123

## 🛠️ Tecnologias

- HTML5, CSS3, JavaScript
- Supabase (PostgreSQL)
- Chart.js, PWA

## 📦 Instalação

1. Clone: git clone https://github.com/andreajoa/SEU-PLANNER.git
2. Configure Supabase (execute SQL completo)
3. Atualize credenciais em index.html
4. Execute: python -m http.server 8000

📖 Veja DATABASE_SETUP.md para detalhes

## 👨‍💻 Desenvolvedor

**André Almeida**
- andremuseu@gmail.com
- [@andreajoa](https://github.com/andreajoa)

---
⭐ Deixe uma estrela se você gostou!
>>>>>>> 8217a93cc022e494e4bf70d328030db1fbee900b
