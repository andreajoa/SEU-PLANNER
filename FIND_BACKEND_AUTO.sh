#!/bin/bash
# Auto-discover Render backend URL
# Tests all possible backend name variations

echo "🔍 Testing possible backend URLs..."
echo ""

# List of possible backend names based on frontend name "seu-planner"
urls=(
  "https://seu-planner-api.onrender.com/api"
  "https://seu-planner-backend.onrender.com/api"
  "https://seu-planner-flask.onrender.com/api"
  "https://seu-planner-server.onrender.com/api"
  "https://planner-api.onrender.com/api"
  "https://planner-backend.onrender.com/api"
  "https://api-seu-planner.onrender.com/api"
  "https://backend-seu-planner.onrender.com/api"
)

found=0

for url in "${urls[@]}"; do
  echo "Testing: $url"
  response=$(curl -s -o /dev/null -w "%{http_code}" "$url/health" --max-time 3)

  if [ "$response" = "200" ]; then
    echo "✅ FOUND! Backend is at: $url"
    echo ""
    echo "Set this in Render Frontend Environment:"
    echo "Key: VITE_API_URL"
    echo "Value: $url"
    found=1
    break
  else
    echo "❌ Not working (HTTP $response)"
  fi
  echo ""
done

if [ $found -eq 0 ]; then
  echo "❌ No working backend found!"
  echo ""
  echo "📝 NEXT STEPS:"
  echo "1. Go to: https://dashboard.render.com"
  echo "2. Look for ANY backend service"
  echo "3. Check if you have services with these names:"
  echo "   - planner-api"
  echo "   - planner-backend"
  echo "   - seu-planner-api"
  echo "   - flask-backend"
  echo "   - python-backend"
  echo ""
  echo "4. If NO backend exists, create one!"
fi
