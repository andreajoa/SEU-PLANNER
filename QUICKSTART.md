# 🚀 QUICK START - Planner Premium ULTRA

## Execute em 3 Passos!

### 1️⃣ Instale Dependências (se necessário)

```bash
cd ~/Downloads/app/planner-premium-ultra
npm install
```

### 2️⃣ Execute o Servidor de Desenvolvimento

```bash
npm run dev
```

### 3️⃣ Abra no Navegador

```
http://localhost:3000
```

## ✨ Funcionalidades Disponíveis

### 🔐 Modo Demo (Funciona Imediatamente!)

O app já funciona em modo demo usando localStorage:

1. **Crie uma conta** (qualquer email/senha funciona)
2. **Crie planners** (Todo, Projeto, Hábitos, etc.)
3. **Adicione tarefas** com título, descrição, categoria, prioridade
4. **Complete tarefas** clicando no checkbox
5. **Ganhe XP** e aumente seu nível!
6. **Desbloqueie conquistas** ao alcançar metas
7. **Acompanhe estatísticas** no dashboard

### 🌙 Dark Mode

Clique no ícone de ☀️/🌙 na navbar para alternar entre temas.

### 📊 Tabs Disponíveis

- **Planners** - Gerencie seus planners
- **Tarefas** - Gerencie tarefas do planner selecionado
- **Calendário** - View de calendário (placeholder)
- **Stats** - Estatísticas e progresso
- **Conquistas** - Veja suas conquistas desbloqueadas

## 🎮 Como Ganhar XP

| Ação | XP |
|------|-----|
| Criar Planner | +50 XP |
| Completar Tarefa | +10 XP |
| Criar Tarefa | +5 XP |

## 📈 Sistema de Níveis

- **Nível 1**: 0-99 XP
- **Nível 2**: 100-199 XP
- **Nível 3**: 200-299 XP
- E assim por diante...

A cada 100 XP você sobe de nível!

## 🏆 Conquistas

Desbloqueie conquistas ao alcançar metas:

- 🎯 **Primeira Tarefa** - Complete 1 tarefa
- 👑 **Mestre das Tarefas** - Complete 10 tarefas
- 💯 **Centenário** - Complete 100 tarefas
- 🔥 **Streak 7 Dias** - Use 7 dias consecutivos
- 💪 **Streak 30 Dias** - Use 30 dias consecutivos
- ⭐ **Nível 10** - Alcance o nível 10

## 🎨 Tipos de Planners

- ✅ **To-Do List** - Gerenciamento simples de tarefas
- 🏗️ **Projeto** - Projetos multi-fase
- 🔥 **Hábitos** - Rastreador de hábitos diários
- 💰 **Financeiro** - Controle financeiro
- 🎯 **Metas** - Definição e acompanhamento de metas
- 📅 **Diário** - Planejamento diário

## 🏷️ Categorias de Tarefas

- 💼 **Trabalho** - Tarefas profissionais
- 🏠 **Pessoal** - Tarefas pessoais
- 💪 **Saúde** - Saúde e fitness
- 📚 **Estudos** - Aprendizado
- 💰 **Finanças** - Assuntos financeiros

## 🎯 Níveis de Prioridade

- 🟢 **Baixa** - Pode esperar
- 🟡 **Média** - Importante mas não urgente
- 🔴 **Alta** - Importante e urgente
- 🔥 **Urgente** - Precisa de atenção imediata
- ⚡ **Crítica** - Emergência

## 💡 Dicas

1. **Filtre tarefas** - Use a barra de busca e filtros de prioridade/categoria
2. **Organize por data** - Adicione datas às tarefas para melhor organização
3. **Use tags** - Adicione tags para categorizar ainda mais
4. **Mantenha o streak** - Use o app todos os dias para aumentar seu streak
5. **Complete tarefas** - Ganhe XP completando tarefas diariamente

## 🐛 Problemas?

### Porta 3000 em uso?

```bash
npm run dev -- --port 3001
```

### Erro de compilação?

```bash
rm -rf node_modules .vite
npm install
npm run dev
```

### Typescript errors?

```bash
npm run type-check
```

## 📱 Testar Responsividade

1. Abra DevTools (F12 ou Cmd+Option+I)
2. Clique no ícone de dispositivo mobile
3. Selecione iPhone, iPad ou outros dispositivos
4. Recarregue a página para testar

## 🚀 Próximos Passos

Depois de testar o modo demo:

1. **Configure Supabase** - Para sincronização na nuvem
   - Veja `SETUP_GUIDE.md` para instruções completas

2. **Personalize cores** - Edite `src/styles/globals.css`

3. **Adicione mais features** - Veja `PROJECT_SUMMARY.md` para ideias

4. **Deploy** - Faça deploy para Vercel, Netlify ou GitHub Pages

## 📚 Documentação

- `README.md` - Visão geral do projeto
- `SETUP_GUIDE.md` - Setup completo e detalhado
- `PROJECT_SUMMARY.md` - Resumo técnico completo

---

**Aproveite seu Planner Premium ULTRA! 🎉**
