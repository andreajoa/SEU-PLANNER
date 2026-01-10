# 🔍 ENCONTRAR URL DO BACKEND NO RENDER

## Passo a Passo COM IMAGENS

### 1. ABRIR DASHBOARD RENDER
```
https://dashboard.render.com
```

### 2. PROCURAR PELO BACKEND

Você verá uma lista de serviços. Procure por nomes como:
- ✅ planner-api
- ✅ planner-backend
- ✅ seu-planner-api
- ✅ backend
- ✅ flask-backend
- ✅ python-backend

### 3. COPIAR A URL

1. **Clique no serviço do backend**
2. **Olhe no topo da página** - vai aparecer a URL
3. **Copie a URL completa**

Exemplo:
```
https://seu-nome-de-servico.onrender.com
```

### 4. ADICIONAR /api NO FINAL

```
https://seu-nome-de-servico.onrender.com/api
```

## COMO TESTAR SE É A URL CERTA

### Método 1 - Browser
Abra no navegador:
```
https://sua-url.onrender.com/api/health
```

Deve retornar:
```json
{"status":"healthy","version":"1.0.0"}
```

### Método 2 - Terminal
```bash
curl https://sua-url.onrender.com/api/health
```

## VOCÊ NÃO ENCONTROU O BACKEND?

### Então você precisa criar o backend!

### Opção 1 - Deploy Manual (Fácil)

1. **No Dashboard Render**, clique **"New +"**
2. **Escolha "Web Service"**
3. **Conecte o GitHub**: andreajoa/SEU-PLANNER
4. **Configure**:
   - **Name**: `seu-planner-api` (ou outro nome)
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn run:app`
   - **Environment Variables**:
     ```
     FLASK_ENV=production
     SECRET_KEY=chave-secreta-aqui
     JWT_SECRET_KEY=outra-chave-aqui
     ```
5. **Clique "Deploy Web Service"**

### Opção 2 - Usar render.yaml (Já configurado)

O arquivo `backend/render.yaml` já está configurado!
Mas o Render pode não ter detectado automaticamente.

## DEPOIS DE ENCONTRAR OU CRIAR

### Atualizar o Frontend

Escolha **UMA** opção:

#### Opção A - Via Dashboard Render (Mais Fácil)

1. **Abra o serviço frontend** no Render
2. **Vá em "Environment"**
3. **Adicione variável**:
   - Key: `VITE_API_URL`
   - Value: `https://SUA-URL.onrender.com/api`
4. **Clique "Save Changes"**
5. **Deploy automático** em 1-2 min

#### Opção B - Via Código

1. **Edite** `render.yaml`:
   ```yaml
   value: https://SUA-URL-ENCONTRADA.onrender.com/api
   ```

2. **Commit e push**:
   ```bash
   git add render.yaml
   git commit -m "Fix: Set correct API URL"
   git push
   ```

## URL EXEMPLO

Se seu backend se chama `meu-planner-api`:
```
URL: https://meu-planner-api.onrender.com/api
```

## RESUMO RÁPIDO

```
1. Abrir: https://dashboard.render.com
2. Encontrar serviço backend
3. Copiar URL (https://nome.onrender.com)
4. Adicionar /api no final
5. Testar: curl URL/api/health
6. Atualizar render.yaml ou Environment
7. Commit e push (se editou o arquivo)
8. Esperar redeploy
9. Testar login no site
```

## PRECISA DE AJUDA?

Responda:
1. **Você tem um serviço backend listado no Render?** (Sim/Não)
2. **Qual o nome dele?** (Se tiver)
3. **Qual a URL completa?**

Com essas infos eu configuro tudo para você!
