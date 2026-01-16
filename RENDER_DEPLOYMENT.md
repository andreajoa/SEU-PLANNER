# 🚀 Render Deployment Guide

## Overview
This project requires **TWO separate services** on Render:
1. **Backend API** (Python/Flask)
2. **Frontend** (React/Vite)

---

## Step 1: Deploy the Backend API

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **New** → **Web Service**
3. Connect GitHub: `andreajoa/SEU-PLANNER`
4. Configure:

```
Name: seu-planner-api
Runtime: Python 3
Root Directory: backend
Build Command: pip install -r requirements.txt
Start Command: gunicorn run:app
```

5. **Database**: Add PostgreSQL database
6. **Environment Variables** (Render will auto-generate):
   - `SECRET_KEY` (auto-generated)
   - `JWT_SECRET_KEY` (auto-generated)
   - `FLASK_ENV=production`

7. Click **Deploy**

**Your backend URL will be**: `https://seu-planner-api.onrender.com`

---

## Step 2: Deploy the Frontend

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **New** → **Web Service**
3. Connect GitHub: `andreajoa/SEU-PLANNER` (same repo)
4. Configure:

```
Name: seu-planner-frontend
Runtime: Node
Root Directory: / (leave empty)
Build Command: npm install && npm run build
Start Command: node server.cjs
Publish Directory: dist
```

5. **Environment Variables**:
   ```
   VITE_API_URL=https://seu-planner-api.onrender.com/api
   NODE_ENV=production
   ```

6. Click **Deploy**

**Your frontend URL will be**: `https://seu-planner-frontend.onrender.com`

---

## Step 3: Access Your App

After both services are deployed:

- **Frontend URL**: `https://seu-planner-frontend.onrender.com` ← Use this!
- **Backend API**: `https://seu-planner-api.onrender.com` ← For API calls only

**Login Credentials**:
```
Email: admin@planner.com
Password: admin123
```

---

## Troubleshooting

### Frontend shows JSON instead of the app
- **Problem**: You're accessing the backend URL, not the frontend
- **Solution**: Make sure you access `seu-planner-frontend.onrender.com`, NOT `seu-planner-api.onrender.com`

### Frontend won't start
- Check the **Logs** in Render dashboard
- Verify `node server.cjs` is the start command
- Verify `dist` directory is the Publish Directory

### API connection errors
- Verify `VITE_API_URL` environment variable in frontend service
- Check backend is running: `curl https://seu-planner-api.onrender.com/api/health`

---

## URLs Summary

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | `https://seu-planner-frontend.onrender.com` | User visits this |
| Backend API | `https://seu-planner-api.onrender.com` | Frontend calls this |
| Health Check | `https://seu-planner-api.onrender.com/api/health` | Test backend |

---

## Important Notes

1. **TWO separate services** - You must deploy both backend and frontend
2. **Frontend calls Backend** - The React app automatically calls the Flask API
3. **Use the Frontend URL** - Users should only access the frontend URL
4. **Backend is API-only** - The backend only returns JSON, not HTML
