# ✨ Planner Premium ULTRA - Flask + React

Sistema de planejamento com gamificação usando Flask backend e React frontend.

## 🚀 Deploy Status

- **Frontend**: https://seu-planner.onrender.com ✅
- **Backend**: https://planner-api.onrender.com (verifique no dashboard Render)

## 👤 Admin Access

**Credenciais Padrão:**
- Email: `admin@planner.com`
- Senha: `admin123`

> ⚠️ O usuário admin é criado automaticamente na primeira vez que o backend inicia!

## 🔧 Configuração Importante

### Encontrar URL do Backend

1. Acesse: https://dashboard.render.com
2. Encontre seu serviço backend
3. Copie a URL (ex: `https://planner-api.onrender.com`)
4. Atualize em `render.yaml`:
   ```yaml
   value: https://SUA-URL.onrender.com/api
   ```
5. Commit e push para fazer redeploy

### Testar Conexão

```bash
# Health check
curl https://sua-url.onrender.com/api/health

# Login
curl -X POST https://sua-url.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@planner.com","password":"admin123"}'
```

## 📁 Estrutura do Projeto

```
SEU-PLANNER/
├── backend/           # Flask API
│   ├── app/          # Blueprints (auth, planners, tasks, etc)
│   ├── models/       # SQLAlchemy models
│   ├── init_db.py    # Auto-cria admin user
│   └── run.py        # Entry point
├── src/              # React frontend
│   ├── components/   # React components
│   ├── lib/         # API client, config
│   └── stores/      # Zustand state
└── render.yaml      # Render deployment config
```

## 🛠️ Tecnologias

**Backend:**
- Flask 3.0
- SQLAlchemy + PostgreSQL
- Flask-JWT-Extended (auth)
- bcrypt (password hashing)

**Frontend:**
- React 19 + TypeScript
- TanStack Query
- Zustand (state)
- TailwindCSS + shadcn/ui
- Framer Motion
- Vite

## 📝 Como Funciona

### Backend Auto-Setup

Quando o backend inicia:
1. Cria tabelas no banco automaticamente
2. Cria usuário admin se não existir
3. Configura todos os blueprints

### Frontend API Detection

O frontend detecta automaticamente:
1. Usa `VITE_API_URL` se definida
2. Fallback para URLs comuns
3. Mostra configuração no console (dev mode)

## 🐛 Troubleshooting

### Erro 404 ao Registrar/Login

**Causa:** Frontend não consegue encontrar backend

**Solução:**
1. Encontre URL do backend no Render dashboard
2. Atualize `VITE_API_URL` no render.yaml
3. Commit e push

### Backend Não Cria Admin

**Verifique os logs do backend no Render:**
- Deve mostrar: "✅ ADMIN USER CREATED!"
- Se não mostrar, reinicie o serviço backend

### CORS Errors

O backend já está configurado com CORS. Se ainda tiver problemas:
- Verifique se a URL está correta
- Verifique se o backend está rodando

## 📖 Documentação Adicional

- `SETUP_RENDER.md` - Setup detalhado do Render
- `API_CONNECTION.md` - Diagnosticar problemas de API
- `DEPLOYMENT.md` - Guia de deployment completo

## 👨‍💻 Author

**André Almeida**
- GitHub: [@andreajoa](https://github.com/andreajoa)
- Email: andremuseu@gmail.com

---

⭐ **Se funcionou, considere dar uma estrela no GitHub!**
