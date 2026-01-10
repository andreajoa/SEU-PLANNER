# 🔧 Render Setup Instructions

## Encontrar a URL do seu Backend no Render

Depois de fazer deploy do backend no Render:

1. **Acesse o Dashboard do Render**: https://dashboard.render.com

2. **Encontre seu serviço de backend**:
   - Procure pelo serviço com nome starting with "planner-api" ou o nome que você deu

3. **Clique no serviço** e copie a URL no formato:
   ```
   https://seu-nome-de-servico.onrender.com
   ```

4. **Configure no Frontend**:
   - No arquivo `render.yaml` do frontend, substitua:
   ```yaml
   value: https://SUA-URL-AQUI.onrender.com/api
   ```

5. **Redeploy o frontend** para aplicar as mudanças

## Criar Usuário Admin

Depois que o backend estiver rodando:

```bash
cd backend
python create_admin.py
```

**Credenciais padrão:**
- Email: `admin@planner.com`
- Senha: `admin123`

## Testar a API

```bash
# Health check
curl https://sua-api.onrender.com/api/health

# Registrar novo usuário
curl -X POST https://sua-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"test","password":"password123"}'

# Login
curl -X POST https://sua-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@planner.com","password":"admin123"}'
```

## URLs Comuns no Render

Se você não mudou o nome, seu backend provavelmente está em:
- `https://planner-api.onrender.com/api`
- `https://planner-backend.onrender.com/api`
- `https://seu-planner-api.onrender.com/api`

**Verifique no seu dashboard do Render!**
