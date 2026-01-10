#!/bin/bash
# Planner Premium ULTRA - Local Development Startup Script

echo "🚀 Starting Planner Premium ULTRA..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Start Backend
echo "📦 Starting Flask Backend..."
cd backend
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt > /dev/null 2>&1
    echo "✅ Backend dependencies installed"
fi

source venv/bin/activate
export FLASK_APP=run.py
export FLASK_ENV=development
export SECRET_KEY=dev-secret-key-change-in-production
export JWT_SECRET_KEY=dev-jwt-secret-change-in-production
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

# Start Flask in background
python run.py > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ Flask backend running on http://localhost:5000 (PID: $BACKEND_PID)"
cd ..

# Wait for backend to start
sleep 3

# Check if backend is running
if ! curl -s http://localhost:5000/api/health > /dev/null; then
    echo "❌ Backend failed to start. Check backend.log for details."
    exit 1
fi

# Start Frontend
echo ""
echo "🎨 Starting React Frontend..."
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install > /dev/null 2>&1
    echo "✅ Frontend dependencies installed"
fi

# Export API URL for frontend
export VITE_API_URL=http://localhost:5000/api

echo "✅ Starting Vite dev server..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Planner Premium ULTRA is now running!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 Frontend:  http://localhost:5173"
echo "🔌 Backend:   http://localhost:5000"
echo "📊 API Docs:  http://localhost:5000/api/health"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start frontend
npm run dev

# Cleanup on exit
trap "echo ''; echo 'Stopping services...'; kill $BACKEND_PID 2>/dev/null; echo '✅ All services stopped'" EXIT
