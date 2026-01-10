# 🔍 Diagnosticar Problemas de Conexão API

## URL do Seu Backend

**Seu Frontend:** https://seu-planner.onrender.com

**Seu Backend:** Você precisa descobrir isso no Render

## Como Descobrir a URL do Backend

### Método 1 - Dashboard Render (Mais Fácil)

1. Acesse: https://dashboard.render.com
2. Encontre a lista de seus serviços
3. Procure um serviço com nome contendo:
   - "api"
   - "backend"
   - "planner"
4. Clique no serviço
5. Copie a URL que aparece no topo
6. Adicione `/api` no final

### Método 2 - Teste Manual

Teste cada URL abaixo no seu navegador ou com curl:

```bash
# Teste 1
curl https://planner-api.onrender.com/api/health

# Teste 2
curl https://planner-backend.onrender.com/api/health

# Teste 3
curl https://seu-planner-api.onrender.com/api/health
```

**A que funcionar (retornar JSON) é a URL correta!**

## URLs Possíveis (Baseadas no setup)

Se você seguiu os defaults:

- ✅ **Backend Render Name:** `planner-api`
- ✅ **Backend URL:** `https://planner-api.onrender.com/api`

## Como Atualizar

### Via Dashboard Render:

1. Abra seu serviço frontend no Render
2. Vá em "Environment"
3. Encontre ou crie variável: `VITE_API_URL`
4. Set o valor: `https://SUA-URL-CORRETA.onrender.com/api`
5. Save Changes (faz auto-deploy)

### Via Código:

Edite `render.yaml`:
```yaml
envVars:
  - key: VITE_API_URL
    value: https://planner-api.onrender.com/api  # ← USE A URL CORRETA
```

## Verificar se Funcionou

Após atualizar e redeploy:

1. Abra o site: https://seu-planner.onrender.com
2. Abra DevTools (F12)
3. Vá em Console
4. Deve ver: `🔧 API Configuration: Using URL: https://...`
5. Tente fazer login com:
   - Email: `admin@planner.com`
   - Senha: `admin123`

## Logs Úteis

No Console do navegador, procure por:
- `API Configuration` - Mostra qual URL está sendo usada
- Erros 404 - API URL errada
- Erros CORS - Backend não configurado corretamente

No Dashboard do Render (Backend):
- Vá em "Logs"
- Procure por "✅ ADMIN USER CREATED" - Confirma que admin foi criado
- Procure por "Total users" - Mostra quantos usuários existem

## Ainda Com Problemas?

1. Verifique se o backend está rodando no Render
2. Verifique os logs do backend no Render
3. Teste a API diretamente com curl
4. Verifique se as variáveis de ambiente estão corretas
