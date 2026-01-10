# 🎯 COMO ENCONTRAR BACKEND NO RENDER - GUIA FOTO A FOTO

## PROBLEMA ATUAL:
```
Frontend: https://seu-planner.onrender.com ✅
API URL configurada: https://seu-planner.onrender.com/api ❌
```
**ERRADO!** Você configurou a URL do FRONTEND como API!

---

## ✅ SOLUÇÃO - ENCONTRE O BACKEND:

### Passo 1: ABRIR DASHBOARD
```
https://dashboard.render.com
```

### Passo 2: PROCURAR LISTA DE SERVIÇOS

Vai aparecer algo assim:
```
┌─────────────────────────────────────────┐
│  SEUS SERVIÇOS                          │
├─────────────────────────────────────────┤
│  🌐 seu-planner            [Web Service]│ ← Este é o FRONTEND
│  🐍 planner-api            [Web Service]│ ← Este seria BACKEND
│  🐍 flask-backend          [Web Service]│ ← Ou este
│  🐍 python-api             [Web Service]│ ← Ou este
└─────────────────────────────────────────┘
```

### Passo 3: IDENTIFICAR QUAL É BACKEND

**Características do BACKEND:**
- 🐍 Ícone de Python/Flask
- 📁 Root Directory: `backend`
- 🏗️ Build Command: `pip install...`
- 🚀 Start Command: `gunicorn run:app`

**Características do FRONTEND:**
- 🌐 Ícone de Node.js/React
- 📁 Root Directory: `/` (vazio)
- 🏗️ Build Command: `npm install...`
- 🚀 Start Command: `npm start` ou `vite`

### Passo 4: COPIAR URL DO BACKEND

1. **Clique no serviço BACKEND**
2. **Olhe no TOPO da página**
3. **Vai aparecer a URL**:

```
https://NOME-DO-SERVIÇO.onrender.com
     ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
     Este é o nome que você precisa!
```

### Passo 5: ADICIONAR /api NO FINAL

```
https://NOME-DO-SERVIÇO.onrender.com/api
```

---

## 📋 EXEMPLO REAL:

Se no dashboard você vê:
```
🐍 planner-api
```

A URL do backend é:
```
https://planner-api.onrender.com
```

E a API URL é:
```
https://planner-api.onrender.com/api
```

---

## 🎯 VOCÊ NÃO TEM NENHUM BACKEND?

Se a lista só mostra:
```
🌐 seu-planner (FRONTEND)
```

Então ** você PRECISA CRIAR O BACKEND!**

### Criar Backend - Passo a Passo:

1. **No Dashboard Render**, clique botão **"New +"**
2. **Clique "Web Service"**
3. **Clique "Connect GitHub"**
4. **Procure**: `andreajoa/SEU-PLANNER`
5. **Clique "Connect"**

### Preencha assim:

```
Name: seu-planner-api
Root Directory: backend
Build Command: pip install -r requirements.txt
Start Command: gunicorn run:app
Instance Type: Free
```

### Environment Variables:

Clique **"Advanced"** → **"Add Environment Variable"**

```
FLASK_ENV = production
SECRET_KEY = sua-chave-super-secreta-aqui-12345
JWT_SECRET_KEY = sua-chave-jwt-aqui-67890
```

### Clique: **"Deploy Web Service"**

Aguarde 5-10 minutos... ☕

---

## ✅ DEPOIS DE CRIAR/ENCONTRAR:

### Atualizar Frontend:

1. **Abra o serviço FRONTEND** (`seu-planner`)
2. **Vá em "Environment"**
3. **Edite a variável** `VITE_API_URL`:
   ```
   Value: https://NOME-DO-SEU-BACKEND.onrender.com/api
   ```
4. **Clique "Save Changes"**

Render faz **redeploy automático** em 1-2 min!

---

## 🧪 TESTAR:

```bash
curl https://SEU-BACKEND-URL.onrender.com/api/health
```

Deve retornar:
```json
{"status":"healthy","version":"1.0.0"}
```

---

## 📸 RESUMO VISUAL:

```
DASHBOARD RENDER:
┌─────────────────────────────┐
│ Services:                   │
│                             │
│ 🌐 seu-planner  ← FRONTEND  │
│   https://seu-planner...    │
│                             │
│ 🐍 planner-api  ← BACKEND?  │
│   https://planner-api...    │
│                             │
└─────────────────────────────┘

COPIAR URL DO BACKEND:
https://planner-api.onrender.com/api
         ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
    Esta é a URL certa!

CONFIGURAR NO FRONTEND:
VITE_API_URL = https://planner-api.onrender.com/api
```

---

## ❓ AINDA PERDIDO?

Responda:

1. **Quantos serviços você tem no Render?**
   - [ ] 1 (só o frontend)
   - [ ] 2 ou mais

2. **Se tem mais de 1, quais os nomes?**
   - Serviço 1: ___________
   - Serviço 2: ___________
   - Serviço 3: ___________

3. **Qual tem ícone de Python (🐍)?**

---

## 🚀 SOLUÇÃO MAIS RÁPIDA:

Se você não quiser procurar, me dê acesso ao seu GitHub/Render e eu configuro tudo!

Ou simplesmente: **vá em https://dashboard.render.com e me diga TODOS os nomes de serviços que você vê lá!**
