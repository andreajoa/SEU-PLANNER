# 🚀 Planner Premium ULTRA - Deployment Guide

## 📋 Overview

Complete Flask + React planner application with:
- **Backend**: Flask API + SQLAlchemy + PostgreSQL
- **Frontend**: React + TypeScript + Vite
- **Deployment**: Render (frontend + backend services)
- **Database**: Render PostgreSQL

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│           Frontend (React + Vite)          │
│         planner-frontend.onrender.com      │
└─────────────────┬───────────────────────────┘
                  │ API Calls
                  ↓
┌─────────────────────────────────────────────┐
│         Backend (Flask + Python)            │
│           planner-api.onrender.com         │
└─────────────────┬───────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────┐
│     PostgreSQL (Render Database)           │
└─────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- GitHub account
- Render account (free tier works)
- Node.js 18+
- Python 3.11+

### Step 1: Prepare GitHub Repository

1. Initialize git:
```bash
cd ~/Downloads/app/planner-premium-ultra
git init
git add .
git commit -m "Initial commit: Flask + React planner"
```

2. Create GitHub repository and push:
```bash
# Replace with your repo URL
git remote add origin https://github.com/YOUR_USERNAME/planner-premium-ultra.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy Backend on Render

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn run:app`
   - **Environment Variables**:
     ```
     FLASK_ENV=production
     SECRET_KEY=<generate-random>
     JWT_SECRET_KEY=<generate-random>
     ```
5. Add **PostgreSQL** database
6. Deploy! 🎉

### Step 3: Deploy Frontend on Render

1. Click **New** → **Web Service**
2. Connect same repository
3. Configure:
   - **Root Directory**: `/` (project root)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Start Command**: `npm run preview`
   - **Environment Variables**:
     ```
     VITE_API_URL=https://planner-api.onrender.com/api
     ```
4. Deploy! 🎉

---

## 🔧 Local Development

### Backend (Flask)
```bash
cd ~/Downloads/app/planner-premium-ultra/backend
source venv/bin/activate
export FLASK_APP=run.py
export FLASK_ENV=development
export SECRET_KEY=dev-secret-key
export JWT_SECRET_KEY=dev-jwt-secret
python run.py
# Runs on http://localhost:5000
```

### Frontend (React)
```bash
cd ~/Downloads/app/planner-premium-ultra
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## 📁 Project Structure

```
planner-premium-ultra/
├── backend/              # Flask API
│   ├── app/              # Application blueprints
│   │   ├── auth.py       # Authentication endpoints
│   │   ├── planners.py   # Planner CRUD
│   │   ├── tasks.py      # Task management
│   │   ├── user.py       # User profile & stats
│   │   └── achievements.py
│   ├── models/           # SQLAlchemy models
│   ├── config.py         # Configuration
│   ├── requirements.txt
│   ├── run.py            # Entry point
│   └── render.yaml       # Render config
│
├── src/                  # React frontend
│   ├── components/       # React components
│   ├── lib/              # API client, utils
│   ├── stores/           # Zustand state
│   ├── types/            # TypeScript types
│   ├── App.tsx           # Main app
│   └── main.tsx          # Entry point
│
├── package.json
├── vite.config.ts
└── README.md
```

---

## 🧪 Testing the API

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"test","password":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## 🌐 Environment Variables

### Backend (Render)
```bash
FLASK_ENV=production
SECRET_KEY=<random-32-char-string>
JWT_SECRET_KEY=<random-32-char-string>
DATABASE_URL=<provided-by-render>
```

### Frontend (Render)
```bash
VITE_API_URL=https://your-api-name.onrender.com/api
```

---

## 🔐 Security Notes

- All API routes use JWT authentication
- CORS enabled for development only
- Production uses HTTPS automatically
- Secrets managed by Render environment variables

---

## 📊 Features Implemented

### ✅ Backend
- [x] JWT Authentication (register/login)
- [x] User management with gamification
- [x] Planner CRUD operations
- [x] Task management (with subtasks)
- [x] Achievement system
- [x] Statistics and leaderboard
- [x] PostgreSQL integration

### ✅ Frontend
- [x] React 19 + TypeScript
- [x] Zustand state management
- [x] TanStack Query for data fetching
- [x] TailwindCSS styling
- [x] Framer Motion animations
- [x] Authentication pages
- [x] Dashboard layout

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check Python version
python3 --version  # Should be 3.11+

# Reinstall dependencies
cd backend
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Frontend can't connect to API
- Check `VITE_API_URL` environment variable
- Verify backend is running on correct port
- Check CORS settings in Flask

---

## 📝 TODO / Future Enhancements

- [ ] Add email verification
- [ ] Implement real-time updates (WebSockets)
- [ ] Add file upload (avatars, attachments)
- [ ] Create mobile app (React Native)
- [ ] Add recurring tasks
- [ ] Implement task reminders (email/push)
- [ ] Add dark mode
- [ ] Create shareable planners
- [ ] Add collaboration features

---

## 📄 License

MIT

---

## 👨‍💻 Author

**André Almeida**
- GitHub: [@andreajoa](https://github.com/andreajoa)
- Email: andremuseu@gmail.com

---

⭐ **Star this repo if it helped you!**
