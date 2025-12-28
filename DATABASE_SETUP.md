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
