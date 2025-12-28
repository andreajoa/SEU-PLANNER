#!/bin/bash
cd ~/Desktop/SEU-PLANNER

echo '🚀 Criando arquivos...'

# README.md
cat > README.md << 'READMEEOF'
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
READMEEOF

# DATABASE_SETUP.md
cat > DATABASE_SETUP.md << 'DBEOF'
# 🗄️ Configuração do Banco de Dados

## 📋 Instalação

### 1️⃣ Acesse Supabase SQL Editor
https://supabase.com/dashboard → SQL Editor

### 2️⃣ Execute o SQL Completo
Copie database_complete.sql e execute no SQL Editor

### 3️⃣ Configure Credenciais
Edite index.html:
const SUPABASE_URL = 'SUA_URL';
const SUPABASE_ANON_KEY = 'SUA_CHAVE';

## 🎯 Estrutura

- **users** - Usuários e gamificação
- **planners** - Planejadores
- **tarefas** - Tarefas
- **notas** - Notas
- **habitos** - Hábitos
- **metas** - Metas

## 🔐 Conta Admin

Email: andremuseu@gmail.com
Senha: senha123
Status: Admin permanente

## 📊 Queries Úteis

-- Verificar admin
SELECT * FROM users WHERE email = 'andremuseu@gmail.com';

-- Renovar trial
UPDATE users SET trial_end = '2099-12-31' WHERE email = 'andremuseu@gmail.com';

---
André Almeida - andremuseu@gmail.com
DBEOF

echo '✅ Arquivos criados!'
git add .
git status
